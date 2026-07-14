-- Converted from data.sql MySQL dump for PostgreSQL.
-- Source database: app_quan_tri; target database: app_ke_toan.
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
CREATE TABLE "_prisma_migrations" (
  "id" varchar(36) NOT NULL,
  "checksum" varchar(64) NOT NULL,
  "finished_at" timestamp(3) DEFAULT NULL,
  "migration_name" varchar(255) NOT NULL,
  "logs" text,
  "rolled_back_at" timestamp(3) DEFAULT NULL,
  "started_at" timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  "applied_steps_count" integer NOT NULL DEFAULT '0',
  PRIMARY KEY ("id")
);

INSERT INTO "_prisma_migrations" ("id","checksum","finished_at","migration_name","logs","rolled_back_at","started_at","applied_steps_count") VALUES ('34f6d2c6-69c0-47e6-9b8f-42fd3282ba65','fd49911e5e6978da4f440e0b1fd7d74f0ef9ca8a1235798f16c509e8c60ad557','2026-07-10 02:26:07.122','202607090001_initial_safe_baseline',NULL,NULL,'2026-07-10 02:25:59.246',1),('58861a8c-8c53-46f2-82d1-c22f14aac5f8','3a54180cd08908479dc1a2abcb79d68a39c90f4891c6efe49fb91ac0ed4788f3','2026-07-10 02:26:07.472','20260709144118_m2_voucher_header_alignment',NULL,NULL,'2026-07-10 02:26:07.125',1);
DROP TABLE IF EXISTS "accounts" CASCADE;
CREATE TABLE "accounts" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "parent_id" char(36) DEFAULT NULL,
  "account_group" varchar(30) NOT NULL,
  "normal_balance" varchar(10) NOT NULL,
  "level" integer NOT NULL,
  "is_postable" boolean NOT NULL DEFAULT true,
  "is_active" boolean NOT NULL DEFAULT true,
  "allows_counterparty" boolean NOT NULL DEFAULT false,
  "allows_contract" boolean NOT NULL DEFAULT false,
  "allows_item" boolean NOT NULL DEFAULT false,
  "allows_warehouse" boolean NOT NULL DEFAULT false,
  "allows_employee" boolean NOT NULL DEFAULT false,
  "effective_from" date DEFAULT NULL,
  "effective_to" date DEFAULT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "ai_job_outputs" CASCADE;
