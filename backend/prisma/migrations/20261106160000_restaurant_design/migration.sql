-- Diseño del restaurante (página principal que lista sus sedes).
-- Tabla nueva; no altera tablas existentes.

-- CreateTable
CREATE TABLE "restaurant_design" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "header_type" TEXT NOT NULL DEFAULT 'color',
    "header_value" TEXT NOT NULL DEFAULT '#ffffff',
    "background_media_id" BIGINT,
    "background_brightness" INTEGER NOT NULL DEFAULT 100,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "font" TEXT NOT NULL DEFAULT 'Inter',
    "font_size" INTEGER NOT NULL DEFAULT 16,
    "button_fill_color" TEXT NOT NULL DEFAULT '#2563eb',
    "button_fill_opacity" INTEGER NOT NULL DEFAULT 100,
    "button_text_color" TEXT NOT NULL DEFAULT '#ffffff',
    "button_shape" TEXT NOT NULL DEFAULT 'rounded',
    "button_size" TEXT NOT NULL DEFAULT 'M',
    "button_border_color" TEXT NOT NULL DEFAULT '#c3aa80',
    "button_shadow_color" TEXT NOT NULL DEFAULT '#000000',
    "button_shadow_opacity" INTEGER NOT NULL DEFAULT 10,
    "show_icons" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_design_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_design_restaurant_id_key" ON "restaurant_design"("restaurant_id");

-- AddForeignKey
ALTER TABLE "restaurant_design" ADD CONSTRAINT "restaurant_design_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
