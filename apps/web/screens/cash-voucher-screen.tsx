import { useEffect, useState } from "react";
import { cashVoucherScreens, cashVouchers } from "@domain/index";
import type { CashVoucherType, VoucherRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { MarkdownText } from "../components/markdown-text";
import { fetchApi, patchApi, postApi } from "../lib/api";
import { StatusPill } from "../components/status-pill";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

type VoucherFormState = {
  voucherNo: string;
  voucherDate: string;
  currency: string;
  cashBookCode: string;
  bankAccountCode: string;
  counterpartyCode: string;
  counterpartyName: string;
  referenceInvoiceNo: string;
  content: string;
  amount: string;
  debitAccount: string;
  creditAccount: string;
  description: string;
};

type VoucherListFilterState = {
  fromDate: string;
  toDate: string;
  query: string;
};

type AiChatResponse = {
  answer?: string;
};

export default function CashVoucherScreen({ voucherType }: { voucherType: CashVoucherType }) {
  const screen = cashVoucherScreens.find((item) => item.voucherType === voucherType) ?? cashVoucherScreens[0];
  const [vouchers, setVouchers] = useState<VoucherRecord[]>(cashVouchers.filter((item) => item.voucherType === voucherType));
  const [form, setForm] = useState<VoucherFormState>(() => buildInitialForm(voucherType));
  const [filters, setFilters] = useState<VoucherListFilterState>(buildInitialFilters());
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [isAskingAi, setIsAskingAi] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [listMessage, setListMessage] = useState<string>("");
  const filteredVouchers = filterVouchers(vouchers, filters);
  const selectedVoucher = vouchers.find((voucher) => voucher.id === editingVoucherId) ?? vouchers[0];

  useEffect(() => {
    let active = true;
    void fetchApi<VoucherRecord[]>(`/cash/vouchers?type=${voucherType}`)
      .then((data) => {
        if (active) {
          setVouchers(data);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [voucherType]);

  useEffect(() => {
    setForm(buildInitialForm(voucherType));
    setFilters(buildInitialFilters());
    setEditingVoucherId(null);
    setFeedback("");
    setAiSuggestion("");
    setListMessage("");
  }, [voucherType]);

  async function handleSaveVoucher() {
    setIsSaving(true);
    setFeedback("");

    try {
      const payload = {
        voucherType,
        paymentChannel: screen.paymentChannel,
        voucherNo: form.voucherNo,
        voucherDate: form.voucherDate,
        currency: form.currency,
        cashBookCode: form.cashBookCode || undefined,
        bankAccountCode: form.bankAccountCode || undefined,
        counterpartyCode: form.counterpartyCode || undefined,
        counterpartyName: form.counterpartyName || undefined,
        referenceInvoiceNo: form.referenceInvoiceNo || undefined,
        content: form.content,
        amount: Number(form.amount),
        status: "draft",
        createdBy: "DEMO.TGD",
        lines: [
          {
            debitAccount: form.debitAccount,
            creditAccount: form.creditAccount,
            amount: Number(form.amount),
            description: form.description || form.content
          }
        ]
      };

      if (editingVoucherId) {
        const updated = await patchApi<VoucherRecord>(`/cash/vouchers/${editingVoucherId}`, payload);
        setVouchers((current) => current.map((voucher) => (voucher.id === updated.id ? updated : voucher)));
        setFeedback(`Da cap nhat ${updated.voucherNo}`);
      } else {
        const created = await postApi<VoucherRecord>("/cash/vouchers", payload);
        setVouchers((current) => [created, ...current]);
        setEditingVoucherId(created.id);
        setForm(buildFormFromVoucher(created));
        setFeedback(`Da tao ${created.voucherNo}`);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Khong luu duoc chung tu");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectVoucher(voucher: VoucherRecord) {
    setEditingVoucherId(voucher.id);
    setForm(buildFormFromVoucher(voucher));
    setFeedback(`Dang sua ${voucher.voucherNo}`);
  }

  function handleResetForm() {
    setEditingVoucherId(null);
    setForm(buildInitialForm(voucherType));
    setAiSuggestion("");
    setFeedback("Da chuyen sang tao moi");
  }

  async function handleAskAiForVoucher() {
    setIsAskingAi(true);
    setAiSuggestion("");

    try {
      const response = await postApi<AiChatResponse>("/ai/chat", {
        message:
          "Kiem tra nhanh chung tu nay va goi y dinh khoan, rui ro thue/kiem soat, va thong tin con thieu. Tra loi ngan gon theo bullet.",
        currentScreen: `/modules/cash/vouchers/${voucherType}`,
        selectedFilters: {
          voucherType,
          paymentChannel: screen.paymentChannel,
          form,
        },
      });

      setAiSuggestion(response.answer || "AI da nhan yeu cau nhung chua tra ve noi dung.");
    } catch (error) {
      setAiSuggestion(error instanceof Error ? error.message : "Khong goi duoc AI Agent.");
    } finally {
      setIsAskingAi(false);
    }
  }

  function handleApplyFilters() {
    setListMessage(`Da tim thay ${filteredVouchers.length} chung tu ${voucherType}`);
  }

  function handleResetFilters() {
    setFilters(buildInitialFilters());
    setListMessage("Da xoa bo loc");
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chu</span>
          <span>/</span>
          <span>So quy &amp; Ngan hang</span>
          <span>/</span>
          <span>{screen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">{screen.voucherType} voucher engine</div>
            <h2 className="hero-title">{screen.title}</h2>
            <p className="hero-copy">{screen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{filteredVouchers.length}/{vouchers.length} chung tu</strong>
            <span>
              Rule rieng theo subtype: {screen.paymentChannel === "cash" ? "bat buoc so quy" : "bat buoc tai khoan ngan hang"}.
            </span>
          </div>
        </section>

        <div className="section-title">
          <h2>Danh sach chung tu</h2>
          <div className="topbar-actions">
            <button className="button primary" onClick={handleResetForm} type="button">
              <AppIcon name="FileText" />
              Tao moi
            </button>
            <button className="button" type="button">Export</button>
          </div>
        </div>

        <section className="panel table-scroll">
          <div className="toolbar">
            <input
              className="field"
              type="date"
              value={filters.fromDate}
              aria-label="Tu ngay"
              onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
            />
            <input
              className="field"
              type="date"
              value={filters.toDate}
              aria-label="Den ngay"
              onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
            />
            <button className="button" type="button">{voucherType}</button>
            <input
              className="search"
              placeholder="Tim so chung tu, doi tuong, hoa don"
              aria-label="Tim kiem"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            />
            <button className="button primary" type="button" onClick={handleApplyFilters}>
              <AppIcon name="Search" />
              Tim
            </button>
            <button className="button" type="button" onClick={handleResetFilters}>Xoa loc</button>
          </div>
          {listMessage ? (
            <div className="attachment-box" style={{ marginBottom: 12 }}>
              {listMessage}
            </div>
          ) : null}
          <table className="data-table">
            <thead>
              <tr>
                {screen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredVouchers.map((voucher) => (
                <tr
                  key={voucher.id}
                  onClick={() => handleSelectVoucher(voucher)}
                  style={{
                    cursor: "pointer",
                    backgroundColor: voucher.id === editingVoucherId ? "rgba(15, 23, 42, 0.06)" : undefined
                  }}
                >
                  <td>{voucher.voucherType}</td>
                  <td>{voucher.voucherNo}</td>
                  <td>{voucher.voucherDate}</td>
                  <td>{voucher.cashBookCode ?? voucher.bankAccountCode ?? "-"}</td>
                  <td>{voucher.counterpartyName}</td>
                  <td>{voucher.content}</td>
                  <td>{currency.format(voucher.amount)}</td>
                  <td>
                    {voucherType === "BN" || voucherType === "BC" ? (
                      <span>{voucher.reconciliationStatus ?? "unmatched"}</span>
                    ) : (
                      <StatusPill status={voucher.status} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {!vouchers.length ? (
          <section className="panel">
            <div className="attachment-box">
              Chua co chung tu trong database cho loai {voucherType}. Ban co the tao moi ngay tren form ben duoi.
            </div>
          </section>
        ) : null}

        {vouchers.length > 0 && !filteredVouchers.length ? (
          <section className="panel">
            <div className="attachment-box">
              Khong co chung tu nao khop bo loc hien tai. Thu mo rong khoang ngay hoac doi tu khoa tim kiem.
            </div>
          </section>
        ) : null}

        <div className="section-title">
          <h2>Tao / sua chung tu</h2>
          <div className="topbar-actions">
            <button className="button" onClick={handleAskAiForVoucher} type="button" disabled={isAskingAi}>
              <AppIcon name="Bot" />
              {isAskingAi ? "AI dang goi y..." : "AI goi y"}
            </button>
            <button className="button primary" onClick={handleSaveVoucher} type="button" disabled={isSaving}>
              <AppIcon name="Save" />
              {isSaving ? "Dang luu..." : editingVoucherId ? "Luu cap nhat" : "Luu"}
            </button>
            <button className="button" onClick={handleResetForm} type="button">Lam moi form</button>
          </div>
        </div>

        <div className="split-grid">
          <section className="panel">
            <div className="subsection">
              <h3>Header</h3>
              <StatusPill status={selectedVoucher?.status ?? "draft"} />
            </div>
            <form className="form-grid">
              {screen.fields.map((field) => (
                <label className={`form-field ${field.width ?? "md"}`} key={field.key}>
                  <span>{field.label}{field.required ? " *" : ""}</span>
                  {field.type === "textarea" ? (
                    <textarea
                      className="field"
                      value={getFieldValue(form, field.key)}
                      onChange={(event) => setFieldValue(setForm, field.key, event.target.value)}
                    />
                  ) : (
                    <input
                      className="field"
                      type={field.type === "date" ? "date" : "text"}
                      value={getFieldValue(form, field.key)}
                      onChange={(event) => setFieldValue(setForm, field.key, event.target.value)}
                    />
                  )}
                </label>
              ))}
            </form>

            <div className="attachments" style={{ marginTop: 16 }}>
              <div className="attachment-box">
                <strong>Dong hach toan dau tien</strong>
                <p>Nhap nhanh 1 dong de tao chung tu M2 xuong database that.</p>
              </div>
            </div>

            <form className="form-grid" style={{ marginTop: 12 }}>
              <label className="form-field md">
                <span>TK No *</span>
                <input className="field" value={form.debitAccount} onChange={(event) => setForm((current) => ({ ...current, debitAccount: event.target.value }))} />
              </label>
              <label className="form-field md">
                <span>TK Co *</span>
                <input className="field" value={form.creditAccount} onChange={(event) => setForm((current) => ({ ...current, creditAccount: event.target.value }))} />
              </label>
              <label className="form-field md">
                <span>So tien *</span>
                <input className="field" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
              </label>
              <label className="form-field xl">
                <span>Dien giai dong</span>
                <input className="field" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
            </form>
          </section>

          <aside className="panel">
            <div className="subsection">
              <h3>Control</h3>
            </div>
            <div className="attachments">
              <div className="attachment-box">
                <strong>Approval</strong>
                <p>Su dung chung approval_instances va approval_actions cho ca PT, PC, BN, BC.</p>
              </div>
              <div className="attachment-box">
                <strong>Audit</strong>
                <p>Moi thao tac tao, sua, import, match va unmatch deu can log vao audit_events.</p>
              </div>
              <div className="attachment-box">
                <strong>Reference</strong>
                <p>Hoa don tham chieu hien tai: {form.referenceInvoiceNo || "Chua gan"}.</p>
              </div>
              <div className="attachment-box">
                <strong>Mode</strong>
                <p>{editingVoucherId ? `Dang sua ${form.voucherNo}` : `Dang tao moi ${voucherType}`}</p>
              </div>
              {aiSuggestion ? (
                <div className="attachment-box">
                  <strong>AI Agent</strong>
                  <MarkdownText className="ai-card-markdown" content={aiSuggestion} />
                </div>
              ) : null}
              {feedback ? (
                <div className="attachment-box">
                  <strong>Trang thai</strong>
                  <p>{feedback}</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        {selectedVoucher ? (
          <>
            <div className="section-title">
              <h2>Dong hach toan da luu gan nhat</h2>
              <button className="button" type="button">+ Dong moi</button>
            </div>
            <section className="panel table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TK No</th>
                    <th>YT1 No</th>
                    <th>TK Co</th>
                    <th>YT1 Co</th>
                    <th>So tien</th>
                    <th>Dien giai</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVoucher.lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.debitAccount}</td>
                      <td>{line.debitDimension1 ?? ""}</td>
                      <td>{line.creditAccount}</td>
                      <td>{line.creditDimension1 ?? ""}</td>
                      <td>{currency.format(line.amount)}</td>
                      <td>{line.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function buildInitialForm(voucherType: CashVoucherType): VoucherFormState {
  const defaults: Record<CashVoucherType, VoucherFormState> = {
    PT: {
      voucherNo: `PT-${Date.now()}`,
      voucherDate: "2026-07-09",
      currency: "VND",
      cashBookCode: "TM-01",
      bankAccountCode: "",
      counterpartyCode: "KH-NEW",
      counterpartyName: "Khách hàng mới",
      referenceInvoiceNo: "INV-NEW",
      content: "Thu tiền mặt",
      amount: "1000000",
      debitAccount: "1111",
      creditAccount: "131",
      description: "Thu tiền công nợ"
    },
    PC: {
      voucherNo: `PC-${Date.now()}`,
      voucherDate: "2026-07-09",
      currency: "VND",
      cashBookCode: "TM-01",
      bankAccountCode: "",
      counterpartyCode: "NCC-NEW",
      counterpartyName: "Nhà cung cấp mới",
      referenceInvoiceNo: "BILL-NEW",
      content: "Chi tiền mặt",
      amount: "1000000",
      debitAccount: "331",
      creditAccount: "1111",
      description: "Chi tiền nhà cung cấp"
    },
    BN: {
      voucherNo: `BN-${Date.now()}`,
      voucherDate: "2026-07-09",
      currency: "VND",
      cashBookCode: "",
      bankAccountCode: "VCB-001",
      counterpartyCode: "NCC-NEW",
      counterpartyName: "Nhà cung cấp mới",
      referenceInvoiceNo: "BILL-NEW",
      content: "Báo nợ ngân hàng",
      amount: "1000000",
      debitAccount: "331",
      creditAccount: "1121",
      description: "Chuyển khoản thanh toán"
    },
    BC: {
      voucherNo: `BC-${Date.now()}`,
      voucherDate: "2026-07-09",
      currency: "VND",
      cashBookCode: "",
      bankAccountCode: "VCB-001",
      counterpartyCode: "KH-NEW",
      counterpartyName: "Khách hàng mới",
      referenceInvoiceNo: "INV-NEW",
      content: "Báo có ngân hàng",
      amount: "1000000",
      debitAccount: "1121",
      creditAccount: "131",
      description: "Thu tiền qua ngân hàng"
    }
  };

  return defaults[voucherType];
}

function buildInitialFilters(): VoucherListFilterState {
  return {
    fromDate: "2026-07-01",
    toDate: "2026-07-31",
    query: ""
  };
}

function buildFormFromVoucher(voucher: VoucherRecord): VoucherFormState {
  const firstLine = voucher.lines[0];

  return {
    voucherNo: voucher.voucherNo,
    voucherDate: voucher.voucherDate,
    currency: voucher.currency,
    cashBookCode: voucher.cashBookCode ?? "",
    bankAccountCode: voucher.bankAccountCode ?? "",
    counterpartyCode: voucher.counterpartyCode ?? "",
    counterpartyName: voucher.counterpartyName ?? "",
    referenceInvoiceNo: voucher.referenceInvoiceNo ?? "",
    content: voucher.content,
    amount: String(voucher.amount),
    debitAccount: firstLine?.debitAccount ?? "",
    creditAccount: firstLine?.creditAccount ?? "",
    description: firstLine?.description ?? voucher.content
  };
}

function filterVouchers(vouchers: VoucherRecord[], filters: VoucherListFilterState) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return vouchers.filter((voucher) => {
    const inFromRange = !filters.fromDate || voucher.voucherDate >= filters.fromDate;
    const inToRange = !filters.toDate || voucher.voucherDate <= filters.toDate;

    if (!inFromRange || !inToRange) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const searchHaystack = [
      voucher.voucherNo,
      voucher.counterpartyCode,
      voucher.counterpartyName,
      voucher.referenceInvoiceNo,
      voucher.content,
      voucher.cashBookCode,
      voucher.bankAccountCode
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchHaystack.includes(normalizedQuery);
  });
}

function getFieldValue(form: VoucherFormState, key: string) {
  return form[key as keyof VoucherFormState] ?? "";
}

function setFieldValue(setter: React.Dispatch<React.SetStateAction<VoucherFormState>>, key: string, value: string) {
  setter((current) => ({
    ...current,
    [key]: value
  }));
}
