-- CreateEnum
CREATE TYPE "MenuType" AS ENUM ('READ_ONLY', 'ORDER', 'FOOD_COURT');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('VISIBLE', 'HIDDEN');

-- CreateEnum
CREATE TYPE "CategoryStyle" AS ENUM ('WITH_IMAGES', 'LIST', 'BANNER');

-- CreateEnum
CREATE TYPE "NavigationType" AS ENUM ('VERTICAL', 'HORIZONTAL');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SINGLE', 'COMBO');

-- CreateEnum
CREATE TYPE "ModifierType" AS ENUM ('ADDITION', 'OPTION');

-- CreateEnum
CREATE TYPE "AdType" AS ENUM ('STORY', 'LINK', 'SUBSCRIBE', 'PRODUCT');

-- CreateEnum
CREATE TYPE "EntityType" AS ENUM ('MENU', 'CATEGORY', 'PAGE_ELEMENT', 'AD');

-- CreateEnum
CREATE TYPE "HistoryAction" AS ENUM ('CREATE', 'EDIT', 'MOVE', 'COPY', 'DUPLICATE', 'REPLACE', 'DELETE', 'ACTIVATE', 'DEACTIVATE');

-- CreateTable
CREATE TABLE "restaurant" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin_global',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "contact_info" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "design" (
    "id" BIGSERIAL NOT NULL,
    "page_id" BIGINT NOT NULL,
    "header_type" TEXT NOT NULL DEFAULT 'color',
    "header_value" TEXT NOT NULL DEFAULT '#ffffff',
    "logo_media_id" BIGINT,
    "logo_size" INTEGER NOT NULL DEFAULT 100,
    "title" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "font" TEXT NOT NULL DEFAULT 'Inter',
    "font_size" INTEGER NOT NULL DEFAULT 16,
    "button_fill_color" TEXT NOT NULL DEFAULT '#2563eb',
    "button_shadow" TEXT NOT NULL DEFAULT 'none',
    "button_border" TEXT NOT NULL DEFAULT 'none',
    "show_icons" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "design_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_element" (
    "id" BIGSERIAL NOT NULL,
    "page_id" BIGINT NOT NULL,
    "menu_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "has_schedule" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "page_element_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu" (
    "id" BIGSERIAL NOT NULL,
    "page_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MenuType" NOT NULL DEFAULT 'READ_ONLY',
    "visibility" "Visibility" NOT NULL DEFAULT 'VISIBLE',
    "language" TEXT NOT NULL DEFAULT 'es',
    "has_schedule" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category" (
    "id" BIGSERIAL NOT NULL,
    "menu_id" BIGINT NOT NULL,
    "parent_id" BIGINT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "image_media_id" BIGINT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "visibility" "Visibility" NOT NULL DEFAULT 'VISIBLE',
    "style" "CategoryStyle" NOT NULL DEFAULT 'WITH_IMAGES',
    "columns" INTEGER NOT NULL DEFAULT 1,
    "navigation" "NavigationType" NOT NULL DEFAULT 'VERTICAL',
    "center_content" BOOLEAN NOT NULL DEFAULT false,
    "hide_title" BOOLEAN NOT NULL DEFAULT false,
    "hide_product_titles" BOOLEAN NOT NULL DEFAULT false,
    "description_ellipsis" BOOLEAN NOT NULL DEFAULT false,
    "has_schedule" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product" (
    "id" BIGSERIAL NOT NULL,
    "category_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "type" "ProductType" NOT NULL DEFAULT 'SINGLE',
    "visibility" "Visibility" NOT NULL DEFAULT 'VISIBLE',
    "hide_prices" BOOLEAN NOT NULL DEFAULT false,
    "recommended" BOOLEAN NOT NULL DEFAULT false,
    "is_new" BOOLEAN NOT NULL DEFAULT false,
    "sold_out" BOOLEAN NOT NULL DEFAULT false,
    "preparation_time" INTEGER,
    "time_per_unit" BOOLEAN NOT NULL DEFAULT false,
    "product_type_1" TEXT,
    "product_type_2" TEXT,
    "product_type_3" TEXT,
    "product_type_4" TEXT,
    "link" TEXT DEFAULT '',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_price" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "value" DECIMAL(10,2) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_range" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "from_quantity" INTEGER NOT NULL,
    "to_quantity" INTEGER,
    "price" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "price_range_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifier" (
    "id" BIGSERIAL NOT NULL,
    "product_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ModifierType" NOT NULL DEFAULT 'ADDITION',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "min" INTEGER NOT NULL DEFAULT 0,
    "max" INTEGER NOT NULL DEFAULT 1,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "modifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modifier_option" (
    "id" BIGSERIAL NOT NULL,
    "modifier_id" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "modifier_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_media" (
    "product_id" BIGINT NOT NULL,
    "media_id" BIGINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "product_media_pkey" PRIMARY KEY ("product_id","media_id")
);

-- CreateTable
CREATE TABLE "ad" (
    "id" BIGSERIAL NOT NULL,
    "restaurant_id" BIGINT NOT NULL,
    "name" TEXT,
    "type" "AdType" NOT NULL DEFAULT 'STORY',
    "media_id" BIGINT,
    "video_url" TEXT,
    "text" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "published_ad" (
    "id" BIGSERIAL NOT NULL,
    "ad_id" BIGINT NOT NULL,
    "page_id" BIGINT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "show_after_seconds" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "published_ad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule" (
    "id" BIGSERIAL NOT NULL,
    "entity_type" "EntityType" NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "timezone" TEXT NOT NULL DEFAULT 'America/Guayaquil',

    CONSTRAINT "schedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_time_range" (
    "id" BIGSERIAL NOT NULL,
    "schedule_id" BIGINT NOT NULL,
    "day_of_week" INTEGER NOT NULL,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,

    CONSTRAINT "schedule_time_range_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "history" (
    "id" BIGSERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" BIGINT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "action" "HistoryAction" NOT NULL,
    "user_id" BIGINT,
    "field_name" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" BIGSERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_slug_key" ON "restaurant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "page_restaurant_id_slug_key" ON "page"("restaurant_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "design_page_id_key" ON "design"("page_id");

-- CreateIndex
CREATE INDEX "history_entity_type_entity_id_idx" ON "history"("entity_type", "entity_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page" ADD CONSTRAINT "page_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "design" ADD CONSTRAINT "design_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_element" ADD CONSTRAINT "page_element_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_element" ADD CONSTRAINT "page_element_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu" ADD CONSTRAINT "menu_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_price" ADD CONSTRAINT "product_price_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_range" ADD CONSTRAINT "price_range_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier" ADD CONSTRAINT "modifier_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modifier_option" ADD CONSTRAINT "modifier_option_modifier_id_fkey" FOREIGN KEY ("modifier_id") REFERENCES "modifier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_media" ADD CONSTRAINT "product_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad" ADD CONSTRAINT "ad_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_ad" ADD CONSTRAINT "published_ad_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "ad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "published_ad" ADD CONSTRAINT "published_ad_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_time_range" ADD CONSTRAINT "schedule_time_range_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "schedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "history" ADD CONSTRAINT "history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
