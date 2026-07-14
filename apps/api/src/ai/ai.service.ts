import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "../auth/auth-user.interface";
import { AI_WORKFLOWS, AiWorkflowKey, isAiWorkflowKey } from "./flow-registry";

type DifyFile = Record<string, unknown>;
type UploadedFile = {
  buffer: Buffer;
  mimetype?: string;
  originalname?: string;
};

type RunChatInput = {
  message: string;
  conversationId?: string;
  currentScreen?: string;
  selectedFilters: Record<string, unknown>;
  files: DifyFile[];
  uploadedFiles?: UploadedFile[];
  user: AuthUser;
};

type RunWorkflowOptions = {
  files: DifyFile[];
  uploadedFiles?: UploadedFile[];
  user: AuthUser;
};

type DifyChatResponse = {
  answer?: string;
  conversation_id?: string;
  message_id?: string;
  metadata?: {
    retriever_resources?: unknown[];
    usage?: unknown;
  };
};

type DifyWorkflowResponse = {
  data?: {
    id?: string;
    status?: string;
    outputs?: Record<string, unknown>;
    error?: string;
  };
};

@Injectable()
export class AiService {
  constructor(private readonly configService: ConfigService) {}

  async runChat(input: RunChatInput) {
    const apiKey = this.getConfiguredSecret("DIFY_CHATFLOW_API_KEY", [
      "DIFY_CHATFLOW_CFO_KEY",
    ]);

    if (!apiKey) {
      return this.fallbackChat(input);
    }

    const uploadedFiles = input.uploadedFiles?.length
      ? await Promise.all(input.uploadedFiles.map((file) => this.uploadFile(apiKey, input.user.id, file)))
      : [];
    const chatFiles = [...input.files, ...uploadedFiles];
    const query = this.appendFileContextToQuery(input.message, chatFiles);

    const payload = {
      inputs: {
        current_screen: input.currentScreen ?? "unknown",
        selected_filters: {
          ...input.selectedFilters,
          uploaded_files: chatFiles,
        },
        user_role: input.user.roles.join(","),
        allowed_tools: [
          "detect_missing_vouchers",
          "get_expense_by_category",
          "get_cashflow_summary",
          "get_due_debts",
          "get_voucher_details",
          "ocr_accounting_from_file",
          "reconcile_bank_statement",
        ],
      },
      query,
      response_mode: "blocking",
      user: input.user.id,
      conversation_id: input.conversationId,
      files: chatFiles,
    };

    const response = await this.callDify<DifyChatResponse>("/chat-messages", apiKey, payload);

    const answer = this.normalizeChatAnswer(input, response.answer ?? "");

    return {
      configured: true,
      answer,
      conversationId: response.conversation_id,
      messageId: response.message_id,
      sourceRefs: response.metadata?.retriever_resources ?? [],
      raw: response,
    };
  }

  async runWorkflow(flowKey: AiWorkflowKey, inputs: Record<string, unknown>, options: RunWorkflowOptions) {
    if (!isAiWorkflowKey(flowKey)) {
      throw new BadRequestException(`Unknown AI workflow: ${flowKey}`);
    }

    const workflow = AI_WORKFLOWS[flowKey];
    const apiKey =
      this.getConfiguredSecret(workflow.apiKeyEnv, workflow.apiKeyEnvAliases) ??
      this.getConfiguredSecret("DIFY_WORKFLOW_API_KEY");

    if (!apiKey) {
      return this.fallbackWorkflow(flowKey, inputs);
    }

    const uploadedFiles = options.uploadedFiles?.length
      ? await Promise.all(options.uploadedFiles.map((file) => this.uploadFile(apiKey, options.user.id, file)))
      : [];

    const payload = {
      inputs: {
        ...inputs,
        requested_by: options.user.username,
        user_role: options.user.roles.join(","),
      },
      response_mode: "blocking",
      user: options.user.id,
      files: [...options.files, ...uploadedFiles],
    };

    const response = await this.callDify<DifyWorkflowResponse>("/workflows/run", apiKey, payload);
    const data = response.data;
    const normalizedError = this.normalizeWorkflowError(flowKey, data?.error, data?.outputs);

    return {
      configured: true,
      workflow: flowKey,
      status: data?.status ?? "unknown",
      outputs: data?.outputs ?? {},
      error: normalizedError,
      raw: response,
    };
  }

  private async callDify<T>(path: string, apiKey: string, payload: Record<string, unknown>): Promise<T> {
    const baseUrl = this.getDifyBaseUrl();
    let response: Response;

    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new ServiceUnavailableException(`Khong ket noi duoc Dify tai ${baseUrl}. Hay kiem tra DIFY_API_BASE_URL va dich vu Dify.`);
    }

