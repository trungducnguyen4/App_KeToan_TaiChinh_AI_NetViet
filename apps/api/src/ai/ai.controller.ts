import { Body, Controller, Param, Post, Req, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { AnyFilesInterceptor } from "@nestjs/platform-express";
import { IsArray, IsObject, IsOptional, IsString } from "class-validator";
import type { Request } from "express";
import type { AuthUser } from "../auth/auth-user.interface";
import { Public } from "../auth/public.decorator";
import { AppRole } from "../auth/roles.constant";
import { AiService } from "./ai.service";
import type { AiWorkflowKey } from "./flow-registry";

type AuthenticatedRequest = Request & {
  user?: AuthUser;
};

const DEMO_AI_USER: AuthUser = {
  id: "demo-ai-user",
  organizationId: "demo-organization",
  username: "demo-ai",
  fullName: "Demo AI User",
  roles: [AppRole.Director, AppRole.ChiefAccountant],
};

class AiChatDto {
  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  conversationId?: string;

  @IsOptional()
  @IsString()
  currentScreen?: string;

  @IsOptional()
  @IsObject()
  selectedFilters?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  files?: Array<Record<string, unknown>>;
}

class AiWorkflowDto {
  @IsOptional()
  @IsObject()
  inputs?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  files?: Array<Record<string, unknown>>;
}

type UploadedFile = {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
};

const uploadOptions = {
  limits: {
    fileSize: 25 * 1024 * 1024,
    files: 5,
  },
};

@Controller("ai")
@Public()
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("chat")
  chat(@Body() dto: AiChatDto, @Req() request: AuthenticatedRequest) {
    return this.aiService.runChat({
      message: dto.message,
      conversationId: dto.conversationId,
      currentScreen: dto.currentScreen,
      selectedFilters: dto.selectedFilters ?? {},
      files: dto.files ?? [],
      user: request.user ?? DEMO_AI_USER,
    });
  }

  @Post("chat/upload")
  @UseInterceptors(AnyFilesInterceptor(uploadOptions))
  async chatWithUpload(
    @Body()
    body: {
      message?: string;
      conversationId?: string;
      currentScreen?: string;
      selectedFilters?: string | Record<string, unknown>;
    },
    @UploadedFiles() files: UploadedFile[] = [],
    @Req() request: AuthenticatedRequest,
  ) {
    const selectedFilters = parseWorkflowInputs(body.selectedFilters);
    const message = body.message ?? "Hãy đọc file đính kèm và hỗ trợ kiểm tra chứng từ.";
    const user = request.user ?? DEMO_AI_USER;

    if (files.length > 0 && shouldRunOcrAccountingFromUpload(message, body.currentScreen, selectedFilters)) {
      const workflowResult = await this.aiService.runWorkflow(
        "ocr-accounting",
        {
          voucher_type: resolveVoucherType(message, body.currentScreen, selectedFilters),
          source: "ai_chat_upload",
        },
        {
          files: [],
          uploadedFiles: files,
          user,
        },
      );

      return toChatUploadWorkflowResponse(workflowResult, body.conversationId);
    }

    return this.aiService.runChat({
      message,
      conversationId: body.conversationId,
      currentScreen: body.currentScreen,
      selectedFilters,
      files: [],
      uploadedFiles: files,
      user,
    });
  }

  @Post("workflows/:flowKey")
  runWorkflow(
    @Param("flowKey") flowKey: AiWorkflowKey,
    @Body() dto: AiWorkflowDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.runWorkflow(flowKey, dto.inputs ?? {}, {
      files: dto.files ?? [],
      user: request.user ?? DEMO_AI_USER,
    });
  }

  @Post("workflows/:flowKey/upload")
  @UseInterceptors(AnyFilesInterceptor(uploadOptions))
  runWorkflowWithUpload(
    @Param("flowKey") flowKey: AiWorkflowKey,
    @Body() body: { inputs?: string | Record<string, unknown> },
    @UploadedFiles() files: UploadedFile[] = [],
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiService.runWorkflow(flowKey, parseWorkflowInputs(body.inputs), {
      files: [],
      uploadedFiles: files,
      user: request.user ?? DEMO_AI_USER,
    });
  }
}

