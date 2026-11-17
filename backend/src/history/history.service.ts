import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HistoryAction } from '@prisma/client';

@Injectable()
export class HistoryService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    entityType: string;
    entityId: number;
    entityName: string;
    action: HistoryAction;
    userId?: number | null;
    fieldName?: string | null;
    oldValue?: string | null;
    newValue?: string | null;
  }) {
    return this.prisma.history.create({ data });
  }

  /** Últimos cambios de todo el sistema (para la pantalla de historial). */
  findRecent(limit = 100) {
    return this.prisma.history.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 500),
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  findByEntity(entityType: string, entityId: number) {
    return this.prisma.history.findMany({
      where: { entityType, entityId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}