import { Body, Controller, Get, Post } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "../auth/auth-user.interface";
import { Public } from "../auth/public.decorator";
import { AppRole } from "../auth/roles.constant";
import { AiService } from "./ai.service";

type OcrAccountingToolBody = {
  data?: unknown;
  data_json?: unknown;
  document_data?: unknown;
  document_json?: unknown;
  file?: unknown;
  files?: unknown[];
  file_url?: string;
  file_type?: string;
  upload_file_id?: string;
  user?: string;
  voucher_type?: string;
  requested_by?: string;
};

type WorkflowDifyFile = Record<string, unknown>;

type ReportToolBody = {
  period?: string;
  month?: string;
  account_code?: string;
  bank_account_code?: string;
  category_code?: string;
  check_type?: string;
  debt_type?: string;
  file_url?: string;
  partner_name?: string;
  voucher_code?: string;
  voucher_no?: string;
  statement_line_id?: string;
  requested_by?: string;
};

const debtSummary = {
  period: "2026-07",
  receivable_total: 4_820_000_000,
  payable_total: 3_160_000_000,
  overdue_total: 684_000_000,
  due_next_7_days: 1_050_000_000,
  receivables: [
    {
      counterparty_code: "KH-MINH-AN",
      counterparty_name: "Công ty Minh An",
      current_amount: 1_515_604_553,
      overdue_amount: 180_000_000,
      priority: "Cao",
      recommendation: "Liên hệ thu ngay",
    },
    {
      counterparty_code: "KH-CP32",
      counterparty_name: "Công ty Cổ phần 32",
      current_amount: 1_020_000_000,
      overdue_amount: 95_000_000,
      priority: "Cao",
      recommendation: "Gửi nhắc nợ",
    },
    {
      counterparty_code: "KH-DCL",
      counterparty_name: "Công ty CP Dược phẩm Cửu Long",
      current_amount: 390_804_296,
      overdue_amount: 62_000_000,
      priority: "Trung bình",
      recommendation: "Đối chiếu lịch thanh toán",
    },
  ],
  payables: [
    {
      counterparty_code: "NCC-TTP",
      counterparty_name: "Công ty CP Vật tư Y tế Hồng Thiên Mỹ",
      current_amount: 5_146_668_000,
      overdue_amount: 640_000_000,
      priority: "Cao",
      recommendation: "Ưu tiên đối chiếu và lập kế hoạch thanh toán",
    },
    {
      counterparty_code: "NCC-VFC",
      counterparty_name: "Công ty CP Khử trùng Việt Nam - CN HCM",
      current_amount: 1_083_003_896,
      overdue_amount: 120_000_000,
      priority: "Cao",
      recommendation: "Xác nhận công nợ quá hạn",
    },
    {
      counterparty_code: "NCC-HV",
      counterparty_name: "Hồng Vân",
      current_amount: 472_500_000,
      overdue_amount: 78_000_000,
      priority: "Trung bình",
      recommendation: "Lên lịch thanh toán",
    },
  ],
};

const cashflowSummary = {
  period: "2026-07",
  cash_in: 8_540_000_000,
  cash_out: 6_040_000_000,
  net_cashflow: 2_500_000_000,
  closing_balance: 82_641_000_000,
  forecast_shortage_alerts: 0,
};

const expenseSummary = {
  period: "2026-07",
  total_expense: 6_180_000_000,
  budget_overrun_alerts: [
    {
      category_code: "642",
      category_name: "Chi phí quản lý doanh nghiệp",
      actual_amount: 860_000_000,
      budget_amount: 780_000_000,
      variance_amount: 80_000_000,
      variance_ratio: 0.1026,
      recommendation: "Kiểm tra chi phí hành chính và phê duyệt các khoản phát sinh lớn.",
    },
  ],
  categories: [
    { category_code: "621", category_name: "Nguyên vật liệu trực tiếp", amount: 2_860_000_000 },
    { category_code: "622", category_name: "Nhân công trực tiếp", amount: 1_240_000_000 },
    { category_code: "627", category_name: "Sản xuất chung", amount: 980_000_000 },
    { category_code: "641", category_name: "Chi phí bán hàng", amount: 240_000_000 },
    { category_code: "642", category_name: "Chi phí quản lý doanh nghiệp", amount: 860_000_000 },
  ],
};

