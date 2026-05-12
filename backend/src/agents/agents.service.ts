import { Injectable, NotFoundException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Agent } from './entities/agent.entity';

@Injectable()
export class AgentsService implements OnModuleInit {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    @InjectRepository(Agent)
    private readonly agentRepository: Repository<Agent>,
  ) {}

  onModuleInit() {
    this.startHeartbeatMonitor();
  }

  private startHeartbeatMonitor() {
    this.logger.log('Starting agent heartbeat monitor...');
    setInterval(async () => {
      try {
        const threshold = new Date();
        threshold.setMinutes(threshold.getMinutes() - 2); // 2 minutes without heartbeat = offline

        const result = await this.agentRepository.update(
          {
            status: 'online',
            last_heartbeat: LessThan(threshold),
          },
          { status: 'offline' }
        );

        if (result.affected && result.affected > 0) {
          this.logger.warn(`Marked ${result.affected} agents as offline due to missed heartbeats`);
        }
      } catch (error) {
        this.logger.error('Error in heartbeat monitor:', error);
      }
    }, 60000); // Check every minute
  }

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