function parseWorkflowInputs(inputs?: string | Record<string, unknown>) {
  if (!inputs) {
    return {};
  }

  if (typeof inputs === "object") {
    return inputs;
  }

  try {
    const parsed = JSON.parse(inputs) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function shouldRunOcrAccountingFromUpload(
  message: string,
  currentScreen: string | undefined,
  selectedFilters: Record<string, unknown>,
) {
  const text = normalizeText(
    [
      message,
      currentScreen,
      JSON.stringify(selectedFilters),
    ]
      .filter(Boolean)
      .join(" "),
  );

  return (
    !message.trim() ||
    /ocr|hoa don|invoice|einvoice|chung tu|dinh khoan|doc file|kiem tra file|kiem tra chung tu|input-einvoices/.test(
      text,
    )
  );
}

function resolveVoucherType(
  message: string,
  currentScreen: string | undefined,
  selectedFilters: Record<string, unknown>,
) {
  const explicitVoucherType = firstString(
    selectedFilters.voucher_type,
    selectedFilters.voucherType,
    selectedFilters.file_type,
    selectedFilters.fileType,
  );

  if (explicitVoucherType) {
    return normalizeVoucherType(explicitVoucherType);
  }

  const text = normalizeText([message, currentScreen].filter(Boolean).join(" "));

  if (/bank-debits|bao no|uy nhiem chi|unc/.test(text)) {
    return "BN";
  }

  if (/bank-credits|bao co|giay bao co/.test(text)) {
    return "BC";
  }

  if (/cash\/payments|phieu chi|chi tien/.test(text)) {
    return "PC";
  }

  if (/cash\/receipts|phieu thu|thu tien/.test(text)) {
    return "PT";
  }

  if (/hoa don dau ra|ban hang|sale|output invoice/.test(text)) {
    return "HT2";
  }

  return "HT1";
}

function normalizeVoucherType(value: string) {
  const normalized = normalizeText(value).toUpperCase();

  const aliases: Record<string, string> = {
    INPUT_INVOICE: "HT1",
    INVOICE: "HT1",
    PURCHASE_INVOICE: "HT1",
    HOA_DON_DAU_VAO: "HT1",
    HT1: "HT1",
    SALE_INVOICE: "HT2",
    OUTPUT_INVOICE: "HT2",
    HOA_DON_DAU_RA: "HT2",
    HT2: "HT2",
    BANK_DEBIT: "BN",
    BAO_NO: "BN",
    BN: "BN",
    BANK_CREDIT: "BC",
    BAO_CO: "BC",
    BC: "BC",
    CASH_PAYMENT: "PC",
    PHIEU_CHI: "PC",
    PC: "PC",
    CASH_RECEIPT: "PT",
    PHIEU_THU: "PT",
    PT: "PT",
  };

  return aliases[normalized.replace(/[\s-]+/g, "_")] ?? "HT1";
}

function toChatUploadWorkflowResponse(
  workflowResult: Awaited<ReturnType<AiService["runWorkflow"]>>,
  conversationId?: string,
) {
  const outputs =
    workflowResult && typeof workflowResult === "object" && "outputs" in workflowResult
      ? workflowResult.outputs
      : {};
  const error =
    workflowResult && typeof workflowResult === "object" && "error" in workflowResult
      ? workflowResult.error
      : undefined;
  const output = pickWorkflowOutput(outputs);

  return {
    configured:
      workflowResult && typeof workflowResult === "object" && "configured" in workflowResult
        ? workflowResult.configured
        : false,
    answer:
      typeof error === "string" && error.trim()
        ? error
        : output ?? "Workflow OCR đã xử lý file nhưng chưa trả về nội dung hiển thị.",
    conversationId,
    workflow:
      workflowResult && typeof workflowResult === "object" && "workflow" in workflowResult
        ? workflowResult.workflow
        : "ocr-accounting",
    status:
      workflowResult && typeof workflowResult === "object" && "status" in workflowResult
        ? workflowResult.status
        : "unknown",
    outputs,
    raw: workflowResult,
  };
}

function pickWorkflowOutput(outputs: Record<string, unknown>) {
  for (const key of ["output", "answer", "text", "result", "message"]) {
    const value = outputs[key];
    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (value && typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
  }

  if (Object.keys(outputs).length > 0) {
    return JSON.stringify(outputs, null, 2);
  }

  return undefined;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
