import type { NextApiRequest, NextApiResponse } from "next";

const PUBLIC_TOOL_BASE_URL =
  process.env.AI_TOOLS_PUBLIC_BASE_URL?.replace(/\/$/, "") ??
  "http://host.docker.internal:3000";

const jsonRequest = {
  required: false,
  content: {
    "application/json": {
      schema: {
        type: "object",
        additionalProperties: true,
      },
    },
  },
};

const ocrRequest = {
  required: false,
  content: {
    "application/json": {
      schema: {
        type: "object",
        properties: {
          file: { type: "object" },
          files: { type: "array", items: { type: "object" } },
          file_url: { type: "string" },
          file_type: { type: "string" },
          upload_file_id: { type: "string" },
          data_json: { type: "object" },
          document_json: { type: "object" },
          voucher_type: { type: "string" },
          user: { type: "string" },
          requested_by: { type: "string" },
        },
        additionalProperties: true,
      },
    },
  },
};

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    openapi: "3.0.0",
    info: {
      title: "NetViet Accounting AI Tools Web Proxy",
      version: "1.0.0",
    },
    servers: [{ url: `${PUBLIC_TOOL_BASE_URL}/api/v1/ai/tools` }],
    paths: {
      "/debts/due": {
        post: {
          operationId: "get_due_debts",
          summary: "Lay tong hop cong no den han va qua han",
          requestBody: jsonRequest,
          responses: { "200": { description: "Du lieu cong no" } },
        },
      },
      "/cashflow/summary": {
        post: {
          operationId: "get_cashflow_summary",
          summary: "Lay tong hop dong tien",
          requestBody: jsonRequest,
          responses: { "200": { description: "Du lieu dong tien" } },
        },
      },
      "/vouchers/missing": {
        post: {
          operationId: "detect_missing_vouchers",
          summary: "Phat hien hoa don/chung tu thieu lien ket hach toan",
          requestBody: jsonRequest,
          responses: { "200": { description: "Danh sach chung tu thieu" } },
        },
      },
      "/vouchers/detail": {
        post: {
          operationId: "get_voucher_details",
          summary: "Lay thong tin chung tu theo so chung tu",
          requestBody: jsonRequest,
          responses: { "200": { description: "Chi tiet chung tu" } },
        },
      },
      "/expenses/by-category": {
        post: {
          operationId: "get_expense_by_category",
          summary: "Lay chi phi theo tai khoan/khoan muc",
          requestBody: jsonRequest,
          responses: { "200": { description: "Du lieu chi phi theo khoan muc" } },
        },
      },
      "/bank/reconcile": {
        post: {
          operationId: "reconcile_bank_statement",
          summary: "Goi y doi chieu sao ke ngan hang",
          requestBody: jsonRequest,
          responses: { "200": { description: "Goi y doi chieu" } },
        },
      },
      "/ocr/accounting": {
        post: {
          operationId: "ocr_accounting_from_file",
          summary: "OCR va goi y dinh khoan tu file hoa don/chung tu",
          requestBody: ocrRequest,
          responses: { "200": { description: "Ket qua OCR va goi y dinh khoan" } },
        },
      },
    },
  });
}
