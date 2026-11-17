import { IsBoolean, IsInt, IsOptional, IsString, Matches, MaxLength, Min } from 'class-validator';

/** Datos aceptados al crear o editar una sede. El slug solo admite letras, números y guiones. */
export class PageDto {
  @IsOptional() @IsInt() @Min(1) restaurantId?: number;
  @IsOptional() @IsString() @MaxLength(60) name?: string;
  @IsOptional() @IsString() @MaxLength(60) @Matches(/^[a-zA-Z0-9-]+$/, { message: 'La dirección solo puede tener letras, números y guiones' }) slug?: string;
  @IsOptional() @IsString() @MaxLength(1000) contactInfo?: string | null;
  @IsOptional() @IsBoolean() active?: boolean;
}