CREATE TABLE "ai_job_outputs" (
  "id" char(36) NOT NULL,
  "ai_job_id" char(36) NOT NULL,
  "output_type" varchar(80) NOT NULL,
  "payload" text NOT NULL,
  "confidence" decimal(5,4) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "ai_jobs" CASCADE;
CREATE TABLE "ai_jobs" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "job_type" varchar(80) NOT NULL,
  "input_ref" varchar(255) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "started_at" timestamp(3) DEFAULT NULL,
  "ended_at" timestamp(3) DEFAULT NULL,
  "error_message" text,
  "created_by" char(36) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "approval_actions" CASCADE;
CREATE TABLE "approval_actions" (
  "id" char(36) NOT NULL,
  "approval_instance_id" char(36) NOT NULL,
  "step_no" integer NOT NULL,
  "action" varchar(20) NOT NULL,
  "acted_by" char(36) NOT NULL,
  "acted_at" timestamp(3) NOT NULL,
  "comment" varchar(1000) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "approval_flow_steps" CASCADE;
CREATE TABLE "approval_flow_steps" (
  "id" char(36) NOT NULL,
  "flow_id" char(36) NOT NULL,
  "step_no" integer NOT NULL,
  "approver_role_id" char(36) DEFAULT NULL,
  "approver_user_id" char(36) DEFAULT NULL,
  "deadline_hours" integer DEFAULT NULL,
  "required" boolean NOT NULL DEFAULT true,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "approval_flows" CASCADE;
CREATE TABLE "approval_flows" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "document_type" varchar(40) NOT NULL,
  "name" varchar(255) NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "approval_instances" CASCADE;
CREATE TABLE "approval_instances" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "flow_id" char(36) NOT NULL,
  "document_type" varchar(40) NOT NULL,
  "document_id" char(36) NOT NULL,
  "status" varchar(20) NOT NULL,
  "current_step_no" integer NOT NULL DEFAULT '1',
  "started_at" timestamp(3) NOT NULL,
  "completed_at" timestamp(3) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "asset_movements" CASCADE;
CREATE TABLE "asset_movements" (
  "id" char(36) NOT NULL,
  "asset_id" char(36) NOT NULL,
  "movement_type" varchar(40) NOT NULL,
  "movement_date" date NOT NULL,
  "amount" decimal(18,2) NOT NULL,
  "journal_entry_id" char(36) DEFAULT NULL,
  "memo" varchar(500) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "attachment_files" CASCADE;
CREATE TABLE "attachment_files" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "entity_name" varchar(120) NOT NULL,
  "entity_id" char(36) NOT NULL,
  "file_name" varchar(255) NOT NULL,
  "mime_type" varchar(120) NOT NULL,
  "file_size" bigint NOT NULL,
  "storage_key" varchar(500) NOT NULL,
  "file_hash" varchar(128) NOT NULL,
  "created_by" char(36) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "audit_events" CASCADE;
CREATE TABLE "audit_events" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "actor_user_id" char(36) DEFAULT NULL,
  "action" varchar(120) NOT NULL,
  "entity_name" varchar(120) NOT NULL,
  "entity_id" char(36) NOT NULL,
  "before_data" text,
  "after_data" text,
  "ip_address" varchar(45) DEFAULT NULL,
  "user_agent" varchar(500) DEFAULT NULL,
  "request_id" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "bank_accounts" CASCADE;
CREATE TABLE "bank_accounts" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "bank_name" varchar(255) NOT NULL,
  "account_no" varchar(128) NOT NULL,
  "account_holder" varchar(255) NOT NULL,
  "currency_code" varchar(8) NOT NULL DEFAULT 'VND',
  "branch_name" varchar(255) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "bank_reconciliation_matches" CASCADE;
CREATE TABLE "bank_reconciliation_matches" (
  "id" char(36) NOT NULL,
  "statement_line_id" char(36) NOT NULL,
  "voucher_id" char(36) NOT NULL,
  "matched_amount" decimal(18,2) NOT NULL,
  "matched_by" char(36) DEFAULT NULL,
  "matched_at" timestamp(3) NOT NULL,
  "note" varchar(255) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "bank_statement_lines" CASCADE;
CREATE TABLE "bank_statement_lines" (
  "id" char(36) NOT NULL,
  "statement_id" char(36) NOT NULL,
  "line_no" integer NOT NULL,
  "value_date" date DEFAULT NULL,
  "transaction_date" date DEFAULT NULL,
  "description" varchar(1000) NOT NULL,
  "reference_no" varchar(128) DEFAULT NULL,
  "debit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "credit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "balance_after" decimal(18,2) DEFAULT NULL,
  "matched_status" varchar(64) NOT NULL DEFAULT 'unmatched',
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "bank_statements" CASCADE;
CREATE TABLE "bank_statements" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "bank_account_id" char(36) NOT NULL,
  "statement_no" varchar(64) DEFAULT NULL,
  "statement_date" date NOT NULL,
  "opening_balance" decimal(18,2) NOT NULL DEFAULT '0.00',
  "closing_balance" decimal(18,2) NOT NULL DEFAULT '0.00',
  "source_file_name" varchar(255) DEFAULT NULL,
  "source_file_hash" varchar(128) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "imported_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "cash_books" CASCADE;
CREATE TABLE "cash_books" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "currency_code" varchar(8) NOT NULL DEFAULT 'VND',
  "status" varchar(20) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "contracts" CASCADE;
CREATE TABLE "contracts" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "contract_no" varchar(64) NOT NULL,
  "contract_name" varchar(255) NOT NULL,
  "counterparty_type" varchar(20) NOT NULL,
  "customer_id" char(36) DEFAULT NULL,
  "supplier_id" char(36) DEFAULT NULL,
  "signed_date" date DEFAULT NULL,
  "start_date" date DEFAULT NULL,
  "end_date" date DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "cost_items" CASCADE;
CREATE TABLE "cost_items" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "parent_id" char(36) DEFAULT NULL,
  "cost_group" varchar(20) NOT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "customers" CASCADE;
CREATE TABLE "customers" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "tax_code" varchar(32) DEFAULT NULL,
  "short_name" varchar(255) DEFAULT NULL,
  "phone" varchar(40) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "address" varchar(512) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "depreciation_lines" CASCADE;
CREATE TABLE "depreciation_lines" (
  "id" char(36) NOT NULL,
  "depreciation_run_id" char(36) NOT NULL,
  "asset_id" char(36) NOT NULL,
  "amount" decimal(18,2) NOT NULL,
  "journal_entry_id" char(36) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "depreciation_runs" CASCADE;
CREATE TABLE "depreciation_runs" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "period_year" integer NOT NULL,
  "period_month" integer NOT NULL,
  "status" varchar(20) NOT NULL,
  "run_at" timestamp(3) NOT NULL,
  "created_by" char(36) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "employees" CASCADE;
CREATE TABLE "employees" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "department_name" varchar(255) DEFAULT NULL,
  "position_name" varchar(255) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "fixed_assets" CASCADE;
CREATE TABLE "fixed_assets" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "asset_code" varchar(64) NOT NULL,
  "asset_name" varchar(255) NOT NULL,
  "asset_category" varchar(255) NOT NULL,
  "acquisition_date" date NOT NULL,
  "original_cost" decimal(18,2) NOT NULL,
  "residual_value" decimal(18,2) NOT NULL DEFAULT '0.00',
  "useful_life_months" integer NOT NULL,
  "depreciation_method" varchar(40) NOT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "inventory_balances" CASCADE;
CREATE TABLE "inventory_balances" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "snapshot_date" date NOT NULL,
  "item_id" char(36) NOT NULL,
  "warehouse_id" char(36) NOT NULL,
  "lot_no" varchar(128) DEFAULT NULL,
  "opening_qty" decimal(18,4) NOT NULL DEFAULT '0.0000',
  "in_qty" decimal(18,4) NOT NULL DEFAULT '0.0000',
  "out_qty" decimal(18,4) NOT NULL DEFAULT '0.0000',
  "closing_qty" decimal(18,4) NOT NULL DEFAULT '0.0000',
  "closing_cost" decimal(18,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "inventory_document_lines" CASCADE;
CREATE TABLE "inventory_document_lines" (
  "id" char(36) NOT NULL,
  "inventory_document_id" char(36) NOT NULL,
  "line_no" integer NOT NULL,
  "item_id" char(36) NOT NULL,
  "warehouse_id" char(36) NOT NULL,
  "qty_in" decimal(18,4) NOT NULL DEFAULT '0.0000',
  "qty_out" decimal(18,4) NOT NULL DEFAULT '0.0000',
  "unit_cost" decimal(18,4) DEFAULT NULL,
  "lot_no" varchar(128) DEFAULT NULL,
  "memo" varchar(500) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "inventory_documents" CASCADE;
CREATE TABLE "inventory_documents" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "document_type" varchar(40) NOT NULL,
  "document_no" varchar(64) NOT NULL,
  "document_date" date NOT NULL,
  "status" varchar(20) NOT NULL,
  "source_voucher_id" char(36) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "item_categories" CASCADE;
CREATE TABLE "item_categories" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "parent_id" char(36) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "items" CASCADE;
CREATE TABLE "items" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "item_type" varchar(30) NOT NULL,
  "category_id" char(36) DEFAULT NULL,
  "uom_id" char(36) DEFAULT NULL,
  "barcode" varchar(128) DEFAULT NULL,
  "is_inventory_item" boolean NOT NULL DEFAULT true,
  "is_service_item" boolean NOT NULL DEFAULT false,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "journal_entries" CASCADE;
CREATE TABLE "journal_entries" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "entry_no" varchar(64) NOT NULL,
  "entry_date" date NOT NULL,
  "source_type" varchar(40) NOT NULL,
  "source_id" char(36) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "description" varchar(1000) DEFAULT NULL,
  "posted_at" timestamp(3) DEFAULT NULL,
  "created_by" char(36) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "journal_entry_lines" CASCADE;
CREATE TABLE "journal_entry_lines" (
  "id" char(36) NOT NULL,
  "journal_entry_id" char(36) NOT NULL,
  "line_no" integer NOT NULL,
  "account_id" char(36) NOT NULL,
  "customer_id" char(36) DEFAULT NULL,
  "supplier_id" char(36) DEFAULT NULL,
  "employee_id" char(36) DEFAULT NULL,
  "contract_id" char(36) DEFAULT NULL,
  "cost_item_id" char(36) DEFAULT NULL,
  "warehouse_id" char(36) DEFAULT NULL,
  "bank_account_id" char(36) DEFAULT NULL,
  "item_id" char(36) DEFAULT NULL,
  "debit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "credit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "memo" varchar(500) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "ledger_balances" CASCADE;
CREATE TABLE "ledger_balances" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "period_year" integer NOT NULL,
  "period_month" integer NOT NULL,
  "account_id" char(36) NOT NULL,
  "customer_id" char(36) DEFAULT NULL,
  "supplier_id" char(36) DEFAULT NULL,
  "warehouse_id" char(36) DEFAULT NULL,
  "contract_id" char(36) DEFAULT NULL,
  "opening_debit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "opening_credit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "period_debit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "period_credit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "closing_debit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "closing_credit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "calculated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "materialized_metrics" CASCADE;
CREATE TABLE "materialized_metrics" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "metric_code" varchar(64) NOT NULL,
  "metric_date" date NOT NULL,
  "dimension_key" varchar(255) DEFAULT NULL,
  "metric_value" decimal(18,4) NOT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "opening_balance_account_lines" CASCADE;
CREATE TABLE "opening_balance_account_lines" (
  "id" char(36) NOT NULL,
  "batch_id" char(36) NOT NULL,
  "account_id" char(36) NOT NULL,
  "customer_id" char(36) DEFAULT NULL,
  "supplier_id" char(36) DEFAULT NULL,
  "employee_id" char(36) DEFAULT NULL,
  "contract_id" char(36) DEFAULT NULL,
  "warehouse_id" char(36) DEFAULT NULL,
  "item_id" char(36) DEFAULT NULL,
  "debit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "credit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "memo" varchar(500) DEFAULT NULL,
  "line_no" integer NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "opening_balance_batches" CASCADE;
CREATE TABLE "opening_balance_batches" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "period_year" integer NOT NULL,
  "period_month" integer DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "opening_balance_inventory_lines" CASCADE;
CREATE TABLE "opening_balance_inventory_lines" (
  "id" char(36) NOT NULL,
  "batch_id" char(36) NOT NULL,
  "item_id" char(36) NOT NULL,
  "warehouse_id" char(36) NOT NULL,
  "lot_no" varchar(128) DEFAULT NULL,
  "quantity" decimal(18,4) NOT NULL,
  "unit_cost" decimal(18,4) NOT NULL,
  "amount" decimal(18,2) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "opening_balance_payable_lines" CASCADE;
CREATE TABLE "opening_balance_payable_lines" (
  "id" char(36) NOT NULL,
  "batch_id" char(36) NOT NULL,
  "supplier_id" char(36) NOT NULL,
  "contract_id" char(36) DEFAULT NULL,
  "account_id" char(36) NOT NULL,
  "invoice_no" varchar(64) DEFAULT NULL,
  "due_date" date DEFAULT NULL,
  "amount" decimal(18,2) NOT NULL,
  "memo" varchar(500) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "opening_balance_receivable_lines" CASCADE;
CREATE TABLE "opening_balance_receivable_lines" (
  "id" char(36) NOT NULL,
  "batch_id" char(36) NOT NULL,
  "customer_id" char(36) NOT NULL,
  "contract_id" char(36) DEFAULT NULL,
  "account_id" char(36) NOT NULL,
  "invoice_no" varchar(64) DEFAULT NULL,
  "due_date" date DEFAULT NULL,
  "amount" decimal(18,2) NOT NULL,
  "memo" varchar(500) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "organizations" CASCADE;
CREATE TABLE "organizations" (
  "id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "tax_code" varchar(32) DEFAULT NULL,
  "base_currency" varchar(8) NOT NULL DEFAULT 'VND',
  "timezone" varchar(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  "status" varchar(20) NOT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

INSERT INTO "organizations" ("id","code","name","tax_code","base_currency","timezone","status","created_at","updated_at") VALUES ('d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','TTPPAPER','Công ty TNHH Giấy Tín Thịnh Phát',NULL,'VND','Asia/Ho_Chi_Minh','active','2026-07-13 03:58:35.006','2026-07-13 03:58:35.007');
DROP TABLE IF EXISTS "prepaid_allocations" CASCADE;
CREATE TABLE "prepaid_allocations" (
  "id" char(36) NOT NULL,
  "prepaid_expense_id" char(36) NOT NULL,
  "allocation_date" date NOT NULL,
  "amount" decimal(18,2) NOT NULL,
  "journal_entry_id" char(36) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "prepaid_expenses" CASCADE;
CREATE TABLE "prepaid_expenses" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "prepaid_code" varchar(64) NOT NULL,
  "prepaid_name" varchar(255) NOT NULL,
  "supplier_id" char(36) DEFAULT NULL,
  "start_date" date NOT NULL,
  "end_date" date NOT NULL,
  "original_amount" decimal(18,2) NOT NULL,
  "allocated_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "status" varchar(20) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "report_snapshots" CASCADE;
CREATE TABLE "report_snapshots" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "report_code" varchar(64) NOT NULL,
  "period_year" integer NOT NULL,
  "period_month" integer DEFAULT NULL,
  "snapshot_key" varchar(255) NOT NULL,
  "payload" text NOT NULL,
  "generated_at" timestamp(3) NOT NULL,
  "generated_by" char(36) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "roles" CASCADE;
CREATE TABLE "roles" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "is_system" boolean NOT NULL DEFAULT false,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

INSERT INTO "roles" ("id","organization_id","code","name","is_system","created_at","updated_at") VALUES ('2b78db6f-8a63-4024-820b-332a8045edeb','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','director','Giám đốc',true,'2026-07-13 03:58:35.016','2026-07-13 03:58:35.017'),('36418658-1816-43af-97d0-b4c575a72b94','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','accountant','Kế toán viên',true,'2026-07-13 03:58:35.023','2026-07-13 03:58:35.024'),('d5d0b572-f99e-4322-b868-f2df6dc7b08f','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','chief_accountant','Kế toán trưởng',true,'2026-07-13 03:58:35.020','2026-07-13 03:58:35.021');
DROP TABLE IF EXISTS "source_systems" CASCADE;
CREATE TABLE "source_systems" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "source_type" varchar(40) NOT NULL,
  "base_url" varchar(512) DEFAULT NULL,
  "auth_type" varchar(40) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "last_synced_at" timestamp(3) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "suppliers" CASCADE;
CREATE TABLE "suppliers" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "tax_code" varchar(32) DEFAULT NULL,
  "short_name" varchar(255) DEFAULT NULL,
  "phone" varchar(40) DEFAULT NULL,
  "email" varchar(255) DEFAULT NULL,
  "address" varchar(512) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "sync_mappings" CASCADE;
CREATE TABLE "sync_mappings" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "source_system_id" char(36) NOT NULL,
  "entity_name" varchar(120) NOT NULL,
  "source_record_id" varchar(128) NOT NULL,
  "local_table_name" varchar(128) NOT NULL,
  "local_record_id" char(36) NOT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "sync_status" varchar(20) NOT NULL,
  "last_sync_run_id" char(36) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "sync_raw_payloads" CASCADE;
CREATE TABLE "sync_raw_payloads" (
  "id" char(36) NOT NULL,
  "sync_run_id" char(36) NOT NULL,
  "entity_name" varchar(120) NOT NULL,
  "source_record_id" varchar(128) NOT NULL,
  "payload" text NOT NULL,
  "payload_hash" varchar(128) NOT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "sync_runs" CASCADE;
CREATE TABLE "sync_runs" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "source_system_id" char(36) NOT NULL,
  "entity_name" varchar(120) NOT NULL,
  "mode" varchar(20) NOT NULL,
  "status" varchar(20) NOT NULL,
  "started_at" timestamp(3) NOT NULL,
  "ended_at" timestamp(3) DEFAULT NULL,
  "records_read" integer NOT NULL DEFAULT '0',
  "records_inserted" integer NOT NULL DEFAULT '0',
  "records_updated" integer NOT NULL DEFAULT '0',
  "records_skipped" integer NOT NULL DEFAULT '0',
  "records_failed" integer NOT NULL DEFAULT '0',
  "error_message" text,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "units_of_measure" CASCADE;
CREATE TABLE "units_of_measure" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "status" varchar(20) NOT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "user_roles" CASCADE;
CREATE TABLE "user_roles" (
  "id" char(36) NOT NULL,
  "user_id" char(36) NOT NULL,
  "role_id" char(36) NOT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

INSERT INTO "user_roles" ("id","user_id","role_id","created_at") VALUES ('2499da91-59fe-403b-b9a2-af9a046e10c3','54653463-d8fc-45d5-937c-45f146be5fe7','36418658-1816-43af-97d0-b4c575a72b94','2026-07-13 04:19:20.205'),('936dfb46-dda1-498a-b134-edd2cb53e203','2c34e28f-c779-4963-a385-0f81f790eca5','36418658-1816-43af-97d0-b4c575a72b94','2026-07-13 04:20:24.264'),('dcd5d497-a37f-4eef-bb82-dcf0bb53a13d','f75f50c7-afd5-46e6-99bb-beb08997bba1','d5d0b572-f99e-4322-b868-f2df6dc7b08f','2026-07-13 04:18:01.525'),('f6adfe4a-8544-42c4-b6eb-3e210fd118a0','9ea038e8-e7e1-4301-9238-3d2a5c399cfa','2b78db6f-8a63-4024-820b-332a8045edeb','2026-07-13 03:58:35.027');
DROP TABLE IF EXISTS "users" CASCADE;
CREATE TABLE "users" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "email" varchar(255) DEFAULT NULL,
  "username" varchar(120) NOT NULL,
  "full_name" varchar(255) NOT NULL,
  "password_hash" varchar(255) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "last_login_at" timestamp(3) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

INSERT INTO "users" ("id","organization_id","email","username","full_name","password_hash","status","last_login_at","created_at","updated_at") VALUES ('2c34e28f-c779-4963-a385-0f81f790eca5','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','ketoanvien02@netviet.vn','ketoanvien02','Kế toán viên thứ hai','$2b$12$DzfQeOJiq1VUjtn5xAivSeCy4bWSdhVJHYA3LnpH59CnS4qxqvify','active',NULL,'2026-07-13 04:20:24.264','2026-07-13 04:20:24.265'),('54653463-d8fc-45d5-937c-45f146be5fe7','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','ketoanvien01@netviet.vn','ketoanvien01','Trần Thị Kế Toán','$2b$12$KrCch.JouMIZA9b32YOsPOmZnp.7ToMWSmnaYq2z5ENzUoPlI/8oS','active',NULL,'2026-07-13 04:19:20.205','2026-07-13 04:19:20.206'),('9ea038e8-e7e1-4301-9238-3d2a5c399cfa','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','director@netviet.vn','director','Giám đốc NetViet','$2b$12$GRq8wij67kSQor6jw33rPOeS2L9cF1GJlKFe2RFcoxheDuZFrIGDa','active','2026-07-13 07:10:54.782','2026-07-13 03:58:35.027','2026-07-13 07:10:54.783'),('f75f50c7-afd5-46e6-99bb-beb08997bba1','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','ketoantruong@netviet.vn','ketoantruong','Nguyễn Văn Kế Toán','$2b$12$ZF03GB9iv9dyZN1lK6IJMOh.vjwTAj5rGexHOCXrm8WGTuRarcXUK','active','2026-07-13 04:18:24.138','2026-07-13 04:18:01.525','2026-07-13 04:18:24.140');
DROP TABLE IF EXISTS "voucher_lines" CASCADE;
CREATE TABLE "voucher_lines" (
  "id" char(36) NOT NULL,
  "voucher_id" char(36) NOT NULL,
  "line_no" integer NOT NULL,
  "account_id" char(36) NOT NULL,
  "customer_id" char(36) DEFAULT NULL,
  "supplier_id" char(36) DEFAULT NULL,
  "employee_id" char(36) DEFAULT NULL,
  "contract_id" char(36) DEFAULT NULL,
  "cost_item_id" char(36) DEFAULT NULL,
  "warehouse_id" char(36) DEFAULT NULL,
  "bank_account_id" char(36) DEFAULT NULL,
  "item_id" char(36) DEFAULT NULL,
  "debit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "credit_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "quantity" decimal(18,4) DEFAULT NULL,
  "unit_price" decimal(18,4) DEFAULT NULL,
  "tax_rate" decimal(5,2) DEFAULT NULL,
  "memo" varchar(500) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "vouchers" CASCADE;
CREATE TABLE "vouchers" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "voucher_type" varchar(40) NOT NULL,
  "voucher_no" varchar(64) NOT NULL,
  "voucher_date" date NOT NULL,
  "posting_date" date DEFAULT NULL,
  "currency_code" varchar(8) NOT NULL DEFAULT 'VND',
  "exchange_rate" decimal(18,6) NOT NULL DEFAULT '1.000000',
  "status" varchar(20) NOT NULL,
  "approval_status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "description" varchar(1000) DEFAULT NULL,
  "total_debit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "total_credit" decimal(18,2) NOT NULL DEFAULT '0.00',
  "created_by" char(36) DEFAULT NULL,
  "updated_by" char(36) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  "bank_account_id" char(36) DEFAULT NULL,
  "cash_book_id" char(36) DEFAULT NULL,
  "counterparty_type" varchar(64) DEFAULT NULL,
  "matched_amount" decimal(18,2) NOT NULL DEFAULT '0.00',
  "payment_channel" varchar(64) DEFAULT NULL,
  "reconciliation_status" varchar(64) NOT NULL DEFAULT 'unmatched',
  "reference_invoice_no" varchar(128) DEFAULT NULL,
  PRIMARY KEY ("id")
);

DROP TABLE IF EXISTS "warehouses" CASCADE;
CREATE TABLE "warehouses" (
  "id" char(36) NOT NULL,
  "organization_id" char(36) NOT NULL,
  "code" varchar(64) NOT NULL,
  "name" varchar(255) NOT NULL,
  "location" varchar(255) DEFAULT NULL,
  "status" varchar(20) NOT NULL,
  "source_system_id" char(36) DEFAULT NULL,
  "source_record_id" varchar(128) DEFAULT NULL,
  "source_updated_at" timestamp(3) DEFAULT NULL,
  "source_checksum" varchar(128) DEFAULT NULL,
  "created_at" timestamp(3) NOT NULL,
  "updated_at" timestamp(3) NOT NULL,
  PRIMARY KEY ("id")
);


-- Indexes
CREATE UNIQUE INDEX "uq_accounts_org_code" ON "accounts" ("organization_id","code");
CREATE INDEX "fk_accounts_parent_idx" ON "accounts" ("parent_id");
CREATE INDEX "idx_accounts_active" ON "accounts" ("organization_id","is_active");
CREATE INDEX "idx_accounts_group" ON "accounts" ("organization_id","account_group");
CREATE INDEX "idx_accounts_org_parent" ON "accounts" ("organization_id","parent_id");
CREATE INDEX "idx_accounts_source" ON "accounts" ("source_system_id","source_record_id");
CREATE INDEX "fk_ai_job_outputs_job_idx" ON "ai_job_outputs" ("ai_job_id");
CREATE INDEX "fk_ai_jobs_created_by_idx" ON "ai_jobs" ("created_by");
CREATE INDEX "idx_ai_jobs_org_status" ON "ai_jobs" ("organization_id","status");
CREATE INDEX "fk_approval_actions_user_idx" ON "approval_actions" ("acted_by");
CREATE INDEX "idx_approval_actions_instance" ON "approval_actions" ("approval_instance_id");
CREATE UNIQUE INDEX "uq_approval_flow_steps_flow_step" ON "approval_flow_steps" ("flow_id","step_no");
CREATE INDEX "fk_approval_flow_steps_role_idx" ON "approval_flow_steps" ("approver_role_id");
CREATE INDEX "fk_approval_flow_steps_user_idx" ON "approval_flow_steps" ("approver_user_id");
CREATE UNIQUE INDEX "uq_approval_flows_org_doc_name" ON "approval_flows" ("organization_id","document_type","name");
CREATE UNIQUE INDEX "uq_approval_instances_doc" ON "approval_instances" ("organization_id","document_type","document_id");
CREATE INDEX "fk_approval_instances_flow_idx" ON "approval_instances" ("flow_id");
CREATE INDEX "fk_asset_movements_journal_entry_idx" ON "asset_movements" ("journal_entry_id");
CREATE INDEX "idx_asset_movements_asset" ON "asset_movements" ("asset_id");
CREATE UNIQUE INDEX "uq_attachment_files_hash_key" ON "attachment_files" ("organization_id","file_hash","storage_key");
CREATE INDEX "fk_attachment_files_created_by_idx" ON "attachment_files" ("created_by");
CREATE INDEX "fk_audit_events_actor_user_idx" ON "audit_events" ("actor_user_id");
CREATE INDEX "idx_audit_events_action_created" ON "audit_events" ("organization_id","action","created_at");
CREATE INDEX "idx_audit_events_entity" ON "audit_events" ("organization_id","entity_name","entity_id");
CREATE UNIQUE INDEX "uq_bank_accounts_org_account_no" ON "bank_accounts" ("organization_id","account_no");
CREATE INDEX "idx_bank_accounts_source" ON "bank_accounts" ("source_system_id","source_record_id");
CREATE UNIQUE INDEX "uq_bank_reconciliation_matches_line_voucher" ON "bank_reconciliation_matches" ("statement_line_id","voucher_id");
CREATE INDEX "fk_bank_reconciliation_matches_user_idx" ON "bank_reconciliation_matches" ("matched_by");
CREATE INDEX "fk_bank_reconciliation_matches_voucher_idx" ON "bank_reconciliation_matches" ("voucher_id");
CREATE UNIQUE INDEX "uq_bank_statement_lines_statement_line" ON "bank_statement_lines" ("statement_id","line_no");
CREATE INDEX "idx_bank_statement_lines_statement_status" ON "bank_statement_lines" ("statement_id","matched_status");
CREATE INDEX "fk_bank_statements_org_idx" ON "bank_statements" ("organization_id");
CREATE INDEX "idx_bank_statements_bank_account" ON "bank_statements" ("bank_account_id");
CREATE UNIQUE INDEX "uq_cash_books_org_code" ON "cash_books" ("organization_id","code");
CREATE UNIQUE INDEX "uq_contracts_org_contract_no" ON "contracts" ("organization_id","contract_no");
CREATE INDEX "fk_contracts_source_idx" ON "contracts" ("source_system_id");
CREATE INDEX "idx_contracts_customer" ON "contracts" ("customer_id");
CREATE INDEX "idx_contracts_supplier" ON "contracts" ("supplier_id");
CREATE UNIQUE INDEX "uq_cost_items_org_code" ON "cost_items" ("organization_id","code");
CREATE INDEX "fk_cost_items_source_idx" ON "cost_items" ("source_system_id");
CREATE INDEX "idx_cost_items_parent" ON "cost_items" ("parent_id");
CREATE UNIQUE INDEX "uq_customers_org_code" ON "customers" ("organization_id","code");
CREATE INDEX "idx_customers_source" ON "customers" ("source_system_id","source_record_id");
CREATE INDEX "fk_depreciation_lines_asset_idx" ON "depreciation_lines" ("asset_id");
CREATE INDEX "fk_depreciation_lines_journal_entry_idx" ON "depreciation_lines" ("journal_entry_id");
CREATE INDEX "fk_depreciation_lines_run_idx" ON "depreciation_lines" ("depreciation_run_id");
CREATE UNIQUE INDEX "uq_depreciation_runs_period" ON "depreciation_runs" ("organization_id","period_year","period_month");
CREATE INDEX "fk_depreciation_runs_created_by_idx" ON "depreciation_runs" ("created_by");
CREATE UNIQUE INDEX "uq_employees_org_code" ON "employees" ("organization_id","code");
CREATE INDEX "idx_employees_source" ON "employees" ("source_system_id","source_record_id");
CREATE UNIQUE INDEX "uq_fixed_assets_org_code" ON "fixed_assets" ("organization_id","asset_code");
CREATE INDEX "idx_fixed_assets_source" ON "fixed_assets" ("source_system_id","source_record_id");
CREATE UNIQUE INDEX "uq_inventory_balances_snapshot" ON "inventory_balances" ("organization_id","snapshot_date","item_id","warehouse_id","lot_no");
CREATE INDEX "fk_inventory_balances_item_idx" ON "inventory_balances" ("item_id");
CREATE INDEX "fk_inventory_balances_warehouse_idx" ON "inventory_balances" ("warehouse_id");
CREATE UNIQUE INDEX "uq_inventory_document_lines_doc_line" ON "inventory_document_lines" ("inventory_document_id","line_no");
CREATE INDEX "fk_inventory_document_lines_item_idx" ON "inventory_document_lines" ("item_id");
CREATE INDEX "fk_inventory_document_lines_warehouse_idx" ON "inventory_document_lines" ("warehouse_id");
CREATE UNIQUE INDEX "uq_inventory_documents_org_type_no" ON "inventory_documents" ("organization_id","document_type","document_no");
CREATE INDEX "fk_inventory_documents_source_voucher_idx" ON "inventory_documents" ("source_voucher_id");
CREATE UNIQUE INDEX "uq_item_categories_org_code" ON "item_categories" ("organization_id","code");
CREATE INDEX "idx_item_categories_parent" ON "item_categories" ("parent_id");
CREATE UNIQUE INDEX "uq_items_org_code" ON "items" ("organization_id","code");
CREATE INDEX "idx_items_category" ON "items" ("category_id");
CREATE INDEX "idx_items_source" ON "items" ("source_system_id","source_record_id");
CREATE INDEX "idx_items_uom" ON "items" ("uom_id");
CREATE UNIQUE INDEX "uq_journal_entries_org_entry_no" ON "journal_entries" ("organization_id","entry_no");
CREATE INDEX "fk_journal_entries_created_by_idx" ON "journal_entries" ("created_by");
CREATE INDEX "idx_journal_entries_org_date" ON "journal_entries" ("organization_id","entry_date");
CREATE UNIQUE INDEX "uq_journal_entry_lines_entry_line" ON "journal_entry_lines" ("journal_entry_id","line_no");
CREATE INDEX "fk_journal_entry_lines_bank_account_idx" ON "journal_entry_lines" ("bank_account_id");
CREATE INDEX "fk_journal_entry_lines_contract_idx" ON "journal_entry_lines" ("contract_id");
CREATE INDEX "fk_journal_entry_lines_cost_item_idx" ON "journal_entry_lines" ("cost_item_id");
CREATE INDEX "fk_journal_entry_lines_customer_idx" ON "journal_entry_lines" ("customer_id");
CREATE INDEX "fk_journal_entry_lines_employee_idx" ON "journal_entry_lines" ("employee_id");
CREATE INDEX "fk_journal_entry_lines_item_idx" ON "journal_entry_lines" ("item_id");
CREATE INDEX "fk_journal_entry_lines_supplier_idx" ON "journal_entry_lines" ("supplier_id");
CREATE INDEX "fk_journal_entry_lines_warehouse_idx" ON "journal_entry_lines" ("warehouse_id");
CREATE INDEX "idx_journal_entry_lines_account" ON "journal_entry_lines" ("account_id");
CREATE INDEX "fk_ledger_balances_account_idx" ON "ledger_balances" ("account_id");
CREATE INDEX "fk_ledger_balances_contract_idx" ON "ledger_balances" ("contract_id");
CREATE INDEX "fk_ledger_balances_customer_idx" ON "ledger_balances" ("customer_id");
CREATE INDEX "fk_ledger_balances_supplier_idx" ON "ledger_balances" ("supplier_id");
CREATE INDEX "fk_ledger_balances_warehouse_idx" ON "ledger_balances" ("warehouse_id");
CREATE INDEX "idx_ledger_balances_org_period_account" ON "ledger_balances" ("organization_id","period_year","period_month","account_id");
CREATE UNIQUE INDEX "uq_materialized_metrics_org_metric_date_dim" ON "materialized_metrics" ("organization_id","metric_code","metric_date","dimension_key");
CREATE UNIQUE INDEX "uq_opening_balance_account_lines_batch_line" ON "opening_balance_account_lines" ("batch_id","line_no");
CREATE INDEX "fk_ob_account_lines_contract_idx" ON "opening_balance_account_lines" ("contract_id");
CREATE INDEX "fk_ob_account_lines_customer_idx" ON "opening_balance_account_lines" ("customer_id");
CREATE INDEX "fk_ob_account_lines_employee_idx" ON "opening_balance_account_lines" ("employee_id");
CREATE INDEX "fk_ob_account_lines_item_idx" ON "opening_balance_account_lines" ("item_id");
CREATE INDEX "fk_ob_account_lines_supplier_idx" ON "opening_balance_account_lines" ("supplier_id");
CREATE INDEX "fk_ob_account_lines_warehouse_idx" ON "opening_balance_account_lines" ("warehouse_id");
CREATE INDEX "idx_opening_balance_account_lines_account" ON "opening_balance_account_lines" ("account_id");
CREATE UNIQUE INDEX "uq_opening_balance_batches_period" ON "opening_balance_batches" ("organization_id","period_year","period_month");
CREATE INDEX "fk_opening_balance_batches_source_idx" ON "opening_balance_batches" ("source_system_id");
CREATE INDEX "fk_ob_inventory_batch_idx" ON "opening_balance_inventory_lines" ("batch_id");
CREATE INDEX "fk_ob_inventory_warehouse_idx" ON "opening_balance_inventory_lines" ("warehouse_id");
CREATE INDEX "idx_ob_inventory_lines_item_warehouse" ON "opening_balance_inventory_lines" ("item_id","warehouse_id");
CREATE INDEX "fk_ob_payable_account_idx" ON "opening_balance_payable_lines" ("account_id");
CREATE INDEX "fk_ob_payable_batch_idx" ON "opening_balance_payable_lines" ("batch_id");
CREATE INDEX "fk_ob_payable_contract_idx" ON "opening_balance_payable_lines" ("contract_id");
CREATE INDEX "idx_ob_payable_lines_supplier" ON "opening_balance_payable_lines" ("supplier_id");
CREATE INDEX "fk_ob_receivable_account_idx" ON "opening_balance_receivable_lines" ("account_id");
CREATE INDEX "fk_ob_receivable_batch_idx" ON "opening_balance_receivable_lines" ("batch_id");
CREATE INDEX "fk_ob_receivable_contract_idx" ON "opening_balance_receivable_lines" ("contract_id");
CREATE INDEX "idx_ob_receivable_lines_customer" ON "opening_balance_receivable_lines" ("customer_id");
CREATE UNIQUE INDEX "uq_organizations_code" ON "organizations" ("code");
CREATE INDEX "fk_prepaid_allocations_journal_entry_idx" ON "prepaid_allocations" ("journal_entry_id");
CREATE INDEX "fk_prepaid_allocations_prepaid_idx" ON "prepaid_allocations" ("prepaid_expense_id");
CREATE UNIQUE INDEX "uq_prepaid_expenses_org_code" ON "prepaid_expenses" ("organization_id","prepaid_code");
CREATE INDEX "fk_prepaid_expenses_supplier_idx" ON "prepaid_expenses" ("supplier_id");
CREATE UNIQUE INDEX "uq_report_snapshots_org_report_key" ON "report_snapshots" ("organization_id","report_code","snapshot_key");
CREATE INDEX "fk_report_snapshots_generated_by_idx" ON "report_snapshots" ("generated_by");
CREATE UNIQUE INDEX "uq_roles_org_code" ON "roles" ("organization_id","code");
CREATE INDEX "idx_roles_org" ON "roles" ("organization_id");
CREATE UNIQUE INDEX "uq_source_systems_org_code" ON "source_systems" ("organization_id","code");
CREATE INDEX "idx_source_systems_org" ON "source_systems" ("organization_id");
CREATE UNIQUE INDEX "uq_suppliers_org_code" ON "suppliers" ("organization_id","code");
CREATE INDEX "idx_suppliers_source" ON "suppliers" ("source_system_id","source_record_id");
CREATE UNIQUE INDEX "uq_sync_mappings_source" ON "sync_mappings" ("source_system_id","entity_name","source_record_id");
CREATE INDEX "fk_sync_mappings_last_run_idx" ON "sync_mappings" ("last_sync_run_id");
CREATE INDEX "idx_sync_mappings_local" ON "sync_mappings" ("local_table_name","local_record_id");
CREATE INDEX "idx_sync_mappings_org" ON "sync_mappings" ("organization_id");
CREATE INDEX "idx_sync_raw_payloads_hash" ON "sync_raw_payloads" ("payload_hash");
CREATE INDEX "idx_sync_raw_payloads_run_entity" ON "sync_raw_payloads" ("sync_run_id","entity_name");
CREATE INDEX "idx_sync_runs_org_source_entity_started" ON "sync_runs" ("organization_id","source_system_id","entity_name","started_at");
CREATE INDEX "idx_sync_runs_source" ON "sync_runs" ("source_system_id");
CREATE UNIQUE INDEX "uq_uom_org_code" ON "units_of_measure" ("organization_id","code");
CREATE UNIQUE INDEX "uq_user_roles_user_role" ON "user_roles" ("user_id","role_id");
CREATE INDEX "idx_user_roles_role" ON "user_roles" ("role_id");
CREATE INDEX "idx_user_roles_user" ON "user_roles" ("user_id");
CREATE UNIQUE INDEX "uq_users_org_username" ON "users" ("organization_id","username");
CREATE UNIQUE INDEX "uq_users_org_email" ON "users" ("organization_id","email");
CREATE INDEX "idx_users_org" ON "users" ("organization_id");
CREATE UNIQUE INDEX "uq_voucher_lines_voucher_line" ON "voucher_lines" ("voucher_id","line_no");
CREATE INDEX "fk_voucher_lines_contract_idx" ON "voucher_lines" ("contract_id");
CREATE INDEX "fk_voucher_lines_cost_item_idx" ON "voucher_lines" ("cost_item_id");
CREATE INDEX "fk_voucher_lines_employee_idx" ON "voucher_lines" ("employee_id");
CREATE INDEX "fk_voucher_lines_item_idx" ON "voucher_lines" ("item_id");
CREATE INDEX "idx_voucher_lines_account" ON "voucher_lines" ("account_id");
CREATE INDEX "idx_voucher_lines_bank_account" ON "voucher_lines" ("bank_account_id");
CREATE INDEX "idx_voucher_lines_customer" ON "voucher_lines" ("customer_id");
CREATE INDEX "idx_voucher_lines_supplier" ON "voucher_lines" ("supplier_id");
CREATE INDEX "idx_voucher_lines_warehouse" ON "voucher_lines" ("warehouse_id");
CREATE UNIQUE INDEX "uq_vouchers_org_type_no" ON "vouchers" ("organization_id","voucher_type","voucher_no");
CREATE INDEX "fk_vouchers_created_by_idx" ON "vouchers" ("created_by");
CREATE INDEX "fk_vouchers_updated_by_idx" ON "vouchers" ("updated_by");
CREATE INDEX "idx_vouchers_org_status_date" ON "vouchers" ("organization_id","status","voucher_date");
CREATE INDEX "idx_vouchers_org_type_date" ON "vouchers" ("organization_id","voucher_type","voucher_date");
CREATE INDEX "idx_vouchers_source" ON "vouchers" ("source_system_id","source_record_id");
CREATE INDEX "idx_vouchers_org_bank_date" ON "vouchers" ("organization_id","bank_account_id","voucher_date");
CREATE INDEX "idx_vouchers_org_cash_book_date" ON "vouchers" ("organization_id","cash_book_id","voucher_date");
CREATE INDEX "fk_vouchers_bank_account_idx" ON "vouchers" ("bank_account_id");
CREATE INDEX "fk_vouchers_cash_book_idx" ON "vouchers" ("cash_book_id");
CREATE UNIQUE INDEX "uq_warehouses_org_code" ON "warehouses" ("organization_id","code");
CREATE INDEX "idx_warehouses_source" ON "warehouses" ("source_system_id","source_record_id");

-- Foreign keys
ALTER TABLE "accounts" ADD CONSTRAINT "fk_accounts_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "accounts" ADD CONSTRAINT "fk_accounts_parent" FOREIGN KEY ("parent_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "accounts" ADD CONSTRAINT "fk_accounts_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ai_job_outputs" ADD CONSTRAINT "fk_ai_job_outputs_job" FOREIGN KEY ("ai_job_id") REFERENCES "ai_jobs" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ai_jobs" ADD CONSTRAINT "fk_ai_jobs_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ai_jobs" ADD CONSTRAINT "fk_ai_jobs_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_actions" ADD CONSTRAINT "fk_approval_actions_instance" FOREIGN KEY ("approval_instance_id") REFERENCES "approval_instances" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_actions" ADD CONSTRAINT "fk_approval_actions_user" FOREIGN KEY ("acted_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "fk_approval_flow_steps_flow" FOREIGN KEY ("flow_id") REFERENCES "approval_flows" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "fk_approval_flow_steps_role" FOREIGN KEY ("approver_role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_flow_steps" ADD CONSTRAINT "fk_approval_flow_steps_user" FOREIGN KEY ("approver_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_flows" ADD CONSTRAINT "fk_approval_flows_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_instances" ADD CONSTRAINT "fk_approval_instances_flow" FOREIGN KEY ("flow_id") REFERENCES "approval_flows" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "approval_instances" ADD CONSTRAINT "fk_approval_instances_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "asset_movements" ADD CONSTRAINT "fk_asset_movements_asset" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "asset_movements" ADD CONSTRAINT "fk_asset_movements_journal_entry" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "attachment_files" ADD CONSTRAINT "fk_attachment_files_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "attachment_files" ADD CONSTRAINT "fk_attachment_files_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "audit_events" ADD CONSTRAINT "fk_audit_events_actor_user" FOREIGN KEY ("actor_user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "audit_events" ADD CONSTRAINT "fk_audit_events_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_accounts" ADD CONSTRAINT "fk_bank_accounts_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_accounts" ADD CONSTRAINT "fk_bank_accounts_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_reconciliation_matches" ADD CONSTRAINT "fk_bank_reconciliation_matches_line" FOREIGN KEY ("statement_line_id") REFERENCES "bank_statement_lines" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_reconciliation_matches" ADD CONSTRAINT "fk_bank_reconciliation_matches_user" FOREIGN KEY ("matched_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_reconciliation_matches" ADD CONSTRAINT "fk_bank_reconciliation_matches_voucher" FOREIGN KEY ("voucher_id") REFERENCES "vouchers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_statement_lines" ADD CONSTRAINT "fk_bank_statement_lines_statement" FOREIGN KEY ("statement_id") REFERENCES "bank_statements" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_statements" ADD CONSTRAINT "fk_bank_statements_bank_account" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "bank_statements" ADD CONSTRAINT "fk_bank_statements_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "cash_books" ADD CONSTRAINT "fk_cash_books_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "contracts" ADD CONSTRAINT "fk_contracts_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "cost_items" ADD CONSTRAINT "fk_cost_items_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "cost_items" ADD CONSTRAINT "fk_cost_items_parent" FOREIGN KEY ("parent_id") REFERENCES "cost_items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "cost_items" ADD CONSTRAINT "fk_cost_items_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "customers" ADD CONSTRAINT "fk_customers_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "customers" ADD CONSTRAINT "fk_customers_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "depreciation_lines" ADD CONSTRAINT "fk_depreciation_lines_asset" FOREIGN KEY ("asset_id") REFERENCES "fixed_assets" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "depreciation_lines" ADD CONSTRAINT "fk_depreciation_lines_journal_entry" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "depreciation_lines" ADD CONSTRAINT "fk_depreciation_lines_run" FOREIGN KEY ("depreciation_run_id") REFERENCES "depreciation_runs" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "depreciation_runs" ADD CONSTRAINT "fk_depreciation_runs_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "depreciation_runs" ADD CONSTRAINT "fk_depreciation_runs_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "employees" ADD CONSTRAINT "fk_employees_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "employees" ADD CONSTRAINT "fk_employees_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fk_fixed_assets_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "fixed_assets" ADD CONSTRAINT "fk_fixed_assets_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_balances" ADD CONSTRAINT "fk_inventory_balances_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_balances" ADD CONSTRAINT "fk_inventory_balances_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_balances" ADD CONSTRAINT "fk_inventory_balances_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_document_lines" ADD CONSTRAINT "fk_inventory_document_lines_doc" FOREIGN KEY ("inventory_document_id") REFERENCES "inventory_documents" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_document_lines" ADD CONSTRAINT "fk_inventory_document_lines_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_document_lines" ADD CONSTRAINT "fk_inventory_document_lines_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_documents" ADD CONSTRAINT "fk_inventory_documents_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "inventory_documents" ADD CONSTRAINT "fk_inventory_documents_source_voucher" FOREIGN KEY ("source_voucher_id") REFERENCES "vouchers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "item_categories" ADD CONSTRAINT "fk_item_categories_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "item_categories" ADD CONSTRAINT "fk_item_categories_parent" FOREIGN KEY ("parent_id") REFERENCES "item_categories" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "items" ADD CONSTRAINT "fk_items_category" FOREIGN KEY ("category_id") REFERENCES "item_categories" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "items" ADD CONSTRAINT "fk_items_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "items" ADD CONSTRAINT "fk_items_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "items" ADD CONSTRAINT "fk_items_uom" FOREIGN KEY ("uom_id") REFERENCES "units_of_measure" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entries" ADD CONSTRAINT "fk_journal_entries_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entries" ADD CONSTRAINT "fk_journal_entries_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_account" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_bank_account" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_cost_item" FOREIGN KEY ("cost_item_id") REFERENCES "cost_items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_employee" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_entry" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "journal_entry_lines" ADD CONSTRAINT "fk_journal_entry_lines_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ledger_balances" ADD CONSTRAINT "fk_ledger_balances_account" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ledger_balances" ADD CONSTRAINT "fk_ledger_balances_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ledger_balances" ADD CONSTRAINT "fk_ledger_balances_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ledger_balances" ADD CONSTRAINT "fk_ledger_balances_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ledger_balances" ADD CONSTRAINT "fk_ledger_balances_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "ledger_balances" ADD CONSTRAINT "fk_ledger_balances_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "materialized_metrics" ADD CONSTRAINT "fk_materialized_metrics_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_account" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_batch" FOREIGN KEY ("batch_id") REFERENCES "opening_balance_batches" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_employee" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_account_lines" ADD CONSTRAINT "fk_ob_account_lines_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_batches" ADD CONSTRAINT "fk_opening_balance_batches_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_batches" ADD CONSTRAINT "fk_opening_balance_batches_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_inventory_lines" ADD CONSTRAINT "fk_ob_inventory_batch" FOREIGN KEY ("batch_id") REFERENCES "opening_balance_batches" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_inventory_lines" ADD CONSTRAINT "fk_ob_inventory_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_inventory_lines" ADD CONSTRAINT "fk_ob_inventory_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_payable_lines" ADD CONSTRAINT "fk_ob_payable_account" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_payable_lines" ADD CONSTRAINT "fk_ob_payable_batch" FOREIGN KEY ("batch_id") REFERENCES "opening_balance_batches" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_payable_lines" ADD CONSTRAINT "fk_ob_payable_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_payable_lines" ADD CONSTRAINT "fk_ob_payable_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_receivable_lines" ADD CONSTRAINT "fk_ob_receivable_account" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_receivable_lines" ADD CONSTRAINT "fk_ob_receivable_batch" FOREIGN KEY ("batch_id") REFERENCES "opening_balance_batches" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_receivable_lines" ADD CONSTRAINT "fk_ob_receivable_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "opening_balance_receivable_lines" ADD CONSTRAINT "fk_ob_receivable_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "prepaid_allocations" ADD CONSTRAINT "fk_prepaid_allocations_journal_entry" FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "prepaid_allocations" ADD CONSTRAINT "fk_prepaid_allocations_prepaid" FOREIGN KEY ("prepaid_expense_id") REFERENCES "prepaid_expenses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "prepaid_expenses" ADD CONSTRAINT "fk_prepaid_expenses_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "prepaid_expenses" ADD CONSTRAINT "fk_prepaid_expenses_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "report_snapshots" ADD CONSTRAINT "fk_report_snapshots_generated_by" FOREIGN KEY ("generated_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "report_snapshots" ADD CONSTRAINT "fk_report_snapshots_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "roles" ADD CONSTRAINT "fk_roles_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "source_systems" ADD CONSTRAINT "fk_source_systems_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "suppliers" ADD CONSTRAINT "fk_suppliers_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "suppliers" ADD CONSTRAINT "fk_suppliers_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "sync_mappings" ADD CONSTRAINT "fk_sync_mappings_last_run" FOREIGN KEY ("last_sync_run_id") REFERENCES "sync_runs" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "sync_mappings" ADD CONSTRAINT "fk_sync_mappings_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "sync_mappings" ADD CONSTRAINT "fk_sync_mappings_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "sync_raw_payloads" ADD CONSTRAINT "fk_sync_raw_payloads_run" FOREIGN KEY ("sync_run_id") REFERENCES "sync_runs" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "sync_runs" ADD CONSTRAINT "fk_sync_runs_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "sync_runs" ADD CONSTRAINT "fk_sync_runs_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "units_of_measure" ADD CONSTRAINT "fk_uom_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "user_roles" ADD CONSTRAINT "fk_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "users" ADD CONSTRAINT "fk_users_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_account" FOREIGN KEY ("account_id") REFERENCES "accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_bank_account" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_contract" FOREIGN KEY ("contract_id") REFERENCES "contracts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_cost_item" FOREIGN KEY ("cost_item_id") REFERENCES "cost_items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_customer" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_employee" FOREIGN KEY ("employee_id") REFERENCES "employees" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_item" FOREIGN KEY ("item_id") REFERENCES "items" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_supplier" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_voucher" FOREIGN KEY ("voucher_id") REFERENCES "vouchers" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "voucher_lines" ADD CONSTRAINT "fk_voucher_lines_warehouse" FOREIGN KEY ("warehouse_id") REFERENCES "warehouses" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "vouchers" ADD CONSTRAINT "fk_vouchers_bank_account" FOREIGN KEY ("bank_account_id") REFERENCES "bank_accounts" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "vouchers" ADD CONSTRAINT "fk_vouchers_cash_book" FOREIGN KEY ("cash_book_id") REFERENCES "cash_books" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "vouchers" ADD CONSTRAINT "fk_vouchers_created_by" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "vouchers" ADD CONSTRAINT "fk_vouchers_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "vouchers" ADD CONSTRAINT "fk_vouchers_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "vouchers" ADD CONSTRAINT "fk_vouchers_updated_by" FOREIGN KEY ("updated_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "warehouses" ADD CONSTRAINT "fk_warehouses_org" FOREIGN KEY ("organization_id") REFERENCES "organizations" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "warehouses" ADD CONSTRAINT "fk_warehouses_source" FOREIGN KEY ("source_system_id") REFERENCES "source_systems" ("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
