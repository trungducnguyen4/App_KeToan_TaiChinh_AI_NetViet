"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppIcon } from "../components/icons";
import {
  payableSupplierMocks,
  type PayableSupplierMock,
  type PayableTransactionMock,
} from "../lib/payable-sql-mock-data";

type PayableTab = "supplier" | "invoice" | "contract" | "aging";
type CurrencyView = "VND" | "NT" | "VND+NT";
type PayableSummary = PayableSupplierMock & {
  periodTransactions: PayableTransactionMock[];
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  periodForeignDebit: number;
  periodForeignCredit: number;
  closingForeignDebit: number;
  closingForeignCredit: number;
};

const tabs: Array<{
  key: PayableTab;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    key: "supplier",
    label: "Theo nhà cung cấp",
    description: "Số dư và phát sinh TK331",
    icon: "Warehouse",
  },
  {
    key: "invoice",
    label: "Theo hóa đơn",
    description: "Chi tiết hóa đơn mua hàng",
    icon: "ReceiptText",
  },
  {
    key: "contract",
    label: "Theo hợp đồng",
    description: "Tổng hợp hợp đồng mua",
    icon: "FileText",
  },
  {
    key: "aging",
    label: "Đến hạn & tuổi nợ",
    description: "Lịch thanh toán nhà cung cấp",
    icon: "ShieldCheck",
  },
];

const numberFormat = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});
const foreignFormat = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const dateFormat = new Intl.DateTimeFormat("vi-VN");
const today = new Date("2026-07-14T00:00:00");

function parseDate(value: string) {
  return new Date(`${value}T00:00:00`);
}
function formatDate(value: string) {
  return dateFormat.format(parseDate(value));
}
function formatAmount(value: number, view: CurrencyView) {
  return view === "NT"
    ? foreignFormat.format(value)
    : numberFormat.format(value);
}
function getAging(dueDate: string) {
  const days = Math.max(
    0,
    Math.floor((today.getTime() - parseDate(dueDate).getTime()) / 86_400_000),
  );
  if (!days) return { days, label: "Chưa quá hạn", status: "normal" };
  if (days <= 30) return { days, label: "1–30 ngày", status: "soon" };
  if (days <= 60) return { days, label: "31–60 ngày", status: "today" };
  return { days, label: "Trên 60 ngày", status: "overdue" };
}

function summarizeSupplier(
  supplier: PayableSupplierMock,
  fromDate: string,
  toDate: string,
  view: CurrencyView,
): PayableSummary {
  const periodTransactions = supplier.transactions.filter(
    (item) =>
      item.voucherDate >= fromDate &&
      item.voucherDate <= toDate &&
      (view !== "NT" || item.currencyCode !== "VND"),
  );
  const foreignTransactions = supplier.transactions.filter(
    (item) =>
      item.voucherDate >= fromDate &&
      item.voucherDate <= toDate &&
      item.currencyCode !== "VND",
  );
  const openingDebit =
    view === "NT" ? supplier.openingForeignDebit : supplier.openingDebit;
  const openingCredit =
    view === "NT" ? supplier.openingForeignCredit : supplier.openingCredit;
  const periodDebit = periodTransactions.reduce(
    (sum, item) =>
      sum + (view === "NT" ? item.foreignDebitAmount : item.debitAmount),
    0,
  );
  const periodCredit = periodTransactions.reduce(
    (sum, item) =>
      sum + (view === "NT" ? item.foreignCreditAmount : item.creditAmount),
    0,
  );
  const periodForeignDebit = foreignTransactions.reduce(
    (sum, item) => sum + item.foreignDebitAmount,
    0,
  );
  const periodForeignCredit = foreignTransactions.reduce(
    (sum, item) => sum + item.foreignCreditAmount,
    0,
  );
  const closingNet = openingCredit - openingDebit + periodCredit - periodDebit;
  const closingForeignNet =
    supplier.openingForeignCredit -
    supplier.openingForeignDebit +
    periodForeignCredit -
    periodForeignDebit;
  return {
    ...supplier,
    openingDebit,
    openingCredit,
    periodTransactions,
    periodDebit,
    periodCredit,
    closingDebit: Math.max(0, -closingNet),
    closingCredit: Math.max(0, closingNet),
    periodForeignDebit,
    periodForeignCredit,
    closingForeignDebit: Math.max(0, -closingForeignNet),
    closingForeignCredit: Math.max(0, closingForeignNet),
  };
}

