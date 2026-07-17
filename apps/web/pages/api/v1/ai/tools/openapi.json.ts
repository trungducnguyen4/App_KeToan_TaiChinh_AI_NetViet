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
          summary: "Lấy tổng hợp công nợ đến hạn và quá hạn",
          requestBody: jsonRequest,
          responses: { "200": { description: "Dữ liệu công nợ" } },
        },
      },
      "/cashflow/summary": {
        post: {
          operationId: "get_cashflow_summary",
          summary: "Lấy tổng hợp dòng tiền",
          requestBody: jsonRequest,
          responses: { "200": { description: "Dữ liệu dòng tiền" } },
        },
      },
      "/vouchers/missing": {
        post: {
          operationId: "detect_missing_vouchers",
          summary: "Phát hiện hóa đơn/chứng từ thiếu liên kết hạch toán",
          requestBody: jsonRequest,
          responses: { "200": { description: "Danh sách chứng từ thiếu" } },
        },
      },
      "/vouchers/detail": {
        post: {
          operationId: "get_voucher_details",
          summary: "Lấy thông tin chứng từ theo số chứng từ",
          requestBody: jsonRequest,
          responses: { "200": { description: "Chi tiết chứng từ" } },
        },
      },
      "/expenses/by-category": {
        post: {
          operationId: "get_expense_by_category",
          summary: "Lấy chi phí theo tài khoản/khoản mục",
          requestBody: jsonRequest,
          responses: { "200": { description: "Dữ liệu chi phí theo khoản mục" } },
        },
      },
      "/bank/reconcile": {
        post: {
          operationId: "reconcile_bank_statement",
          summary: "Gợi ý đối chiếu sao kê ngân hàng",
          requestBody: jsonRequest,
          responses: { "200": { description: "Gợi ý đối chiếu" } },
        },
      },
      "/ocr/accounting": {
        post: {
          operationId: "ocr_accounting_from_file",
          summary: "OCR và gợi ý định khoản từ file hóa đơn/chứng từ",
          requestBody: ocrRequest,
          responses: { "200": { description: "Kết quả OCR và gợi ý định khoản" } },
        },
      },
    },
  });
}
