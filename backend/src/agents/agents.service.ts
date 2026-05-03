import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  async registerAgent(data: any, orgId: string) {
    const agent = this.agentRepository.create({
      ...data,
      org_id: orgId,
      status: 'online',
      last_heartbeat: new Date(),
    });
    return this.agentRepository.save(agent);
  }

  async getAgentsForOrg(orgId: string) {
    return this.agentRepository.find({ where: { org_id: orgId } });
  }

  async updateHeartbeat(agentId: string, orgId: string) {
    const agent = await this.agentRepository.findOne({ where: { id: agentId, org_id: orgId } });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
    agent.last_heartbeat = new Date();
    agent.status = 'online';
    return this.agentRepository.save(agent);
  }

  async deleteAgent(agentId: string, orgId: string) {
    const result = await this.agentRepository.delete({ id: agentId, org_id: orgId });
    if (result.affected === 0) {
      throw new NotFoundException('Agent not found');
    }
    return { success: true };
  }
}
