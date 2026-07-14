"use client";

import { useMemo, useState } from "react";
import { AppIcon } from "../components/icons";
import { receivableCustomerMocks } from "../lib/receivable-sql-mock-data";
import { payableSupplierMocks } from "../lib/payable-sql-mock-data";

type CurrencyView = "VND" | "NT" | "VND+NT";
type DebtEntity = {
  id: string;
  code: string;
  name: string;
  kind: "receivable" | "payable";
  invoiceCount: number;
  overdueInvoiceCount: number;
  oldestOverdueDays: number;
  balance: number;
  foreignBalance: number;
  overdueBalance: number;
  overdueForeignBalance: number;
};

const numberFormat = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const compactFormat = new Intl.NumberFormat("vi-VN", { notation: "compact", maximumFractionDigits: 1 });
const foreignFormat = new Intl.NumberFormat("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const today = new Date("2026-07-14T00:00:00");
const months = Array.from({ length: 12 }, (_, index) => `T${String(index + 1).padStart(2, "0")}`);

function daysOverdue(dueDate: string) {
  return Math.max(0, Math.floor((today.getTime() - new Date(`${dueDate}T00:00:00`).getTime()) / 86_400_000));
}

function displayMoney(vnd: number, foreign: number, view: CurrencyView) {
  if (view === "NT") return `${foreignFormat.format(foreign)} NT`;
  if (view === "VND+NT") return `${numberFormat.format(vnd)} ₫ · ${foreignFormat.format(foreign)} NT`;
  return `${numberFormat.format(vnd)} ₫`;
}

function buildReceivableEntities(fromDate: string, toDate: string): DebtEntity[] {
  return receivableCustomerMocks.map((customer) => {
    const transactions = customer.transactions.filter((item) => item.voucherDate >= fromDate && item.voucherDate <= toDate);
    const balance = Math.max(0, customer.openingDebit - customer.openingCredit + transactions.reduce((sum, item) => sum + item.debitAmount - item.creditAmount, 0));
    const foreignBalance = Math.max(0, customer.openingForeignDebit - customer.openingForeignCredit + transactions.reduce((sum, item) => sum + item.foreignDebitAmount - item.foreignCreditAmount, 0));
    const invoiceMap = new Map<string, { overdueDays: number; balance: number; foreignBalance: number }>();
    transactions.forEach((item) => {
      const current = invoiceMap.get(item.invoiceNo) ?? { overdueDays: 0, balance: 0, foreignBalance: 0 };
      current.overdueDays = Math.max(current.overdueDays, daysOverdue(item.dueDate));
      current.balance += item.debitAmount - item.creditAmount;
      current.foreignBalance += item.foreignDebitAmount - item.foreignCreditAmount;
      invoiceMap.set(item.invoiceNo, current);
    });
    const invoices = [...invoiceMap.values()];
    return { id: customer.id, code: customer.customerCode, name: customer.customerName, kind: "receivable", invoiceCount: invoiceMap.size, overdueInvoiceCount: invoices.filter((item) => item.overdueDays > 0 && item.balance > 0).length, oldestOverdueDays: Math.max(0, ...invoices.map((item) => item.overdueDays)), balance, foreignBalance, overdueBalance: invoices.filter((item) => item.overdueDays > 0).reduce((sum, item) => sum + Math.max(0, item.balance), 0), overdueForeignBalance: invoices.filter((item) => item.overdueDays > 0).reduce((sum, item) => sum + Math.max(0, item.foreignBalance), 0) };
  });
}

function buildPayableEntities(fromDate: string, toDate: string): DebtEntity[] {
  return payableSupplierMocks.map((supplier) => {
    const transactions = supplier.transactions.filter((item) => item.voucherDate >= fromDate && item.voucherDate <= toDate);
    const balance = Math.max(0, supplier.openingCredit - supplier.openingDebit + transactions.reduce((sum, item) => sum + item.creditAmount - item.debitAmount, 0));
    const foreignBalance = Math.max(0, supplier.openingForeignCredit - supplier.openingForeignDebit + transactions.reduce((sum, item) => sum + item.foreignCreditAmount - item.foreignDebitAmount, 0));
    const invoiceMap = new Map<string, { overdueDays: number; balance: number; foreignBalance: number }>();
    transactions.forEach((item) => {
      const current = invoiceMap.get(item.invoiceNo) ?? { overdueDays: 0, balance: 0, foreignBalance: 0 };
      current.overdueDays = Math.max(current.overdueDays, daysOverdue(item.dueDate));
      current.balance += item.creditAmount - item.debitAmount;
      current.foreignBalance += item.foreignCreditAmount - item.foreignDebitAmount;
      invoiceMap.set(item.invoiceNo, current);
    });
    const invoices = [...invoiceMap.values()];
    return { id: supplier.id, code: supplier.supplierCode, name: supplier.supplierName, kind: "payable", invoiceCount: invoiceMap.size, overdueInvoiceCount: invoices.filter((item) => item.overdueDays > 0 && item.balance > 0).length, oldestOverdueDays: Math.max(0, ...invoices.map((item) => item.overdueDays)), balance, foreignBalance, overdueBalance: invoices.filter((item) => item.overdueDays > 0).reduce((sum, item) => sum + Math.max(0, item.balance), 0), overdueForeignBalance: invoices.filter((item) => item.overdueDays > 0).reduce((sum, item) => sum + Math.max(0, item.foreignBalance), 0) };
  });
}

export default function DebtOverviewScreen() {
  const [fromDate, setFromDate] = useState("2026-01-01");
  const [toDate, setToDate] = useState("2026-12-31");
  const [currencyView, setCurrencyView] = useState<CurrencyView>("VND");
  const receivables = useMemo(() => buildReceivableEntities(fromDate, toDate), [fromDate, toDate]);
  const payables = useMemo(() => buildPayableEntities(fromDate, toDate), [fromDate, toDate]);

  const totals = useMemo(() => ({
    receivable: receivables.reduce((sum, item) => sum + item.balance, 0),
    receivableForeign: receivables.reduce((sum, item) => sum + item.foreignBalance, 0),
    receivableOverdue: receivables.reduce((sum, item) => sum + item.overdueBalance, 0),
    receivableOverdueForeign: receivables.reduce((sum, item) => sum + item.overdueForeignBalance, 0),
    payable: payables.reduce((sum, item) => sum + item.balance, 0),
    payableForeign: payables.reduce((sum, item) => sum + item.foreignBalance, 0),
    payableOverdue: payables.reduce((sum, item) => sum + item.overdueBalance, 0),
    payableOverdueForeign: payables.reduce((sum, item) => sum + item.overdueForeignBalance, 0)
  }), [payables, receivables]);

  const attentionRows = useMemo(() => [...receivables, ...payables].filter((item) => item.overdueInvoiceCount > 0).sort((a, b) => b.oldestOverdueDays - a.oldestOverdueDays || b.overdueBalance - a.overdueBalance).slice(0, 12), [payables, receivables]);
  const topReceivables = useMemo(() => [...receivables].sort((a, b) => b.balance - a.balance).slice(0, 5), [receivables]);
  const topPayables = useMemo(() => [...payables].sort((a, b) => b.balance - a.balance).slice(0, 5), [payables]);
  const maxTopValue = Math.max(topReceivables[0]?.balance ?? 1, topPayables[0]?.balance ?? 1);

  const monthlyData = useMemo(() => {
    const factors = [0.62, 0.75, 0.68, 0.82, 0.71, 0.91, 0.78, 0.87, 0.73, 0.95, 0.84, 1];
    const receivableBase = Math.max(1, totals.receivable * 0.12);
    const payableBase = Math.max(1, totals.payable * 0.11);
    return months.map((month, index) => ({ month, receivable: receivableBase * factors[index], collected: receivableBase * factors[index] * (0.55 + (index % 3) * 0.09), payable: payableBase * factors[(index + 3) % 12], paid: payableBase * factors[(index + 3) % 12] * (0.58 + (index % 4) * 0.06) }));
  }, [totals.payable, totals.receivable]);
  const maxMonthly = Math.max(...monthlyData.flatMap((item) => [item.receivable, item.collected, item.payable, item.paid]), 1);

  const receivableAging = [45, 22, 15, 10, 8];
  const payableAging = [52, 20, 13, 9, 6];
  const actionCount = [...receivables, ...payables].filter((item) => item.overdueInvoiceCount > 0).length;

  return <div className="workspace debt-overview-workspace">
    <div className="breadcrumb"><a className="breadcrumb-link" href="/">Trang chủ</a><span>/</span><a className="breadcrumb-link" href="/modules/receivables">Công nợ</a><span>/</span><span>Tổng quan công nợ</span></div>
    <div className="receivable-page-head"><div className="receivable-page-heading"><a className="button receivable-back-button" href="/modules/receivables"><AppIcon name="ArrowLeft" /> </a><div><div className="eyebrow">Dashboard TK131 / TK331</div><h2>Tổng quan công nợ</h2><p>Theo dõi phải thu, phải trả, tuổi nợ và các đối tượng cần ưu tiên xử lý.</p></div></div><div className="receivable-page-actions"><button className="button" type="button" onClick={() => window.print()}><AppIcon name="Printer" /> In</button><button className="button" type="button"><AppIcon name="Upload" /> Xuất báo cáo</button></div></div>

    <section className="panel debt-overview-filter"><label><span>Từ ngày</span><input className="field" type="date" value={fromDate} onChange={(event) => setFromDate(event.target.value)} /></label><label><span>Đến ngày</span><input className="field" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} /></label><button className="period-button is-active" type="button" onClick={() => { setFromDate("2026-01-01"); setToDate("2026-12-31"); }}>Năm 2026</button><button className="period-button" type="button" onClick={() => { setFromDate("2025-01-01"); setToDate("2025-12-31"); }}>Năm 2025</button><label><span>Tiền tệ</span><select className="field" value={currencyView} onChange={(event) => setCurrencyView(event.target.value as CurrencyView)}><option>VND</option><option>NT</option><option>VND+NT</option></select></label></section>

    <div className="debt-kpi-grid">
      <DebtKpi label="Tổng phải thu" value={displayMoney(totals.receivable, totals.receivableForeign, currencyView)} hint="Số dư TK131" tone="green" icon="TrendingUp" />
      <DebtKpi label="Phải thu quá hạn" value={displayMoney(totals.receivableOverdue, totals.receivableOverdueForeign, currencyView)} hint="Cần ưu tiên thu" tone="red" icon="ShieldCheck" />
      <DebtKpi label="Tổng phải trả" value={displayMoney(totals.payable, totals.payableForeign, currencyView)} hint="Số dư TK331" tone="blue" icon="WalletCards" />
      <DebtKpi label="Phải trả quá hạn" value={displayMoney(totals.payableOverdue, totals.payableOverdueForeign, currencyView)} hint="Cần lên kế hoạch trả" tone="amber" icon="ReceiptText" />
      <DebtKpi label="Chênh lệch thu - trả" value={displayMoney(totals.receivable - totals.payable, totals.receivableForeign - totals.payableForeign, currencyView)} hint="Phải thu trừ phải trả" tone="gray" icon="Calculator" />
      <DebtKpi label="Đối tượng cần xử lý" value={String(actionCount).padStart(2, "0")} hint="Khách hàng và NCC quá hạn" tone="red" icon="Bot" />
    </div>

    <section className="panel debt-dashboard-card debt-monthly-card"><div className="debt-card-head"><div><h3>Phát sinh và thanh toán theo tháng</h3><p>So sánh phải thu, đã thu, phải trả và đã trả trong 12 tháng.</p></div><span>Đơn vị biểu đồ: VND</span></div><div className="debt-chart-legend"><span className="legend-receivable">Phải thu</span><span className="legend-collected">Đã thu</span><span className="legend-payable">Phải trả</span><span className="legend-paid">Đã trả</span></div><div className="debt-monthly-chart">{monthlyData.map((item) => <div className="debt-month-group" key={item.month}><div className="debt-month-bars"><i className="bar-receivable" style={{ height: `${(item.receivable / maxMonthly) * 100}%` }} title={`Phải thu ${compactFormat.format(item.receivable)}`} /><i className="bar-collected" style={{ height: `${(item.collected / maxMonthly) * 100}%` }} title={`Đã thu ${compactFormat.format(item.collected)}`} /><i className="bar-payable" style={{ height: `${(item.payable / maxMonthly) * 100}%` }} title={`Phải trả ${compactFormat.format(item.payable)}`} /><i className="bar-paid" style={{ height: `${(item.paid / maxMonthly) * 100}%` }} title={`Đã trả ${compactFormat.format(item.paid)}`} /></div><span>{item.month}</span></div>)}</div></section>

    <div className="debt-two-column">
      <AgingCard title="Tuổi nợ phải thu" values={receivableAging} />
      <AgingCard title="Tuổi nợ phải trả" values={payableAging} />
    </div>

    <div className="debt-two-column">
      <TopDebtCard title="Top khách hàng phải thu" rows={topReceivables} maxValue={maxTopValue} currencyView={currencyView} />
      <TopDebtCard title="Top nhà cung cấp phải trả" rows={topPayables} maxValue={maxTopValue} currencyView={currencyView} />
    </div>

    <section className="panel debt-dashboard-card"><div className="debt-card-head"><div><h3>Danh sách công nợ cần xử lý</h3><p>Ưu tiên theo số ngày quá hạn và giá trị còn phải thu hoặc phải trả.</p></div><span>{attentionRows.length} đối tượng</span></div><div className="table-scroll"><table className="data-table debt-attention-table"><thead><tr><th>Mã</th><th>Đối tượng</th><th>Loại</th><th>Số hóa đơn</th><th>HĐ quá hạn</th><th>Quá hạn lâu nhất</th><th>Số tiền quá hạn</th><th>Mức cảnh báo</th><th></th></tr></thead><tbody>{attentionRows.map((row) => { const warning = row.oldestOverdueDays > 60 ? "Cao" : row.oldestOverdueDays > 30 ? "Trung bình" : "Theo dõi"; return <tr key={`${row.kind}-${row.id}`}><td><strong>{row.code}</strong></td><td>{row.name}</td><td><span className={`debt-kind ${row.kind}`}>{row.kind === "receivable" ? "Phải thu" : "Phải trả"}</span></td><td>{row.invoiceCount}</td><td>{row.overdueInvoiceCount}</td><td>{row.oldestOverdueDays} ngày</td><td><strong>{numberFormat.format(row.overdueBalance)} ₫</strong></td><td><span className={`debt-warning warning-${warning === "Cao" ? "high" : warning === "Trung bình" ? "medium" : "low"}`}>{warning}</span></td><td><a className="button button-sm" href={`/modules/receivables?view=${row.kind}&tab=aging`}>Chi tiết</a></td></tr>; })}</tbody></table></div></section>
  </div>;
}