export default function PayableDetailScreen() {
  const router = useRouter();
  const routeTab =
    typeof router.query.tab === "string" ? router.query.tab : "supplier";
  const activeTab = tabs.some((tab) => tab.key === routeTab)
    ? (routeTab as PayableTab)
    : "supplier";
  const [fromDate, setFromDate] = useState("2026-07-01");
  const [toDate, setToDate] = useState("2026-07-14");
  const [currencyView, setCurrencyView] = useState<CurrencyView>("VND");
  const [supplierQuery, setSupplierQuery] = useState("");
  const [contractQuery, setContractQuery] = useState("");
  const [onlyClosing, setOnlyClosing] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(
    payableSupplierMocks[0].id,
  );

  const summaries = useMemo(
    () =>
      payableSupplierMocks
        .map((supplier) =>
          summarizeSupplier(supplier, fromDate, toDate, currencyView),
        )
        .filter((supplier) => {
          const supplierNeedle = supplierQuery.trim().toLocaleLowerCase("vi");
          const contractNeedle = contractQuery.trim().toLocaleLowerCase("vi");
          const matchesSupplier =
            !supplierNeedle ||
            [
              supplier.supplierCode,
              supplier.supplierName,
              supplier.taxCode,
            ].some((value) =>
              value.toLocaleLowerCase("vi").includes(supplierNeedle),
            );
          const matchesContract =
            !contractNeedle ||
            supplier.periodTransactions.some((item) =>
              item.contractNo.toLocaleLowerCase("vi").includes(contractNeedle),
            );
          return (
            matchesSupplier &&
            matchesContract &&
            (!onlyClosing ||
              supplier.closingDebit > 0 ||
              supplier.closingCredit > 0)
          );
        }),
    [contractQuery, currencyView, fromDate, onlyClosing, supplierQuery, toDate],
  );

  const selectedSupplier =
    summaries.find((supplier) => supplier.id === selectedSupplierId) ??
    summaries[0];
  const transactions = useMemo(
    () =>
      summaries.flatMap((supplier) =>
        supplier.periodTransactions.map((item) => ({
          ...item,
          supplierCode: supplier.supplierCode,
          supplierName: supplier.supplierName,
        })),
      ),
    [summaries],
  );

  useEffect(() => {
    if (
      summaries.length &&
      !summaries.some((supplier) => supplier.id === selectedSupplierId)
    )
      setSelectedSupplierId(summaries[0].id);
  }, [selectedSupplierId, summaries]);

  function changeTab(tab: PayableTab) {
    void router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, view: "payable", tab },
      },
      undefined,
      { shallow: true },
    );
  }
  function setYear(year: number) {
    setFromDate(`${year}-01-01`);
    setToDate(`${year}-12-31`);
  }
  function resetFilters() {
    setFromDate("2026-07-01");
    setToDate("2026-07-14");
    setCurrencyView("VND");
    setSupplierQuery("");
    setContractQuery("");
    setOnlyClosing(false);
  }

  return (
    <div className="workspace receivable-workspace">
      <div className="breadcrumb">
        <a className="breadcrumb-link" href="/">
          Trang chủ
        </a>
        <span>/</span>
        <a className="breadcrumb-link" href="/modules/receivables">
          Công nợ
        </a>
        <span>/</span>
        <span>BC công nợ nhà cung cấp TK331</span>
      </div>
      <div className="receivable-page-head">
        <div className="receivable-page-heading">
          <a
            className="button receivable-back-button"
            href="/modules/receivables"
          >
            <AppIcon name="ArrowLeft" />{" "}
          </a>
          <div>
            <div className="eyebrow">Tài khoản phải trả</div>
            <h2>BC công nợ nhà cung cấp TK331</h2>
            <p>Chọn một tab để xem bảng công nợ phải trả tương ứng.</p>
          </div>
        </div>
        <div className="receivable-page-actions">
          <button
            className="button"
            type="button"
            onClick={() => window.print()}
          >
            <AppIcon name="Printer" /> In
          </button>
          <button className="button" type="button">
            <AppIcon name="Upload" /> Xuất dữ liệu
          </button>
        </div>
      </div>
      <section className="panel receivable-panel">
        <div
          className="receivable-tabs"
          role="tablist"
          aria-label="Chi tiết công nợ phải trả"
        >
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.key ? "is-active" : ""}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              key={tab.key}
              onClick={() => changeTab(tab.key)}
            >
              <span className="receivable-tab-icon">
                <AppIcon name={tab.icon} />
              </span>
              <span className="receivable-tab-copy">
                <strong>{tab.label}</strong>
                <small>{tab.description}</small>
              </span>
            </button>
          ))}
        </div>
        <div className="workit-filter-panel">
          <div className="workit-filter-row">
            <label>
              <span>Từ ngày</span>
              <input
                className="field"
                type="date"
                value={fromDate}
                onChange={(event) => setFromDate(event.target.value)}
              />
            </label>
            <label>
              <span>Đến ngày</span>
              <input
                className="field"
                type="date"
                value={toDate}
                onChange={(event) => setToDate(event.target.value)}
              />
            </label>
            <button
              className="period-button is-active"
              type="button"
              onClick={() => setYear(2026)}
            >
              Năm 2026
            </button>
            <button
              className="period-button"
              type="button"
              onClick={() => setYear(2025)}
            >
              Năm 2025
            </button>
            <label>
              <span>Tiền tệ</span>
              <select
                className="field"
                value={currencyView}
                onChange={(event) =>
                  setCurrencyView(event.target.value as CurrencyView)
                }
              >
                <option>VND</option>
                <option>NT</option>
                <option>VND+NT</option>
              </select>
            </label>
            <label>
              <span>Tài khoản</span>
              <input className="field" value="331" readOnly />
            </label>
            <button
              className="button primary button-sm workit-search-button"
              type="button"
            >
              Tìm
            </button>
          </div>
          <div className="workit-filter-row workit-filter-row--secondary">
            <label className="factor-field">
              <span>Yếu tố 1 · Nhà cung cấp</span>
              <span className="search-with-icon">
                <AppIcon name="Search" size={16} />
                <input
                  className="search"
                  value={supplierQuery}
                  onChange={(event) => setSupplierQuery(event.target.value)}
                  placeholder="Mã, tên hoặc MST nhà cung cấp"
                />
              </span>
            </label>
            <label className="factor-field">
              <span>Yếu tố 2 · Hợp đồng</span>
              <span className="search-with-icon">
                <AppIcon name="Search" size={16} />
                <input
                  className="search"
                  value={contractQuery}
                  onChange={(event) => setContractQuery(event.target.value)}
                  placeholder="Số hợp đồng mua"
                />
              </span>
            </label>
            <label className="closing-checkbox">
              <input
                type="checkbox"
                checked={onlyClosing}
                onChange={(event) => setOnlyClosing(event.target.checked)}
              />{" "}
              Chỉ xem đối tượng có số dư cuối
            </label>
            <button className="button" type="button" onClick={resetFilters}>
              <AppIcon name="RefreshCw" size={16} /> Đặt lại
            </button>
          </div>
        </div>
        {activeTab === "supplier" ? (
          <SupplierMasterDetail
            rows={summaries}
            selected={selectedSupplier}
            selectedId={selectedSupplierId}
            onSelect={setSelectedSupplierId}
            currencyView={currencyView}
          />
        ) : null}
        {activeTab === "invoice" ? (
          <PayableInvoiceTable
            rows={transactions}
            currencyView={currencyView}
          />
        ) : null}
        {activeTab === "contract" ? (
          <PayableContractTable
            rows={transactions}
            currencyView={currencyView}
          />
        ) : null}
        {activeTab === "aging" ? (
          <PayableAgingTable rows={transactions} currencyView={currencyView} />
        ) : null}
      </section>
    </div>
  );
}

