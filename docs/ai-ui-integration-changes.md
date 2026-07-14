# Mo ta thay doi tich hop AI/Dify vao UI

Tai lieu nay ghi lai cac phan AI da duoc them vao giao dien, backend va cau hinh cua project `App_KeToan_TaiChinh_AI_NetViet`.

## 1. Muc tieu tich hop

Muc tieu la dua Dify vao ung dung theo mo hinh:

```text
Frontend UI -> NestJS API -> Dify API
```

Frontend khong goi truc tiep Dify. Tat ca yeu cau AI di qua backend de:

- Gan token dang nhap cua nguoi dung.
- Truyen ngu canh man hinh hien tai.
- Giu API key Dify trong server `.env`.
- Kiem soat loi va tra thong bao ro rang cho UI.

## 2. Cac diem AI da them vao UI

### 2.0 Bang tong hop duong dan UI co gan AI

| UI | Duong dan tren web | Thanh phan AI | Workflow/API | File source |
| --- | --- | --- | --- | --- |
| Floating AI Agent | Tat ca cac man hinh trong app | Chat AI noi tren goc man hinh | `POST /api/ai/chat` | `apps/web/components/ai-chat-widget.tsx` |
| Danh sach chung tu tien mat, ngan hang | `http://localhost:3000/modules/cash/receipts`, `http://localhost:3000/modules/cash/payments`, `http://localhost:3000/modules/cash/bank-debits`, `http://localhost:3000/modules/cash/bank-credits` | Nut `AI kiem tra` tren thanh tac vu, doc chung tu dang chon | `POST /api/ai/chat` | `apps/web/screens/cash-ledger-list-screen.tsx`, `apps/web/screens/bank-debit-list-screen.tsx`, `apps/web/screens/bank-credit-list-screen.tsx` |
| Quan ly HDDT dau vao | `http://localhost:3000/modules/accounting/input-einvoices` | Upload file va nut `Chay OCR AI` | `POST /api/ai/workflows/ocr-accounting/upload` | `apps/web/screens/input-einvoice-screen.tsx` |
| Doi chieu ngan hang | `http://localhost:3000/modules/cash/reconciliation` | Nut `AI doi chieu lech` | `POST /api/ai/workflows/semantic-reconciliation` | `apps/web/screens/reconciliation-screen.tsx` |
| Dashboard ke toan | `http://localhost:3000/modules/accounting` | Card `Canh bao can xem`, chi tiet canh bao va nut `AI soan van ban` | `POST /api/ai/workflows/alert-writer` | `apps/web/components/module-dashboard.tsx` |
| Bao cao & Dashboard | `http://localhost:3000/modules/reports` | Khu vuc `AI Agent` va nut `AI lap bao cao` | `POST /api/ai/workflows/cfo-report` | `apps/web/screens/reports-dashboard-screen.tsx` |

Luu y ve canh bao dashboard:

- Viec phat hien canh bao nhu no qua han, chi vuot dinh muc, dong tien am du bao, but toan lech nen do rule/logic nghiep vu cua backend thuc hien.
- Workflow Dify `alert-writer` chi dung de soan van ban, dien giai rui ro va goi y huong xu ly cho canh bao dang chon.

### 2.1 Floating AI Agent

File da sua:

- `apps/web/components/ai-chat-widget.tsx`
- `apps/web/lib/api.ts`

Thay doi:

- O chat AI khong con tra loi gia lap bang `setTimeout`.
- Khi nguoi dung gui cau hoi, UI goi API:

```text
POST /api/ai/chat
```

- Khi nguoi dung dinh kem file trong AI Agent, UI goi API multipart:

```text
POST /api/ai/chat/upload
```

Backend se upload file len Dify bang `/files/upload`. Neu file upload la hoa don/chung tu/OCR hoac nguoi dung dang o man `input-einvoices`, backend goi thang workflow `ocr-accounting` thay vi cho Chatflow tu suy luan custom tool. Cach nay tranh loi Agent tra loi "chua nhan duoc file dinh kem" khi Dify khong bind duoc `sys.files` / `userinput.files`.

