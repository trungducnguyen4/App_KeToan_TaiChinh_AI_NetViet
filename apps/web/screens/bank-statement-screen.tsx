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
    sourceName: "Manual import",
    transactionDate: "2026-07-09",
    referenceNo: "",
    description: "Dong sao ke moi",
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
      setFeedback(`Da import ${created.statementNo}`);
      setForm((current) => ({
        ...current,
        statementNo: `ST-${Date.now()}`,
        referenceNo: "",
        description: "Dong sao ke moi"
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Import sao ke that bai");
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chu</span>
          <span>/</span>
          <span>So quy &amp; Ngan hang</span>
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
            <strong>{statements.length} dot import</strong>
            <span>Import file, luu header va tung line de phuc vu matching, raw payload va audit.</span>
          </div>
        </section>

        <div className="section-title">
          <h2>Import preview</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleImportStatement} disabled={isImporting}>
              <AppIcon name="Upload" />
              {isImporting ? "Dang import..." : "Import sao ke"}
            </button>
            <button className="button" type="button">Tai mau CSV</button>
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
              <span>So sao ke *</span>
              <input className="field" value={form.statementNo} onChange={(event) => setForm((current) => ({ ...current, statementNo: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>So du dau *</span>
              <input className="field" value={form.openingBalance} onChange={(event) => setForm((current) => ({ ...current, openingBalance: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>So du cuoi *</span>
              <input className="field" value={form.closingBalance} onChange={(event) => setForm((current) => ({ ...current, closingBalance: event.target.value }))} />
            </label>
          </form>

          <div className="section-title" style={{ marginTop: 20 }}>
            <h2>Dong sao ke se import</h2>
            <span className="module-meta">1 dong / 1 lan import nhanh</span>
          </div>
          <form className="form-grid">
            <label className="form-field md">
              <span>Ngay giao dich *</span>
              <input className="field" type="date" value={form.transactionDate} onChange={(event) => setForm((current) => ({ ...current, transactionDate: event.target.value }))} />
            </label>
            <label className="form-field md">
              <span>Reference</span>
              <input className="field" value={form.referenceNo} onChange={(event) => setForm((current) => ({ ...current, referenceNo: event.target.value }))} />
            </label>
            <label className="form-field xl">
              <span>Dien giai *</span>
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
              <strong>Trang thai</strong>
              <p>{feedback}</p>
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Danh sach sao ke</h2>
          <span className="module-meta">Bank statements + lines</span>
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

        {statement ? (
          <>
            <div className="section-title">
              <h2>Statement lines</h2>
              <span className="module-meta">{statement.lineCount} dong</span>
            </div>
            <section className="panel table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Ngay GD</th>
                    <th>Dien giai</th>
                    <th>Ref</th>
                    <th>Debit</th>
                    <th>Credit</th>
                    <th>Running</th>
                    <th>Match</th>
                  </tr>
                </thead>
                <tbody>
                  {statement.lines.map((line) => (
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
              Chua co sao ke trong database. Su dung form import ben tren de nap du lieu vao M2.
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
