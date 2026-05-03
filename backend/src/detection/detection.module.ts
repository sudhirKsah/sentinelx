import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DetectionService } from './detection.service';
import { DetectionController } from './detection.controller';
import { Rule } from './entities/rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Rule])],
  controllers: [DetectionController],
  providers: [DetectionService],
  exports: [DetectionService],
})
export class DetectionModule {}