Neu request upload file khong phai ngu canh OCR/chung tu, backend van gui sang Chatflow nhu cau hoi binh thuong.

Payload gui len backend gom:

- `message`: cau hoi cua nguoi dung.
- `conversationId`: id hoi thoai Dify neu co.
- `currentScreen`: route hien tai cua Next.js.
- `selectedFilters`: query/filter tren man hinh hien tai.

Ket qua:

- Neu Dify cau hinh dung, chatbot hien cau tra loi tu Dify Chatflow.
- Neu Dify chua cau hinh hoac khong ket noi duoc, UI hien thong bao loi ro tu backend thay vi `Failed to fetch`.

### 2.2 Nut AI kiem tra tren man danh sach chung tu

File da sua:

- `apps/web/screens/cash-ledger-list-screen.tsx`
- `apps/web/screens/bank-debit-list-screen.tsx`
- `apps/web/screens/bank-credit-list-screen.tsx`

Vi tri UI:

- `http://localhost:3000/modules/cash/receipts`
- `http://localhost:3000/modules/cash/payments`
- `http://localhost:3000/modules/cash/bank-debits`
- `http://localhost:3000/modules/cash/bank-credits`
- Khu vuc topbar `Danh sach chung tu`.

Da them nut:

```text
AI kiem tra
```

Nut nay goi:

```text
POST /api/ai/chat
```

Ngu canh gui sang AI gom:

- `voucherType`: PT, PC, BN, BC.
- `period`: ky loc hien tai.
- `query`: tu khoa tim kiem hien tai.
- `selectedVoucher`: chung tu dang chon, gom so chung tu, ngay, doi tuong, noi dung, so tien, trang thai va toi da 5 dong hach toan.

Muc dich:

- Kiem tra nhanh chung tu.
- Goi y dinh khoan.
- Nhac rui ro thue/kiem soat.
- Nhac thong tin con thieu.

Ket qua AI duoc hien trong khu vuc `Trang thai`, muc `AI Agent`.

Luu y: Nut nay chi kiem tra/giai thich/rui ro va goi y viec can lam tiep, khong tu dong ghi so va khong tu dong sua du lieu.

### 2.3 Nut AI lap bao cao tren man Bao cao & Dashboard

File da sua:

- `apps/web/screens/reports-dashboard-screen.tsx`
- `apps/web/styles/globals.css`

Vi tri UI:

- Man hinh `Bao cao & Dashboard`.
- Nam ngay ben duoi bo loc ky bao cao.

Da them khu vuc:

```text
AI Agent
San sang lap bao cao quan tri AI cho nhom dang xem.
```

Da them nut:

```text
AI lap bao cao
```

Nut nay goi workflow:

```text
POST /api/ai/workflows/cfo-report
```

Payload gui sang workflow gom:

- `report_type`: loai bao cao dang chon, gom `CASH_FLOW`, `RECEIVABLES_PAYABLES`, `PROFITABILITY`, `MANAGEMENT_FINANCE`.
- `financial_tables`: bang KPI va bang chi tiet cua nhom bao cao dang xem.
- `report_scope`: pham vi 4 nhom bao cao tu dong:
  - Bao cao dong tien: thu - chi thuc te va du bao ngan han tu cong no den han.
  - Bao cao cong no: tuoi no phai thu/phai tra, top khach no, canh bao qua han, de xuat uu tien thu.
  - Bao cao chi phi & loi nhuan: theo khoan muc 621/622/627/641/642, bien loi nhuan theo don hang/mat hang.
  - Bao cao tai chinh quan tri: can doi phat sinh, so du TK, so cai, doi chieu nguoc voi WORKIT.
- `delivery_channels`: kenh gui/nhan bao cao, hien tai gom `email` va `dashboard`.
- `schedule_modes`: che do chay `daily`, `weekly`, `monthly`, `on_demand`.
- `report_key`: nhom bao cao dang chon.
- `report_title`: ten bao cao.
- `period_label`: ky bao cao dang ap dung.
- `period_filter`: loai ky va gia tri ky.
- `kpis`: cac chi so KPI dang hien.
- `table_columns`: cot bang chi tiet.
- `table_rows`: toi da 10 dong du lieu dau tien.
- `source`: mo ta nguon du lieu cua bao cao.