const missingVoucherSummary = {
  period: "2026-07",
  missing_count: 3,
  duplicate_risk_count: 1,
  items: [
    {
      source: "HDDT",
      reference_no: "HD-26070122",
      issue: "Hóa đơn đầu vào chưa có chứng từ hạch toán",
      amount: 56_000_000,
      recommendation: "Kiểm tra màn HĐĐT đầu vào và tạo chứng từ mua hàng nếu hợp lệ.",
    },
    {
      source: "Bank statement",
      reference_no: "VCB-20260714-009",
      issue: "Giao dịch ngân hàng chưa đối chiếu BN/BC",
      amount: 118_000_000,
      recommendation: "Chạy đối chiếu sao kê hoặc tạo BN tạm.",
    },
    {
      source: "WORKIT",
      reference_no: "SO-2607021",
      issue: "Đơn hàng đã giao nhưng chưa thấy bút toán doanh thu",
      amount: 760_000_000,
      recommendation: "Đối chiếu phân hệ bán hàng và nhật ký chung.",
    },
  ],
};

const TOOL_AI_USER: AuthUser = {
  id: "dify-custom-tool",
  organizationId: "demo-organization",
  username: "dify-tool",
  fullName: "Dify Custom Tool",
  roles: [AppRole.Director, AppRole.ChiefAccountant],
};

function buildOpenApiSpec(publicBaseUrl: string) {
  return {
    openapi: "3.0.0",
    info: {
      title: "NetViet Accounting AI Tools",
      version: "1.0.0",
    },
    servers: [{ url: `${publicBaseUrl}/api/v1/ai/tools` }],
    paths: {
      "/debts/due": {
        post: {
          operationId: "get_due_debts",
          summary: "Lấy tổng hợp công nợ đến hạn và quá hạn",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    period: { type: "string", example: "2026-07" },
                    month: { type: "string", example: "2026-07" },
                    account_code: { type: "string", example: "131" },
                    requested_by: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Dữ liệu công nợ" } },
        },
      },
      "/cashflow/summary": {
        post: {
          operationId: "get_cashflow_summary",
          summary: "Lấy tổng hợp dòng tiền",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    period: { type: "string", example: "2026-07" },
                    requested_by: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Dữ liệu dòng tiền" } },
        },
      },
      "/vouchers/missing": {
        post: {
          operationId: "detect_missing_vouchers",
          summary: "Phát hiện hóa đơn/chứng từ thiếu liên kết hạch toán",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    period: { type: "string", example: "2026-07" },
                    check_type: { type: "string", example: "invoice_to_voucher" },
                    requested_by: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Danh sách chứng từ thiếu" } },
        },
      },
      "/vouchers/detail": {
        post: {
          operationId: "get_voucher_details",
          summary: "Lấy thông tin chứng từ theo số chứng từ",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    voucher_code: { type: "string" },
                    voucher_no: { type: "string" },
                    requested_by: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Chi tiết chứng từ" } },
        },
      },
      "/expenses/by-category": {
        post: {
          operationId: "get_expense_by_category",
          summary: "Lấy chi phí theo tài khoản/khoản mục",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    category_code: { type: "string", example: "642" },
                    period: { type: "string", example: "2026-07" },
                    requested_by: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Dữ liệu chi phí theo khoản mục" } },
        },
      },
      "/bank/reconcile": {
        post: {
          operationId: "reconcile_bank_statement",
          summary: "Gợi ý đối chiếu sao kê ngân hàng",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    statement_line_id: { type: "string" },
                    requested_by: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { "200": { description: "Gợi ý đối chiếu" } },
        },
      },
      "/ocr/accounting": {
        post: {
          operationId: "ocr_accounting_from_file",
          summary: "OCR và gợi ý định khoản từ file hóa đơn/chứng từ",
          requestBody: {
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
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Kết quả OCR và gợi ý định khoản",
            },
          },
        },
      },
    },
  };
}

@Controller("v1/ai/tools")
@Public()
export class AiToolsController {
  constructor(
    private readonly configService: ConfigService,
    private readonly aiService: AiService,
  ) {}

  @Get("openapi.json")
  getOpenApiSpec() {
    const publicBaseUrl =
      this.configService.get<string>("AI_TOOLS_PUBLIC_BASE_URL")?.replace(/\/$/, "") ??
      "http://host.docker.internal:4000";

    return buildOpenApiSpec(publicBaseUrl);
  }

  @Post("debts/due")
  getDueDebts(@Body() body: ReportToolBody) {
    return this.buildDueDebtsResponse(body);
  }

  @Post("get_due_debts")
  getDueDebtsAlias(@Body() body: ReportToolBody) {
    return this.buildDueDebtsResponse(body);
  }

  @Post("cashflow/summary")
  getCashflowSummary(@Body() body: ReportToolBody) {
    return {
      ok: true,
      tool: "get_cashflow_summary",
      requested_period: body.period ?? body.month ?? cashflowSummary.period,
      summary: cashflowSummary,
    };
  }