function DebtKpi({ label, value, hint, tone, icon }: { label: string; value: string; hint: string; tone: string; icon: string }) { return <article className={`debt-kpi tone-${tone}`}><span className="debt-kpi-icon"><AppIcon name={icon} /></span><div><span>{label}</span><strong>{value}</strong><small>{hint}</small></div></article>; }
function AgingCard({ title, values }: { title: string; values: number[] }) { const labels = ["Chưa đến hạn", "1–30 ngày", "31–60 ngày", "61–90 ngày", "Trên 90 ngày"]; return <section className="panel debt-dashboard-card"><div className="debt-card-head"><div><h3>{title}</h3><p>Cơ cấu dư nợ theo thời gian quá hạn.</p></div></div><div className="aging-distribution">{values.map((value, index) => <div className="aging-distribution-row" key={labels[index]}><span>{labels[index]}</span><div><i className={`aging-tone-${index}`} style={{ width: `${value}%` }} /></div><strong>{value}%</strong></div>)}</div></section>; }
function TopDebtCard({ title, rows, maxValue, currencyView }: { title: string; rows: DebtEntity[]; maxValue: number; currencyView: CurrencyView }) { return <section className="panel debt-dashboard-card"><div className="debt-card-head"><div><h3>{title}</h3><p>Xếp hạng theo số dư cuối kỳ.</p></div></div><div className="top-debt-list">{rows.map((row, index) => <div className="top-debt-row" key={row.id}><span className="top-debt-rank">{index + 1}</span><div className="top-debt-info"><span><strong>{row.code}</strong> · {row.name}</span><div><i style={{ width: `${Math.max(4, (row.balance / maxValue) * 100)}%` }} /></div></div><strong>{currencyView === "NT" ? `${foreignFormat.format(row.foreignBalance)} NT` : compactFormat.format(row.balance)}</strong></div>)}</div></section>; }
