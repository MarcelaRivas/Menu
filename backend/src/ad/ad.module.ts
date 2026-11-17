import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdController } from './ad.controller';
import { AdService } from './ad.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdController],
  providers: [AdService],
  exports: [AdService],
})
export class AdModule {}