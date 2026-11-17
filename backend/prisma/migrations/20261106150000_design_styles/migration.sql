-- Estilos de diseño de sede: fondo con imagen y estilos de botones (columnas nuevas con valor por defecto).
ALTER TABLE "design" ADD COLUMN "background_media_id" BIGINT,
ADD COLUMN "background_brightness" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN "button_shape" TEXT NOT NULL DEFAULT 'rounded',
ADD COLUMN "button_size" TEXT NOT NULL DEFAULT 'M',
ADD COLUMN "button_text_color" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN "button_fill_opacity" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN "button_border_color" TEXT NOT NULL DEFAULT '#c3aa80',
ADD COLUMN "button_shadow_color" TEXT NOT NULL DEFAULT '#000000',
ADD COLUMN "button_shadow_opacity" INTEGER NOT NULL DEFAULT 10;