Muc dich:

- Lap hoac dien giai bao cao quan tri AI cho nhom bao cao dang xem.
- Tom tat diem dang chu y.
- Ho tro nguoi dung doc dashboard nhanh hon.

### 2.4 OCR & goi y dinh khoan tren man Quan ly HDDT dau vao

File da sua:

- `apps/web/screens/input-einvoice-screen.tsx`
- `apps/web/lib/api.ts`
- `apps/web/lib/ai-workflows.ts`
- `apps/web/components/markdown-text.tsx`

Vi tri UI:

```text
http://localhost:3000/modules/accounting/input-einvoices
```

Da them:

- O chon file hoa don/chung tu.
- Nut `Chay OCR AI`.
- Vung hien ket qua AI co format Markdown.

Nut nay goi:

```text
POST /api/ai/workflows/ocr-accounting/upload
```

Payload gui len backend la `multipart/form-data`, gom:

- `file`: file anh/PDF/chung tu nguoi dung upload.
- `inputs`: JSON string, hien dang gui `voucher_type`.

Backend se upload file len Dify qua:

```text
/files/upload
```

Sau do chay workflow:

```text
/workflows/run
```

Muc dich:

- OCR noi dung hoa don/chung tu.
- Trich xuat thong tin chinh.
- Goi y dinh khoan ban dau.
- Tra ket qua cho ke toan xem lai, khong tu dong ghi so.

### 2.5 Doi chieu ngu nghia lech tren man Doi chieu ngan hang

File da sua:

- `apps/web/screens/reconciliation-screen.tsx`
- `apps/web/lib/ai-workflows.ts`
- `apps/web/components/markdown-text.tsx`

Vi tri UI:

```text
http://localhost:3000/modules/cash/reconciliation
```

Da them nut:

```text
AI doi chieu lech
```

Nut nay goi workflow:

```text
POST /api/ai/workflows/semantic-reconciliation
```

Payload gui sang workflow gom:

- `unmatched_transaction`: dong sao ke chua khop.
- `pending_documents`: danh sach chung tu BN/BC dang cho doi chieu.

Muc dich:

- So khop theo ngu nghia noi dung giao dich.
- Goi y chung tu co kha nang lien quan.
- Ho tro ke toan xu ly cac truong hop khong match duoc bang rule don gian.

### 2.6 Soan van ban canh bao tren Dashboard ke toan

File da sua:

- `apps/web/components/module-dashboard.tsx`
- `apps/web/components/icons.tsx`
- `apps/web/styles/globals.css`
- `apps/web/lib/ai-workflows.ts`
- `apps/web/components/markdown-text.tsx`

Vi tri UI:

```text
http://localhost:3000/modules/accounting
```

Da them card dashboard:

```text
Canh bao can xem
```

Khi bam vao card, UI mo phan chi tiet canh bao, gom cac nhom:

- Canh bao no qua han.
- Chi vuot dinh muc.
- Dong tien am du bao.
- But toan lech.

Trong chi tiet canh bao co nut:

```text
AI soan van ban
```

Nut nay goi workflow:

```text
POST /api/ai/workflows/alert-writer
```

Payload gui sang workflow gom thong tin canh bao dang chon:

- `alert_type`
- `raw_data.alert_id`
- `raw_data.title`
- `raw_data.severity`
- `raw_data.due_date`
- `raw_data.owner`
- `raw_data.source`
- `raw_data.amount`
- `raw_data.sent_at`
- `raw_data.description`

Muc dich:

- Dashboard hien canh bao nganh nghe ke toan/tai chinh.
- Nguoi dung bam vao de xem chi tiet.
- Dify chi soan van ban/dien giai/giai phap cho canh bao, khong thay the rule phat hien canh bao.

## 3. Cac thay doi backend AI

Da them thu muc:

```text
apps/api/src/ai/
```

Cac file moi:

- `apps/api/src/ai/ai.module.ts`
- `apps/api/src/ai/ai.controller.ts`
- `apps/api/src/ai/ai.service.ts`
- `apps/api/src/ai/flow-registry.ts`