  @Post("get_cashflow_summary")
  getCashflowSummaryAlias(@Body() body: ReportToolBody) {
    return this.getCashflowSummary(body);
  }

  @Post("vouchers/missing")
  detectMissingVouchers(@Body() body: ReportToolBody) {
    return {
      ok: true,
      tool: "detect_missing_vouchers",
      requested_period: body.period ?? body.month ?? missingVoucherSummary.period,
      check_type: body.check_type ?? "all",
      summary: missingVoucherSummary,
    };
  }

  @Post("detect_missing_vouchers")
  detectMissingVouchersAlias(@Body() body: ReportToolBody) {
    return this.detectMissingVouchers(body);
  }

  @Post("vouchers/detail")
  getVoucherDetails(@Body() body: ReportToolBody) {
    const voucherNo = body.voucher_code ?? body.voucher_no ?? "BC1-26070018";

    return {
      ok: true,
      tool: "get_voucher_details",
      voucher_no: voucherNo,
      voucher: {
        voucher_no: voucherNo,
        voucher_date: "2026-07-16",
        description: "Thu công nợ khách hàng",
        amount: 320_000_000,
        status: "posted",
        entries: [
          { debit_account: "1121", credit_account: "131", amount: 320_000_000 },
        ],
      },
    };
  }

  @Post("get_voucher_details")
  getVoucherDetailsAlias(@Body() body: ReportToolBody) {
    return this.getVoucherDetails(body);
  }

  @Post("expenses/by-category")
  getExpenseByCategory(@Body() body: ReportToolBody) {
    const categoryCode = body.category_code;
    const categories = categoryCode
      ? expenseSummary.categories.filter((item) => item.category_code === categoryCode)
      : expenseSummary.categories;

    return {
      ok: true,
      tool: "get_expense_by_category",
      requested_period: body.period ?? body.month ?? expenseSummary.period,
      category_code: categoryCode ?? null,
      total_expense: categories.reduce((total, item) => total + item.amount, 0),
      categories,
      budget_overrun_alerts: categoryCode
        ? expenseSummary.budget_overrun_alerts.filter((item) => item.category_code === categoryCode)
        : expenseSummary.budget_overrun_alerts,
    };
  }

  @Post("get_expense_by_category")
  getExpenseByCategoryAlias(@Body() body: ReportToolBody) {
    return this.getExpenseByCategory(body);
  }

  @Post("bank/reconcile")
  reconcileBankStatement(@Body() body: ReportToolBody) {
    return {
      ok: true,
      tool: "reconcile_bank_statement",
      statement_line_id: body.statement_line_id ?? null,
      suggested_matches: [
        {
          document_id: "cash-voucher-004",
          match_score: 0.92,
          matched_signals: ["amount", "date", "counterparty_hint"],
          risk_flags: [],
          reason: "So tien va ngay giao dich gan khop, dien giai co dau hieu lien quan KH32.",
        },
      ],
    };
  }

  @Post("reconcile_bank_statement")
  reconcileBankStatementAlias(@Body() body: ReportToolBody) {
    return this.reconcileBankStatement(body);
  }

  @Post("ocr/accounting")
  async runOcrAccounting(@Body() body: OcrAccountingToolBody) {
    const voucherType = normalizeVoucherType(body);
    const workflowFiles = collectDifyFiles(body);
    const jsonData = getOcrJsonData(body);
    const uploadedFiles = jsonData
      ? [
          {
            buffer: Buffer.from(JSON.stringify(jsonData, null, 2), "utf8"),
            mimetype: "application/json",
            originalname: `ocr-input-${voucherType.toLowerCase()}.json`,
          },
        ]
      : [];

    if (!workflowFiles.length && !uploadedFiles.length) {
      return {
        ok: false,
        tool: "ocr_accounting_from_file",
        status: "missing_file",
        message:
          "Custom tool OCR chưa nhận được upload_file_id, file_url, files hoặc data_json để gửi sang workflow ocr-accounting.",
        expected_input: {
          voucher_type: voucherType,
          upload_file_id: "Dify upload file id",
          file_url: "URL file nếu dùng remote_url",
          data_json: "Dữ liệu JSON nếu muốn gửi lên workflow dưới dạng file .json",
        },
      };
    }

    const workflowResponse = await this.aiService.runWorkflow(
      "ocr-accounting",
      {
        voucher_type: voucherType,
        source: "chatbot_custom_tool",
        requested_by: body.requested_by ?? body.user ?? "dify-chatbot",
      },
      {
        files: workflowFiles,
        uploadedFiles,
        user: {
          ...TOOL_AI_USER,
          username: body.requested_by ?? body.user ?? TOOL_AI_USER.username,
        },
      },
    );
    const workflowError = "error" in workflowResponse ? workflowResponse.error : undefined;
    const workflowRaw = "raw" in workflowResponse ? workflowResponse.raw : undefined;

    return {
      ok: !workflowError,
      tool: "ocr_accounting_from_file",
      status: workflowResponse.status,
      voucher_type: voucherType,
      input_summary: {
        workflow_file_count: workflowFiles.length,
        uploaded_json_file_count: uploadedFiles.length,
        has_file_url: Boolean(body.file_url),
        has_upload_file_id: Boolean(body.upload_file_id),
        requested_by: body.requested_by ?? body.user ?? null,
      },
      outputs: workflowResponse.outputs,
      error: workflowError,
      raw: workflowRaw,
    };
  }

