import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { HistoryService } from './history.service';

@UseGuards(AuthGuard('jwt'))
@Controller('history')
export class HistoryController {
  constructor(private readonly service: HistoryService) {}

  @Get()
  findRecent(@Query('limit') limit?: string) {
    return this.service.findRecent(limit ? Number(limit) : 100);
  }

  @Get(':entityType/:entityId')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) { return this.service.findByEntity(entityType, Number(entityId)); }
}