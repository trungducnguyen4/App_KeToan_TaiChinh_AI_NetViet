import { useEffect, useState } from "react";
import { cashVoucherScreens, cashVouchers } from "@domain/index";
import type { CashVoucherType, VoucherRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
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

export default function CashVoucherScreen({ voucherType }: { voucherType: CashVoucherType }) {
  const screen = cashVoucherScreens.find((item) => item.voucherType === voucherType) ?? cashVoucherScreens[0];
  const [vouchers, setVouchers] = useState<VoucherRecord[]>(cashVouchers.filter((item) => item.voucherType === voucherType));
  const [form, setForm] = useState<VoucherFormState>(() => buildInitialForm(voucherType));
  const [filters, setFilters] = useState<VoucherListFilterState>(buildInitialFilters());
  const [editingVoucherId, setEditingVoucherId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
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
        setFeedback(`Đã cập nhật chứng từ ${updated.voucherNo}`);
      } else {
        const created = await postApi<VoucherRecord>("/cash/vouchers", payload);
        setVouchers((current) => [created, ...current]);
        setEditingVoucherId(created.id);
        setForm(buildFormFromVoucher(created));
        setFeedback(`Đã tạo thành công chứng từ ${created.voucherNo}`);
      }
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không lưu được chứng từ");
    } finally {
      setIsSaving(false);
    }
  }

  function handleSelectVoucher(voucher: VoucherRecord) {
    setEditingVoucherId(voucher.id);
    setForm(buildFormFromVoucher(voucher));
    setFeedback(`Đang chỉnh sửa chứng từ ${voucher.voucherNo}`);
  }

  function handleResetForm() {
    setEditingVoucherId(null);
    setForm(buildInitialForm(voucherType));
    setFeedback("Đã chuyển sang chế độ tạo mới");
  }

  function handleApplyFilters() {
    setListMessage(`Đã tìm thấy ${filteredVouchers.length} chứng từ loại ${voucherType}`);
  }

  function handleResetFilters() {
    setFilters(buildInitialFilters());
    setListMessage("Đã đặt lại bộ lọc");
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/cash">Sổ quỹ &amp; Ngân hàng</a>
          <span>/</span>
          <span>{screen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">{screen.voucherType} • Sổ Quỹ &amp; Ngân Hàng</div>
            <h2 className="hero-title">{screen.title}</h2>
            <p className="hero-copy">{screen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{filteredVouchers.length}/{vouchers.length} chứng từ</strong>
            <span>
              Quy tắc theo kênh: {screen.paymentChannel === "cash" ? "bắt buộc chọn Sổ quỹ tiền mặt" : "bắt buộc chọn Tài khoản ngân hàng"}.
            </span>
          </div>
        </section>

        <div className="section-title">
          <h2>Danh sách chứng từ</h2>
          <div className="topbar-actions">
            <button className="button primary" onClick={handleResetForm} type="button">
              <AppIcon name="Plus" />
              Tạo mới
            </button>
            <button className="button" type="button">
              <AppIcon name="Download" />
              Xuất Excel
            </button>
          </div>
        </div>

        <section className="panel table-scroll">
          <div className="toolbar">
            <input
              className="field"
              type="date"
              value={filters.fromDate}
              aria-label="Từ ngày"
              onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))}
            />
            <input
              className="field"
              type="date"
              value={filters.toDate}
              aria-label="Đến ngày"
              onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))}
            />
            <button className="button" type="button">{screen.voucherType} - {screen.title}</button>
            <input
              className="search"
              placeholder="Tìm số chứng từ, đối tượng, hóa đơn..."
              aria-label="Tìm kiếm"
              value={filters.query}
              onChange={(event) => setFilters((current) => ({ ...current, query: event.target.value }))}
            />
            <button className="button primary" type="button" onClick={handleApplyFilters}>
              <AppIcon name="Search" />
              Tìm
            </button>
            <button className="button" type="button" onClick={handleResetFilters}>
              <AppIcon name="RefreshCw" />
              Xóa lọc
            </button>
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
                  <td><strong>{voucher.voucherType}</strong></td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{voucher.voucherNo}</td>
                  <td>{voucher.voucherDate}</td>
                  <td>{voucher.cashBookCode ?? voucher.bankAccountCode ?? "-"}</td>
                  <td>{voucher.counterpartyName}</td>
                  <td>{voucher.content}</td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currency.format(voucher.amount)}</td>
                  <td>
                    {voucherType === "BN" || voucherType === "BC" ? (
                      <span className="status-pill is-info">{voucher.reconciliationStatus === "matched" ? "Đã khớp" : voucher.reconciliationStatus === "partial" ? "Khớp một phần" : "Chưa khớp"}</span>
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
              Chưa có chứng từ trong hệ thống cho loại {voucherType}. Bạn có thể tạo mới ngay trên form bên dưới.
            </div>
          </section>
        ) : null}

        {vouchers.length > 0 && !filteredVouchers.length ? (
          <section className="panel">
            <div className="attachment-box">
              Không có chứng từ nào khớp bộ lọc hiện tại. Thử mở rộng khoảng ngày hoặc đổi từ khóa tìm kiếm.
            </div>
          </section>
        ) : null}

        <div className="section-title">
          <h2>Tạo / Sửa chứng từ</h2>
          <div className="topbar-actions">
            <button className="button primary" onClick={handleSaveVoucher} type="button" disabled={isSaving}>
              <AppIcon name="Save" />
              {isSaving ? "Đang lưu..." : editingVoucherId ? "Lưu cập nhật" : "Lưu chứng từ"}
            </button>
            <button className="button" onClick={handleResetForm} type="button">
              <AppIcon name="RefreshCw" />
              Làm mới form
            </button>
          </div>
        </div>

        <div className="split-grid">
          <section className="panel">
            <div className="subsection">
              <h3>Thông tin chung chứng từ (Header)</h3>
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
                <strong>Định khoản hạch toán ban đầu</strong>
                <p>Nhập nhanh 1 dòng định khoản để ghi nhận chứng từ vào hệ thống.</p>
              </div>
            </div>

            <form className="form-grid" style={{ marginTop: 12 }}>
              <label className="form-field md">
                <span>TK Nợ *</span>
                <input className="field" value={form.debitAccount} onChange={(event) => setForm((current) => ({ ...current, debitAccount: event.target.value }))} />
              </label>
              <label className="form-field md">
                <span>TK Có *</span>
                <input className="field" value={form.creditAccount} onChange={(event) => setForm((current) => ({ ...current, creditAccount: event.target.value }))} />
              </label>
              <label className="form-field md">
                <span>Số tiền *</span>
                <input className="field" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
              </label>
              <label className="form-field xl">
                <span>Diễn giải dòng</span>
                <input className="field" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
            </form>
          </section>

          <aside className="panel">
            <div className="subsection">
              <h3>Kiểm soát &amp; Quy trình</h3>
            </div>
            <div className="attachments">
              <div className="attachment-box">
                <strong>Quy trình Phê duyệt (Approval)</strong>
                <p>Sử dụng chung quy trình phê duyệt điện tử cho toàn bộ Phiếu thu (PT), Phiếu chi (PC), Báo nợ (BN) và Báo có (BC).</p>
              </div>
              <div className="attachment-box">
                <strong>Nhật ký Kiểm toán (Audit)</strong>
                <p>Mọi thao tác tạo mới, sửa đổi, import, đối chiếu và hủy đối chiếu đều được ghi nhật ký hệ thống đầy đủ.</p>
              </div>
              <div className="attachment-box">
                <strong>Tham chiếu Hóa đơn (Reference)</strong>
                <p>Hóa đơn tham chiếu hiện tại: <strong>{form.referenceInvoiceNo || "Chưa gắn"}</strong>.</p>
              </div>
              <div className="attachment-box">
                <strong>Chế độ Xử lý (Mode)</strong>
                <p>{editingVoucherId ? `Đang chỉnh sửa chứng từ ${form.voucherNo}` : `Đang tạo mới ${screen.title} (${voucherType})`}</p>
              </div>
              {feedback ? (
                <div className="attachment-box" style={{ background: "#f0fdf4", borderColor: "#86efac" }}>
                  <strong style={{ color: "#166534" }}>Trạng thái</strong>
                  <p style={{ color: "#15803d" }}>{feedback}</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>

        {selectedVoucher ? (
          <>
            <div className="section-title">
              <h2>Định khoản hạch toán đã lưu gần nhất</h2>
              <button className="button" type="button">
                <AppIcon name="Plus" />
                + Thêm dòng định khoản
              </button>
            </div>
            <section className="panel table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>TK Nợ</th>
                    <th>YT1 Nợ</th>
                    <th>TK Có</th>
                    <th>YT1 Có</th>
                    <th style={{ textAlign: "right" }}>Số tiền</th>
                    <th>Diễn giải</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedVoucher.lines.map((line) => (
                    <tr key={line.id}>
                      <td style={{ fontWeight: 600 }}>{line.debitAccount}</td>
                      <td>{line.debitDimension1 ?? ""}</td>
                      <td style={{ fontWeight: 600 }}>{line.creditAccount}</td>
                      <td>{line.creditDimension1 ?? ""}</td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currency.format(line.amount)}</td>
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
      description: "Thu tiền công nợ bán hàng"
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
      description: "Chi tiền trả nhà cung cấp"
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
      description: "Chuyển khoản thanh toán tiền dừa"
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
      description: "Thu tiền bán dầu qua ngân hàng"
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