Da sua:

- `apps/api/src/app.module.ts`

### 3.1 AiModule

`AiModule` duoc import vao `AppModule` de NestJS dang ky route AI.

Route da them:

```text
POST /api/ai/chat
POST /api/ai/chat/upload
POST /api/ai/workflows/:flowKey
POST /api/ai/workflows/:flowKey/upload
```

### 3.2 Chat endpoint

Endpoint:

```text
POST /api/ai/chat
```

Backend goi Dify Chatflow endpoint:

```text
/chat-messages
```

Dung env:

```text
DIFY_API_BASE_URL
DIFY_CHATFLOW_API_KEY
```

Payload gui sang Dify gom:

- `inputs.current_screen`
- `inputs.selected_filters`
- `inputs.user_role`
- `inputs.allowed_tools`
- `query`
- `response_mode = blocking`
- `user`
- `conversation_id`
- `files`

Endpoint upload:

```text
POST /api/ai/chat/upload
```

Neu request co file va noi dung lien quan den OCR/hoa don/chung tu/dinh khoan, backend goi truc tiep:

```text
POST /api/ai/workflows/ocr-accounting/upload
```

Input gui vao workflow:

- `voucher_type`: tu nhan dien theo man hinh/noi dung, mac dinh `HT1` cho hoa don dau vao.
- `source`: `ai_chat_upload`.
- `files`: file da upload len Dify bang API key cua workflow OCR.

### 3.3 Workflow endpoint

Endpoint:

```text
POST /api/ai/workflows/:flowKey
POST /api/ai/workflows/:flowKey/upload
```

Backend goi Dify Workflow endpoint:

```text
/workflows/run
```

Rieng route upload se nhan file tu UI, upload len Dify truoc qua:

```text
/files/upload
```

Sau do dua `upload_file_id` vao `files` khi chay workflow.

Da them endpoint custom-tool de Dify/Agent OCR co the goi ve app hien tai:

```text
POST /api/v1/ai/tools/ocr/accounting
```

Endpoint nay hien goi lai workflow Dify that `ocr-accounting` thay vi tra du lieu demo. Input ho tro:

- `upload_file_id`: file da upload trong Dify/chat.
- `file_url`: URL file de gui vao workflow theo `remote_url`.
- `file` / `files`: metadata file tu `sys.files` hoac `userinput.files`.
- `data_json` / `document_json`: du lieu JSON, app se upload thanh file `.json` len workflow.
- `voucher_type`: loai chung tu truyen vao workflow 1, mac dinh `HT1`. App co map alias nhu `INPUT_INVOICE -> HT1`, `BANK_DEBIT -> BN`, `BANK_CREDIT -> BC`, `CASH_PAYMENT -> PC`, `CASH_RECEIPT -> PT`.

Payload goi workflow tu custom tool:

```text
POST /api/ai/workflows/ocr-accounting
inputs.voucher_type = <voucher_type da chuan hoa>
files = <upload_file_id/file_url/files hoac file JSON vua upload>
```

Da them endpoint custom-tool cho Chatflow/Agent doc du lieu bao cao va tra loi truc tiep:

```text
POST /api/v1/ai/tools/debts/due
POST /api/v1/ai/tools/get_due_debts
POST /api/v1/ai/tools/cashflow/summary
POST /api/v1/ai/tools/get_cashflow_summary
POST /api/v1/ai/tools/vouchers/missing
POST /api/v1/ai/tools/detect_missing_vouchers
POST /api/v1/ai/tools/vouchers/detail
POST /api/v1/ai/tools/get_voucher_details
POST /api/v1/ai/tools/expenses/by-category
POST /api/v1/ai/tools/get_expense_by_category
POST /api/v1/ai/tools/bank/reconcile
POST /api/v1/ai/tools/reconcile_bank_statement
```

Hien da phu du 7 custom tools trong chatbot Dify: `get_due_debts`, `get_cashflow_summary`, `detect_missing_vouchers`, `reconcile_bank_statement`, `ocr_accounting_from_file`, `get_expense_by_category`, `get_voucher_details`.

