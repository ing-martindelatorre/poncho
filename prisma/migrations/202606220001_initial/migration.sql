CREATE TYPE "ProjectStatus" AS ENUM ('PLANNED', 'ACTIVE', 'PAUSED', 'FINISHED');
CREATE TYPE "PeriodStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "MoneyKind" AS ENUM ('CASH', 'INVOICED');
CREATE TYPE "PurchaseStatus" AS ENUM ('ORDERED', 'PARTIAL', 'DELIVERED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'CHECK', 'CARD', 'OTHER');
CREATE TYPE "PhotoLinkType" AS ENUM ('PROJECT', 'WEEKLY_PERIOD', 'WORK_ITEM', 'MATERIAL_PURCHASE', 'LABOR_PAYMENT', 'PAYMENT', 'GENERAL');

CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT,
  "client_name" TEXT,
  "built_area_m2" DECIMAL(12,2),
  "status" "ProjectStatus" NOT NULL DEFAULT 'ACTIVE',
  "start_date" DATE,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "weekly_periods" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "week_number" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "status" "PeriodStatus" NOT NULL DEFAULT 'OPEN',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "weekly_periods_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "contractors" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "trade" TEXT,
  "phone" TEXT,
  "email" TEXT,
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "suppliers" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "tax_id" TEXT,
  "notes" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_items" (
  "id" TEXT NOT NULL,
  "weekly_period_id" TEXT NOT NULL,
  "contractor_id" TEXT,
  "category" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "length" DECIMAL(12,3),
  "width" DECIMAL(12,3),
  "height" DECIMAL(12,3),
  "pieces" DECIMAL(12,3),
  "volume" DECIMAL(14,3) NOT NULL DEFAULT 0,
  "unit_price" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "money_kind" "MoneyKind" NOT NULL DEFAULT 'CASH',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "work_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "labor_payments" (
  "id" TEXT NOT NULL,
  "weekly_period_id" TEXT NOT NULL,
  "contractor_id" TEXT,
  "worker_name" TEXT NOT NULL,
  "role" TEXT,
  "days" DECIMAL(10,2),
  "hours" DECIMAL(10,2),
  "rate" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "money_kind" "MoneyKind" NOT NULL DEFAULT 'CASH',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "labor_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "material_purchases" (
  "id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "weekly_period_id" TEXT,
  "supplier_id" TEXT,
  "description" TEXT NOT NULL,
  "invoice_number" TEXT,
  "quantity" DECIMAL(14,3),
  "unit" TEXT,
  "unit_price" DECIMAL(14,2),
  "total" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "paid_amount" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "money_kind" "MoneyKind" NOT NULL DEFAULT 'CASH',
  "status" "PurchaseStatus" NOT NULL DEFAULT 'ORDERED',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "material_purchases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "material_deliveries" (
  "id" TEXT NOT NULL,
  "material_purchase_id" TEXT NOT NULL,
  "weekly_period_id" TEXT,
  "delivery_date" DATE NOT NULL,
  "quantity" DECIMAL(14,3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "material_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "weekly_period_id" TEXT,
  "target_type" TEXT NOT NULL,
  "target_id" TEXT,
  "description" TEXT NOT NULL,
  "amount" DECIMAL(14,2) NOT NULL,
  "method" "PaymentMethod" NOT NULL DEFAULT 'TRANSFER',
  "money_kind" "MoneyKind" NOT NULL DEFAULT 'CASH',
  "paid_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "photos" (
  "id" TEXT NOT NULL,
  "project_id" TEXT,
  "weekly_period_id" TEXT,
  "link_type" "PhotoLinkType" NOT NULL DEFAULT 'GENERAL',
  "link_id" TEXT,
  "file_name" TEXT NOT NULL,
  "storage_path" TEXT NOT NULL,
  "mime_type" TEXT NOT NULL,
  "size_bytes" INTEGER,
  "caption" TEXT,
  "taken_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "photos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "weekly_periods_project_id_week_number_start_date_key" ON "weekly_periods"("project_id", "week_number", "start_date");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE INDEX "weekly_periods_project_id_status_idx" ON "weekly_periods"("project_id", "status");
CREATE INDEX "contractors_active_idx" ON "contractors"("active");
CREATE INDEX "suppliers_active_idx" ON "suppliers"("active");
CREATE INDEX "work_items_weekly_period_id_idx" ON "work_items"("weekly_period_id");
CREATE INDEX "work_items_contractor_id_idx" ON "work_items"("contractor_id");
CREATE INDEX "labor_payments_weekly_period_id_idx" ON "labor_payments"("weekly_period_id");
CREATE INDEX "labor_payments_contractor_id_idx" ON "labor_payments"("contractor_id");
CREATE INDEX "material_purchases_project_id_idx" ON "material_purchases"("project_id");
CREATE INDEX "material_purchases_weekly_period_id_idx" ON "material_purchases"("weekly_period_id");
CREATE INDEX "material_purchases_supplier_id_idx" ON "material_purchases"("supplier_id");
CREATE INDEX "material_deliveries_material_purchase_id_idx" ON "material_deliveries"("material_purchase_id");
CREATE INDEX "material_deliveries_weekly_period_id_idx" ON "material_deliveries"("weekly_period_id");
CREATE INDEX "payments_weekly_period_id_idx" ON "payments"("weekly_period_id");
CREATE INDEX "payments_target_type_target_id_idx" ON "payments"("target_type", "target_id");
CREATE INDEX "photos_project_id_idx" ON "photos"("project_id");
CREATE INDEX "photos_weekly_period_id_idx" ON "photos"("weekly_period_id");
CREATE INDEX "photos_link_type_link_id_idx" ON "photos"("link_type", "link_id");

ALTER TABLE "weekly_periods" ADD CONSTRAINT "weekly_periods_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_weekly_period_id_fkey" FOREIGN KEY ("weekly_period_id") REFERENCES "weekly_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_items" ADD CONSTRAINT "work_items_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "labor_payments" ADD CONSTRAINT "labor_payments_weekly_period_id_fkey" FOREIGN KEY ("weekly_period_id") REFERENCES "weekly_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "labor_payments" ADD CONSTRAINT "labor_payments_contractor_id_fkey" FOREIGN KEY ("contractor_id") REFERENCES "contractors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "material_purchases" ADD CONSTRAINT "material_purchases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "material_purchases" ADD CONSTRAINT "material_purchases_weekly_period_id_fkey" FOREIGN KEY ("weekly_period_id") REFERENCES "weekly_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "material_purchases" ADD CONSTRAINT "material_purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "material_deliveries" ADD CONSTRAINT "material_deliveries_material_purchase_id_fkey" FOREIGN KEY ("material_purchase_id") REFERENCES "material_purchases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "material_deliveries" ADD CONSTRAINT "material_deliveries_weekly_period_id_fkey" FOREIGN KEY ("weekly_period_id") REFERENCES "weekly_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_weekly_period_id_fkey" FOREIGN KEY ("weekly_period_id") REFERENCES "weekly_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "photos" ADD CONSTRAINT "photos_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "photos" ADD CONSTRAINT "photos_weekly_period_id_fkey" FOREIGN KEY ("weekly_period_id") REFERENCES "weekly_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
