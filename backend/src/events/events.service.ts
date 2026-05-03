import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { EventsGateway } from './events.gateway';
import { AlertsService } from '../alerts/alerts.service';
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
  ) {
    // Initialize Gemini AI Client
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });
  }

  async ingestEvent(data: any, orgId: string) {
    this.logger.log(`Ingesting event for org ${orgId}: ${data.title}`);

    const newEvent = this.eventRepository.create({
      org_id: orgId,
      event_type: data.event_type,
      source: data.source,
      severity: data.severity,
      title: data.title,
      description: data.description,
      raw_data: data.raw_data,
      timestamp: new Date(data.timestamp || Date.now()),
    });

    const savedEvent = await this.eventRepository.save(newEvent);

    // Broadcast the new event in real-time
    this.eventsGateway.broadcastEvent(orgId, savedEvent);

    // Basic rule evaluation could go here
    this.evaluateRules(savedEvent);

    return savedEvent;
  }

  async getEventsForOrg(orgId: string, limit = 100) {
    return this.eventRepository.find({
      where: { org_id: orgId },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  private async evaluateRules(event: Event) {
    // Basic heuristic: Is this a high or critical event?
    if (event.severity === 'critical' || event.severity === 'high') {
      this.logger.log(`Evaluating suspicious event with Gemini AI: ${event.title}`);
      
      try {
        if (!process.env.GEMINI_API_KEY) {
          // Fallback if no API key is provided
          this.logger.warn('No GEMINI_API_KEY provided. Using fallback alert generation.');
          return this.triggerAlert(event, 80, "Fallback rule matched due to missing AI key.");
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
            model: 'gemini-2.5-flash',
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
  }

  private triggerAlert(event: Event, confidence: number, reasoning: string) {
    this.alertsService.createAlert({
      title: `AI Detection: ${event.title}`,
      description: `[AI Confidence: ${confidence}%] ${reasoning} | Original Event: ${event.description}`,
      severity: event.severity, // Inherit severity from the raw event
      sourceEventId: event.id,
    }, event.org_id);
  }
}