  private buildDueDebtsResponse(body: ReportToolBody) {
    const requestedPeriod = body.period ?? body.month ?? debtSummary.period;
    const accountCode = body.account_code;
    const includeReceivables = !accountCode || accountCode === "131";
    const includePayables = !accountCode || accountCode === "331";

    return {
      ok: true,
      tool: "get_due_debts",
      requested_period: requestedPeriod,
      account_code: accountCode ?? null,
      summary: {
        period: requestedPeriod,
        receivable_total: debtSummary.receivable_total,
        payable_total: debtSummary.payable_total,
        overdue_total: debtSummary.overdue_total,
        overdue_ratio_on_total_debt: Number(
          (
            debtSummary.overdue_total /
            (debtSummary.receivable_total + debtSummary.payable_total)
          ).toFixed(4),
        ),
        due_next_7_days: debtSummary.due_next_7_days,
      },
      receivables: includeReceivables ? debtSummary.receivables : [],
      payables: includePayables ? debtSummary.payables : [],
      guidance:
        "Hãy nhận xét trực tiếp trên các số liệu này, không hỏi lại người dùng nhập tổng nợ hoặc top đối tác.",
    };
  }
}

function normalizeVoucherType(body: OcrAccountingToolBody) {
  const raw = String(body.voucher_type ?? body.file_type ?? "").trim().toUpperCase();
  const aliases: Record<string, string> = {
    BANK_CREDIT: "BC",
    BANK_DEBIT: "BN",
    CASH_PAYMENT: "PC",
    CASH_RECEIPT: "PT",
    E_INVOICE: "HT1",
    EINVOICE: "HT1",
    EXPENSE: "PC",
    INPUT_EINVOICE: "HT1",
    INPUT_INVOICE: "HT1",
    INVOICE: "HT1",
    OCR: "HT1",
    PAYMENT: "PC",
    PURCHASE_INVOICE: "HT1",
    RECEIPT: "PT",
    SALE_INVOICE: "HT2",
  };

  return aliases[raw] ?? (raw || "HT1");
}

function collectDifyFiles(body: OcrAccountingToolBody): WorkflowDifyFile[] {
  const candidates = [
    body.upload_file_id ? { upload_file_id: body.upload_file_id } : undefined,
    body.file_url ? { file_url: body.file_url } : undefined,
    body.file,
    ...(Array.isArray(body.files) ? body.files : []),
  ].filter(Boolean);

  return candidates
    .map((candidate) => toDifyWorkflowFile(candidate, body.file_type))
    .filter((file): file is WorkflowDifyFile => Boolean(file));
}

function toDifyWorkflowFile(candidate: unknown, fallbackType?: string): WorkflowDifyFile | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const data = candidate as Record<string, unknown>;
  const uploadFileId = firstString(data.upload_file_id, data.uploadFileId, data.id);
  const remoteUrl = firstString(data.file_url, data.url, data.remote_url, data.download_url);
  const fileType = inferWorkflowFileType(
    firstString(data.type, data.file_type, data.mime_type, data.mimetype, fallbackType),
  );

  if (uploadFileId) {
    return {
      type: fileType,
      transfer_method: "local_file",
      upload_file_id: uploadFileId,
    };
  }

  if (remoteUrl) {
    return {
      type: fileType,
      transfer_method: "remote_url",
      url: remoteUrl,
    };
  }

  return null;
}

function getOcrJsonData(body: OcrAccountingToolBody) {
  return body.data_json ?? body.document_json ?? body.document_data ?? body.data;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function inferWorkflowFileType(value?: string) {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("image") || ["png", "jpg", "jpeg", "webp"].includes(normalized)) {
    return "image";
  }

  if (
    normalized.includes("pdf") ||
    normalized.includes("document") ||
    normalized.includes("json") ||
    normalized.includes("text") ||
    normalized.includes("spreadsheet") ||
    ["doc", "docx", "xls", "xlsx", "csv"].includes(normalized)
  ) {
    return "document";
  }

  return "document";
}
