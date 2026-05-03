import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from './entities/rule.entity';

@Injectable()
export class DetectionService {
  private readonly logger = new Logger(DetectionService.name);

  constructor(
    @InjectRepository(Rule)
    private readonly ruleRepository: Repository<Rule>,
  ) {}

  async getActiveRules(orgId: string) {
    return this.ruleRepository.find({
      where: { org_id: orgId },
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

  evaluateEvent(event: any, rules: Rule[]) {
    // Basic evaluation logic stub
    const matchedRules: Rule[] = [];
    for (const rule of rules) {
      if (rule.rule_type === 'regex' && event.description?.match(new RegExp(rule.rule_config.pattern))) {
        matchedRules.push(rule);
      }
    }
    return matchedRules;
  }
}
