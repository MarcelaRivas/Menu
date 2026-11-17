import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EntityType } from '@prisma/client';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  findByEntity(entityType: string, entityId: number) {
    return this.prisma.schedule.findMany({
      where: { entityType: entityType as EntityType, entityId },
      include: { timeRanges: { orderBy: { dayOfWeek: 'asc' } } },
      orderBy: { startDate: 'asc' },
    });
  }

  async create(data: {
    entityType: string;
    entityId: number;
    startDate: string;
    endDate?: string | null;
    timezone?: string;
    timeRanges?: { dayOfWeek: number; startTime: string; endTime: string }[];
  }) {
    return this.prisma.schedule.create({
      data: {
        entityType: data.entityType as EntityType,
        entityId: data.entityId,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        timezone: data.timezone,
        timeRanges: data.timeRanges ? { createMany: { data: data.timeRanges } } : undefined,
      },
      include: { timeRanges: true },
    });
  }

  async update(
    id: number,
    data: {
      startDate?: string;
      endDate?: string | null;
      timezone?: string;
      timeRanges?: { dayOfWeek: number; startTime: string; endTime: string }[];
    },
  ) {
    const existing = await this.prisma.schedule.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Horario no encontrado');

    if (data.timeRanges) {
      await this.prisma.scheduleTimeRange.deleteMany({ where: { scheduleId: id } });
    }

    const updateData: any = {};
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.timezone) updateData.timezone = data.timezone;

    return this.prisma.schedule.update({
      where: { id },
      data: {
        ...updateData,
        timeRanges: data.timeRanges ? { createMany: { data: data.timeRanges } } : undefined,
      },
      include: { timeRanges: true },
    });
  }

  async remove(id: number) {
    await this.prisma.scheduleTimeRange.deleteMany({ where: { scheduleId: id } });
    return this.prisma.schedule.delete({ where: { id } });
  }
}