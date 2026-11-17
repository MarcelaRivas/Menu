import { Controller, Get, Put, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotificationService } from './notification.service';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  findByUser(@Query('userId') userId: string) {
    return this.service.findByUser(Number(userId));
  }

  @Put(':id/read')
  markAsRead(@Param('id') id: string) { return this.service.markAsRead(Number(id)); }
}