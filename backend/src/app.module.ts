import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PageModule } from './page/page.module';
import { MenuModule } from './menu/menu.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { AdModule } from './ad/ad.module';
import { HistoryModule } from './history/history.module';
import { ScheduleModule } from './schedule/schedule.module';
import { MediaModule } from './media/media.module';
import { NotificationModule } from './notification/notification.module';
import { PublicModule } from './public/public.module';
import { TagModule } from './tag/tag.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RestaurantModule,
    PageModule,
    MenuModule,
    CategoryModule,
    ProductModule,
    AdModule,
    HistoryModule,
    ScheduleModule,
    MediaModule,
    NotificationModule,
    PublicModule,
    TagModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}