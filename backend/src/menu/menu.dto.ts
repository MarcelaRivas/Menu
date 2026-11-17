import { IsBoolean, IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

/** Datos aceptados al crear o editar una carta. */
export class MenuDto {
  @IsOptional() @IsInt() @Min(1) pageId?: number;
  @IsOptional() @IsString() @MaxLength(60) name?: string;
  @IsOptional() @IsIn(['READ_ONLY', 'ORDER', 'FOOD_COURT']) type?: string;
  @IsOptional() @IsIn(['VISIBLE', 'HIDDEN']) visibility?: string;
  @IsOptional() @IsString() @MaxLength(10) language?: string;
  @IsOptional() @IsBoolean() active?: boolean;
  @IsOptional() @IsBoolean() hasSchedule?: boolean;
  @IsOptional() @IsBoolean() deliveryEnabled?: boolean;
  @IsOptional() @IsBoolean() pickupEnabled?: boolean;
  @IsOptional() @IsBoolean() dineInEnabled?: boolean;
}
