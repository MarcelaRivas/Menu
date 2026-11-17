import {
  Controller, Get, Post, Put, Delete, Body, Param, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ScheduleService } from './schedule.service';

@UseGuards(AuthGuard('jwt'))
@Controller('schedules')
export class ScheduleController {
  constructor(private readonly service: ScheduleService) {}

  @Get(':entityType/:entityId')
  findByEntity(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) { return this.service.findByEntity(entityType, Number(entityId)); }

  @Post()
  create(@Body() data: {
    entityType: string; entityId: number; startDate: string;
    endDate?: string | null; timezone?: string;
    timeRanges?: { dayOfWeek: number; startTime: string; endTime: string }[];
  }) { return this.service.create(data); }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: {
      startDate?: string; endDate?: string | null; timezone?: string;
      timeRanges?: { dayOfWeek: number; startTime: string; endTime: string }[];
    },
  ) { return this.service.update(Number(id), data); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(Number(id)); }
}