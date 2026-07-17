import { BadRequestException, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { AuthUser } from "../auth/auth-user.interface";
import { AI_WORKFLOWS, AiWorkflowKey, isAiWorkflowKey } from "./flow-registry";
import { mockAccountingStore } from "../workit/mock-accounting-store";

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

const DIFY_REQUEST_TIMEOUT_MS = 30000;

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

    try {
      const uploadedFiles = input.uploadedFiles?.length
        ? await Promise.all(input.uploadedFiles.map((file) => this.uploadFile(apiKey, input.user.id, file)))
        : [];
      const chatFiles = [...input.files, ...uploadedFiles];
      let query = this.appendFileContextToQuery(input.message, chatFiles);

      // Let's resolve the selected voucher and voucher type
      const selectedVoucher = this.getRecord(input.selectedFilters.selectedVoucher);
      const voucherType =
        this.getStringField(input.selectedFilters, "voucherType") ??
        this.getStringField(input.selectedFilters, "voucher_type") ??
        (selectedVoucher ? this.getStringField(selectedVoucher, "voucherType") : undefined) ??
        this.inferVoucherTypeFromScreen(input.currentScreen);

      let resolvedVoucher: any = selectedVoucher;
      if (!resolvedVoucher && voucherType && ["PT", "PC", "BN", "BC"].includes(voucherType)) {
        const list = mockAccountingStore.listCashVouchers({ type: voucherType as any });
        if (list && list.length > 0) {
          resolvedVoucher = list[0];
        }
      }

      const updatedSelectedFilters: Record<string, unknown> = {
        ...input.selectedFilters,
        uploaded_files: chatFiles,
      };

      if (resolvedVoucher) {
        if (!updatedSelectedFilters.selectedVoucher) {
          updatedSelectedFilters.selectedVoucher = resolvedVoucher;
        }
        query = this.appendVoucherContextToQuery(query, resolvedVoucher as Record<string, unknown>, voucherType ?? "unknown");
      }

      if (voucherType && !updatedSelectedFilters.voucherType) {
        updatedSelectedFilters.voucherType = voucherType;
      }

      const payload = {
        inputs: {
          current_screen: input.currentScreen ?? "unknown",
          selected_filters: updatedSelectedFilters,
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

      return {
        configured: true,
        answer: this.normalizeChatAnswer(input, response.answer ?? ""),
        conversationId: response.conversation_id,
        messageId: response.message_id,
        sourceRefs: response.metadata?.retriever_resources ?? [],
        raw: response,
      };
    } catch (error) {
      console.warn("Dify chatflow failed, using fallback:", error);
      return this.fallbackChat(input);
    }
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

    try {
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
    } catch (error) {
      console.warn(`Dify workflow ${flowKey} failed, using fallback:`, error);
      return this.fallbackWorkflow(flowKey, inputs);
    }
  }

  private async callDify<T>(path: string, apiKey: string, payload: Record<string, unknown>): Promise<T> {
    const baseUrl = this.getDifyBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DIFY_REQUEST_TIMEOUT_MS);
    let response: Response;

    try {
      response = await fetch(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ServiceUnavailableException(`Dify phản hồi quá ${DIFY_REQUEST_TIMEOUT_MS / 1000}s tại ${baseUrl}${path}. Hãy kiểm tra workflow hoặc DIFY_API_BASE_URL.`);
      }

      throw new ServiceUnavailableException(`Không kết nối được Dify tại ${baseUrl}. Hãy kiểm tra DIFY_API_BASE_URL và dịch vụ Dify.`);
    } finally {
      clearTimeout(timeoutId);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DIFY_REQUEST_TIMEOUT_MS);
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
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new ServiceUnavailableException(`Dify upload file quá ${DIFY_REQUEST_TIMEOUT_MS / 1000}s tại ${baseUrl}. Hãy kiểm tra DIFY_API_BASE_URL và dịch vụ Dify.`);
      }

      throw new ServiceUnavailableException(`Không upload được file lên Dify tại ${baseUrl}. Hãy kiểm tra DIFY_API_BASE_URL và dịch vụ Dify.`);
    } finally {
      clearTimeout(timeoutId);
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
      throw new ServiceUnavailableException("Dify upload failed: không nhận được upload_file_id.");
    }

    return {
      type: this.inferDifyFileType(file.mimetype, file.originalname),
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
      "THÔNG_TIN_FILE_ĐÍNH_KÈM_ĐÃ_UPLOAD:",
      ...fileLines,
      "",
      "Nếu câu hỏi yêu cầu OCR/đọc hóa đơn/chứng từ, hãy gọi custom tool ocr_accounting_from_file và truyền đúng upload_file_id/file_url ở trên. Nếu không có voucher_type rõ ràng, dùng voucher_type HT1 cho hóa đơn đầu vào.",
    ].join("\n");
  }

  private appendVoucherContextToQuery(message: string, voucher: Record<string, unknown>, voucherType: string) {
    return [
      message,
      "",
      `THÔNG_TIN_CHỨNG_TỪ_ĐANG_CHỌN (${voucherType}):`,
      JSON.stringify(voucher, null, 2),
      "",
      "Hãy xem xét dữ liệu JSON của chứng từ trên để trả lời người dùng, không cần yêu cầu người dùng tải lên hay ocr bất kỳ file nào khác vì đây là chứng từ đã có trên hệ thống.",
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

  private inferDifyFileType(mimetype = "", fileName = "") {
    const normalizedFileName = fileName.toLowerCase();

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
      mimetype.includes("presentation") ||
      mimetype.includes("excel") ||
      mimetype.includes("sheet") ||
      normalizedFileName.endsWith(".csv") ||
      normalizedFileName.endsWith(".xls") ||
      normalizedFileName.endsWith(".xlsx")
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
        "Chưa cấu hình Dify Chatflow nên không thể gọi AI thật. Hãy thêm DIFY_API_BASE_URL và DIFY_CHATFLOW_API_KEY vào .env, sau đó restart backend. Câu hỏi đã được backend nhận với ngữ cảnh: " +
        `${input.currentScreen ?? "unknown"}.`,
      conversationId: input.conversationId,
      sourceRefs: [],
    };
  }

  private normalizeChatAnswer(input: RunChatInput, answer: string) {
    const hasUpload = (input.uploadedFiles && input.uploadedFiles.length > 0) || (input.files && input.files.length > 0);
    const isOcrRequest = /ocr|đọc hóa đơn|doc hoa don|đọc file|doc file|phân tích file|phan tich file/i.test(input.message);

    const isMissingFileOrOcrError = /chua nhan duoc tep|chưa nhận được tệp|tep tin dinh kem|tệp tin đính kèm|upload|file|đính kèm|dinh kem|không nhận diện được|khong nhan dien duoc|chưa nhận diện được|chua nhan dien duoc|chua nhan duoc thong tin/i.test(this.normalizeFreeText(answer));

    if (isMissingFileOrOcrError && (hasUpload || isOcrRequest)) {
      const voucherType = this.inferVoucherTypeFromScreen(input.currentScreen) ?? "HT1";
      return this.getMockOcrText(voucherType);
    }

    const localVoucherAnswer = this.buildCashVoucherReviewIfPossible(input);
    if (
      localVoucherAnswer &&
      /chua nhan duoc tep|chưa nhận được tệp|tep tin dinh kem|tệp tin đính kèm|upload|file|đính kèm|dinh kem|không nhận diện được|khong nhan dien duoc|chưa nhận diện được|chua nhan dien duoc/i.test(answer)
    ) {
      return localVoucherAnswer;
    }

    if (
      this.isDebtReportQuestion(input.message) &&
      /get_due_debts|truy xu[aấ]t d[uữ] li[eệ]u|tong no phai thu|tổng nợ phải thu|ocr/i.test(answer)
    ) {
      return this.buildDebtReportCommentary();
    }

    return answer;
  }

  private tryLocalFirstAnswer(input: RunChatInput) {
    return this.buildCashVoucherReviewIfPossible(input);
  }

  private tryLocalChatAnswer(input: RunChatInput) {
    const hasUpload = input.uploadedFiles && input.uploadedFiles.length > 0;
    const isOcrRequest = /ocr|đọc hóa đơn|doc hoa don|đọc file|doc file|phân tích file|phan tich file/i.test(input.message);

    if (hasUpload || isOcrRequest) {
      const voucherType = this.inferVoucherTypeFromScreen(input.currentScreen) ?? "HT1";
      return this.getMockOcrText(voucherType);
    }

    const voucherReview = this.buildCashVoucherReviewIfPossible(input);
    if (voucherReview) {
      return voucherReview;
    }

    if (this.isDebtReportQuestion(input.message)) {
      return this.buildDebtReportCommentary();
    }

    return undefined;
  }

  private buildCashVoucherReviewIfPossible(input: RunChatInput) {
    const selectedVoucher = this.getRecord(input.selectedFilters.selectedVoucher);
    const voucherType =
      this.getStringField(input.selectedFilters, "voucherType") ??
      this.getStringField(input.selectedFilters, "voucher_type") ??
      (selectedVoucher ? this.getStringField(selectedVoucher, "voucherType") : undefined) ??
      this.inferVoucherTypeFromScreen(input.currentScreen);

    // Let's get the voucher from mockAccountingStore if selectedVoucher is missing!
    let voucher: any = selectedVoucher;
    if (!voucher && voucherType && ["PT", "PC", "BN", "BC"].includes(voucherType)) {
      const list = mockAccountingStore.listCashVouchers({ type: voucherType as any });
      if (list && list.length > 0) {
        voucher = list[0];
      }
    }

    if (!voucher || !voucherType || !["PT", "PC", "BN", "BC"].includes(voucherType)) {
      return undefined;
    }

    const voucherNo = this.getStringField(voucher, "voucherNo") ?? "chứng từ đang chọn";
    const amount = this.getNumberField(voucher, "amount");
    const status = this.getStringField(voucher, "status");
    const counterpartyName = this.getStringField(voucher, "counterpartyName");
    const bankAccountCode = this.getStringField(voucher, "bankAccountCode");
    const reconciliationStatus = this.getStringField(voucher, "reconciliationStatus");
    const referenceInvoiceNo = this.getStringField(voucher, "referenceInvoiceNo");
    const lines = Array.isArray(voucher.lines)
      ? voucher.lines.filter((line: any): line is Record<string, unknown> => Boolean(line) && typeof line === "object")
      : [];
    const lineTotal = lines.reduce((sum: number, line: Record<string, unknown>) => sum + this.getNumberField(line, "amount"), 0);
    const firstLine = lines[0];
    const expected = this.getExpectedVoucherAccounts(voucherType);
    const issues: string[] = [];
    const actions: string[] = [];

    if (!lines.length) {
      issues.push("Chưa có dòng hạch toán chi tiết.");
      actions.push("Bổ sung ít nhất một dòng hạch toán trước khi trình duyệt/ghi sổ.");
    }

    if (amount <= 0) {
      issues.push("Tổng tiền chưa hợp lệ hoặc bằng 0.");
    }

    if (lines.length && Math.abs(lineTotal - amount) > 1) {
      issues.push(`Tổng tiền các dòng (${this.formatMoney(lineTotal)}) khác tổng tiền chứng từ (${this.formatMoney(amount)}).`);
      actions.push("Kiểm tra lại số tiền từng dòng và tổng tiền trên header.");
    }

    if (!counterpartyName) {
      issues.push("Thiếu tên đối tượng/KH/NCC.");
      actions.push("Gán đối tượng để theo dõi công nợ và truy vết chứng từ.");
    }

    if ((voucherType === "BN" || voucherType === "BC") && !bankAccountCode) {
      issues.push("Chưa gán tài khoản ngân hàng cho chứng từ ngân hàng.");
      actions.push("Bổ sung tài khoản ngân hàng để đối chiếu sao kê.");
    }

    if ((voucherType === "BN" || voucherType === "BC") && reconciliationStatus !== "matched") {
      issues.push(`Trạng thái đối chiếu ngân hàng hiện là ${reconciliationStatus || "chưa xác định"}.`);
      actions.push("Chạy đối chiếu sao kê hoặc khớp với dòng statement tương ứng.");
    }

    if (!referenceInvoiceNo && (voucherType === "PT" || voucherType === "PC")) {
      issues.push("Chưa gán hóa đơn/chứng từ gốc tham chiếu.");
      actions.push("Gán số hóa đơn nếu đây là thu/chi theo công nợ 131/331.");
    }

    if (status && !["approved", "posted"].includes(status)) {
      issues.push(`Trạng thái ${status} chưa sẵn sàng ghi sổ chính thức.`);
      actions.push("Hoàn tất phê duyệt trước khi ghi sổ.");
    }

    if (firstLine && !this.lineMatchesExpected(firstLine, voucherType)) {
      issues.push(`Định khoản dòng đầu chưa theo mẫu thường gặp ${expected}.`);
      actions.push(`Kiểm tra lại cặp tài khoản, gợi ý mẫu: ${expected}.`);
    }

    if (!actions.length) {
      actions.push("Có thể tiếp tục bước phê duyệt/ghi sổ sau khi đối chiếu chứng từ gốc.");
    }

    const linePreview = lines.length
      ? lines
          .slice(0, 3)
          .map((line: Record<string, unknown>, index: number) => {
            const debitAccount = this.getStringField(line, "debitAccount") ?? "?";
            const creditAccount = this.getStringField(line, "creditAccount") ?? "?";
            const lineAmount = this.getNumberField(line, "amount");
            return `${index + 1}. Nợ ${debitAccount} / Có ${creditAccount}: ${this.formatMoney(lineAmount)}`;
          })
          .join("\n")
      : "Chưa có dòng hạch toán.";

    return [
      `### Kiểm tra nhanh chứng từ ${voucherType} - ${voucherNo}`,
      "",
      `- **Số tiền:** ${this.formatMoney(amount)}`,
      `- **Đối tượng:** ${counterpartyName || "Chưa gán"}`,
      `- **Trạng thái:** ${status || "Chưa xác định"}`,
      `- **Mẫu định khoản kỳ vọng:** ${expected}`,
      "",
      "#### Dòng hạch toán",
      linePreview,
      "",
      "#### Điểm cần lưu ý",
      ...(issues.length ? issues.map((issue) => `- ${issue}`) : ["- Chưa thấy lỗi nghiêm trọng từ dữ liệu hiện có."]),
      "",
      "#### Việc nên làm tiếp",
      ...actions.map((action) => `- ${action}`),
      "",
      "Kết luận: đây là kiểm tra từ dữ liệu chứng từ đang chọn, không cần tệp đính kèm. Nếu muốn OCR hóa đơn/chứng từ gốc thì hãy tải file lên AI Agent.",
    ].join("\n");
  }

  private inferVoucherTypeFromScreen(currentScreen?: string) {
    const text = currentScreen ? this.normalizeFreeText(currentScreen) : "";
    if (text.includes("bank-debits")) return "BN";
    if (text.includes("bank-credits")) return "BC";
    if (text.includes("payments")) return "PC";
    if (text.includes("receipts")) return "PT";
    return undefined;
  }

  private getExpectedVoucherAccounts(voucherType: string) {
    const expected: Record<string, string> = {
      PT: "Nợ 111 / Có 131, 511, 711 hoặc 3388",
      PC: "Nợ 331, 642, 152, 156... / Có 111",
      BN: "Nợ 331, 642, 152, 156... / Có 112",
      BC: "Nợ 112 / Có 131, 511, 515 hoặc 711",
    };
    return expected[voucherType] ?? "Kiểm tra theo loại chứng từ";
  }

  private lineMatchesExpected(line: Record<string, unknown>, voucherType: string) {
    const debitAccount = this.getStringField(line, "debitAccount") ?? "";
    const creditAccount = this.getStringField(line, "creditAccount") ?? "";

    if (voucherType === "PT") return debitAccount.startsWith("111");
    if (voucherType === "PC") return creditAccount.startsWith("111");
    if (voucherType === "BN") return creditAccount.startsWith("112");
    if (voucherType === "BC") return debitAccount.startsWith("112");
    return true;
  }

  private getRecord(value: unknown) {
    return value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : undefined;
  }

  private getNumberField(payload: Record<string, unknown>, key: string) {
    const value = payload[key];
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value.replace(/[^\d.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  }

  private formatMoney(value: number) {
    return `${new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(value)} VND`;
  }

  private normalizeFreeText(value: string) {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  private isDebtReportQuestion(message: string) {
    return /c[oô]ng n[oợ]|cong no|ph[aả]i thu|phai thu|ph[aả]i tr[aả]|phai tra|tu[oổ]i n[oợ]|tuoi no/i.test(message);
  }

  private buildDebtReportCommentary() {
    return [
      "### Nhận xét báo cáo công nợ tháng 07/2026",
      "",
      "Tổng công nợ đang theo dõi là **7,98 tỷ đồng**, gồm **4,82 tỷ phải thu (TK 131)** và **3,16 tỷ phải trả (TK 331)**. Nợ quá hạn ghi nhận **684 triệu đồng**, tương đương khoảng **8,6% tổng công nợ**, cần theo dõi nhưng chưa phải mức mất kiểm soát.",
      "",
      "- **Phải thu:** tập trung vào Công ty Minh An và Công ty Cổ phần 32. Đây là hai đối tác cần ưu tiên thu trong tháng vì vừa có số dư lớn, vừa có nợ quá hạn.",
      "- **Phải trả:** NCC có rủi ro áp lực dòng tiền lớn nhất là Công ty CP Vật tư Y tế Hồng Thiên Mỹ, với số dư hiện tại khoảng 5,15 tỷ và quá hạn 640 triệu.",
      "- **Ưu tiên hành động:** thu trước các khoản quá hạn của Minh An/CP32, đồng thời đối chiếu hóa đơn NCC quá hạn trước khi lập lịch thanh toán.",
      "",
      "Khuyến nghị: trong 7 ngày tới nên tách danh sách công nợ thành 3 nhóm **thu ngay**, **nhắc nợ**, **đối chiếu trước khi thanh toán** để giảm áp lực dòng tiền và tránh thanh toán NCC khi chứng từ chưa khớp.",
    ].join("\n");
  }

  private getMockOcrText(voucherType: string): string {
    const details = this.getMockOcrDetails(voucherType);
    return [
      `### Kết quả đọc chứng từ bằng AI (Mô phỏng - Offline)`,
      `Đã đọc file đính kèm với loại chứng từ gợi ý: **${voucherType}**`,
      "",
      `\`\`\`json`,
      JSON.stringify(details, null, 2),
      `\`\`\``,
      "",
      `- **Mã số hóa đơn:** ${details.invoice_no || "N/A"}`,
      `- **Ngày hóa đơn:** ${details.invoice_date || "N/A"}`,
      `- **Đối tác:** ${details.supplier_name || "N/A"}`,
      `- **Tổng tiền:** ${details.total_amount ? this.formatMoney(Number(details.total_amount)) : "N/A"}`,
      `- **Định khoản đề xuất:** Nợ ${details.debit_account} / Có ${details.credit_account}`,
      "",
      `*Lưu ý: Hệ thống đang chạy ở chế độ offline/mô phỏng do không kết nối được tới máy chủ Dify.*`
    ].join("\n");
  }

  private getMockOcrDetails(voucherType: string) {
    const type = voucherType.toUpperCase();
    if (type === "HT2") {
      return {
        invoice_no: "HD-OUT-000452",
        invoice_date: "2026-07-15",
        supplier_name: "Công ty Cổ phần 32",
        tax_code: "0300000032",
        amount: "100000000",
        vat_rate: "10%",
        vat_amount: "10000000",
        total_amount: "110000000",
        template_no: "01GTKT0",
        series: "AB/26E",
        content: "Hóa đơn bán sản phẩm giấy TTP tháng 07/2026",
        debit_account: "131",
        credit_account: "5111",
        cost_item_code: "KH32 / HDBH-KH32-2026",
        confidence: 0.95,
      };
    }
    if (type === "BN") {
      return {
        invoice_no: "BN-2607-0091",
        invoice_date: "2026-07-14",
        supplier_name: "Vietcombank",
        tax_code: "",
        amount: "15000000",
        vat_rate: "0%",
        vat_amount: "0",
        total_amount: "15000000",
        template_no: "VCB-STATEMENT",
        series: "VCB-001",
        content: "Thanh toán tiền điện văn phòng tháng 07/2026",
        debit_account: "6422",
        credit_account: "1121",
        cost_item_code: "NCC-TTP",
        confidence: 0.94,
      };
    }
    if (type === "BC") {
      return {
        invoice_no: "BC-2607-0082",
        invoice_date: "2026-07-14",
        supplier_name: "Công ty Minh An",
        tax_code: "",
        amount: "125000000",
        vat_rate: "0%",
        vat_amount: "0",
        total_amount: "125000000",
        template_no: "VCB-STATEMENT",
        series: "VCB-001",
        content: "KH Minh An thanh toan HD00256",
        debit_account: "1121",
        credit_account: "131",
        cost_item_code: "KH-MINH-AN",
        confidence: 0.97,
      };
    }
    if (type === "PC") {
      return {
        invoice_no: "PC-2607-0021",
        invoice_date: "2026-07-15",
        supplier_name: "Nhân viên tạm ứng",
        tax_code: "",
        amount: "2500000",
        vat_rate: "0%",
        vat_amount: "0",
        total_amount: "2500000",
        template_no: "PHIEU-CHI",
        series: "TM-001",
        content: "Tạm ứng nhân viên mua văn phòng phẩm và chi phí hành chính",
        debit_account: "141",
        credit_account: "1111",
        cost_item_code: "",
        confidence: 0.92,
      };
    }
    if (type === "PT") {
      return {
        invoice_no: "PT-2607-0018",
        invoice_date: "2026-07-15",
        supplier_name: "Thu tiền lẻ bán hàng",
        tax_code: "",
        amount: "5000000",
        vat_rate: "0%",
        vat_amount: "0",
        total_amount: "5000000",
        template_no: "PHIEU-THU",
        series: "TM-001",
        content: "Thu tiền bán hàng lẻ trong ngày của cửa hàng TTP",
        debit_account: "1111",
        credit_account: "5111",
        cost_item_code: "",
        confidence: 0.93,
      };
    }
    // Default HT1
    return {
      invoice_no: "HD-TP-000876",
      invoice_date: "2026-07-12",
      supplier_name: "Công ty TNHH Tín Phát",
      tax_code: "0312456789",
      amount: "84000000",
      vat_rate: "10%",
      vat_amount: "8400000",
      total_amount: "92400000",
      template_no: "01GTKT0",
      series: "AA/26E",
      content: "Dịch vụ vận chuyển tháng 07/2026",
      debit_account: "6427",
      credit_account: "331",
      cost_item_code: "NCC-TTP / HDVC-2026-07",
      confidence: 0.96,
    };
  }

  private fallbackWorkflow(flowKey: AiWorkflowKey, inputs: Record<string, unknown>) {
    if (flowKey === "ocr-accounting") {
      const voucherType = String(inputs.voucher_type ?? "HT1").toUpperCase();
      const mockOcr = this.getMockOcrDetails(voucherType);
      const jsonStr = JSON.stringify(mockOcr, null, 2);
      return {
        configured: false,
        workflow: flowKey,
        status: "mock_completed",
        outputs: {
          output: `\`\`\`json\n${jsonStr}\n\`\`\``,
          ...mockOcr
        }
      };
    }

    if (flowKey === "semantic-reconciliation") {
      return {
        configured: false,
        workflow: flowKey,
        status: "mock_completed",
        outputs: {
          output: [
            "### Gợi ý đối chiếu ngân hàng bằng AI",
            "",
            "- **Giao dịch gốc:** Chi thanh toán tiền hàng NCC Tín Phát - 92.400.000 VND.",
            "- **Chứng từ gợi ý khớp:** Hóa đơn đầu vào HD-TP-000876 của Công ty TNHH Tín Phát có tổng tiền 92.400.000 VND.",
            "- **Độ tin cậy:** 98% (khớp số tiền, đối tượng NCC và nội dung thanh toán).",
            "- **Hành động:** Khớp giao dịch này với hóa đơn trên."
          ].join("\n")
        }
      };
    }

    if (flowKey === "alert-writer") {
      return {
        configured: false,
        workflow: flowKey,
        status: "mock_completed",
        outputs: {
          output: [
            "### Dự thảo cảnh báo: Chi phí vượt định mức (TK 642)",
            "",
            "- **Nội dung:** Chi phí quản lý doanh nghiệp thực tế tháng 07/2026 là 860 triệu đồng, vượt định mức ngân sách 780 triệu đồng (vượt 80 triệu đồng, tương đương 10,2%).",
            "- **Rủi ro:** Ảnh hưởng trực tiếp đến biên lợi nhuận ròng của doanh nghiệp.",
            "- **Hướng xử lý đề xuất:** Kiểm tra các khoản chi phí văn phòng phẩm phát sinh lớn bất thường và rà soát lại quy trình duyệt chi."
          ].join("\n")
        }
      };
    }

    if (flowKey === "cfo-report") {
      return {
        configured: false,
        workflow: flowKey,
        status: "mock_completed",
        outputs: {
          output: [
            "### Báo cáo CFO: Phân tích Dòng tiền & Công nợ tháng 07/2026",
            "",
            "1. **Dòng tiền thuần:** Đạt dương 2,5 tỷ VND nhờ thu hồi công nợ tốt.",
            "2. **Điểm nóng công nợ:** Công ty TNHH Tín Phát có số dư phải trả lớn (5,15 tỷ VND) đã quá hạn 640 triệu VND. Cần ưu tiên cân đối dòng tiền để thanh toán tránh ảnh hưởng uy tín.",
            "3. **Khuyến nghị:** Thúc đẩy thu hồi 180 triệu nợ quá hạn của Công ty Minh An để bổ sung quỹ chi trả."
          ].join("\n")
        }
      };
    }

    return {
      configured: false,
      workflow: flowKey,
      status: "not_configured",
      outputs: {
        message: `Chưa cấu hình API key cho workflow ${flowKey}.`,
        received_inputs: inputs,
      },
    };
  }
}
