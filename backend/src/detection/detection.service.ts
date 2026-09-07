import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from './entities/rule.entity';
import { Event } from '../events/entities/event.entity';

/**
 * Supported rule types:
 *  - regex:        { pattern: "string" }                       -> matches against a configurable text field
 *  - exact_match:  { field: "event_type", value: "string" }    -> equality check on a flat event field
 *  - threshold:    { field: "raw_data.bytes", operator: "gt", value: 100 }
 *                  operators: gt | gte | lt | lte | eq
 *  - severity:     { value: "critical" }                       -> matches when event.severity === value
 */
@Injectable()
export class DetectionService {
  private readonly logger = new Logger(DetectionService.name);

  constructor(
    @InjectRepository(Rule)
    private readonly ruleRepository: Repository<Rule>,
  ) {}

  /** All rules for an org (used by the UI list, includes disabled ones). */
  async getActiveRules(orgId: string) {
    return this.ruleRepository.find({
      where: { org_id: orgId },
      order: { created_at: 'DESC' }
    });
  }

  /** Only enabled rules for an org (used by the ingestion evaluation path). */
  async getEnabledRules(orgId: string) {
    return this.ruleRepository.find({
      where: { org_id: orgId, enabled: true },
      order: { created_at: 'DESC' }
    });
  }

  async createRule(orgId: string, ruleData: any) {
    const rule = this.ruleRepository.create({
      org_id: orgId,
      name: ruleData.name,
      rule_type: ruleData.rule_type,
      rule_config: ruleData.rule_config,
      enabled: true
    });
    return this.ruleRepository.save(rule);
  }

  async updateRuleStatus(id: string, orgId: string, enabled: boolean) {
    await this.ruleRepository.update({ id, org_id: orgId }, { enabled });
    return this.ruleRepository.findOne({ where: { id } });
  }

  /**
   * Evaluate a single event against a set of rules.
   * Returns the list of rules that matched.
   */
  evaluateEvent(event: Event | any, rules: Rule[]): Rule[] {
    const matchedRules: Rule[] = [];
    for (const rule of rules) {
      try {
        if (this.matchesRule(event, rule)) {
          matchedRules.push(rule);
        }
      } catch (err: any) {
        this.logger.warn(`Rule "${rule.name}" (${rule.id}) threw during evaluation: ${err.message}`);
      }
    }
    return matchedRules;
  }

  private matchesRule(event: any, rule: Rule): boolean {
    const cfg = rule.rule_config || {};
    switch (rule.rule_type) {
      case 'regex':
        return this.matchRegex(event, cfg);
      case 'exact_match':
        return this.matchExact(event, cfg);
      case 'threshold':
        return this.matchThreshold(event, cfg);
      case 'severity':
        return this.matchSeverity(event, cfg);
      default:
        this.logger.debug(`Unknown rule_type "${rule.rule_type}" on rule ${rule.id}; skipping.`);
        return false;
    }
  }

  /** Regex match against a configurable text field (defaults to description). */
  private matchRegex(event: any, cfg: any): boolean {
    const pattern = cfg.pattern;
    if (!pattern) return false;
    const field: string = cfg.field || 'description';
    const haystack = this.getStringField(event, field);
    if (haystack == null) return false;
    return new RegExp(pattern, cfg.flags || 'i').test(haystack);
  }

  /** Exact equality check on a flat or nested field. */
  private matchExact(event: any, cfg: any): boolean {
    const { field, value } = cfg;
    if (!field || value === undefined) return false;
    const actual = this.getField(event, field);
    return actual === value;
  }

  /** Numeric threshold comparison against a flat or nested field. */
  private matchThreshold(event: any, cfg: any): boolean {
    const { field, operator, value } = cfg;
    if (!field || operator === undefined || value === undefined) return false;
    const actual = this.getField(event, field);
    if (actual === undefined || actual === null) return false;
    const numericActual = Number(actual);
    if (Number.isNaN(numericActual)) return false;
    const numericValue = Number(value);
    switch (operator) {
      case 'gt':  return numericActual >  numericValue;
      case 'gte': return numericActual >= numericValue;
      case 'lt':  return numericActual <  numericValue;
      case 'lte': return numericActual <= numericValue;
      case 'eq':  return numericActual === numericValue;
      default:    return false;
    }
  }

  /** Severity equality check. */
  private matchSeverity(event: any, cfg: any): boolean {
    const { value } = cfg;
    if (!value) return false;
    return String(event.severity || '').toLowerCase() === String(value).toLowerCase();
  }

  /** Resolve a possibly-nested dotted path (e.g. "raw_data.bytes") to a value. */
  private getField(obj: any, path: string): any {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
  }

  /** Same as getField but coerced to a string for regex matching. */
  private getStringField(obj: any, path: string): string | null {
    const v = this.getField(obj, path);
    if (v == null) return null;
    if (typeof v === 'string') return v;
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
}
