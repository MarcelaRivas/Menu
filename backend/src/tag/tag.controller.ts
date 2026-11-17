import { BadRequestException, Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';

const MAX_LENGTH = 30;

@UseGuards(AuthGuard('jwt'))
@Controller('tags')
export class TagController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  findAll() {
    return this.prisma.tag.findMany({ orderBy: { name: 'asc' } });
  }

  /** Crea la etiqueta si no existe; si ya existe, devuelve la existente. */
  @Post()
  async create(@Body() body: { name?: string }) {
    const name = (body.name ?? '').trim().replace(/\s+/g, ' ');
    if (!name) throw new BadRequestException('El nombre de la etiqueta es obligatorio');
    if (name.length > MAX_LENGTH) throw new BadRequestException(`Máximo ${MAX_LENGTH} caracteres`);
    return this.prisma.tag.upsert({ where: { name }, update: {}, create: { name } });
  }
}