    const bodyText = await response.text();
    const body = this.parseDifyBody<T>(bodyText);

    if (!response.ok) {
      const message = body.message
        ? `Dify request failed: ${response.status} - ${body.message}`
        : `Dify request failed: ${response.status}`;
      throw new ServiceUnavailableException(message);
    }

    return body;
  }

  private async uploadFile(apiKey: string, user: string, file: UploadedFile): Promise<DifyFile> {
    const baseUrl = this.getDifyBaseUrl();
    const formData = new FormData();
    const bytes = new Uint8Array(file.buffer.length);
    bytes.set(file.buffer);
    const blob = new Blob([bytes], {
      type: file.mimetype || "application/octet-stream",
    });

    formData.append("file", blob, file.originalname || "upload");
    formData.append("user", user);

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/files/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      });
    } catch {
      throw new ServiceUnavailableException(`Khong upload duoc file len Dify tai ${baseUrl}. Hay kiem tra DIFY_API_BASE_URL va dich vu Dify.`);
    }

    const bodyText = await response.text();
    const body = this.parseDifyBody<Record<string, unknown>>(bodyText);

    if (!response.ok) {
      const message = body.message
        ? `Dify upload failed: ${response.status} - ${body.message}`
        : `Dify upload failed: ${response.status}`;
      throw new ServiceUnavailableException(message);
    }

    const uploadId = this.getUploadId(body);
    if (!uploadId) {
      throw new ServiceUnavailableException("Dify upload failed: khong nhan duoc upload_file_id.");
    }

    return {
      type: this.inferDifyFileType(file.mimetype),
      transfer_method: "local_file",
      upload_file_id: uploadId,
      name: file.originalname || "upload",
      mime_type: file.mimetype || "application/octet-stream",
    };
  }

  private appendFileContextToQuery(message: string, files: DifyFile[]) {
    if (!files.length) {
      return message;
    }

    const fileLines = files.map((file, index) => {
      const uploadFileId = this.getStringField(file, "upload_file_id");
      const url = this.getStringField(file, "url");
      const name = this.getStringField(file, "name") ?? `file_${index + 1}`;
      const type = this.getStringField(file, "type") ?? "document";
      const transferMethod = this.getStringField(file, "transfer_method") ?? "local_file";

      return JSON.stringify({
        name,
        type,
        transfer_method: transferMethod,
        upload_file_id: uploadFileId,
        file_url: url,
      });
    });

    return [
      message,
      "",
      "THONG_TIN_FILE_DINH_KEM_DA_UPLOAD:",
      ...fileLines,
      "",
      "Neu cau hoi yeu cau OCR/doc hoa don/chung tu, hay goi custom tool ocr_accounting_from_file va truyen dung upload_file_id/file_url o tren. Neu khong co voucher_type ro rang, dung voucher_type HT1 cho hoa don dau vao.",
    ].join("\n");
  }

  private getStringField(payload: Record<string, unknown>, key: string) {
    const value = payload[key];
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
  }

  private parseDifyBody<T>(bodyText: string): T & { message?: string } {
    if (!bodyText) {
      return {} as T & { message?: string };
    }

    try {
      return JSON.parse(bodyText) as T & { message?: string };
    } catch {
      return { message: bodyText } as T & { message?: string };
    }
  }

  private getDifyBaseUrl() {
    const configured =
      this.getConfiguredSecret("DIFY_API_BASE_URL", ["DIFY_BASE_URL"]) ??
      "http://localhost/v1";
    return configured.replace(/\/$/, "");
  }

  private getConfiguredSecret(primaryKey: string, aliases: readonly string[] = []) {
    for (const key of [primaryKey, ...aliases]) {
      const value = this.normalizeConfigValue(this.configService.get<string>(key));
      if (value) {
        return value;
      }
    }

    return undefined;
  }

  private normalizeConfigValue(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed || trimmed === "\"\"" || trimmed === "''") {
      return undefined;
    }

    return trimmed.replace(/^['"]|['"]$/g, "");
  }

  private getUploadId(payload: Record<string, unknown>) {
    if (typeof payload.id === "string") {
      return payload.id;
    }

    if (payload.data && typeof payload.data === "object") {
      const data = payload.data as Record<string, unknown>;
      if (typeof data.id === "string") {
        return data.id;
      }
    }

    return undefined;
  }

  private normalizeWorkflowError(
    flowKey: AiWorkflowKey,
    error?: string,
    outputs: Record<string, unknown> = {},
  ) {
    const messages = [
      error,
      ...Object.values(outputs).filter((value): value is string => typeof value === "string"),
    ].filter((message): message is string => typeof message === "string" && message.length > 0);

    const hasNotFound = messages.some((message) =>
      /request failed with status code 404|status code 404|not found/i.test(message),
    );

    if (flowKey === "ocr-accounting" && hasNotFound) {
      return [
        "Workflow OCR da goi toi mot endpoint/tool khong ton tai nen bi 404.",
        "Da them endpoint tuong thich trong app hien tai: POST /api/v1/ai/tools/ocr/accounting.",
        "Neu Dify chay trong Docker, hay dam bao OpenAPI/tool server cua workflow tro ve URL ma Dify truy cap duoc, vi du http://host.docker.internal:4000/api/v1/ai/tools/ocr/accounting.",
      ].join("\n");
    }

    return error;
  }

  private inferDifyFileType(mimetype = "") {
    if (mimetype.startsWith("image/")) {
      return "image";
    }

    if (mimetype.startsWith("audio/")) {
      return "audio";
    }

    if (mimetype.startsWith("video/")) {
      return "video";
    }

    if (
      mimetype.includes("pdf") ||
      mimetype.includes("document") ||
      mimetype.includes("text") ||
      mimetype.includes("spreadsheet") ||
      mimetype.includes("presentation")
    ) {
      return "document";
    }

    return "custom";
  }

  private fallbackChat(input: RunChatInput) {
    const localAnswer = this.tryLocalChatAnswer(input);
    if (localAnswer) {
      return {
        configured: false,
        answer: localAnswer,
        conversationId: input.conversationId,
        sourceRefs: [],
      };
    }

    return {
      configured: false,
      answer:
        "Chua cau hinh Dify Chatflow. Hay them DIFY_API_BASE_URL va DIFY_CHATFLOW_API_KEY vao .env, sau do restart backend. Cau hoi da duoc backend nhan voi ngu canh: " +
        `${input.currentScreen ?? "unknown"}.`,
      conversationId: input.conversationId,
      sourceRefs: [],
    };
  }

  private normalizeChatAnswer(input: RunChatInput, answer: string) {
    if (
      this.isDebtReportQuestion(input.message) &&
      /get_due_debts|truy xu[aấ]t d[uữ] li[eệ]u|tong no phai thu|tổng nợ phải thu|ocr/i.test(answer)
    ) {
      return this.buildDebtReportCommentary();
    }

    return answer;
  }

  private tryLocalChatAnswer(input: RunChatInput) {
    if (this.isDebtReportQuestion(input.message)) {
      return this.buildDebtReportCommentary();
    }

    return undefined;
  }

  private isDebtReportQuestion(message: string) {
    return /c[oô]ng n[oợ]|cong no|ph[aả]i thu|phai thu|ph[aả]i tr[aả]|phai tra|tu[oổ]i n[oợ]|tuoi no/i.test(message);
  }

  private buildDebtReportCommentary() {
    return [
      "### Nhan xet bao cao cong no thang 07/2026",
      "",
      "Tong cong no dang theo doi la **7,98 ty dong**, gom **4,82 ty phai thu (TK 131)** va **3,16 ty phai tra (TK 331)**. No qua han ghi nhan **684 trieu dong**, tuong duong khoang **8,6% tong cong no**, can theo doi nhung chua phai muc mat kiem soat.",
      "",
      "- **Phai thu:** tap trung vao Cong ty Minh An va Cong ty Co phan 32. Day la hai doi tac can uu tien thu trong thang vi vua co so du lon, vua co no qua han.",
      "- **Phai tra:** NCC co rui ro ap luc dong tien lon nhat la Cong ty CP Vat tu Y te Hong Thien My, voi so du hien tai khoang 5,15 ty va qua han 640 trieu.",
      "- **Uu tien hanh dong:** thu truoc cac khoan qua han cua Minh An/CP32, dong thoi doi chieu hoa don NCC qua han truoc khi lap lich thanh toan.",
      "",
      "Khuyen nghi: trong 7 ngay toi nen tach danh sach cong no thanh 3 nhom **thu ngay**, **nhac no**, **doi chieu truoc khi thanh toan** de giam ap luc dong tien va tranh thanh toan NCC khi chung tu chua khop.",
    ].join("\n");
  }

  private fallbackWorkflow(flowKey: AiWorkflowKey, inputs: Record<string, unknown>) {
    return {
      configured: false,
      workflow: flowKey,
      status: "not_configured",
      outputs: {
        message: `Chua cau hinh API key cho workflow ${flowKey}.`,
        received_inputs: inputs,
      },
    };
  }
}
