import { useEffect, useState } from "react";
import { bankStatementScreen, bankStatements } from "@domain/index";
import type { BankStatementRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi, postApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

type StatementFormState = {
  bankAccountCode: string;
  statementNo: string;
  statementDate: string;
  openingBalance: string;
  closingBalance: string;
  sourceName: string;
  transactionDate: string;
  referenceNo: string;
  description: string;
  debitAmount: string;
  creditAmount: string;
};

export default function BankStatementScreen() {
  const [statements, setStatements] = useState<BankStatementRecord[]>(bankStatements);
  const [form, setForm] = useState<StatementFormState>({
    bankAccountCode: "VCB-001",
    statementNo: `ST-${Date.now()}`,
    statementDate: "2026-07-09",
    openingBalance: "10000000",
    closingBalance: "12000000",
    sourceName: "Nhập thủ công",
    transactionDate: "2026-07-09",
    referenceNo: "",
    description: "Giao dịch sao kê mới",
    debitAmount: "0",
    creditAmount: "1000000"
  });
  const [feedback, setFeedback] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const statement = statements[0];

  useEffect(() => {
    let active = true;
    void fetchApi<BankStatementRecord[]>("/cash/bank-statements")
      .then((data) => {
        if (active) {
          setStatements(data);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  async function handleImportStatement() {
    setIsImporting(true);
    setFeedback("");

    try {
      const created = await postApi<BankStatementRecord>("/cash/bank-statements/import", {
        statementNo: form.statementNo,
        bankAccountCode: form.bankAccountCode,
        statementDate: form.statementDate,
        openingBalance: Number(form.openingBalance),
        closingBalance: Number(form.closingBalance),
        sourceName: form.sourceName,
        lines: [
          {
            transactionDate: form.transactionDate,
            referenceNo: form.referenceNo || undefined,
            description: form.description,
            debitAmount: Number(form.debitAmount),
            creditAmount: Number(form.creditAmount),
            amount: Math.max(Number(form.debitAmount), Number(form.creditAmount))
          }
        ]
      });

      setStatements((current) => [created, ...current]);
      setFeedback(`Đã nhập thành công sao kê ${created.statementNo}`);
      setForm((current) => ({
        ...current,
        statementNo: `ST-${Date.now()}`,
        referenceNo: "",
        description: "Giao dịch sao kê mới"
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Nhập sao kê thất bại");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/cash">Sổ quỹ &amp; Ngân hàng</a>
          <span>/</span>
          <span>{bankStatementScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Sao Kê • Sổ Quỹ &amp; Ngân Hàng</div>
            <h2 className="hero-title">{bankStatementScreen.title}</h2>
            <p className="hero-copy">{bankStatementScreen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{statements.length} đợt sao kê</strong>
            <span>Nhập file sao kê, lưu thông tin đầu mục và chi tiết từng dòng để phục vụ đối soát, kiểm toán tự động.</span>
          </div>
        </section>

        <div className="section-title">
          <h2>Nhập và Xem trước Sao kê</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleImportStatement} disabled={isImporting}>
              <AppIcon name="Upload" />
              {isImporting ? "Đang nhập..." : "Nhập sao kê"}
            </button>
            <button className="button" type="button">
              <AppIcon name="Download" />
              Tải mẫu CSV
            </button>
          </div>
        </div>

        <section className="panel">
          <form className="form-grid">
            {bankStatementScreen.fields.map((field) => (
              <label className={`form-field ${field.width ?? "md"}`} key={field.key}>
                <span>{field.label}{field.required ? " *" : ""}</span>
                <input
                  className="field"
                  type={field.type === "date" ? "date" : "text"}
                  value={getStatementField(form, field.key)}
                  onChange={(event) => setStatementField(setForm, field.key, event.target.value)}
                />
              </label>
            ))}
            <label className="form-field md">
              <span>Số sao kê *</span>
              <input className="field" value={form.statementNo} onChange={(event) => setForm((current) => ({ ...current, statementNo: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Số dư đầu kỳ *</span>
              <input className="field" value={form.openingBalance} onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Số dư cuối kỳ *</span>
              <input className="field" value={form.closingBalance} onChange={(event) => setForm((current) => ({ ...current, closingBalance: event.target.value }))} />
            </label>
          </form>

          <div className="section-title" style={{ marginTop: 20 }}>
            <h2>Dòng giao dịch sao kê sẽ nhập</h2>
            <span className="module-meta">Nhập nhanh 1 dòng mẫu để kiểm thử dữ liệu</span>
          </div>
          <form className="form-grid">
            <label className="form-field md">
              <span>Ngày giao dịch *</span>
              <input className="field" type="date" value={form.transactionDate} onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Số tham chiếu (Ref)</span>
              <input className="field" value={form.referenceNo} onChange={(event) => setForm((current) => ({ ...current, referenceNo: event.target.value }))} />
            </label>
            <label className="form-field xl">
              <span>Diễn giải giao dịch *</span>
              <input className="field" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Phát sinh Nợ (Rút tiền/Chi)</span>
              <input className="field" value={form.debitAmount} onChange={(event) => setForm((current) => ({ ...current, debitAmount: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Phát sinh Có (Nộp tiền/Thu)</span>
              <input className="field" value={form.creditAmount} onChange={(event) => setForm((current) => ({ ...current, creditAmount: event.target.value }))} />
            </label>
          </form>

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16, background: "#f0fdf4", borderColor: "#86efac" }}>
              <strong style={{ color: "#166534" }}>Trạng thái xử lý</strong>
              <p style={{ color: "#15803d" }}>{feedback}</p>
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Danh sách đợt sao kê ngân hàng</h2>
          <span className="module-meta">Danh mục sao kê &amp; Dòng chi tiết</span>
        </div>
        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                {bankStatementScreen.listColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statements.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{item.statementNo}</td>
                  <td><strong>{item.bankAccountCode}</strong></td>
                  <td>{item.statementDate}</td>
                  <td style={{ textAlign: "center" }}>{item.lineCount}</td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)" }}>{currency.format(item.openingBalance)}</td>
                  <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currency.format(item.closingBalance)}</td>
                  <td>{item.sourceName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {statement ? (
          <>
            <div className="section-title">
              <h2>Chi tiết các dòng sao kê</h2>
              <span className="module-meta">{statement.lineCount} dòng giao dịch</span>
            </div>
            <section className="panel table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>STT</th>
                    <th>Ngày GD</th>
                    <th>Diễn giải</th>
                    <th>Số tham chiếu</th>
                    <th style={{ textAlign: "right" }}>Ghi Nợ (Chi)</th>
                    <th style={{ textAlign: "right" }}>Ghi Có (Thu)</th>
                    <th style={{ textAlign: "right" }}>Số dư lũy kế</th>
                    <th style={{ textAlign: "center" }}>Trạng thái khớp</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.lines.map((line) => (
                    <tr key={line.id}>
                      <td style={{ textAlign: "center" }}>{line.lineNo}</td>
                      <td>{line.transactionDate}</td>
                      <td>{line.description}</td>
                      <td style={{ fontFamily: "var(--font-mono)" }}>{line.referenceNo || "-"}</td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: line.debitAmount ? "#b91c1c" : "inherit" }}>
                        {line.debitAmount ? currency.format(line.debitAmount) : "-"}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", color: line.creditAmount ? "#15803d" : "inherit" }}>
                        {line.creditAmount ? currency.format(line.creditAmount) : "-"}
                      </td>
                      <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currency.format(line.runningBalance)}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={`status-pill ${line.matchingStatus === "matched" ? "is-success" : line.matchingStatus === "partial" ? "is-info" : "is-warning"}`}>
                          {line.matchingStatus === "matched" ? "Đã khớp" : line.matchingStatus === "partial" ? "Khớp một phần" : "Chưa khớp"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <section className="panel">
            <div className="attachment-box">
              Chưa có sao kê trong hệ thống. Sử dụng form nhập bên trên để nạp dữ liệu giao dịch ngân hàng.
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}

function getStatementField(form: StatementFormState, key: string) {
  return form[key as keyof StatementFormState] ?? "";
}

function setStatementField(setter: React.Dispatch<React.SetStateAction<StatementFormState>>, key: string, value: string) {
  setter((current) => ({
    ...current,
    [key]: value
  }));
}
