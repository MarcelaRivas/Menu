import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';

const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Diseño de una sede. El editor envía el diseño completo (incluidos id, pageId y updatedAt
 * que vienen de la lectura); esos campos se aceptan y se descartan en el controlador.
 */
export class DesignDto {
  @IsOptional() @IsInt() id?: number;
  @IsOptional() @IsInt() pageId?: number;
  @IsOptional() updatedAt?: string;

  @IsOptional() @IsIn(['color', 'image']) headerType?: string;
  @IsOptional() @Matches(HEX, { message: 'El color debe tener formato #RRGGBB' }) headerValue?: string;
  @IsOptional() @IsInt() logoMediaId?: number | null;
  @IsOptional() @IsInt() @Min(20) @Max(400) logoSize?: number;
  @IsOptional() @IsString() @MaxLength(120) title?: string;
  @IsOptional() @IsString() @MaxLength(600) description?: string;
  @IsOptional() @IsString() @MaxLength(60) font?: string;
  @IsOptional() @IsInt() @Min(8) @Max(40) fontSize?: number;
  @IsOptional() @Matches(HEX, { message: 'El color debe tener formato #RRGGBB' }) buttonFillColor?: string;
  @IsOptional() @IsString() @MaxLength(60) buttonShadow?: string;
  @IsOptional() @IsString() @MaxLength(60) buttonBorder?: string;
  @IsOptional() @IsBoolean() showIcons?: boolean;
  @IsOptional() @IsInt() backgroundMediaId?: number | null;
  @IsOptional() @IsInt() @Min(0) @Max(100) backgroundBrightness?: number;
  @IsOptional() @IsIn(['square', 'rounded', 'pill']) buttonShape?: string;
  @IsOptional() @IsIn(['S', 'M', 'L']) buttonSize?: string;
  @IsOptional() @Matches(HEX, { message: 'El color debe tener formato #RRGGBB' }) buttonTextColor?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) buttonFillOpacity?: number;
  @IsOptional() @Matches(HEX, { message: 'El color debe tener formato #RRGGBB' }) buttonBorderColor?: string;
  @IsOptional() @Matches(HEX, { message: 'El color debe tener formato #RRGGBB' }) buttonShadowColor?: string;
  @IsOptional() @IsInt() @Min(0) @Max(100) buttonShadowOpacity?: number;
}
