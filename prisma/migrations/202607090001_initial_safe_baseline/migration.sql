-- CreateTable
CREATE TABLE `organizations` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `tax_code` VARCHAR(32) NULL,
    `base_currency` VARCHAR(8) NOT NULL DEFAULT 'VND',
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_organizations_code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `email` VARCHAR(255) NULL,
    `username` VARCHAR(120) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_users_org`(`organization_id`),
    UNIQUE INDEX `uq_users_org_email`(`organization_id`, `email`),
    UNIQUE INDEX `uq_users_org_username`(`organization_id`, `username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `is_system` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_roles_org`(`organization_id`),
    UNIQUE INDEX `uq_roles_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role_id` CHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `idx_user_roles_role`(`role_id`),
    INDEX `idx_user_roles_user`(`user_id`),
    UNIQUE INDEX `uq_user_roles_user_role`(`user_id`, `role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `source_systems` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `source_type` VARCHAR(40) NOT NULL,
    `base_url` VARCHAR(512) NULL,
    `auth_type` VARCHAR(40) NULL,
    `status` VARCHAR(20) NOT NULL,
    `last_synced_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_source_systems_org`(`organization_id`),
    UNIQUE INDEX `uq_source_systems_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sync_runs` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `source_system_id` CHAR(36) NOT NULL,
    `entity_name` VARCHAR(120) NOT NULL,
    `mode` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `started_at` DATETIME(3) NOT NULL,
    `ended_at` DATETIME(3) NULL,
    `records_read` INTEGER NOT NULL DEFAULT 0,
    `records_inserted` INTEGER NOT NULL DEFAULT 0,
    `records_updated` INTEGER NOT NULL DEFAULT 0,
    `records_skipped` INTEGER NOT NULL DEFAULT 0,
    `records_failed` INTEGER NOT NULL DEFAULT 0,
    `error_message` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `idx_sync_runs_org_source_entity_started`(`organization_id`, `source_system_id`, `entity_name`, `started_at`),
    INDEX `idx_sync_runs_source`(`source_system_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sync_mappings` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `source_system_id` CHAR(36) NOT NULL,
    `entity_name` VARCHAR(120) NOT NULL,
    `source_record_id` VARCHAR(128) NOT NULL,
    `local_table_name` VARCHAR(128) NOT NULL,
    `local_record_id` CHAR(36) NOT NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `sync_status` VARCHAR(20) NOT NULL,
    `last_sync_run_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_sync_mappings_last_run`(`last_sync_run_id`),
    INDEX `idx_sync_mappings_local`(`local_table_name`, `local_record_id`),
    INDEX `idx_sync_mappings_org`(`organization_id`),
    UNIQUE INDEX `uq_sync_mappings_source`(`source_system_id`, `entity_name`, `source_record_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sync_raw_payloads` (
    `id` CHAR(36) NOT NULL,
    `sync_run_id` CHAR(36) NOT NULL,
    `entity_name` VARCHAR(120) NOT NULL,
    `source_record_id` VARCHAR(128) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `payload_hash` VARCHAR(128) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `idx_sync_raw_payloads_hash`(`payload_hash`),
    INDEX `idx_sync_raw_payloads_run_entity`(`sync_run_id`, `entity_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `accounts` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `account_group` VARCHAR(30) NOT NULL,
    `normal_balance` VARCHAR(10) NOT NULL,
    `level` INTEGER NOT NULL,
    `is_postable` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `allows_counterparty` BOOLEAN NOT NULL DEFAULT false,
    `allows_contract` BOOLEAN NOT NULL DEFAULT false,
    `allows_item` BOOLEAN NOT NULL DEFAULT false,
    `allows_warehouse` BOOLEAN NOT NULL DEFAULT false,
    `allows_employee` BOOLEAN NOT NULL DEFAULT false,
    `effective_from` DATE NULL,
    `effective_to` DATE NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_accounts_parent`(`parent_id`),
    INDEX `idx_accounts_active`(`organization_id`, `is_active`),
    INDEX `idx_accounts_group`(`organization_id`, `account_group`),
    INDEX `idx_accounts_org_parent`(`organization_id`, `parent_id`),
    INDEX `idx_accounts_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_accounts_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `tax_code` VARCHAR(32) NULL,
    `short_name` VARCHAR(255) NULL,
    `phone` VARCHAR(40) NULL,
    `email` VARCHAR(255) NULL,
    `address` VARCHAR(512) NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_customers_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_customers_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `tax_code` VARCHAR(32) NULL,
    `short_name` VARCHAR(255) NULL,
    `phone` VARCHAR(40) NULL,
    `email` VARCHAR(255) NULL,
    `address` VARCHAR(512) NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_suppliers_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_suppliers_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cash_books` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `currency_code` VARCHAR(8) NOT NULL DEFAULT 'VND',
    `status` VARCHAR(20) NOT NULL,

    UNIQUE INDEX `uq_cash_books_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vouchers` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `voucher_type` VARCHAR(40) NOT NULL,
    `voucher_no` VARCHAR(64) NOT NULL,
    `voucher_date` DATE NOT NULL,
    `posting_date` DATE NULL,
    `currency_code` VARCHAR(8) NOT NULL DEFAULT 'VND',
    `exchange_rate` DECIMAL(18, 6) NOT NULL DEFAULT 1.000000,
    `status` VARCHAR(20) NOT NULL,
    `approval_status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `description` VARCHAR(1000) NULL,
    `total_debit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `total_credit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `created_by` CHAR(36) NULL,
    `updated_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_vouchers_created_by`(`created_by`),
    INDEX `fk_vouchers_updated_by`(`updated_by`),
    INDEX `idx_vouchers_org_status_date`(`organization_id`, `status`, `voucher_date`),
    INDEX `idx_vouchers_org_type_date`(`organization_id`, `voucher_type`, `voucher_date`),
    INDEX `idx_vouchers_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_vouchers_org_type_no`(`organization_id`, `voucher_type`, `voucher_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucher_lines` (
    `id` CHAR(36) NOT NULL,
    `voucher_id` CHAR(36) NOT NULL,
    `line_no` INTEGER NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NULL,
    `supplier_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `contract_id` CHAR(36) NULL,
    `cost_item_id` CHAR(36) NULL,
    `warehouse_id` CHAR(36) NULL,
    `bank_account_id` CHAR(36) NULL,
    `item_id` CHAR(36) NULL,
    `debit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `credit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `quantity` DECIMAL(18, 4) NULL,
    `unit_price` DECIMAL(18, 4) NULL,
    `tax_rate` DECIMAL(5, 2) NULL,
    `memo` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `fk_voucher_lines_contract`(`contract_id`),
    INDEX `fk_voucher_lines_cost_item`(`cost_item_id`),
    INDEX `fk_voucher_lines_employee`(`employee_id`),
    INDEX `fk_voucher_lines_item`(`item_id`),
    INDEX `idx_voucher_lines_account`(`account_id`),
    INDEX `idx_voucher_lines_bank_account`(`bank_account_id`),
    INDEX `idx_voucher_lines_customer`(`customer_id`),
    INDEX `idx_voucher_lines_supplier`(`supplier_id`),
    INDEX `idx_voucher_lines_warehouse`(`warehouse_id`),
    UNIQUE INDEX `uq_voucher_lines_voucher_line`(`voucher_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_instances` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `flow_id` CHAR(36) NOT NULL,
    `document_type` VARCHAR(40) NOT NULL,
    `document_id` CHAR(36) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `current_step_no` INTEGER NOT NULL DEFAULT 1,
    `started_at` DATETIME(3) NOT NULL,
    `completed_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `fk_approval_instances_flow`(`flow_id`),
    UNIQUE INDEX `uq_approval_instances_doc`(`organization_id`, `document_type`, `document_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_actions` (
    `id` CHAR(36) NOT NULL,
    `approval_instance_id` CHAR(36) NOT NULL,
    `step_no` INTEGER NOT NULL,
    `action` VARCHAR(20) NOT NULL,
    `acted_by` CHAR(36) NOT NULL,
    `acted_at` DATETIME(3) NOT NULL,
    `comment` VARCHAR(1000) NULL,

    INDEX `fk_approval_actions_user`(`acted_by`),
    INDEX `idx_approval_actions_instance`(`approval_instance_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attachment_files` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `entity_name` VARCHAR(120) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `file_name` VARCHAR(255) NOT NULL,
    `mime_type` VARCHAR(120) NOT NULL,
    `file_size` BIGINT NOT NULL,
    `storage_key` VARCHAR(500) NOT NULL,
    `file_hash` VARCHAR(128) NOT NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `fk_attachment_files_created_by`(`created_by`),
    UNIQUE INDEX `uq_attachment_files_hash_key`(`organization_id`, `file_hash`, `storage_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_statements` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `bank_account_id` CHAR(36) NOT NULL,
    `statement_no` VARCHAR(64) NULL,
    `statement_date` DATE NOT NULL,
    `opening_balance` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `closing_balance` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `source_file_name` VARCHAR(255) NULL,
    `source_file_hash` VARCHAR(128) NULL,
    `status` VARCHAR(20) NOT NULL,
    `imported_at` DATETIME(3) NOT NULL,

    INDEX `fk_bank_statements_org`(`organization_id`),
    INDEX `idx_bank_statements_bank_account`(`bank_account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_statement_lines` (
    `id` CHAR(36) NOT NULL,
    `statement_id` CHAR(36) NOT NULL,
    `line_no` INTEGER NOT NULL,
    `value_date` DATE NULL,
    `transaction_date` DATE NULL,
    `description` VARCHAR(1000) NOT NULL,
    `reference_no` VARCHAR(128) NULL,
    `debit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `credit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `balance_after` DECIMAL(18, 2) NULL,
    `matched_status` VARCHAR(30) NOT NULL,

    UNIQUE INDEX `uq_bank_statement_lines_statement_line`(`statement_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_reconciliation_matches` (
    `id` CHAR(36) NOT NULL,
    `statement_line_id` CHAR(36) NOT NULL,
    `voucher_id` CHAR(36) NOT NULL,
    `matched_amount` DECIMAL(18, 2) NOT NULL,
    `matched_by` CHAR(36) NULL,
    `matched_at` DATETIME(3) NOT NULL,

    INDEX `fk_bank_reconciliation_matches_user`(`matched_by`),
    INDEX `fk_bank_reconciliation_matches_voucher`(`voucher_id`),
    UNIQUE INDEX `uq_bank_reconciliation_matches_line_voucher`(`statement_line_id`, `voucher_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_events` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `actor_user_id` CHAR(36) NULL,
    `action` VARCHAR(120) NOT NULL,
    `entity_name` VARCHAR(120) NOT NULL,
    `entity_id` CHAR(36) NOT NULL,
    `before_data` LONGTEXT NULL,
    `after_data` LONGTEXT NULL,
    `ip_address` VARCHAR(45) NULL,
    `user_agent` VARCHAR(500) NULL,
    `request_id` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `fk_audit_events_actor_user`(`actor_user_id`),
    INDEX `idx_audit_events_action_created`(`organization_id`, `action`, `created_at`),
    INDEX `idx_audit_events_entity`(`organization_id`, `entity_name`, `entity_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_jobs` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `job_type` VARCHAR(80) NOT NULL,
    `input_ref` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL,
    `started_at` DATETIME(3) NULL,
    `ended_at` DATETIME(3) NULL,
    `error_message` TEXT NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `fk_ai_jobs_created_by`(`created_by`),
    INDEX `idx_ai_jobs_org_status`(`organization_id`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ai_job_outputs` (
    `id` CHAR(36) NOT NULL,
    `ai_job_id` CHAR(36) NOT NULL,
    `output_type` VARCHAR(80) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `confidence` DECIMAL(5, 4) NULL,
    `created_at` DATETIME(3) NOT NULL,

    INDEX `fk_ai_job_outputs_job`(`ai_job_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_flow_steps` (
    `id` CHAR(36) NOT NULL,
    `flow_id` CHAR(36) NOT NULL,
    `step_no` INTEGER NOT NULL,
    `approver_role_id` CHAR(36) NULL,
    `approver_user_id` CHAR(36) NULL,
    `deadline_hours` INTEGER NULL,
    `required` BOOLEAN NOT NULL DEFAULT true,

    INDEX `fk_approval_flow_steps_role`(`approver_role_id`),
    INDEX `fk_approval_flow_steps_user`(`approver_user_id`),
    UNIQUE INDEX `uq_approval_flow_steps_flow_step`(`flow_id`, `step_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `approval_flows` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `document_type` VARCHAR(40) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_approval_flows_org_doc_name`(`organization_id`, `document_type`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `asset_movements` (
    `id` CHAR(36) NOT NULL,
    `asset_id` CHAR(36) NOT NULL,
    `movement_type` VARCHAR(40) NOT NULL,
    `movement_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `journal_entry_id` CHAR(36) NULL,
    `memo` VARCHAR(500) NULL,

    INDEX `fk_asset_movements_journal_entry`(`journal_entry_id`),
    INDEX `idx_asset_movements_asset`(`asset_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bank_accounts` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `bank_name` VARCHAR(255) NOT NULL,
    `account_no` VARCHAR(128) NOT NULL,
    `account_holder` VARCHAR(255) NOT NULL,
    `currency_code` VARCHAR(8) NOT NULL DEFAULT 'VND',
    `branch_name` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_bank_accounts_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_bank_accounts_org_account_no`(`organization_id`, `account_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contracts` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `contract_no` VARCHAR(64) NOT NULL,
    `contract_name` VARCHAR(255) NOT NULL,
    `counterparty_type` VARCHAR(20) NOT NULL,
    `customer_id` CHAR(36) NULL,
    `supplier_id` CHAR(36) NULL,
    `signed_date` DATE NULL,
    `start_date` DATE NULL,
    `end_date` DATE NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_contracts_source`(`source_system_id`),
    INDEX `idx_contracts_customer`(`customer_id`),
    INDEX `idx_contracts_supplier`(`supplier_id`),
    UNIQUE INDEX `uq_contracts_org_contract_no`(`organization_id`, `contract_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cost_items` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `cost_group` VARCHAR(20) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_cost_items_source`(`source_system_id`),
    INDEX `idx_cost_items_parent`(`parent_id`),
    UNIQUE INDEX `uq_cost_items_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depreciation_lines` (
    `id` CHAR(36) NOT NULL,
    `depreciation_run_id` CHAR(36) NOT NULL,
    `asset_id` CHAR(36) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `journal_entry_id` CHAR(36) NULL,

    INDEX `fk_depreciation_lines_asset`(`asset_id`),
    INDEX `fk_depreciation_lines_journal_entry`(`journal_entry_id`),
    INDEX `fk_depreciation_lines_run`(`depreciation_run_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `depreciation_runs` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `run_at` DATETIME(3) NOT NULL,
    `created_by` CHAR(36) NULL,

    INDEX `fk_depreciation_runs_created_by`(`created_by`),
    UNIQUE INDEX `uq_depreciation_runs_period`(`organization_id`, `period_year`, `period_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `department_name` VARCHAR(255) NULL,
    `position_name` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_employees_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_employees_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fixed_assets` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `asset_code` VARCHAR(64) NOT NULL,
    `asset_name` VARCHAR(255) NOT NULL,
    `asset_category` VARCHAR(255) NOT NULL,
    `acquisition_date` DATE NOT NULL,
    `original_cost` DECIMAL(18, 2) NOT NULL,
    `residual_value` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `useful_life_months` INTEGER NOT NULL,
    `depreciation_method` VARCHAR(40) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_fixed_assets_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_fixed_assets_org_code`(`organization_id`, `asset_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_balances` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `snapshot_date` DATE NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `warehouse_id` CHAR(36) NOT NULL,
    `lot_no` VARCHAR(128) NULL,
    `opening_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `in_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `out_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `closing_qty` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `closing_cost` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,

    INDEX `fk_inventory_balances_item`(`item_id`),
    INDEX `fk_inventory_balances_warehouse`(`warehouse_id`),
    UNIQUE INDEX `uq_inventory_balances_snapshot`(`organization_id`, `snapshot_date`, `item_id`, `warehouse_id`, `lot_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_document_lines` (
    `id` CHAR(36) NOT NULL,
    `inventory_document_id` CHAR(36) NOT NULL,
    `line_no` INTEGER NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `warehouse_id` CHAR(36) NOT NULL,
    `qty_in` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `qty_out` DECIMAL(18, 4) NOT NULL DEFAULT 0.0000,
    `unit_cost` DECIMAL(18, 4) NULL,
    `lot_no` VARCHAR(128) NULL,
    `memo` VARCHAR(500) NULL,

    INDEX `fk_inventory_document_lines_item`(`item_id`),
    INDEX `fk_inventory_document_lines_warehouse`(`warehouse_id`),
    UNIQUE INDEX `uq_inventory_document_lines_doc_line`(`inventory_document_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inventory_documents` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `document_type` VARCHAR(40) NOT NULL,
    `document_no` VARCHAR(64) NOT NULL,
    `document_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_voucher_id` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_inventory_documents_source_voucher`(`source_voucher_id`),
    UNIQUE INDEX `uq_inventory_documents_org_type_no`(`organization_id`, `document_type`, `document_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_categories` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `parent_id` CHAR(36) NULL,
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_item_categories_parent`(`parent_id`),
    UNIQUE INDEX `uq_item_categories_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `item_type` VARCHAR(30) NOT NULL,
    `category_id` CHAR(36) NULL,
    `uom_id` CHAR(36) NULL,
    `barcode` VARCHAR(128) NULL,
    `is_inventory_item` BOOLEAN NOT NULL DEFAULT true,
    `is_service_item` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_items_category`(`category_id`),
    INDEX `idx_items_source`(`source_system_id`, `source_record_id`),
    INDEX `idx_items_uom`(`uom_id`),
    UNIQUE INDEX `uq_items_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_entries` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `entry_no` VARCHAR(64) NOT NULL,
    `entry_date` DATE NOT NULL,
    `source_type` VARCHAR(40) NOT NULL,
    `source_id` CHAR(36) NULL,
    `status` VARCHAR(20) NOT NULL,
    `description` VARCHAR(1000) NULL,
    `posted_at` DATETIME(3) NULL,
    `created_by` CHAR(36) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_journal_entries_created_by`(`created_by`),
    INDEX `idx_journal_entries_org_date`(`organization_id`, `entry_date`),
    UNIQUE INDEX `uq_journal_entries_org_entry_no`(`organization_id`, `entry_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `journal_entry_lines` (
    `id` CHAR(36) NOT NULL,
    `journal_entry_id` CHAR(36) NOT NULL,
    `line_no` INTEGER NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NULL,
    `supplier_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `contract_id` CHAR(36) NULL,
    `cost_item_id` CHAR(36) NULL,
    `warehouse_id` CHAR(36) NULL,
    `bank_account_id` CHAR(36) NULL,
    `item_id` CHAR(36) NULL,
    `debit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `credit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `memo` VARCHAR(500) NULL,

    INDEX `fk_journal_entry_lines_bank_account`(`bank_account_id`),
    INDEX `fk_journal_entry_lines_contract`(`contract_id`),
    INDEX `fk_journal_entry_lines_cost_item`(`cost_item_id`),
    INDEX `fk_journal_entry_lines_customer`(`customer_id`),
    INDEX `fk_journal_entry_lines_employee`(`employee_id`),
    INDEX `fk_journal_entry_lines_item`(`item_id`),
    INDEX `fk_journal_entry_lines_supplier`(`supplier_id`),
    INDEX `fk_journal_entry_lines_warehouse`(`warehouse_id`),
    INDEX `idx_journal_entry_lines_account`(`account_id`),
    UNIQUE INDEX `uq_journal_entry_lines_entry_line`(`journal_entry_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ledger_balances` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NULL,
    `supplier_id` CHAR(36) NULL,
    `warehouse_id` CHAR(36) NULL,
    `contract_id` CHAR(36) NULL,
    `opening_debit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `opening_credit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `period_debit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `period_credit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `closing_debit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `closing_credit` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `calculated_at` DATETIME(3) NOT NULL,

    INDEX `fk_ledger_balances_account`(`account_id`),
    INDEX `fk_ledger_balances_contract`(`contract_id`),
    INDEX `fk_ledger_balances_customer`(`customer_id`),
    INDEX `fk_ledger_balances_supplier`(`supplier_id`),
    INDEX `fk_ledger_balances_warehouse`(`warehouse_id`),
    INDEX `idx_ledger_balances_org_period_account`(`organization_id`, `period_year`, `period_month`, `account_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `materialized_metrics` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `metric_code` VARCHAR(64) NOT NULL,
    `metric_date` DATE NOT NULL,
    `dimension_key` VARCHAR(255) NULL,
    `metric_value` DECIMAL(18, 4) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_materialized_metrics_org_metric_date_dim`(`organization_id`, `metric_code`, `metric_date`, `dimension_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_balance_account_lines` (
    `id` CHAR(36) NOT NULL,
    `batch_id` CHAR(36) NOT NULL,
    `account_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NULL,
    `supplier_id` CHAR(36) NULL,
    `employee_id` CHAR(36) NULL,
    `contract_id` CHAR(36) NULL,
    `warehouse_id` CHAR(36) NULL,
    `item_id` CHAR(36) NULL,
    `debit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `credit_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `memo` VARCHAR(500) NULL,
    `line_no` INTEGER NOT NULL,

    INDEX `fk_ob_account_lines_contract`(`contract_id`),
    INDEX `fk_ob_account_lines_customer`(`customer_id`),
    INDEX `fk_ob_account_lines_employee`(`employee_id`),
    INDEX `fk_ob_account_lines_item`(`item_id`),
    INDEX `fk_ob_account_lines_supplier`(`supplier_id`),
    INDEX `fk_ob_account_lines_warehouse`(`warehouse_id`),
    INDEX `idx_opening_balance_account_lines_account`(`account_id`),
    UNIQUE INDEX `uq_opening_balance_account_lines_batch_line`(`batch_id`, `line_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_balance_batches` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `fk_opening_balance_batches_source`(`source_system_id`),
    UNIQUE INDEX `uq_opening_balance_batches_period`(`organization_id`, `period_year`, `period_month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_balance_inventory_lines` (
    `id` CHAR(36) NOT NULL,
    `batch_id` CHAR(36) NOT NULL,
    `item_id` CHAR(36) NOT NULL,
    `warehouse_id` CHAR(36) NOT NULL,
    `lot_no` VARCHAR(128) NULL,
    `quantity` DECIMAL(18, 4) NOT NULL,
    `unit_cost` DECIMAL(18, 4) NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,

    INDEX `fk_ob_inventory_batch`(`batch_id`),
    INDEX `fk_ob_inventory_warehouse`(`warehouse_id`),
    INDEX `idx_ob_inventory_lines_item_warehouse`(`item_id`, `warehouse_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_balance_payable_lines` (
    `id` CHAR(36) NOT NULL,
    `batch_id` CHAR(36) NOT NULL,
    `supplier_id` CHAR(36) NOT NULL,
    `contract_id` CHAR(36) NULL,
    `account_id` CHAR(36) NOT NULL,
    `invoice_no` VARCHAR(64) NULL,
    `due_date` DATE NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `memo` VARCHAR(500) NULL,

    INDEX `fk_ob_payable_account`(`account_id`),
    INDEX `fk_ob_payable_batch`(`batch_id`),
    INDEX `fk_ob_payable_contract`(`contract_id`),
    INDEX `idx_ob_payable_lines_supplier`(`supplier_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `opening_balance_receivable_lines` (
    `id` CHAR(36) NOT NULL,
    `batch_id` CHAR(36) NOT NULL,
    `customer_id` CHAR(36) NOT NULL,
    `contract_id` CHAR(36) NULL,
    `account_id` CHAR(36) NOT NULL,
    `invoice_no` VARCHAR(64) NULL,
    `due_date` DATE NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `memo` VARCHAR(500) NULL,

    INDEX `fk_ob_receivable_account`(`account_id`),
    INDEX `fk_ob_receivable_batch`(`batch_id`),
    INDEX `fk_ob_receivable_contract`(`contract_id`),
    INDEX `idx_ob_receivable_lines_customer`(`customer_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prepaid_allocations` (
    `id` CHAR(36) NOT NULL,
    `prepaid_expense_id` CHAR(36) NOT NULL,
    `allocation_date` DATE NOT NULL,
    `amount` DECIMAL(18, 2) NOT NULL,
    `journal_entry_id` CHAR(36) NULL,

    INDEX `fk_prepaid_allocations_journal_entry`(`journal_entry_id`),
    INDEX `fk_prepaid_allocations_prepaid`(`prepaid_expense_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prepaid_expenses` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `prepaid_code` VARCHAR(64) NOT NULL,
    `prepaid_name` VARCHAR(255) NOT NULL,
    `supplier_id` CHAR(36) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `original_amount` DECIMAL(18, 2) NOT NULL,
    `allocated_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(20) NOT NULL,

    INDEX `fk_prepaid_expenses_supplier`(`supplier_id`),
    UNIQUE INDEX `uq_prepaid_expenses_org_code`(`organization_id`, `prepaid_code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `report_snapshots` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `report_code` VARCHAR(64) NOT NULL,
    `period_year` INTEGER NOT NULL,
    `period_month` INTEGER NULL,
    `snapshot_key` VARCHAR(255) NOT NULL,
    `payload` LONGTEXT NOT NULL,
    `generated_at` DATETIME(3) NOT NULL,
    `generated_by` CHAR(36) NULL,

    INDEX `fk_report_snapshots_generated_by`(`generated_by`),
    UNIQUE INDEX `uq_report_snapshots_org_report_key`(`organization_id`, `report_code`, `snapshot_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `units_of_measure` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_uom_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `warehouses` (
    `id` CHAR(36) NOT NULL,
    `organization_id` CHAR(36) NOT NULL,
    `code` VARCHAR(64) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `location` VARCHAR(255) NULL,
    `status` VARCHAR(20) NOT NULL,
    `source_system_id` CHAR(36) NULL,
    `source_record_id` VARCHAR(128) NULL,
    `source_updated_at` DATETIME(3) NULL,
    `source_checksum` VARCHAR(128) NULL,
    `created_at` DATETIME(3) NOT NULL,
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_warehouses_source`(`source_system_id`, `source_record_id`),
    UNIQUE INDEX `uq_warehouses_org_code`(`organization_id`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `fk_users_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `roles` ADD CONSTRAINT `fk_roles_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `source_systems` ADD CONSTRAINT `fk_source_systems_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sync_runs` ADD CONSTRAINT `fk_sync_runs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sync_runs` ADD CONSTRAINT `fk_sync_runs_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sync_mappings` ADD CONSTRAINT `fk_sync_mappings_last_run` FOREIGN KEY (`last_sync_run_id`) REFERENCES `sync_runs`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sync_mappings` ADD CONSTRAINT `fk_sync_mappings_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sync_mappings` ADD CONSTRAINT `fk_sync_mappings_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `sync_raw_payloads` ADD CONSTRAINT `fk_sync_raw_payloads_run` FOREIGN KEY (`sync_run_id`) REFERENCES `sync_runs`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `fk_accounts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `fk_accounts_parent` FOREIGN KEY (`parent_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `accounts` ADD CONSTRAINT `fk_accounts_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `customers` ADD CONSTRAINT `fk_customers_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `fk_suppliers_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `suppliers` ADD CONSTRAINT `fk_suppliers_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cash_books` ADD CONSTRAINT `fk_cash_books_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_vouchers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_vouchers_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_vouchers_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_vouchers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_cost_item` FOREIGN KEY (`cost_item_id`) REFERENCES `cost_items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `voucher_lines` ADD CONSTRAINT `fk_voucher_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_instances` ADD CONSTRAINT `fk_approval_instances_flow` FOREIGN KEY (`flow_id`) REFERENCES `approval_flows`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_instances` ADD CONSTRAINT `fk_approval_instances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_actions` ADD CONSTRAINT `fk_approval_actions_instance` FOREIGN KEY (`approval_instance_id`) REFERENCES `approval_instances`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_actions` ADD CONSTRAINT `fk_approval_actions_user` FOREIGN KEY (`acted_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `attachment_files` ADD CONSTRAINT `fk_attachment_files_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `attachment_files` ADD CONSTRAINT `fk_attachment_files_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_statements` ADD CONSTRAINT `fk_bank_statements_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_statements` ADD CONSTRAINT `fk_bank_statements_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_statement_lines` ADD CONSTRAINT `fk_bank_statement_lines_statement` FOREIGN KEY (`statement_id`) REFERENCES `bank_statements`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_reconciliation_matches` ADD CONSTRAINT `fk_bank_reconciliation_matches_line` FOREIGN KEY (`statement_line_id`) REFERENCES `bank_statement_lines`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_reconciliation_matches` ADD CONSTRAINT `fk_bank_reconciliation_matches_user` FOREIGN KEY (`matched_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_reconciliation_matches` ADD CONSTRAINT `fk_bank_reconciliation_matches_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `audit_events` ADD CONSTRAINT `fk_audit_events_actor_user` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `audit_events` ADD CONSTRAINT `fk_audit_events_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_jobs` ADD CONSTRAINT `fk_ai_jobs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_jobs` ADD CONSTRAINT `fk_ai_jobs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ai_job_outputs` ADD CONSTRAINT `fk_ai_job_outputs_job` FOREIGN KEY (`ai_job_id`) REFERENCES `ai_jobs`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_flow_steps` ADD CONSTRAINT `fk_approval_flow_steps_flow` FOREIGN KEY (`flow_id`) REFERENCES `approval_flows`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_flow_steps` ADD CONSTRAINT `fk_approval_flow_steps_role` FOREIGN KEY (`approver_role_id`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_flow_steps` ADD CONSTRAINT `fk_approval_flow_steps_user` FOREIGN KEY (`approver_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `approval_flows` ADD CONSTRAINT `fk_approval_flows_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `asset_movements` ADD CONSTRAINT `fk_asset_movements_asset` FOREIGN KEY (`asset_id`) REFERENCES `fixed_assets`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `asset_movements` ADD CONSTRAINT `fk_asset_movements_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_accounts` ADD CONSTRAINT `fk_bank_accounts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `bank_accounts` ADD CONSTRAINT `fk_bank_accounts_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `fk_contracts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `fk_contracts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `fk_contracts_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `fk_contracts_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cost_items` ADD CONSTRAINT `fk_cost_items_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cost_items` ADD CONSTRAINT `fk_cost_items_parent` FOREIGN KEY (`parent_id`) REFERENCES `cost_items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `cost_items` ADD CONSTRAINT `fk_cost_items_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `depreciation_lines` ADD CONSTRAINT `fk_depreciation_lines_asset` FOREIGN KEY (`asset_id`) REFERENCES `fixed_assets`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `depreciation_lines` ADD CONSTRAINT `fk_depreciation_lines_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `depreciation_lines` ADD CONSTRAINT `fk_depreciation_lines_run` FOREIGN KEY (`depreciation_run_id`) REFERENCES `depreciation_runs`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `depreciation_runs` ADD CONSTRAINT `fk_depreciation_runs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `depreciation_runs` ADD CONSTRAINT `fk_depreciation_runs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `fk_employees_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `employees` ADD CONSTRAINT `fk_employees_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fixed_assets` ADD CONSTRAINT `fk_fixed_assets_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `fixed_assets` ADD CONSTRAINT `fk_fixed_assets_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_balances` ADD CONSTRAINT `fk_inventory_balances_item` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_balances` ADD CONSTRAINT `fk_inventory_balances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_balances` ADD CONSTRAINT `fk_inventory_balances_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_document_lines` ADD CONSTRAINT `fk_inventory_document_lines_doc` FOREIGN KEY (`inventory_document_id`) REFERENCES `inventory_documents`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_document_lines` ADD CONSTRAINT `fk_inventory_document_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_document_lines` ADD CONSTRAINT `fk_inventory_document_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_documents` ADD CONSTRAINT `fk_inventory_documents_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `inventory_documents` ADD CONSTRAINT `fk_inventory_documents_source_voucher` FOREIGN KEY (`source_voucher_id`) REFERENCES `vouchers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_categories` ADD CONSTRAINT `fk_item_categories_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `item_categories` ADD CONSTRAINT `fk_item_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `item_categories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `item_categories`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_items_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_items_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `fk_items_uom` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measure`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `fk_journal_entries_created_by` FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entries` ADD CONSTRAINT `fk_journal_entries_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_cost_item` FOREIGN KEY (`cost_item_id`) REFERENCES `cost_items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `journal_entry_lines` ADD CONSTRAINT `fk_journal_entry_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ledger_balances` ADD CONSTRAINT `fk_ledger_balances_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ledger_balances` ADD CONSTRAINT `fk_ledger_balances_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ledger_balances` ADD CONSTRAINT `fk_ledger_balances_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ledger_balances` ADD CONSTRAINT `fk_ledger_balances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ledger_balances` ADD CONSTRAINT `fk_ledger_balances_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `ledger_balances` ADD CONSTRAINT `fk_ledger_balances_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `materialized_metrics` ADD CONSTRAINT `fk_materialized_metrics_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_account_lines` ADD CONSTRAINT `fk_ob_account_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_batches` ADD CONSTRAINT `fk_opening_balance_batches_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_batches` ADD CONSTRAINT `fk_opening_balance_batches_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_inventory_lines` ADD CONSTRAINT `fk_ob_inventory_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_inventory_lines` ADD CONSTRAINT `fk_ob_inventory_item` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_inventory_lines` ADD CONSTRAINT `fk_ob_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_payable_lines` ADD CONSTRAINT `fk_ob_payable_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_payable_lines` ADD CONSTRAINT `fk_ob_payable_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_payable_lines` ADD CONSTRAINT `fk_ob_payable_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_payable_lines` ADD CONSTRAINT `fk_ob_payable_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_receivable_lines` ADD CONSTRAINT `fk_ob_receivable_account` FOREIGN KEY (`account_id`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_receivable_lines` ADD CONSTRAINT `fk_ob_receivable_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_receivable_lines` ADD CONSTRAINT `fk_ob_receivable_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `opening_balance_receivable_lines` ADD CONSTRAINT `fk_ob_receivable_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `prepaid_allocations` ADD CONSTRAINT `fk_prepaid_allocations_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `prepaid_allocations` ADD CONSTRAINT `fk_prepaid_allocations_prepaid` FOREIGN KEY (`prepaid_expense_id`) REFERENCES `prepaid_expenses`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `prepaid_expenses` ADD CONSTRAINT `fk_prepaid_expenses_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `prepaid_expenses` ADD CONSTRAINT `fk_prepaid_expenses_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `report_snapshots` ADD CONSTRAINT `fk_report_snapshots_generated_by` FOREIGN KEY (`generated_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `report_snapshots` ADD CONSTRAINT `fk_report_snapshots_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `units_of_measure` ADD CONSTRAINT `fk_uom_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `warehouses` ADD CONSTRAINT `fk_warehouses_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `warehouses` ADD CONSTRAINT `fk_warehouses_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

