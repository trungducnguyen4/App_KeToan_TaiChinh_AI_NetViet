/*
  Warnings:

  - You are about to alter the column `matched_status` on the `bank_statement_lines` table. The data in that column could be lost. The data in that column will be cast from `VarChar(30)` to `Enum(EnumId(3))`.

*/
-- AlterTable
ALTER TABLE `bank_reconciliation_matches` ADD COLUMN `note` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `bank_statement_lines` MODIFY `matched_status` ENUM('unmatched', 'partial', 'matched') NOT NULL DEFAULT 'unmatched';

-- AlterTable
ALTER TABLE `vouchers` ADD COLUMN `bank_account_id` CHAR(36) NULL,
    ADD COLUMN `cash_book_id` CHAR(36) NULL,
    ADD COLUMN `counterparty_type` ENUM('customer', 'supplier', 'employee', 'internal', 'other') NULL,
    ADD COLUMN `matched_amount` DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `payment_channel` ENUM('cash', 'bank') NULL,
    ADD COLUMN `reconciliation_status` ENUM('unmatched', 'partial', 'matched') NOT NULL DEFAULT 'unmatched',
    ADD COLUMN `reference_invoice_no` VARCHAR(128) NULL;

-- CreateIndex
CREATE INDEX `idx_bank_statement_lines_statement_status` ON `bank_statement_lines`(`statement_id`, `matched_status`);

-- CreateIndex
CREATE INDEX `idx_vouchers_org_bank_date` ON `vouchers`(`organization_id`, `bank_account_id`, `voucher_date`);

-- CreateIndex
CREATE INDEX `idx_vouchers_org_cash_book_date` ON `vouchers`(`organization_id`, `cash_book_id`, `voucher_date`);

-- CreateIndex
CREATE INDEX `fk_vouchers_bank_account` ON `vouchers`(`bank_account_id`);

-- CreateIndex
CREATE INDEX `fk_vouchers_cash_book` ON `vouchers`(`cash_book_id`);

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_vouchers_cash_book` FOREIGN KEY (`cash_book_id`) REFERENCES `cash_books`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `vouchers` ADD CONSTRAINT `fk_vouchers_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts`(`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;