function SupplierMasterDetail({
  rows,
  selected,
  selectedId,
  onSelect,
  currencyView,
}: {
  rows: PayableSummary[];
  selected?: PayableSummary;
  selectedId: string;
  onSelect: (id: string) => void;
  currencyView: CurrencyView;
}) {
  const totals = rows.reduce(
    (sum, row) => ({
      openingDebit: sum.openingDebit + row.openingDebit,
      openingCredit: sum.openingCredit + row.openingCredit,
      periodDebit: sum.periodDebit + row.periodDebit,
      periodCredit: sum.periodCredit + row.periodCredit,
      closingDebit: sum.closingDebit + row.closingDebit,
      closingCredit: sum.closingCredit + row.closingCredit,
      openingForeignDebit: sum.openingForeignDebit + row.openingForeignDebit,
      openingForeignCredit: sum.openingForeignCredit + row.openingForeignCredit,
      periodForeignDebit: sum.periodForeignDebit + row.periodForeignDebit,
      periodForeignCredit: sum.periodForeignCredit + row.periodForeignCredit,
      closingForeignDebit: sum.closingForeignDebit + row.closingForeignDebit,
      closingForeignCredit: sum.closingForeignCredit + row.closingForeignCredit,
    }),
    {
      openingDebit: 0,
      openingCredit: 0,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: 0,
      closingCredit: 0,
      openingForeignDebit: 0,
      openingForeignCredit: 0,
      periodForeignDebit: 0,
      periodForeignCredit: 0,
      closingForeignDebit: 0,
      closingForeignCredit: 0,
    },
  );
  const suffix = currencyView === "NT" ? " NTệ" : "";
  return (
    <>
      <div className="workit-grid-scroll workit-master-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th>Mã TK</th>
              <th>Tên nhà cung cấp</th>
              {currencyView === "VND+NT" ? (
                <>
                  <th>Dư đầu Nợ NTệ</th>
                  <th>Dư đầu Nợ</th>
                  <th>Dư đầu Có NTệ</th>
                  <th>Dư đầu Có</th>
                  <th>PS Nợ NTệ</th>
                  <th>PS Nợ</th>
                  <th>PS Có NTệ</th>
                  <th>PS Có</th>
                  <th>Dư cuối Nợ NTệ</th>
                  <th>Dư cuối Nợ</th>
                  <th>Dư cuối Có NTệ</th>
                  <th>Dư cuối Có</th>
                </>
              ) : (
                <>
                  <th>Dư đầu Nợ{suffix}</th>
                  <th>Dư đầu Có{suffix}</th>
                  <th>PS Nợ{suffix}</th>
                  <th>PS Có{suffix}</th>
                  <th>Dư cuối Nợ{suffix}</th>
                  <th>Dư cuối Có{suffix}</th>
                </>
              )}
              <th>Mã NCC</th>
              <th>MST</th>
              <th>Điện thoại</th>
              <th>Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className={selectedId === row.id ? "is-selected" : ""}
                key={row.id}
                onClick={() => onSelect(row.id)}
              >
                <td>
                  <strong>331</strong>
                </td>
                <td className="customer-name-cell">{row.supplierName}</td>
                {currencyView === "VND+NT" ? (
                  <>
                    <td>{foreignFormat.format(row.openingForeignDebit)}</td>
                    <td>{numberFormat.format(row.openingDebit)}</td>
                    <td>{foreignFormat.format(row.openingForeignCredit)}</td>
                    <td>{numberFormat.format(row.openingCredit)}</td>
                    <td>{foreignFormat.format(row.periodForeignDebit)}</td>
                    <td>{numberFormat.format(row.periodDebit)}</td>
                    <td>{foreignFormat.format(row.periodForeignCredit)}</td>
                    <td>{numberFormat.format(row.periodCredit)}</td>
                    <td>{foreignFormat.format(row.closingForeignDebit)}</td>
                    <td>{numberFormat.format(row.closingDebit)}</td>
                    <td>{foreignFormat.format(row.closingForeignCredit)}</td>
                    <td>{numberFormat.format(row.closingCredit)}</td>
                  </>
                ) : (
                  <>
                    <td>{formatAmount(row.openingDebit, currencyView)}</td>
                    <td>{formatAmount(row.openingCredit, currencyView)}</td>
                    <td>{formatAmount(row.periodDebit, currencyView)}</td>
                    <td>{formatAmount(row.periodCredit, currencyView)}</td>
                    <td>{formatAmount(row.closingDebit, currencyView)}</td>
                    <td>
                      <strong>
                        {formatAmount(row.closingCredit, currencyView)}
                      </strong>
                    </td>
                  </>
                )}
                <td>{row.supplierCode}</td>
                <td>{row.taxCode}</td>
                <td>{row.phone}</td>
                <td>{row.address}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td>
                <strong>Tổng cộng</strong>
              </td>
              {currencyView === "VND+NT" ? (
                <>
                  <td>{foreignFormat.format(totals.openingForeignDebit)}</td>
                  <td>{numberFormat.format(totals.openingDebit)}</td>
                  <td>{foreignFormat.format(totals.openingForeignCredit)}</td>
                  <td>{numberFormat.format(totals.openingCredit)}</td>
                  <td>{foreignFormat.format(totals.periodForeignDebit)}</td>
                  <td>{numberFormat.format(totals.periodDebit)}</td>
                  <td>{foreignFormat.format(totals.periodForeignCredit)}</td>
                  <td>{numberFormat.format(totals.periodCredit)}</td>
                  <td>{foreignFormat.format(totals.closingForeignDebit)}</td>
                  <td>{numberFormat.format(totals.closingDebit)}</td>
                  <td>{foreignFormat.format(totals.closingForeignCredit)}</td>
                  <td>{numberFormat.format(totals.closingCredit)}</td>
                </>
              ) : (
                <>
                  <td>{formatAmount(totals.openingDebit, currencyView)}</td>
                  <td>{formatAmount(totals.openingCredit, currencyView)}</td>
                  <td>{formatAmount(totals.periodDebit, currencyView)}</td>
                  <td>{formatAmount(totals.periodCredit, currencyView)}</td>
                  <td>{formatAmount(totals.closingDebit, currencyView)}</td>
                  <td>{formatAmount(totals.closingCredit, currencyView)}</td>
                </>
              )}
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="workit-detail-heading">
        <div>
          <strong>Chi tiết chứng từ nhà cung cấp</strong>
          <span>
            {selected
              ? `${selected.supplierCode} · ${selected.supplierName}`
              : "Chọn nhà cung cấp"}
          </span>
        </div>
        <span>{selected?.periodTransactions.length ?? 0} dòng</span>
      </div>
      <div className="workit-grid-scroll workit-detail-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th>Mã CT</th>
              <th>Số CT</th>
              <th>Ngày CT</th>
              <th>Số hóa đơn</th>
              <th>Ngày hóa đơn</th>
              <th>Hợp đồng</th>
              {currencyView !== "VND" ? (
                <>
                  <th>Loại tiền</th>
                  <th>Tỷ giá</th>
                </>
              ) : null}
              <th>PS Nợ</th>
              <th>PS Có</th>
              <th>Diễn giải</th>
            </tr>
          </thead>
          <tbody>
            {selected?.periodTransactions.map((item) => (
              <tr key={item.id}>
                <td>{item.voucherType}</td>
                <td>{item.voucherNo}</td>
                <td>{formatDate(item.voucherDate)}</td>
                <td>{item.invoiceNo}</td>
                <td>{formatDate(item.invoiceDate)}</td>
                <td>{item.contractNo}</td>
                {currencyView !== "VND" ? (
                  <>
                    <td>{item.currencyCode}</td>
                    <td>{numberFormat.format(item.exchangeRate)}</td>
                  </>
                ) : null}
                <td>
                  {formatAmount(
                    currencyView === "NT"
                      ? item.foreignDebitAmount
                      : item.debitAmount,
                    currencyView,
                  )}
                </td>
                <td>
                  {formatAmount(
                    currencyView === "NT"
                      ? item.foreignCreditAmount
                      : item.creditAmount,
                    currencyView,
                  )}
                </td>
                <td>{item.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

type PayableTransactionView = PayableTransactionMock & {
  supplierCode: string;
  supplierName: string;
};
function GridHeading({ title, view }: { title: string; view: CurrencyView }) {
  return (
    <div className="workit-detail-heading">
      <strong>{title}</strong>
      <span>
        Đơn vị:{" "}
        {view === "NT"
          ? "Nguyên tệ"
          : view === "VND+NT"
            ? "VND và nguyên tệ"
            : "VND"}
      </span>
    </div>
  );
}
function PayableInvoiceTable({
  rows,
  currencyView,
}: {
  rows: PayableTransactionView[];
  currencyView: CurrencyView;
}) {
  return (
    <>
      <GridHeading
        title={`${rows.length} dòng chứng từ theo hóa đơn mua`}
        view={currencyView}
      />
      <div className="workit-grid-scroll workit-single-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th>Mã NCC</th>
              <th>Nhà cung cấp</th>
              <th>Số hóa đơn</th>
              <th>Ngày hóa đơn</th>
              <th>Ngày CT</th>
              <th>Số CT</th>
              <th>Hợp đồng</th>
              <th>PS Nợ</th>
              <th>PS Có</th>
              <th>Diễn giải</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.supplierCode}</td>
                <td>{row.supplierName}</td>
                <td>
                  <strong>{row.invoiceNo}</strong>
                </td>
                <td>{formatDate(row.invoiceDate)}</td>
                <td>{formatDate(row.voucherDate)}</td>
                <td>{row.voucherNo}</td>
                <td>{row.contractNo}</td>
                <td>
                  {formatAmount(
                    currencyView === "NT"
                      ? row.foreignDebitAmount
                      : row.debitAmount,
                    currencyView,
                  )}
                </td>
                <td>
                  {formatAmount(
                    currencyView === "NT"
                      ? row.foreignCreditAmount
                      : row.creditAmount,
                    currencyView,
                  )}
                </td>
                <td>{row.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function PayableContractTable({
  rows,
  currencyView,
}: {
  rows: PayableTransactionView[];
  currencyView: CurrencyView;
}) {
  const groups = Object.values(
    rows.reduce<
      Record<
        string,
        {
          contractNo: string;
          supplierCode: string;
          supplierName: string;
          count: number;
          debit: number;
          credit: number;
        }
      >
    >((result, row) => {
      const current = result[row.contractNo] ?? {
        contractNo: row.contractNo,
        supplierCode: row.supplierCode,
        supplierName: row.supplierName,
        count: 0,
        debit: 0,
        credit: 0,
      };
      current.count += 1;
      current.debit +=
        currencyView === "NT" ? row.foreignDebitAmount : row.debitAmount;
      current.credit +=
        currencyView === "NT" ? row.foreignCreditAmount : row.creditAmount;
      result[row.contractNo] = current;
      return result;
    }, {}),
  );
  return (
    <>
      <GridHeading
        title={`${groups.length} hợp đồng mua có phát sinh`}
        view={currencyView}
      />
      <div className="workit-grid-scroll workit-single-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th>Hợp đồng</th>
              <th>Mã NCC</th>
              <th>Nhà cung cấp</th>
              <th>Số chứng từ</th>
              <th>PS Nợ</th>
              <th>PS Có</th>
              <th>Còn phải trả</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((row) => (
              <tr key={row.contractNo}>
                <td>
                  <strong>{row.contractNo}</strong>
                </td>
                <td>{row.supplierCode}</td>
                <td>{row.supplierName}</td>
                <td>{row.count}</td>
                <td>{formatAmount(row.debit, currencyView)}</td>
                <td>{formatAmount(row.credit, currencyView)}</td>
                <td>
                  <strong>
                    {formatAmount(
                      Math.max(0, row.credit - row.debit),
                      currencyView,
                    )}
                  </strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function PayableAgingTable({
  rows,
  currencyView,
}: {
  rows: PayableTransactionView[];
  currencyView: CurrencyView;
}) {
  return (
    <>
      <GridHeading
        title={`${rows.length} khoản phải trả theo ngày đến hạn`}
        view={currencyView}
      />
      <div className="workit-grid-scroll workit-single-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th>Mã NCC</th>
              <th>Nhà cung cấp</th>
              <th>Số hóa đơn</th>
              <th>Ngày hóa đơn</th>
              <th>Ngày đến hạn</th>
              <th>Nhóm tuổi nợ</th>
              <th>Số ngày quá hạn</th>
              <th>Còn phải trả</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const aging = getAging(row.dueDate);
              const balance = Math.max(
                0,
                currencyView === "NT"
                  ? row.foreignCreditAmount - row.foreignDebitAmount
                  : row.creditAmount - row.debitAmount,
              );
              return (
                <tr key={row.id}>
                  <td>{row.supplierCode}</td>
                  <td>{row.supplierName}</td>
                  <td>
                    <strong>{row.invoiceNo}</strong>
                  </td>
                  <td>{formatDate(row.invoiceDate)}</td>
                  <td>{formatDate(row.dueDate)}</td>
                  <td>
                    <span className={`deadline-pill ${aging.status}`}>
                      {aging.label}
                    </span>
                  </td>
                  <td>{aging.days || "—"}</td>
                  <td>
                    <strong>{formatAmount(balance, currencyView)}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
