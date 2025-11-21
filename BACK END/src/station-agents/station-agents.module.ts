import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StationAgentsController } from './station-agents.controller';
import { StationAgentsService } from './station-agents.service';
import { StationAgent } from './entities/station-agent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StationAgent])],
  controllers: [StationAgentsController],
  providers: [StationAgentsService],
  exports: [StationAgentsService],
})
export class StationAgentsModule {}

