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
      counterparty_name: "Cong ty Minh An",
      current_amount: 1_515_604_553,
      overdue_amount: 180_000_000,
      priority: "Cao",
      recommendation: "Lien he thu ngay",
    },
    {
      counterparty_code: "KH-CP32",
      counterparty_name: "Cong ty Co phan 32",
      current_amount: 1_020_000_000,
      overdue_amount: 95_000_000,
      priority: "Cao",
      recommendation: "Gui nhac no",
    },
    {
      counterparty_code: "KH-DCL",
      counterparty_name: "Cong ty CP Duoc pham Cuu Long",
      current_amount: 390_804_296,
      overdue_amount: 62_000_000,
      priority: "Trung binh",
      recommendation: "Doi chieu lich thanh toan",
    },
  ],
  payables: [
    {
      counterparty_code: "NCC-TTP",
      counterparty_name: "Cong ty CP Vat tu Y te Hong Thien My",
      current_amount: 5_146_668_000,
      overdue_amount: 640_000_000,
      priority: "Cao",
      recommendation: "Uu tien doi chieu va lap ke hoach thanh toan",
    },
    {
      counterparty_code: "NCC-VFC",
      counterparty_name: "Cong ty CP Khu trung Viet Nam - CN HCM",
      current_amount: 1_083_003_896,
      overdue_amount: 120_000_000,
      priority: "Cao",
      recommendation: "Xac nhan cong no qua han",
    },
    {
      counterparty_code: "NCC-HV",
      counterparty_name: "Hong Van",
      current_amount: 472_500_000,
      overdue_amount: 78_000_000,
      priority: "Trung binh",
      recommendation: "Len lich thanh toan",
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
      category_name: "Chi phi quan ly doanh nghiep",
      actual_amount: 860_000_000,
      budget_amount: 780_000_000,
      variance_amount: 80_000_000,
      variance_ratio: 0.1026,
      recommendation: "Kiem tra chi phi hanh chinh va phe duyet cac khoan phat sinh lon.",
    },
  ],
  categories: [
    { category_code: "621", category_name: "Nguyen vat lieu truc tiep", amount: 2_860_000_000 },
    { category_code: "622", category_name: "Nhan cong truc tiep", amount: 1_240_000_000 },
    { category_code: "627", category_name: "San xuat chung", amount: 980_000_000 },
    { category_code: "641", category_name: "Chi phi ban hang", amount: 240_000_000 },
    { category_code: "642", category_name: "Chi phi quan ly doanh nghiep", amount: 860_000_000 },
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
      issue: "Hoa don dau vao chua co chung tu hach toan",
      amount: 56_000_000,
      recommendation: "Kiem tra man HDDT dau vao va tao chung tu mua hang neu hop le.",
    },
    {
      source: "Bank statement",
      reference_no: "VCB-20260714-009",
      issue: "Giao dich ngan hang chua doi chieu BN/BC",
      amount: 118_000_000,
      recommendation: "Chay doi chieu sao ke hoac tao BN tam.",
    },
    {
      source: "WORKIT",
      reference_no: "SO-2607021",
      issue: "Don hang da giao nhung chua thay but toan doanh thu",
      amount: 760_000_000,
      recommendation: "Doi chieu phan he ban hang va nhat ky chung.",
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
          summary: "Lay tong hop cong no den han va qua han",
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
          responses: { "200": { description: "Du lieu cong no" } },
        },
      },
      "/cashflow/summary": {
        post: {
          operationId: "get_cashflow_summary",
          summary: "Lay tong hop dong tien",
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
          responses: { "200": { description: "Du lieu dong tien" } },
        },
      },
      "/vouchers/missing": {
        post: {
          operationId: "detect_missing_vouchers",
          summary: "Phat hien hoa don/chung tu thieu lien ket hach toan",
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
          responses: { "200": { description: "Danh sach chung tu thieu" } },
        },
      },
      "/vouchers/detail": {
        post: {
          operationId: "get_voucher_details",
          summary: "Lay thong tin chung tu theo so chung tu",
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
          responses: { "200": { description: "Chi tiet chung tu" } },
        },
      },
      "/expenses/by-category": {
        post: {
          operationId: "get_expense_by_category",
          summary: "Lay chi phi theo tai khoan/khoan muc",
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
          responses: { "200": { description: "Du lieu chi phi theo khoan muc" } },
        },
      },
      "/bank/reconcile": {
        post: {
          operationId: "reconcile_bank_statement",
          summary: "Goi y doi chieu sao ke ngan hang",
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
          responses: { "200": { description: "Goi y doi chieu" } },
        },
      },
      "/ocr/accounting": {
        post: {
          operationId: "ocr_accounting_from_file",
          summary: "OCR va goi y dinh khoan tu file hoa don/chung tu",
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
              description: "Ket qua OCR va goi y dinh khoan",
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
        description: "Thu cong no khach hang",
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
          "Custom tool OCR chua nhan duoc upload_file_id, file_url, files hoac data_json de gui sang workflow ocr-accounting.",
        expected_input: {
          voucher_type: voucherType,
          upload_file_id: "Dify upload file id",
          file_url: "URL file neu dung remote_url",
          data_json: "Du lieu JSON neu muon gui len workflow duoi dang file .json",
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
        "Hay nhan xet truc tiep tren cac so lieu nay, khong hoi lai nguoi dung nhap tong no hoac top doi tac.",
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
