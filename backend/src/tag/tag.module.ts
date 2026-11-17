import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TagController } from './tag.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TagController],
})
export class TagModule {}
