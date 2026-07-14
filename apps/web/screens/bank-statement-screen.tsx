"use client";

import { useEffect, useMemo, useState } from "react";
import { bankStatementScreen, bankStatements } from "@domain/index";
import type { BankStatementRecord } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { bankStatementAssistantMock } from "../lib/document-assistant-mock-data";
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
  const [selectedStatementId, setSelectedStatementId] = useState(bankStatements[0]?.id ?? "");
  const [form, setForm] = useState<StatementFormState>({
    bankAccountCode: "VCB-001",
    statementNo: `ST-${Date.now()}`,
    statementDate: "2026-07-09",
    openingBalance: "10000000",
    closingBalance: "12000000",
    sourceName: "Import thủ công",
    transactionDate: "2026-07-09",
    referenceNo: "",
    description: "Dòng sao kê mới",
    debitAmount: "0",
    creditAmount: "1000000"
  });
  const [feedback, setFeedback] = useState("");
  const [assistantFeedback, setAssistantFeedback] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    let active = true;
    void fetchApi<BankStatementRecord[]>("/cash/bank-statements")
      .then((data) => {
        if (active) {
          setStatements(data);
          setSelectedStatementId((current) => current || data[0]?.id || "");
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const selectedStatement = useMemo(
    () => statements.find((statement) => statement.id === selectedStatementId) ?? statements[0],
    [selectedStatementId, statements]
  );

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
      setSelectedStatementId(created.id);
      setFeedback(`Đã import ${created.statementNo}`);
      setForm((current) => ({
        ...current,
        statementNo: `ST-${Date.now()}`,
        referenceNo: "",
        description: "Dòng sao kê mới"
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Import sao kê thất bại");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Sổ quỹ &amp; Ngân hàng</span>
          <span>/</span>
          <span>{bankStatementScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Statement import</div>
            <h2 className="hero-title">{bankStatementScreen.title}</h2>
            <p className="hero-copy">{bankStatementScreen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{statements.length} đợt import</strong>
            <span>Import file, lưu header và từng dòng để phục vụ matching, raw payload và audit.</span>
          </div>
        </section>

        <section className="panel ai-assistant-panel">
          <div className="ai-assistant-heading">
            <div>
              <span className="ai-assistant-eyebrow">AI đọc sao kê</span>
              <h2>Đọc sao kê bằng AI</h2>
              <p>
                Demo đọc file {bankStatementAssistantMock.fileName}, chuẩn hóa dòng giao dịch, nhận diện giao dịch
                nghi ngờ và chuyển sang đối chiếu ngân hàng.
              </p>
            </div>
            <span className="ai-assistant-badge">{bankStatementAssistantMock.confidence}% tin cậy</span>
          </div>

          <div className="ai-doc-layout">
            <article className="ai-doc-card">
              <span className="ai-doc-file">
                <AppIcon name="Upload" />
                {bankStatementAssistantMock.fileName}
              </span>
              <strong>{bankStatementAssistantMock.classificationLabel}</strong>
              <p>{bankStatementAssistantMock.recommendation}</p>
              <button
                className="button primary"
                type="button"
                onClick={() => setAssistantFeedback("Đã mô phỏng tạo chứng từ nháp cho dòng phí/lãi ngân hàng cần kế toán duyệt.")}
              >
                <AppIcon name="Bot" />
                Tạo chứng từ nháp
              </button>
            </article>

            <div className="ai-extract-grid">
              {bankStatementAssistantMock.extractedFields.map((field) => (
                <div className="ai-extract-item" key={field.label}>
                  <span>{field.label}</span>
                  <strong>{field.value}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Thời gian</th>
                  <th>Tham chiếu</th>
                  <th>Nội dung AI đọc</th>
                  <th>Thu/Chi</th>
                  <th>Số tiền</th>
                  <th>Chứng từ đề xuất</th>
                  <th>Match</th>
                  <th>Tin cậy</th>
                </tr>
              </thead>
              <tbody>
                {(bankStatementAssistantMock.statementLines ?? []).map((line) => (
                  <tr key={line.id}>
                    <td>{line.transactionTime}</td>
                    <td>{line.referenceNo}</td>
                    <td>{line.description}</td>
                    <td>{line.direction}</td>
                    <td>{currency.format(line.amount)}</td>
                    <td>{line.suggestedVoucher}</td>
                    <td>{line.matchStatus}</td>
                    <td>{line.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {assistantFeedback ? (
            <div className="ai-feedback-box">
              <strong>Kết quả mô phỏng</strong>
              <p>{assistantFeedback}</p>
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Nhập sao kê</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleImportStatement} disabled={isImporting}>
              <AppIcon name="Upload" />
              {isImporting ? "Đang import..." : "Import sao kê"}
            </button>
            <button className="button" type="button">
              Tải mẫu CSV
            </button>
          </div>
        </div>

        <section className="panel">
          <form className="form-grid">
            {bankStatementScreen.fields.map((field) => (
              <label className={`form-field ${field.width ?? "md"}`} key={field.key}>
                <span>
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
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
              <span>Số dư đầu *</span>
              <input className="field" value={form.openingBalance} onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Số dư cuối *</span>
              <input className="field" value={form.closingBalance} onChange={(event) => setForm((current) => ({ ...current, closingBalance: event.target.value }))} />
            </label>
          </form>

          <div className="section-title" style={{ marginTop: 20 }}>
            <h2>Dòng giao dịch trong sao kê</h2>
            <span className="module-meta">1 dòng = 1 giao dịch trong file sao kê</span>
          </div>
          <form className="form-grid">
            <label className="form-field md">
              <span>Ngày giao dịch *</span>
              <input className="field" type="date" value={form.transactionDate} onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Tham chiếu</span>
              <input className="field" value={form.referenceNo} onChange={(event) => setForm((current) => ({ ...current, referenceNo: event.target.value }))} />
            </label>
            <label className="form-field xl">
              <span>Diễn giải *</span>
              <input className="field" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Debit</span>
              <input className="field" value={form.debitAmount} onChange={(event) => setForm((current) => ({ ...current, debitAmount: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Credit</span>
              <input className="field" value={form.creditAmount} onChange={(event) => setForm((current) => ({ ...current, creditAmount: event.target.value }))} />
            </label>
          </form>

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>Trạng thái</strong>
              <p>{feedback}</p>
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Danh sách sao kê</h2>
          <span className="module-meta">Mỗi dòng là một file/đợt import sao kê riêng</span>
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
                <tr key={item.id} onClick={() => setSelectedStatementId(item.id)} style={{ cursor: "pointer" }}>
                  <td>{item.statementNo}</td>
                  <td>{item.bankAccountCode}</td>
                  <td>{item.statementDate}</td>
                  <td>{item.lineCount}</td>
                  <td>{currency.format(item.openingBalance)}</td>
                  <td>{currency.format(item.closingBalance)}</td>
                  <td>{item.sourceName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {selectedStatement ? (
          <>
            <div className="section-title">
              <h2>Dòng giao dịch của sao kê đã chọn</h2>
              <span className="module-meta">
                {selectedStatement.statementNo} · {selectedStatement.lineCount} dòng
              </span>
            </div>
            <section className="panel table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Ngày GD</th>
                    <th>Diễn giải</th>
                    <th>Tham chiếu</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Running</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedStatement.lines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.lineNo}</td>
                      <td>{line.transactionDate}</td>
                      <td>{line.description}</td>
                      <td>{line.referenceNo}</td>
                      <td>{line.debitAmount ? currency.format(line.debitAmount) : "-"}</td>
                      <td>{line.creditAmount ? currency.format(line.creditAmount) : "-"}</td>
                      <td>{currency.format(line.runningBalance)}</td>
                      <td>{line.matchingStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        ) : (
          <section className="panel">
            <div className="attachment-box">
              Chưa có sao kê trong database. Sử dụng form import bên trên để nạp dữ liệu vào M2.
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