Trong do `get_due_debts` tra ve tong hop cong no thang `2026-07`: tong phai thu, tong phai tra, no qua han, top doi tac va de xuat uu tien thu/tra. Muc tieu la tranh tinh huong AI hoi lai nguoi dung cac so lieu dang co san tren dashboard.

Workflow OCR hien tai con co node `HTTP Request` lay danh sach tai khoan dang hoat dong:

```text
GET /api/v1/accounts/active-list
```

Node nay dang duoc workflow cau hinh:

```text
http://host.docker.internal:3000/api/v1/accounts/active-list
```

Vi vay app da them endpoint tuong thich tren web port `3000` va API port `4000` de tranh loi 404 khi Dify chay node nay.

Va endpoint OpenAPI de import/cap nhat tool trong Dify:

```text
GET /api/v1/ai/tools/openapi.json
```

Khi chay local sau khi restart API, URL day du la:

```text
http://localhost:4000/api/v1/ai/tools/openapi.json
```

Khi Dify chay trong Docker, endpoint nay can duoc publish qua:

```text
AI_TOOLS_PUBLIC_BASE_URL=http://host.docker.internal:4000
```

Workflow key da dang ky:

| flowKey | Muc dich | Env API key |
| --- | --- | --- |
| `ocr-accounting` | OCR va goi y dinh khoan | `DIFY_WORKFLOW_OCR_API_KEY` |
| `semantic-reconciliation` | Doi chieu ngu nghia | `DIFY_WORKFLOW_RECONCILIATION_API_KEY` |
| `alert-writer` | Soan canh bao | `DIFY_WORKFLOW_ALERT_API_KEY` |
| `cfo-report` | Lap va dien giai bao cao quan tri AI | `DIFY_WORKFLOW_REPORT_API_KEY` |

Neu workflow key khong hop le, backend tra loi `BadRequestException`.

Neu workflow chua cau hinh API key, backend tra fallback:

```text
configured: false
status: not_configured
```

### 3.4 Xu ly loi Dify

Trong `apps/api/src/ai/ai.service.ts` da them xu ly:

- Neu Dify tra ve loi HTTP, backend tra `ServiceUnavailableException`.
- Neu Dify khong ket noi duoc, backend tra thong bao ro:

```text
Khong ket noi duoc Dify tai <baseUrl>. Hay kiem tra DIFY_API_BASE_URL va dich vu Dify.
```

Ly do them phan nay:

- Truoc do UI co the gap loi chung chung `Internal server error`.
- Sau khi sua, UI nhan duoc message cu the de biet la Dify service chua chay hoac sai port.

## 4. Thay doi helper API frontend

File da sua:

- `apps/web/lib/api.ts`

Thay doi:

- Them `getAccessToken()` de gan Bearer token vao moi request API.
- `fetchApi`, `postApi`, `patchApi` deu dung chung `buildHeaders()`.
- Neu backend tra loi loi JSON, frontend doc `message` va nem ra `Error` co noi dung ro.

Tac dung:

- Cac API can dang nhap nhu `/api/ai/chat` khong con bi thieu token.
- Loi hien tren UI de hieu hon.

## 5. Thay doi CSS cho UI AI

File da sua:

- `apps/web/styles/globals.css`

Class da them:

- `.report-ai-narrative`
- `.report-ai-icon`
- `.ai-card-markdown`
- `.dashboard-alert-card`
- `.dashboard-alert-detail`
- `.dashboard-alert-row`
- `.dashboard-alert-content`

Tac dung:

- Tao khu vuc hien nhan xet AI trong man Bao cao.
- Format ket qua Markdown cua AI thanh HTML de khong hien ky tu `#`, `**`, `---` tho.
- Tao card `Canh bao can xem` tren dashboard ke toan va panel chi tiet canh bao.
- Dam bao responsive tren mobile:

```css
.report-ai-narrative { flex-direction: column; }
.report-ai-narrative .button { width: 100%; justify-content: center; }
```

## 6. Cau hinh Dify trong env

Da cap nhat:

- `.env`
- `.env.example`

Da them/cap nhat cac bien:

