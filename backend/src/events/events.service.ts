import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventsGateway } from './events.gateway';
import { AlertsService } from '../alerts/alerts.service';
import { DetectionService } from '../detection/detection.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly ai: GoogleGenAI;

  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    private readonly eventsGateway: EventsGateway,
    @Inject(forwardRef(() => AlertsService))
    private readonly alertsService: AlertsService,
    private readonly detectionService: DetectionService,
  ) {
    // Initialize Gemini AI Client
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }

  async ingestEvent(data: any, orgId: string) {
    this.logger.log(`Ingesting event for org ${orgId}: ${data.title}`);

    const newEvent = this.eventRepository.create({
      org_id: orgId,
      event_type: data.event_type,
      source: data.source,
      severity: data.severity || 'info',
      title: data.title || `Agent Event: ${data.event_type}`,
      description: data.description || 'No description provided.',
      raw_data: data.raw_data,
      timestamp: new Date(data.timestamp || Date.now()),
    });

    const savedEvent = await this.eventRepository.save(newEvent);

    // Broadcast the new event in real-time
    this.eventsGateway.broadcastEvent(orgId, savedEvent);

    // 1. Evaluate custom detection rules created from the UI
    await this.evaluateCustomRules(savedEvent, orgId);

    // 2. Run Gemini AI analysis for high/critical events
    await this.evaluateWithAi(savedEvent);

    return savedEvent;
  }

  async getEventsForOrg(orgId: string, limit = 100) {
    return this.eventRepository.find({
      where: { org_id: orgId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  /**
   * Evaluate the event against the org's enabled custom detection rules.
   * Each matched rule triggers an alert that references the rule.
   */
  private async evaluateCustomRules(event: Event, orgId: string) {
    try {
      const rules = await this.detectionService.getEnabledRules(orgId);
      if (!rules.length) return;

      const matched = this.detectionService.evaluateEvent(event, rules);
      if (!matched.length) return;

      for (const rule of matched) {
        this.logger.log(`Rule "${rule.name}" (${rule.rule_type}) matched event ${event.id}`);
        this.alertsService.createAlert({
          title: `Rule Match: ${rule.name}`,
          description: `[Rule: ${rule.rule_type}] Custom detection rule "${rule.name}" matched event "${event.title}". | Original Event: ${event.description}`,
          severity: event.severity === 'critical' ? 'critical' : 'high',
        }, orgId).catch((err) => this.logger.error(`Failed to create alert for rule ${rule.id}: ${err.message}`));
      }
    } catch (err: any) {
      this.logger.error(`Custom rule evaluation failed for event ${event.id}: ${err.message}`);
    }
  }

  private async evaluateWithAi(event: Event) {
    // Only high/critical events are sent to Gemini to control cost & noise
    if (event.severity !== 'critical' && event.severity !== 'high') {
      return;
    }

    this.logger.log(`Evaluating suspicious event with Gemini AI: ${event.title}`);

    try {
      if (!process.env.GEMINI_API_KEY) {
        // Fallback if no API key is provided
        this.logger.warn('No GEMINI_API_KEY provided. Using fallback alert generation.');
        this.triggerAlert(event, 80, "Fallback rule matched due to missing AI key.");
        return;
      }

      const prompt = `
          Analyze the following cybersecurity event and determine if it represents a malicious attack or a severe security misconfiguration.
          Event Title: ${event.title}
          Event Description: ${event.description}
          Event Source: ${event.source}
          Event Type: ${event.event_type}
          Raw Data: ${JSON.stringify(event.raw_data)}

          Respond ONLY with a valid JSON object in this format:
          {
            "isMalicious": boolean,
            "confidence": number (0-100),
            "reasoning": "A concise, 1-sentence explanation of why it is or is not an attack."
          }
        `;

      const response = await this.ai.models.generateContent({
          model: 'gemini-flash-latest',
          contents: prompt,
      });

      const responseText = response.text || '{}';
      
      // Clean JSON formatting if Gemini wrapped it in markdown blocks
      const cleanJsonStr = responseText.replace(/```json\n|\n```|```/g, '').trim();
      const analysis = JSON.parse(cleanJsonStr);

      this.logger.log(`Gemini Analysis Complete - Malicious: ${analysis.isMalicious}, Confidence: ${analysis.confidence}%`);

      // Trigger an alert if Gemini thinks it's a high-confidence attack
      if (analysis.isMalicious && analysis.confidence >= 70) {
        this.triggerAlert(event, analysis.confidence, analysis.reasoning);
      }

    } catch (error: any) {
      this.logger.error(`Failed to analyze event with Gemini: ${error.message}`);
      // Fallback to basic rule on error
      this.triggerAlert(event, 50, `Failed to run AI analysis: ${error.message}`);
    }
  }

  private triggerAlert(event: Event, confidence: number, reasoning: string) {
    this.alertsService.createAlert({
      title: `AI Detection: ${event.title}`,
      description: `[AI Confidence: ${confidence}%] ${reasoning} | Original Event: ${event.description}`,
      severity: event.severity, // Inherit severity from the raw event
    }, event.org_id);
  }
}
