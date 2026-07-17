-- MySQL dump 10.13  Distrib 8.0.13, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: app_quan_tri
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('34f6d2c6-69c0-47e6-9b8f-42fd3282ba65','fd49911e5e6978da4f440e0b1fd7d74f0ef9ca8a1235798f16c509e8c60ad557','2026-07-10 02:26:07.122','202607090001_initial_safe_baseline',NULL,NULL,'2026-07-10 02:25:59.246',1),('58861a8c-8c53-46f2-82d1-c22f14aac5f8','3a54180cd08908479dc1a2abcb79d68a39c90f4891c6efe49fb91ac0ed4788f3','2026-07-10 02:26:07.472','20260709144118_m2_voucher_header_alignment',NULL,NULL,'2026-07-10 02:26:07.125',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `accounts`
--

DROP TABLE IF EXISTS `accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `accounts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_group` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `normal_balance` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` int NOT NULL,
  `is_postable` tinyint(1) NOT NULL DEFAULT '1',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `allows_counterparty` tinyint(1) NOT NULL DEFAULT '0',
  `allows_contract` tinyint(1) NOT NULL DEFAULT '0',
  `allows_item` tinyint(1) NOT NULL DEFAULT '0',
  `allows_warehouse` tinyint(1) NOT NULL DEFAULT '0',
  `allows_employee` tinyint(1) NOT NULL DEFAULT '0',
  `effective_from` date DEFAULT NULL,
  `effective_to` date DEFAULT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_accounts_org_code` (`organization_id`,`code`),
  KEY `fk_accounts_parent` (`parent_id`),
  KEY `idx_accounts_active` (`organization_id`,`is_active`),
  KEY `idx_accounts_group` (`organization_id`,`account_group`),
  KEY `idx_accounts_org_parent` (`organization_id`,`parent_id`),
  KEY `idx_accounts_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_accounts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_accounts_parent` FOREIGN KEY (`parent_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_accounts_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `accounts`
--

LOCK TABLES `accounts` WRITE;
/*!40000 ALTER TABLE `accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_job_outputs`
--

DROP TABLE IF EXISTS `ai_job_outputs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `ai_job_outputs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ai_job_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `output_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `confidence` decimal(5,4) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ai_job_outputs_job` (`ai_job_id`),
  CONSTRAINT `fk_ai_job_outputs_job` FOREIGN KEY (`ai_job_id`) REFERENCES `ai_jobs` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_job_outputs`
--

LOCK TABLES `ai_job_outputs` WRITE;
/*!40000 ALTER TABLE `ai_job_outputs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_job_outputs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ai_jobs`
--

DROP TABLE IF EXISTS `ai_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `ai_jobs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `job_type` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `input_ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` datetime(3) DEFAULT NULL,
  `ended_at` datetime(3) DEFAULT NULL,
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ai_jobs_created_by` (`created_by`),
  KEY `idx_ai_jobs_org_status` (`organization_id`,`status`),
  CONSTRAINT `fk_ai_jobs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ai_jobs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ai_jobs`
--

LOCK TABLES `ai_jobs` WRITE;
/*!40000 ALTER TABLE `ai_jobs` DISABLE KEYS */;
/*!40000 ALTER TABLE `ai_jobs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_actions`
--

DROP TABLE IF EXISTS `approval_actions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `approval_actions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_instance_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_no` int NOT NULL,
  `action` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acted_by` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acted_at` datetime(3) NOT NULL,
  `comment` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_approval_actions_user` (`acted_by`),
  KEY `idx_approval_actions_instance` (`approval_instance_id`),
  CONSTRAINT `fk_approval_actions_instance` FOREIGN KEY (`approval_instance_id`) REFERENCES `approval_instances` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_approval_actions_user` FOREIGN KEY (`acted_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_actions`
--

LOCK TABLES `approval_actions` WRITE;
/*!40000 ALTER TABLE `approval_actions` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_actions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_flow_steps`
--

DROP TABLE IF EXISTS `approval_flow_steps`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `approval_flow_steps` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `step_no` int NOT NULL,
  `approver_role_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `approver_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deadline_hours` int DEFAULT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_approval_flow_steps_flow_step` (`flow_id`,`step_no`),
  KEY `fk_approval_flow_steps_role` (`approver_role_id`),
  KEY `fk_approval_flow_steps_user` (`approver_user_id`),
  CONSTRAINT `fk_approval_flow_steps_flow` FOREIGN KEY (`flow_id`) REFERENCES `approval_flows` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_approval_flow_steps_role` FOREIGN KEY (`approver_role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_approval_flow_steps_user` FOREIGN KEY (`approver_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_flow_steps`
--

LOCK TABLES `approval_flow_steps` WRITE;
/*!40000 ALTER TABLE `approval_flow_steps` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_flow_steps` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_flows`
--

DROP TABLE IF EXISTS `approval_flows`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `approval_flows` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_approval_flows_org_doc_name` (`organization_id`,`document_type`,`name`),
  CONSTRAINT `fk_approval_flows_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_flows`
--

LOCK TABLES `approval_flows` WRITE;
/*!40000 ALTER TABLE `approval_flows` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_flows` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `approval_instances`
--

DROP TABLE IF EXISTS `approval_instances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `approval_instances` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `flow_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `current_step_no` int NOT NULL DEFAULT '1',
  `started_at` datetime(3) NOT NULL,
  `completed_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_approval_instances_doc` (`organization_id`,`document_type`,`document_id`),
  KEY `fk_approval_instances_flow` (`flow_id`),
  CONSTRAINT `fk_approval_instances_flow` FOREIGN KEY (`flow_id`) REFERENCES `approval_flows` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_approval_instances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `approval_instances`
--

LOCK TABLES `approval_instances` WRITE;
/*!40000 ALTER TABLE `approval_instances` DISABLE KEYS */;
/*!40000 ALTER TABLE `approval_instances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asset_movements`
--

DROP TABLE IF EXISTS `asset_movements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `asset_movements` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `movement_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `movement_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `journal_entry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_asset_movements_journal_entry` (`journal_entry_id`),
  KEY `idx_asset_movements_asset` (`asset_id`),
  CONSTRAINT `fk_asset_movements_asset` FOREIGN KEY (`asset_id`) REFERENCES `fixed_assets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_asset_movements_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asset_movements`
--

LOCK TABLES `asset_movements` WRITE;
/*!40000 ALTER TABLE `asset_movements` DISABLE KEYS */;
/*!40000 ALTER TABLE `asset_movements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `attachment_files`
--

DROP TABLE IF EXISTS `attachment_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `attachment_files` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mime_type` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_size` bigint NOT NULL,
  `storage_key` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_hash` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_attachment_files_hash_key` (`organization_id`,`file_hash`,`storage_key`),
  KEY `fk_attachment_files_created_by` (`created_by`),
  CONSTRAINT `fk_attachment_files_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_attachment_files_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attachment_files`
--

LOCK TABLES `attachment_files` WRITE;
/*!40000 ALTER TABLE `attachment_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `attachment_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_events`
--

DROP TABLE IF EXISTS `audit_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `audit_events` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `actor_user_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `action` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `before_data` longtext COLLATE utf8mb4_unicode_ci,
  `after_data` longtext COLLATE utf8mb4_unicode_ci,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `request_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_audit_events_actor_user` (`actor_user_id`),
  KEY `idx_audit_events_action_created` (`organization_id`,`action`,`created_at`),
  KEY `idx_audit_events_entity` (`organization_id`,`entity_name`,`entity_id`),
  CONSTRAINT `fk_audit_events_actor_user` FOREIGN KEY (`actor_user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_audit_events_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_events`
--

LOCK TABLES `audit_events` WRITE;
/*!40000 ALTER TABLE `audit_events` DISABLE KEYS */;
/*!40000 ALTER TABLE `audit_events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_accounts`
--

DROP TABLE IF EXISTS `bank_accounts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `bank_accounts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_no` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_holder` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency_code` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `branch_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bank_accounts_org_account_no` (`organization_id`,`account_no`),
  KEY `idx_bank_accounts_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_bank_accounts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_bank_accounts_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_accounts`
--

LOCK TABLES `bank_accounts` WRITE;
/*!40000 ALTER TABLE `bank_accounts` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank_accounts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_reconciliation_matches`
--

DROP TABLE IF EXISTS `bank_reconciliation_matches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `bank_reconciliation_matches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statement_line_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `matched_amount` decimal(18,2) NOT NULL,
  `matched_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matched_at` datetime(3) NOT NULL,
  `note` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bank_reconciliation_matches_line_voucher` (`statement_line_id`,`voucher_id`),
  KEY `fk_bank_reconciliation_matches_user` (`matched_by`),
  KEY `fk_bank_reconciliation_matches_voucher` (`voucher_id`),
  CONSTRAINT `fk_bank_reconciliation_matches_line` FOREIGN KEY (`statement_line_id`) REFERENCES `bank_statement_lines` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_bank_reconciliation_matches_user` FOREIGN KEY (`matched_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_bank_reconciliation_matches_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_reconciliation_matches`
--

LOCK TABLES `bank_reconciliation_matches` WRITE;
/*!40000 ALTER TABLE `bank_reconciliation_matches` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank_reconciliation_matches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_statement_lines`
--

DROP TABLE IF EXISTS `bank_statement_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `bank_statement_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statement_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_no` int NOT NULL,
  `value_date` date DEFAULT NULL,
  `transaction_date` date DEFAULT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reference_no` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `balance_after` decimal(18,2) DEFAULT NULL,
  `matched_status` enum('unmatched','partial','matched') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unmatched',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_bank_statement_lines_statement_line` (`statement_id`,`line_no`),
  KEY `idx_bank_statement_lines_statement_status` (`statement_id`,`matched_status`),
  CONSTRAINT `fk_bank_statement_lines_statement` FOREIGN KEY (`statement_id`) REFERENCES `bank_statements` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_statement_lines`
--

LOCK TABLES `bank_statement_lines` WRITE;
/*!40000 ALTER TABLE `bank_statement_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank_statement_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bank_statements`
--

DROP TABLE IF EXISTS `bank_statements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `bank_statements` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bank_account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `statement_no` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `statement_date` date NOT NULL,
  `opening_balance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `closing_balance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `source_file_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_file_hash` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `imported_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_bank_statements_org` (`organization_id`),
  KEY `idx_bank_statements_bank_account` (`bank_account_id`),
  CONSTRAINT `fk_bank_statements_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_bank_statements_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bank_statements`
--

LOCK TABLES `bank_statements` WRITE;
/*!40000 ALTER TABLE `bank_statements` DISABLE KEYS */;
/*!40000 ALTER TABLE `bank_statements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cash_books`
--

DROP TABLE IF EXISTS `cash_books`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `cash_books` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `currency_code` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cash_books_org_code` (`organization_id`,`code`),
  CONSTRAINT `fk_cash_books_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cash_books`
--

LOCK TABLES `cash_books` WRITE;
/*!40000 ALTER TABLE `cash_books` DISABLE KEYS */;
/*!40000 ALTER TABLE `cash_books` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contracts`
--

DROP TABLE IF EXISTS `contracts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `contracts` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_no` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `counterparty_type` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `signed_date` date DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_contracts_org_contract_no` (`organization_id`,`contract_no`),
  KEY `fk_contracts_source` (`source_system_id`),
  KEY `idx_contracts_customer` (`customer_id`),
  KEY `idx_contracts_supplier` (`supplier_id`),
  CONSTRAINT `fk_contracts_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_contracts_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_contracts_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_contracts_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contracts`
--

LOCK TABLES `contracts` WRITE;
/*!40000 ALTER TABLE `contracts` DISABLE KEYS */;
/*!40000 ALTER TABLE `contracts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cost_items`
--

DROP TABLE IF EXISTS `cost_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `cost_items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_group` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_cost_items_org_code` (`organization_id`,`code`),
  KEY `fk_cost_items_source` (`source_system_id`),
  KEY `idx_cost_items_parent` (`parent_id`),
  CONSTRAINT `fk_cost_items_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_cost_items_parent` FOREIGN KEY (`parent_id`) REFERENCES `cost_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_cost_items_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cost_items`
--

LOCK TABLES `cost_items` WRITE;
/*!40000 ALTER TABLE `cost_items` DISABLE KEYS */;
/*!40000 ALTER TABLE `cost_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customers`
--

DROP TABLE IF EXISTS `customers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `customers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_customers_org_code` (`organization_id`,`code`),
  KEY `idx_customers_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_customers_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_customers_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customers`
--

LOCK TABLES `customers` WRITE;
/*!40000 ALTER TABLE `customers` DISABLE KEYS */;
/*!40000 ALTER TABLE `customers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `depreciation_lines`
--

DROP TABLE IF EXISTS `depreciation_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `depreciation_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `depreciation_run_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `journal_entry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_depreciation_lines_asset` (`asset_id`),
  KEY `fk_depreciation_lines_journal_entry` (`journal_entry_id`),
  KEY `fk_depreciation_lines_run` (`depreciation_run_id`),
  CONSTRAINT `fk_depreciation_lines_asset` FOREIGN KEY (`asset_id`) REFERENCES `fixed_assets` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_depreciation_lines_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_depreciation_lines_run` FOREIGN KEY (`depreciation_run_id`) REFERENCES `depreciation_runs` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depreciation_lines`
--

LOCK TABLES `depreciation_lines` WRITE;
/*!40000 ALTER TABLE `depreciation_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `depreciation_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `depreciation_runs`
--

DROP TABLE IF EXISTS `depreciation_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `depreciation_runs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_year` int NOT NULL,
  `period_month` int NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `run_at` datetime(3) NOT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_depreciation_runs_period` (`organization_id`,`period_year`,`period_month`),
  KEY `fk_depreciation_runs_created_by` (`created_by`),
  CONSTRAINT `fk_depreciation_runs_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_depreciation_runs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `depreciation_runs`
--

LOCK TABLES `depreciation_runs` WRITE;
/*!40000 ALTER TABLE `depreciation_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `depreciation_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `employees` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `department_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `position_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_employees_org_code` (`organization_id`,`code`),
  KEY `idx_employees_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_employees_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_employees_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fixed_assets`
--

DROP TABLE IF EXISTS `fixed_assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `fixed_assets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `asset_category` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `acquisition_date` date NOT NULL,
  `original_cost` decimal(18,2) NOT NULL,
  `residual_value` decimal(18,2) NOT NULL DEFAULT '0.00',
  `useful_life_months` int NOT NULL,
  `depreciation_method` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fixed_assets_org_code` (`organization_id`,`asset_code`),
  KEY `idx_fixed_assets_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_fixed_assets_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_fixed_assets_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fixed_assets`
--

LOCK TABLES `fixed_assets` WRITE;
/*!40000 ALTER TABLE `fixed_assets` DISABLE KEYS */;
/*!40000 ALTER TABLE `fixed_assets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_balances`
--

DROP TABLE IF EXISTS `inventory_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `inventory_balances` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `snapshot_date` date NOT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot_no` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `in_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `out_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `closing_qty` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `closing_cost` decimal(18,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inventory_balances_snapshot` (`organization_id`,`snapshot_date`,`item_id`,`warehouse_id`,`lot_no`),
  KEY `fk_inventory_balances_item` (`item_id`),
  KEY `fk_inventory_balances_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_inventory_balances_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_inventory_balances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_inventory_balances_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_balances`
--

LOCK TABLES `inventory_balances` WRITE;
/*!40000 ALTER TABLE `inventory_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_document_lines`
--

DROP TABLE IF EXISTS `inventory_document_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `inventory_document_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `inventory_document_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_no` int NOT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `qty_in` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `qty_out` decimal(18,4) NOT NULL DEFAULT '0.0000',
  `unit_cost` decimal(18,4) DEFAULT NULL,
  `lot_no` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inventory_document_lines_doc_line` (`inventory_document_id`,`line_no`),
  KEY `fk_inventory_document_lines_item` (`item_id`),
  KEY `fk_inventory_document_lines_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_inventory_document_lines_doc` FOREIGN KEY (`inventory_document_id`) REFERENCES `inventory_documents` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_inventory_document_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_inventory_document_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_document_lines`
--

LOCK TABLES `inventory_document_lines` WRITE;
/*!40000 ALTER TABLE `inventory_document_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_document_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory_documents`
--

DROP TABLE IF EXISTS `inventory_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `inventory_documents` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_no` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `document_date` date NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_voucher_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_inventory_documents_org_type_no` (`organization_id`,`document_type`,`document_no`),
  KEY `fk_inventory_documents_source_voucher` (`source_voucher_id`),
  CONSTRAINT `fk_inventory_documents_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_inventory_documents_source_voucher` FOREIGN KEY (`source_voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory_documents`
--

LOCK TABLES `inventory_documents` WRITE;
/*!40000 ALTER TABLE `inventory_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `inventory_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `item_categories`
--

DROP TABLE IF EXISTS `item_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `item_categories` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_item_categories_org_code` (`organization_id`,`code`),
  KEY `idx_item_categories_parent` (`parent_id`),
  CONSTRAINT `fk_item_categories_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_item_categories_parent` FOREIGN KEY (`parent_id`) REFERENCES `item_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `item_categories`
--

LOCK TABLES `item_categories` WRITE;
/*!40000 ALTER TABLE `item_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `item_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `items` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_type` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `uom_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `barcode` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_inventory_item` tinyint(1) NOT NULL DEFAULT '1',
  `is_service_item` tinyint(1) NOT NULL DEFAULT '0',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_items_org_code` (`organization_id`,`code`),
  KEY `idx_items_category` (`category_id`),
  KEY `idx_items_source` (`source_system_id`,`source_record_id`),
  KEY `idx_items_uom` (`uom_id`),
  CONSTRAINT `fk_items_category` FOREIGN KEY (`category_id`) REFERENCES `item_categories` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_items_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_items_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_items_uom` FOREIGN KEY (`uom_id`) REFERENCES `units_of_measure` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `items`
--

LOCK TABLES `items` WRITE;
/*!40000 ALTER TABLE `items` DISABLE KEYS */;
/*!40000 ALTER TABLE `items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entries`
--

DROP TABLE IF EXISTS `journal_entries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `journal_entries` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_no` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entry_date` date NOT NULL,
  `source_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `posted_at` datetime(3) DEFAULT NULL,
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_journal_entries_org_entry_no` (`organization_id`,`entry_no`),
  KEY `fk_journal_entries_created_by` (`created_by`),
  KEY `idx_journal_entries_org_date` (`organization_id`,`entry_date`),
  CONSTRAINT `fk_journal_entries_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entries_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entries`
--

LOCK TABLES `journal_entries` WRITE;
/*!40000 ALTER TABLE `journal_entries` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entries` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `journal_entry_lines`
--

DROP TABLE IF EXISTS `journal_entry_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `journal_entry_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `journal_entry_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_no` int NOT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_item_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_journal_entry_lines_entry_line` (`journal_entry_id`,`line_no`),
  KEY `fk_journal_entry_lines_bank_account` (`bank_account_id`),
  KEY `fk_journal_entry_lines_contract` (`contract_id`),
  KEY `fk_journal_entry_lines_cost_item` (`cost_item_id`),
  KEY `fk_journal_entry_lines_customer` (`customer_id`),
  KEY `fk_journal_entry_lines_employee` (`employee_id`),
  KEY `fk_journal_entry_lines_item` (`item_id`),
  KEY `fk_journal_entry_lines_supplier` (`supplier_id`),
  KEY `fk_journal_entry_lines_warehouse` (`warehouse_id`),
  KEY `idx_journal_entry_lines_account` (`account_id`),
  CONSTRAINT `fk_journal_entry_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_cost_item` FOREIGN KEY (`cost_item_id`) REFERENCES `cost_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_journal_entry_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `journal_entry_lines`
--

LOCK TABLES `journal_entry_lines` WRITE;
/*!40000 ALTER TABLE `journal_entry_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `journal_entry_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ledger_balances`
--

DROP TABLE IF EXISTS `ledger_balances`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `ledger_balances` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_year` int NOT NULL,
  `period_month` int NOT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `opening_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `opening_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `period_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `period_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `closing_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `closing_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `calculated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ledger_balances_account` (`account_id`),
  KEY `fk_ledger_balances_contract` (`contract_id`),
  KEY `fk_ledger_balances_customer` (`customer_id`),
  KEY `fk_ledger_balances_supplier` (`supplier_id`),
  KEY `fk_ledger_balances_warehouse` (`warehouse_id`),
  KEY `idx_ledger_balances_org_period_account` (`organization_id`,`period_year`,`period_month`,`account_id`),
  CONSTRAINT `fk_ledger_balances_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ledger_balances_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ledger_balances_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ledger_balances_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ledger_balances_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ledger_balances_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ledger_balances`
--

LOCK TABLES `ledger_balances` WRITE;
/*!40000 ALTER TABLE `ledger_balances` DISABLE KEYS */;
/*!40000 ALTER TABLE `ledger_balances` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `materialized_metrics`
--

DROP TABLE IF EXISTS `materialized_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `materialized_metrics` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `metric_date` date NOT NULL,
  `dimension_key` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metric_value` decimal(18,4) NOT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_materialized_metrics_org_metric_date_dim` (`organization_id`,`metric_code`,`metric_date`,`dimension_key`),
  CONSTRAINT `fk_materialized_metrics_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `materialized_metrics`
--

LOCK TABLES `materialized_metrics` WRITE;
/*!40000 ALTER TABLE `materialized_metrics` DISABLE KEYS */;
/*!40000 ALTER TABLE `materialized_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balance_account_lines`
--

DROP TABLE IF EXISTS `opening_balance_account_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `opening_balance_account_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `line_no` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_opening_balance_account_lines_batch_line` (`batch_id`,`line_no`),
  KEY `fk_ob_account_lines_contract` (`contract_id`),
  KEY `fk_ob_account_lines_customer` (`customer_id`),
  KEY `fk_ob_account_lines_employee` (`employee_id`),
  KEY `fk_ob_account_lines_item` (`item_id`),
  KEY `fk_ob_account_lines_supplier` (`supplier_id`),
  KEY `fk_ob_account_lines_warehouse` (`warehouse_id`),
  KEY `idx_opening_balance_account_lines_account` (`account_id`),
  CONSTRAINT `fk_ob_account_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_account_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balance_account_lines`
--

LOCK TABLES `opening_balance_account_lines` WRITE;
/*!40000 ALTER TABLE `opening_balance_account_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balance_account_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balance_batches`
--

DROP TABLE IF EXISTS `opening_balance_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `opening_balance_batches` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_year` int NOT NULL,
  `period_month` int DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_opening_balance_batches_period` (`organization_id`,`period_year`,`period_month`),
  KEY `fk_opening_balance_batches_source` (`source_system_id`),
  CONSTRAINT `fk_opening_balance_batches_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_opening_balance_batches_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balance_batches`
--

LOCK TABLES `opening_balance_batches` WRITE;
/*!40000 ALTER TABLE `opening_balance_batches` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balance_batches` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balance_inventory_lines`
--

DROP TABLE IF EXISTS `opening_balance_inventory_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `opening_balance_inventory_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lot_no` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` decimal(18,4) NOT NULL,
  `unit_cost` decimal(18,4) NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ob_inventory_batch` (`batch_id`),
  KEY `fk_ob_inventory_warehouse` (`warehouse_id`),
  KEY `idx_ob_inventory_lines_item_warehouse` (`item_id`,`warehouse_id`),
  CONSTRAINT `fk_ob_inventory_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_inventory_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_inventory_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balance_inventory_lines`
--

LOCK TABLES `opening_balance_inventory_lines` WRITE;
/*!40000 ALTER TABLE `opening_balance_inventory_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balance_inventory_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balance_payable_lines`
--

DROP TABLE IF EXISTS `opening_balance_payable_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `opening_balance_payable_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_no` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ob_payable_account` (`account_id`),
  KEY `fk_ob_payable_batch` (`batch_id`),
  KEY `fk_ob_payable_contract` (`contract_id`),
  KEY `idx_ob_payable_lines_supplier` (`supplier_id`),
  CONSTRAINT `fk_ob_payable_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_payable_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_payable_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_payable_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balance_payable_lines`
--

LOCK TABLES `opening_balance_payable_lines` WRITE;
/*!40000 ALTER TABLE `opening_balance_payable_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balance_payable_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `opening_balance_receivable_lines`
--

DROP TABLE IF EXISTS `opening_balance_receivable_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `opening_balance_receivable_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contract_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `invoice_no` varchar(64) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `amount` decimal(18,2) NOT NULL,
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ob_receivable_account` (`account_id`),
  KEY `fk_ob_receivable_batch` (`batch_id`),
  KEY `fk_ob_receivable_contract` (`contract_id`),
  KEY `idx_ob_receivable_lines_customer` (`customer_id`),
  CONSTRAINT `fk_ob_receivable_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_receivable_batch` FOREIGN KEY (`batch_id`) REFERENCES `opening_balance_batches` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_receivable_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ob_receivable_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `opening_balance_receivable_lines`
--

LOCK TABLES `opening_balance_receivable_lines` WRITE;
/*!40000 ALTER TABLE `opening_balance_receivable_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `opening_balance_receivable_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `organizations`
--

DROP TABLE IF EXISTS `organizations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `organizations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `base_currency` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `timezone` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_organizations_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `organizations`
--

LOCK TABLES `organizations` WRITE;
/*!40000 ALTER TABLE `organizations` DISABLE KEYS */;
INSERT INTO `organizations` VALUES ('d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','TTPPAPER','Công ty TNHH Giấy Tín Thịnh Phát',NULL,'VND','Asia/Ho_Chi_Minh','active','2026-07-13 03:58:35.006','2026-07-13 03:58:35.007');
/*!40000 ALTER TABLE `organizations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepaid_allocations`
--

DROP TABLE IF EXISTS `prepaid_allocations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `prepaid_allocations` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prepaid_expense_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `allocation_date` date NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `journal_entry_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_prepaid_allocations_journal_entry` (`journal_entry_id`),
  KEY `fk_prepaid_allocations_prepaid` (`prepaid_expense_id`),
  CONSTRAINT `fk_prepaid_allocations_journal_entry` FOREIGN KEY (`journal_entry_id`) REFERENCES `journal_entries` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_prepaid_allocations_prepaid` FOREIGN KEY (`prepaid_expense_id`) REFERENCES `prepaid_expenses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepaid_allocations`
--

LOCK TABLES `prepaid_allocations` WRITE;
/*!40000 ALTER TABLE `prepaid_allocations` DISABLE KEYS */;
/*!40000 ALTER TABLE `prepaid_allocations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `prepaid_expenses`
--

DROP TABLE IF EXISTS `prepaid_expenses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `prepaid_expenses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prepaid_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `prepaid_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `original_amount` decimal(18,2) NOT NULL,
  `allocated_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_prepaid_expenses_org_code` (`organization_id`,`prepaid_code`),
  KEY `fk_prepaid_expenses_supplier` (`supplier_id`),
  CONSTRAINT `fk_prepaid_expenses_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_prepaid_expenses_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `prepaid_expenses`
--

LOCK TABLES `prepaid_expenses` WRITE;
/*!40000 ALTER TABLE `prepaid_expenses` DISABLE KEYS */;
/*!40000 ALTER TABLE `prepaid_expenses` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_snapshots`
--

DROP TABLE IF EXISTS `report_snapshots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `report_snapshots` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `report_code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `period_year` int NOT NULL,
  `period_month` int DEFAULT NULL,
  `snapshot_key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `generated_at` datetime(3) NOT NULL,
  `generated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_report_snapshots_org_report_key` (`organization_id`,`report_code`,`snapshot_key`),
  KEY `fk_report_snapshots_generated_by` (`generated_by`),
  CONSTRAINT `fk_report_snapshots_generated_by` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_report_snapshots_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_snapshots`
--

LOCK TABLES `report_snapshots` WRITE;
/*!40000 ALTER TABLE `report_snapshots` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_snapshots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_org_code` (`organization_id`,`code`),
  KEY `idx_roles_org` (`organization_id`),
  CONSTRAINT `fk_roles_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('2b78db6f-8a63-4024-820b-332a8045edeb','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','director','Giám đốc',1,'2026-07-13 03:58:35.016','2026-07-13 03:58:35.017'),('36418658-1816-43af-97d0-b4c575a72b94','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','accountant','Kế toán viên',1,'2026-07-13 03:58:35.023','2026-07-13 03:58:35.024'),('d5d0b572-f99e-4322-b868-f2df6dc7b08f','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','chief_accountant','Kế toán trưởng',1,'2026-07-13 03:58:35.020','2026-07-13 03:58:35.021');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `source_systems`
--

DROP TABLE IF EXISTS `source_systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `source_systems` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `base_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `auth_type` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_synced_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_source_systems_org_code` (`organization_id`,`code`),
  KEY `idx_source_systems_org` (`organization_id`),
  CONSTRAINT `fk_source_systems_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `source_systems`
--

LOCK TABLES `source_systems` WRITE;
/*!40000 ALTER TABLE `source_systems` DISABLE KEYS */;
/*!40000 ALTER TABLE `source_systems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `suppliers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tax_code` varchar(32) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `short_name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_suppliers_org_code` (`organization_id`,`code`),
  KEY `idx_suppliers_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_suppliers_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_suppliers_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `suppliers`
--

LOCK TABLES `suppliers` WRITE;
/*!40000 ALTER TABLE `suppliers` DISABLE KEYS */;
/*!40000 ALTER TABLE `suppliers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_mappings`
--

DROP TABLE IF EXISTS `sync_mappings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sync_mappings` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `local_table_name` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `local_record_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sync_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_sync_run_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_sync_mappings_source` (`source_system_id`,`entity_name`,`source_record_id`),
  KEY `fk_sync_mappings_last_run` (`last_sync_run_id`),
  KEY `idx_sync_mappings_local` (`local_table_name`,`local_record_id`),
  KEY `idx_sync_mappings_org` (`organization_id`),
  CONSTRAINT `fk_sync_mappings_last_run` FOREIGN KEY (`last_sync_run_id`) REFERENCES `sync_runs` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sync_mappings_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sync_mappings_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_mappings`
--

LOCK TABLES `sync_mappings` WRITE;
/*!40000 ALTER TABLE `sync_mappings` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_mappings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_raw_payloads`
--

DROP TABLE IF EXISTS `sync_raw_payloads`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sync_raw_payloads` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sync_run_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload_hash` varchar(128) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sync_raw_payloads_hash` (`payload_hash`),
  KEY `idx_sync_raw_payloads_run_entity` (`sync_run_id`,`entity_name`),
  CONSTRAINT `fk_sync_raw_payloads_run` FOREIGN KEY (`sync_run_id`) REFERENCES `sync_runs` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_raw_payloads`
--

LOCK TABLES `sync_raw_payloads` WRITE;
/*!40000 ALTER TABLE `sync_raw_payloads` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_raw_payloads` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_runs`
--

DROP TABLE IF EXISTS `sync_runs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sync_runs` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `entity_name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `mode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `started_at` datetime(3) NOT NULL,
  `ended_at` datetime(3) DEFAULT NULL,
  `records_read` int NOT NULL DEFAULT '0',
  `records_inserted` int NOT NULL DEFAULT '0',
  `records_updated` int NOT NULL DEFAULT '0',
  `records_skipped` int NOT NULL DEFAULT '0',
  `records_failed` int NOT NULL DEFAULT '0',
  `error_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sync_runs_org_source_entity_started` (`organization_id`,`source_system_id`,`entity_name`,`started_at`),
  KEY `idx_sync_runs_source` (`source_system_id`),
  CONSTRAINT `fk_sync_runs_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_sync_runs_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_runs`
--

LOCK TABLES `sync_runs` WRITE;
/*!40000 ALTER TABLE `sync_runs` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_runs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `units_of_measure`
--

DROP TABLE IF EXISTS `units_of_measure`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `units_of_measure` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_uom_org_code` (`organization_id`,`code`),
  CONSTRAINT `fk_uom_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `units_of_measure`
--

LOCK TABLES `units_of_measure` WRITE;
/*!40000 ALTER TABLE `units_of_measure` DISABLE KEYS */;
/*!40000 ALTER TABLE `units_of_measure` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `user_roles` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_roles_user_role` (`user_id`,`role_id`),
  KEY `idx_user_roles_role` (`role_id`),
  KEY `idx_user_roles_user` (`user_id`),
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES ('2499da91-59fe-403b-b9a2-af9a046e10c3','54653463-d8fc-45d5-937c-45f146be5fe7','36418658-1816-43af-97d0-b4c575a72b94','2026-07-13 04:19:20.205'),('936dfb46-dda1-498a-b134-edd2cb53e203','2c34e28f-c779-4963-a385-0f81f790eca5','36418658-1816-43af-97d0-b4c575a72b94','2026-07-13 04:20:24.264'),('dcd5d497-a37f-4eef-bb82-dcf0bb53a13d','f75f50c7-afd5-46e6-99bb-beb08997bba1','d5d0b572-f99e-4322-b868-f2df6dc7b08f','2026-07-13 04:18:01.525'),('f6adfe4a-8544-42c4-b6eb-3e210fd118a0','9ea038e8-e7e1-4301-9238-3d2a5c399cfa','2b78db6f-8a63-4024-820b-332a8045edeb','2026-07-13 03:58:35.027');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `users` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `full_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_login_at` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_org_username` (`organization_id`,`username`),
  UNIQUE KEY `uq_users_org_email` (`organization_id`,`email`),
  KEY `idx_users_org` (`organization_id`),
  CONSTRAINT `fk_users_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('2c34e28f-c779-4963-a385-0f81f790eca5','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','ketoanvien02@netviet.vn','ketoanvien02','Kế toán viên thứ hai','$2b$12$DzfQeOJiq1VUjtn5xAivSeCy4bWSdhVJHYA3LnpH59CnS4qxqvify','active',NULL,'2026-07-13 04:20:24.264','2026-07-13 04:20:24.265'),('54653463-d8fc-45d5-937c-45f146be5fe7','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','ketoanvien01@netviet.vn','ketoanvien01','Trần Thị Kế Toán','$2b$12$KrCch.JouMIZA9b32YOsPOmZnp.7ToMWSmnaYq2z5ENzUoPlI/8oS','active',NULL,'2026-07-13 04:19:20.205','2026-07-13 04:19:20.206'),('9ea038e8-e7e1-4301-9238-3d2a5c399cfa','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','director@netviet.vn','director','Giám đốc NetViet','$2b$12$GRq8wij67kSQor6jw33rPOeS2L9cF1GJlKFe2RFcoxheDuZFrIGDa','active','2026-07-13 07:10:54.782','2026-07-13 03:58:35.027','2026-07-13 07:10:54.783'),('f75f50c7-afd5-46e6-99bb-beb08997bba1','d14b71a2-dec4-4ecb-9fad-e46ef76b7c59','ketoantruong@netviet.vn','ketoantruong','Nguyễn Văn Kế Toán','$2b$12$ZF03GB9iv9dyZN1lK6IJMOh.vjwTAj5rGexHOCXrm8WGTuRarcXUK','active','2026-07-13 04:18:24.138','2026-07-13 04:18:01.525','2026-07-13 04:18:24.140');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `voucher_lines`
--

DROP TABLE IF EXISTS `voucher_lines`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `voucher_lines` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `line_no` int NOT NULL,
  `account_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `customer_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplier_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contract_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cost_item_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouse_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bank_account_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `item_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `debit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `credit_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `quantity` decimal(18,4) DEFAULT NULL,
  `unit_price` decimal(18,4) DEFAULT NULL,
  `tax_rate` decimal(5,2) DEFAULT NULL,
  `memo` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_voucher_lines_voucher_line` (`voucher_id`,`line_no`),
  KEY `fk_voucher_lines_contract` (`contract_id`),
  KEY `fk_voucher_lines_cost_item` (`cost_item_id`),
  KEY `fk_voucher_lines_employee` (`employee_id`),
  KEY `fk_voucher_lines_item` (`item_id`),
  KEY `idx_voucher_lines_account` (`account_id`),
  KEY `idx_voucher_lines_bank_account` (`bank_account_id`),
  KEY `idx_voucher_lines_customer` (`customer_id`),
  KEY `idx_voucher_lines_supplier` (`supplier_id`),
  KEY `idx_voucher_lines_warehouse` (`warehouse_id`),
  CONSTRAINT `fk_voucher_lines_account` FOREIGN KEY (`account_id`) REFERENCES `accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_cost_item` FOREIGN KEY (`cost_item_id`) REFERENCES `cost_items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_employee` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_voucher` FOREIGN KEY (`voucher_id`) REFERENCES `vouchers` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_voucher_lines_warehouse` FOREIGN KEY (`warehouse_id`) REFERENCES `warehouses` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `voucher_lines`
--

LOCK TABLES `voucher_lines` WRITE;
/*!40000 ALTER TABLE `voucher_lines` DISABLE KEYS */;
/*!40000 ALTER TABLE `voucher_lines` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vouchers`
--

DROP TABLE IF EXISTS `vouchers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `vouchers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_type` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_no` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `voucher_date` date NOT NULL,
  `posting_date` date DEFAULT NULL,
  `currency_code` varchar(8) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'VND',
  `exchange_rate` decimal(18,6) NOT NULL DEFAULT '1.000000',
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `approval_status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` varchar(1000) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `total_debit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `total_credit` decimal(18,2) NOT NULL DEFAULT '0.00',
  `created_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_by` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  `bank_account_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cash_book_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `counterparty_type` enum('customer','supplier','employee','internal','other') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `matched_amount` decimal(18,2) NOT NULL DEFAULT '0.00',
  `payment_channel` enum('cash','bank') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reconciliation_status` enum('unmatched','partial','matched') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unmatched',
  `reference_invoice_no` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vouchers_org_type_no` (`organization_id`,`voucher_type`,`voucher_no`),
  KEY `fk_vouchers_created_by` (`created_by`),
  KEY `fk_vouchers_updated_by` (`updated_by`),
  KEY `idx_vouchers_org_status_date` (`organization_id`,`status`,`voucher_date`),
  KEY `idx_vouchers_org_type_date` (`organization_id`,`voucher_type`,`voucher_date`),
  KEY `idx_vouchers_source` (`source_system_id`,`source_record_id`),
  KEY `idx_vouchers_org_bank_date` (`organization_id`,`bank_account_id`,`voucher_date`),
  KEY `idx_vouchers_org_cash_book_date` (`organization_id`,`cash_book_id`,`voucher_date`),
  KEY `fk_vouchers_bank_account` (`bank_account_id`),
  KEY `fk_vouchers_cash_book` (`cash_book_id`),
  CONSTRAINT `fk_vouchers_bank_account` FOREIGN KEY (`bank_account_id`) REFERENCES `bank_accounts` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_vouchers_cash_book` FOREIGN KEY (`cash_book_id`) REFERENCES `cash_books` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_vouchers_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_vouchers_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_vouchers_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_vouchers_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vouchers`
--

LOCK TABLES `vouchers` WRITE;
/*!40000 ALTER TABLE `vouchers` DISABLE KEYS */;
/*!40000 ALTER TABLE `vouchers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouses`
--

DROP TABLE IF EXISTS `warehouses`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `warehouses` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `organization_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `source_system_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_record_id` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_updated_at` datetime(3) DEFAULT NULL,
  `source_checksum` varchar(128) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` datetime(3) NOT NULL,
  `updated_at` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_warehouses_org_code` (`organization_id`,`code`),
  KEY `idx_warehouses_source` (`source_system_id`,`source_record_id`),
  CONSTRAINT `fk_warehouses_org` FOREIGN KEY (`organization_id`) REFERENCES `organizations` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_warehouses_source` FOREIGN KEY (`source_system_id`) REFERENCES `source_systems` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouses`
--

LOCK TABLES `warehouses` WRITE;
/*!40000 ALTER TABLE `warehouses` DISABLE KEYS */;
/*!40000 ALTER TABLE `warehouses` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-13 14:49:12