```text
DIFY_API_BASE_URL
DIFY_CHATFLOW_API_KEY
DIFY_WORKFLOW_API_KEY
DIFY_WORKFLOW_OCR_API_KEY
DIFY_WORKFLOW_RECONCILIATION_API_KEY
DIFY_WORKFLOW_ALERT_API_KEY
DIFY_WORKFLOW_REPORT_API_KEY
AI_TOOLS_PUBLIC_BASE_URL
```

Sau do da copy cau hinh tu:

```text
D:\AppKeToan\.env
```

Mapping da thuc hien:

| File nguon `D:\AppKeToan\.env` | File dich project hien tai |
| --- | --- |
| `DIFY_BASE_URL` | `DIFY_API_BASE_URL` |
| `DIFY_CHATFLOW_CFO_KEY` | `DIFY_CHATFLOW_API_KEY` |
| `DIFY_WORKFLOW_OCR_KEY` | `DIFY_WORKFLOW_OCR_API_KEY` |
| `DIFY_WORKFLOW_RECONCILIATION_KEY` | `DIFY_WORKFLOW_RECONCILIATION_API_KEY` |
| `DIFY_WORKFLOW_ALERT_KEY` | `DIFY_WORKFLOW_ALERT_API_KEY` |
| `DIFY_WORKFLOW_CFO_REPORT_KEY` | `DIFY_WORKFLOW_REPORT_API_KEY` |
| `AI_TOOLS_PUBLIC_BASE_URL` | `AI_TOOLS_PUBLIC_BASE_URL` |

Khong overwrite cau hinh database PostgreSQL hien tai.

## 7. Trang thai kiem thu hien tai

Da chay thanh cong:

```text
npm.cmd run typecheck
npm.cmd run web:build
```

Da xac nhan:

- Web dang nghe `http://localhost:3000`.
- API dang nghe `http://localhost:4000`.
- Login voi user `director` thanh cong.
- Route AI da duoc NestJS map:

```text
/api/ai/chat
/api/ai/workflows/:flowKey
```

Trang thai Dify hien tai:

- Backend da doc duoc API key Dify tu `.env`.
- Backend dang co gang goi:

```text
http://localhost:9999/v1
```

- Ket qua hien tai la `ECONNREFUSED`, nghia la Dify service tai port `9999` chua chay hoac khong nghe port nay.

Thong bao loi hien tai da duoc lam ro:

```text
Khong ket noi duoc Dify tai http://localhost:9999/v1. Hay kiem tra DIFY_API_BASE_URL va dich vu Dify.
```

## 8. Viec can lam tiep

De AI goi Dify that, can lam mot trong hai cach:

1. Bat Dify service dung port dang khai bao:

```text
http://localhost:9999/v1
```

2. Hoac sua `.env`:

```text
DIFY_API_BASE_URL="<URL Dify dang chay>/v1"
```

Sau khi sua `.env`, restart API:

```text
npm.cmd run api:dev
```

Neu Dify chay trong Docker va can goi nguoc ve backend app, can dam bao `AI_TOOLS_PUBLIC_BASE_URL` la dia chi Dify container truy cap duoc, thuong la:

```text
http://host.docker.internal:4000
```

## 9. Tom tat file da tac dong

Backend:

- `apps/api/src/app.module.ts`
- `apps/api/src/ai/ai.module.ts`
- `apps/api/src/ai/ai.controller.ts`
- `apps/api/src/ai/ai.service.ts`
- `apps/api/src/ai/flow-registry.ts`

Frontend:

- `apps/web/components/ai-chat-widget.tsx`
- `apps/web/components/markdown-text.tsx`
- `apps/web/components/module-dashboard.tsx`
- `apps/web/components/icons.tsx`
- `apps/web/lib/api.ts`
- `apps/web/lib/ai-workflows.ts`
- `apps/web/screens/cash-voucher-screen.tsx`
- `apps/web/screens/input-einvoice-screen.tsx`
- `apps/web/screens/reconciliation-screen.tsx`
- `apps/web/screens/reports-dashboard-screen.tsx`
- `apps/web/screens/tax-notification-screen.tsx`
- `apps/web/styles/globals.css`

Cau hinh:

- `.env`
- `.env.example`
