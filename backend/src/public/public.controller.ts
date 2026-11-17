import { Controller, Get, Param } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('restaurants/:restaurant')
  getRestaurant(@Param('restaurant') restaurant: string) {
    return this.service.getRestaurantBySlug(restaurant);
  }

  @Get('restaurants/:restaurant/pages/:page')
  getPage(@Param('restaurant') restaurant: string, @Param('page') page: string) {
    return this.service.getPageBySlug(restaurant, page);
  }

  @Get('menus/:id')
  getMenu(@Param('id') id: string) {
    return this.service.getMenu(Number(id));
  }
}