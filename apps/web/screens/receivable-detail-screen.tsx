"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AppIcon } from "../components/icons";
import {
  receivableCustomerMocks,
  type ReceivableCustomerMock,
  type ReceivableTransactionMock,
} from "../lib/receivable-sql-mock-data";

type ReceivableTab = "customer" | "invoice" | "contract" | "aging";
type CurrencyView = "VND" | "NT" | "VND+NT";

type CustomerSummary = ReceivableCustomerMock & {
  periodTransactions: ReceivableTransactionMock[];
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  periodForeignDebit: number;
  periodForeignCredit: number;
  closingForeignDebit: number;
  closingForeignCredit: number;
};

type ReceivableTotals = {
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  openingForeignDebit: number;
  openingForeignCredit: number;
  periodForeignDebit: number;
  periodForeignCredit: number;
  closingForeignDebit: number;
  closingForeignCredit: number;
};

const tabs: Array<{
  key: ReceivableTab;
  label: string;
  description: string;
  icon: string;
}> = [
  {
    key: "customer",
    label: "Theo khách hàng",
    description: "Số dư và phát sinh TK131",
    icon: "User",
  },
  {
    key: "invoice",
    label: "Theo hóa đơn",
    description: "Chi tiết từng hóa đơn",
    icon: "ReceiptText",
  },
  {
    key: "contract",
    label: "Theo hợp đồng",
    description: "Tổng hợp theo hợp đồng",
    icon: "FileText",
  },
  {
    key: "aging",
    label: "Đến hạn & tuổi nợ",
    description: "Đến hạn, quá hạn, tuổi nợ",
    icon: "ShieldCheck",
  },
];

const currency = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });
const foreignCurrency = new Intl.NumberFormat("vi-VN", {
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

function summarizeCustomer(
  customer: ReceivableCustomerMock,
  fromDate: string,
  toDate: string,
  currencyView: CurrencyView,
): CustomerSummary {
  const periodTransactions = customer.transactions.filter(
    (transaction) =>
      transaction.voucherDate >= fromDate &&
      transaction.voucherDate <= toDate &&
      (currencyView !== "NT" || transaction.currencyCode !== "VND"),
  );
  const foreignTransactions = customer.transactions.filter(
    (transaction) =>
      transaction.voucherDate >= fromDate &&
      transaction.voucherDate <= toDate &&
      transaction.currencyCode !== "VND",
  );
  const openingDebit =
    currencyView === "NT"
      ? customer.openingForeignDebit
      : customer.openingDebit;
  const openingCredit =
    currencyView === "NT"
      ? customer.openingForeignCredit
      : customer.openingCredit;
  const periodDebit = periodTransactions.reduce(
    (sum, transaction) =>
      sum +
      (currencyView === "NT"
        ? transaction.foreignDebitAmount
        : transaction.debitAmount),
    0,
  );
  const periodCredit = periodTransactions.reduce(
    (sum, transaction) =>
      sum +
      (currencyView === "NT"
        ? transaction.foreignCreditAmount
        : transaction.creditAmount),
    0,
  );
  const periodForeignDebit = foreignTransactions.reduce(
    (sum, transaction) => sum + transaction.foreignDebitAmount,
    0,
  );
  const periodForeignCredit = foreignTransactions.reduce(
    (sum, transaction) => sum + transaction.foreignCreditAmount,
    0,
  );
  const closingNet = openingDebit - openingCredit + periodDebit - periodCredit;
  const closingForeignNet =
    customer.openingForeignDebit -
    customer.openingForeignCredit +
    periodForeignDebit -
    periodForeignCredit;
  return {
    ...customer,
    openingDebit,
    openingCredit,
    periodTransactions,
    periodDebit,
    periodCredit,
    closingDebit: Math.max(0, closingNet),
    closingCredit: Math.max(0, -closingNet),
    periodForeignDebit,
    periodForeignCredit,
    closingForeignDebit: Math.max(0, closingForeignNet),
    closingForeignCredit: Math.max(0, -closingForeignNet),
  };
}

function getAging(dueDate: string) {
  const days = Math.max(
    0,
    Math.floor((today.getTime() - parseDate(dueDate).getTime()) / 86_400_000),
  );
  if (!days) return { label: "Chưa quá hạn", status: "normal", days };
  if (days <= 30) return { label: "1–30 ngày", status: "soon", days };
  if (days <= 60) return { label: "31–60 ngày", status: "today", days };
  return { label: "Trên 60 ngày", status: "overdue", days };
}

export default function ReceivableDetailScreen() {
  const router = useRouter();
  const routeTab =
    typeof router.query.tab === "string" ? router.query.tab : "customer";
  const activeTab = tabs.some((tab) => tab.key === routeTab)
    ? (routeTab as ReceivableTab)
    : "customer";
  const [fromDate, setFromDate] = useState("2026-07-01");
  const [toDate, setToDate] = useState("2026-07-14");
  const [customerQuery, setCustomerQuery] = useState("");
  const [contractQuery, setContractQuery] = useState("");
  const [currencyView, setCurrencyView] = useState<CurrencyView>("VND");
  const [onlyClosingBalance, setOnlyClosingBalance] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    receivableCustomerMocks[0].id,
  );
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const summaries = useMemo(
    () =>
      receivableCustomerMocks
        .map((customer) =>
          summarizeCustomer(customer, fromDate, toDate, currencyView),
        )
        .filter((customer) => {
          const customerNeedle = customerQuery.trim().toLocaleLowerCase("vi");
          const contractNeedle = contractQuery.trim().toLocaleLowerCase("vi");
          const matchesCustomer =
            !customerNeedle ||
            [
              customer.customerCode,
              customer.customerName,
              customer.taxCode,
            ].some((value) =>
              value.toLocaleLowerCase("vi").includes(customerNeedle),
            );
          const matchesContract =
            !contractNeedle ||
            customer.periodTransactions.some((transaction) =>
              transaction.contractNo
                .toLocaleLowerCase("vi")
                .includes(contractNeedle),
            );
          const matchesBalance =
            !onlyClosingBalance ||
            customer.closingDebit > 0 ||
            customer.closingCredit > 0;
          return matchesCustomer && matchesContract && matchesBalance;
        }),
    [
      contractQuery,
      currencyView,
      customerQuery,
      fromDate,
      onlyClosingBalance,
      toDate,
    ],
  );

  const totals = useMemo(
    () =>
      summaries.reduce(
        (result, customer) => ({
          openingDebit: result.openingDebit + customer.openingDebit,
          openingCredit: result.openingCredit + customer.openingCredit,
          periodDebit: result.periodDebit + customer.periodDebit,
          periodCredit: result.periodCredit + customer.periodCredit,
          closingDebit: result.closingDebit + customer.closingDebit,
          closingCredit: result.closingCredit + customer.closingCredit,
          openingForeignDebit:
            result.openingForeignDebit + customer.openingForeignDebit,
          openingForeignCredit:
            result.openingForeignCredit + customer.openingForeignCredit,
          periodForeignDebit:
            result.periodForeignDebit + customer.periodForeignDebit,
          periodForeignCredit:
            result.periodForeignCredit + customer.periodForeignCredit,
          closingForeignDebit:
            result.closingForeignDebit + customer.closingForeignDebit,
          closingForeignCredit:
            result.closingForeignCredit + customer.closingForeignCredit,
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
      ),
    [summaries],
  );

  const pageCount = Math.max(1, Math.ceil(summaries.length / pageSize));
  const pagedSummaries = summaries.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );
  const selectedCustomer =
    summaries.find((customer) => customer.id === selectedCustomerId) ??
    summaries[0];
  const allTransactions = useMemo(
    () =>
      summaries.flatMap((customer) =>
        customer.periodTransactions.map((transaction) => ({
          ...transaction,
          customerCode: customer.customerCode,
          customerName: customer.customerName,
          customerEmail: customer.email,
        })),
      ),
    [summaries],
  );

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  useEffect(() => {
    if (
      summaries.length &&
      !summaries.some((customer) => customer.id === selectedCustomerId)
    ) {
      setSelectedCustomerId(summaries[0].id);
    }
  }, [selectedCustomerId, summaries]);

  function changeTab(tab: ReceivableTab) {
    void router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, view: "receivable", tab },
      },
      undefined,
      { shallow: true },
    );
  }

  function setYear(year: number) {
    setFromDate(`${year}-01-01`);
    setToDate(`${year}-12-31`);
    setPage(1);
  }

  function resetFilters() {
    setFromDate("2026-07-01");
    setToDate("2026-07-14");
    setCustomerQuery("");
    setContractQuery("");
    setCurrencyView("VND");
    setOnlyClosingBalance(false);
    setPage(1);
  }

  function toggleChecked(id: string) {
    setCheckedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function exportCsv() {
    const heading = [
      "TK",
      "Mã KH",
      "Tên khách hàng",
      "Dư đầu Nợ",
      "Dư đầu Có",
      "PS Nợ",
      "PS Có",
      "Dư cuối Nợ",
      "Dư cuối Có",
      "MST",
    ];
    const lines = summaries.map((item) => [
      item.accountCode,
      item.customerCode,
      item.customerName,
      item.openingDebit,
      item.openingCredit,
      item.periodDebit,
      item.periodCredit,
      item.closingDebit,
      item.closingCredit,
      item.taxCode,
    ]);
    const csv = [heading, ...lines]
      .map((line) =>
        line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cong-no-phai-thu-${fromDate}-${toDate}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
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
        <span>BC công nợ khách hàng TK131</span>
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
            <div className="eyebrow">Tài khoản phải thu</div>
            <h2>BC công nợ khách hàng TK131</h2>
            <p>Chọn một tab để xem bảng công nợ tương ứng.</p>
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
          <button className="button" type="button" onClick={exportCsv}>
            <AppIcon name="Upload" /> Xuất dữ liệu
          </button>
        </div>
      </div>

      <section className="panel receivable-panel">
        <div
          className="receivable-tabs"
          role="tablist"
          aria-label="Chi tiết công nợ phải thu"
        >
          {tabs.map((tab) => (
            <button
              className={activeTab === tab.key ? "is-active" : ""}
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
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
                onChange={(event) => {
                  setFromDate(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              <span>Đến ngày</span>
              <input
                className="field"
                type="date"
                value={toDate}
                onChange={(event) => {
                  setToDate(event.target.value);
                  setPage(1);
                }}
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
                onChange={(event) => {
                  setCurrencyView(event.target.value as CurrencyView);
                  setPage(1);
                }}
              >
                <option value="VND">VND</option>
                <option value="NT">NT</option>
                <option value="VND+NT">VND+NT</option>
              </select>
            </label>
            <label>
              <span>Tài khoản</span>
              <input className="field" value="131" readOnly />
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
              <span>Yếu tố 1 · Khách hàng</span>
              <span className="search-with-icon">
                <AppIcon name="Search" size={16} />
                <input
                  className="search"
                  value={customerQuery}
                  onChange={(event) => {
                    setCustomerQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Mã, tên hoặc MST khách hàng"
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
                  onChange={(event) => {
                    setContractQuery(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Số hợp đồng"
                />
              </span>
            </label>
            <label className="closing-checkbox">
              <input
                type="checkbox"
                checked={onlyClosingBalance}
                onChange={(event) =>
                  setOnlyClosingBalance(event.target.checked)
                }
              />{" "}
              Chỉ xem đối tượng có số dư cuối
            </label>
            <button className="button" type="button" onClick={resetFilters}>
              <AppIcon name="RefreshCw" size={16} /> Đặt lại
            </button>
          </div>
        </div>

        {activeTab === "customer" ? (
          <CustomerMasterDetail
            rows={pagedSummaries}
            selectedCustomer={selectedCustomer}
            selectedCustomerId={selectedCustomerId}
            checkedIds={checkedIds}
            totals={totals}
            page={page}
            pageCount={pageCount}
            totalRows={summaries.length}
            onSelect={setSelectedCustomerId}
            onToggle={toggleChecked}
            onPage={setPage}
            currencyView={currencyView}
          />
        ) : null}
        {activeTab === "invoice" ? (
          <InvoiceTable rows={allTransactions} currencyView={currencyView} />
        ) : null}
        {activeTab === "contract" ? (
          <ContractTable rows={allTransactions} currencyView={currencyView} />
        ) : null}
        {activeTab === "aging" ? (
          <AgingCustomerTable rows={allTransactions} currencyView={currencyView} />
        ) : null}
      </section>
    </div>
  );
}

function formatAmount(value: number, currencyView: CurrencyView) {
  return currencyView === "NT"
    ? foreignCurrency.format(value)
    : currency.format(value);
}

function CustomerMasterDetail({
  rows,
  selectedCustomer,
  selectedCustomerId,
  checkedIds,
  totals,
  page,
  pageCount,
  totalRows,
  onSelect,
  onToggle,
  onPage,
  currencyView,
}: {
  rows: CustomerSummary[];
  selectedCustomer?: CustomerSummary;
  selectedCustomerId: string;
  checkedIds: string[];
  totals: ReceivableTotals;
  page: number;
  pageCount: number;
  totalRows: number;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onPage: (page: number) => void;
  currencyView: CurrencyView;
}) {
  const moneySuffix = currencyView === "NT" ? " NTệ" : "";
  return (
    <>
      <div className="workit-grid-scroll workit-master-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th>Mã TK</th>
              <th className="check-col"></th>
              <th>Tên khách hàng</th>
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
                  <th>Dư đầu Nợ{moneySuffix}</th>
                  <th>Dư đầu Có{moneySuffix}</th>
                  <th>PS Nợ{moneySuffix}</th>
                  <th>PS Có{moneySuffix}</th>
                  <th>Dư cuối Nợ{moneySuffix}</th>
                  <th>Dư cuối Có{moneySuffix}</th>
                </>
              )}
              <th>Mã KH</th>
              <th>Mã số thuế</th>
              <th>Điện thoại</th>
              <th>Địa chỉ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                className={selectedCustomerId === row.id ? "is-selected" : ""}
                key={row.id}
                onClick={() => onSelect(row.id)}
              >
                <td>
                  <strong>{row.accountCode}</strong>
                </td>
                <td className="check-col">
                  <input
                    type="checkbox"
                    checked={checkedIds.includes(row.id)}
                    onChange={() => onToggle(row.id)}
                    onClick={(event) => event.stopPropagation()}
                  />
                </td>
                <td className="customer-name-cell">{row.customerName}</td>
                {currencyView === "VND+NT" ? (
                  <>
                    <td>{foreignCurrency.format(row.openingForeignDebit)}</td>
                    <td>{currency.format(row.openingDebit)}</td>
                    <td>{foreignCurrency.format(row.openingForeignCredit)}</td>
                    <td>{currency.format(row.openingCredit)}</td>
                    <td>{foreignCurrency.format(row.periodForeignDebit)}</td>
                    <td>{currency.format(row.periodDebit)}</td>
                    <td>{foreignCurrency.format(row.periodForeignCredit)}</td>
                    <td>{currency.format(row.periodCredit)}</td>
                    <td>
                      <strong>
                        {foreignCurrency.format(row.closingForeignDebit)}
                      </strong>
                    </td>
                    <td>
                      <strong>{currency.format(row.closingDebit)}</strong>
                    </td>
                    <td>{foreignCurrency.format(row.closingForeignCredit)}</td>
                    <td>{currency.format(row.closingCredit)}</td>
                  </>
                ) : (
                  <>
                    <td>{formatAmount(row.openingDebit, currencyView)}</td>
                    <td>{formatAmount(row.openingCredit, currencyView)}</td>
                    <td>{formatAmount(row.periodDebit, currencyView)}</td>
                    <td>{formatAmount(row.periodCredit, currencyView)}</td>
                    <td>
                      <strong>
                        {formatAmount(row.closingDebit, currencyView)}
                      </strong>
                    </td>
                    <td>{formatAmount(row.closingCredit, currencyView)}</td>
                  </>
                )}
                <td>{row.customerCode}</td>
                <td>{row.taxCode}</td>
                <td>{row.phone}</td>
                <td>{row.address}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td></td>
              <td></td>
              <td>
                <strong>Tổng cộng</strong>
              </td>
              {currencyView === "VND+NT" ? (
                <>
                  <td>{foreignCurrency.format(totals.openingForeignDebit)}</td>
                  <td>{currency.format(totals.openingDebit)}</td>
                  <td>{foreignCurrency.format(totals.openingForeignCredit)}</td>
                  <td>{currency.format(totals.openingCredit)}</td>
                  <td>{foreignCurrency.format(totals.periodForeignDebit)}</td>
                  <td>{currency.format(totals.periodDebit)}</td>
                  <td>{foreignCurrency.format(totals.periodForeignCredit)}</td>
                  <td>{currency.format(totals.periodCredit)}</td>
                  <td>{foreignCurrency.format(totals.closingForeignDebit)}</td>
                  <td>{currency.format(totals.closingDebit)}</td>
                  <td>{foreignCurrency.format(totals.closingForeignCredit)}</td>
                  <td>{currency.format(totals.closingCredit)}</td>
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
      <Pagination
        page={page}
        pageCount={pageCount}
        totalRows={totalRows}
        pageSize={15}
        onPage={onPage}
      />
      <div className="workit-detail-heading">
        <div>
          <strong>Chi tiết chứng từ</strong>
          <span>
            {selectedCustomer
              ? `${selectedCustomer.customerCode} · ${selectedCustomer.customerName}`
              : "Chọn khách hàng ở bảng trên"}
          </span>
        </div>
        <span>{selectedCustomer?.periodTransactions.length ?? 0} dòng</span>
      </div>
      <div className="workit-grid-scroll workit-detail-grid">
        <table className="data-table workit-grid">
          <thead>
            <tr>
              <th></th>
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
              {currencyView === "VND+NT" ? (
                <>
                  <th>PS Nợ</th>
                  <th>PS Nợ NTệ</th>
                  <th>PS Có</th>
                  <th>PS Có NTệ</th>
                </>
              ) : (
                <>
                  <th>PS Nợ{moneySuffix}</th>
                  <th>PS Có{moneySuffix}</th>
                </>
              )}
              <th>Diễn giải</th>
            </tr>
          </thead>
          <tbody>
            {selectedCustomer?.periodTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>
                  <button className="link-button" type="button">
                    Xem
                  </button>
                </td>
                <td>{transaction.voucherType}</td>
                <td>{transaction.voucherNo}</td>
                <td>{formatDate(transaction.voucherDate)}</td>
                <td>{transaction.invoiceNo}</td>
                <td>{formatDate(transaction.invoiceDate)}</td>
                <td>{transaction.contractNo}</td>
                {currencyView !== "VND" ? (
                  <>
                    <td>{transaction.currencyCode}</td>
                    <td>{currency.format(transaction.exchangeRate)}</td>
                  </>
                ) : null}
                {currencyView === "VND+NT" ? (
                  <>
                    <td>{currency.format(transaction.debitAmount)}</td>
                    <td>
                      {foreignCurrency.format(transaction.foreignDebitAmount)}
                    </td>
                    <td>{currency.format(transaction.creditAmount)}</td>
                    <td>
                      {foreignCurrency.format(transaction.foreignCreditAmount)}
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {formatAmount(
                        currencyView === "NT"
                          ? transaction.foreignDebitAmount
                          : transaction.debitAmount,
                        currencyView,
                      )}
                    </td>
                    <td>
                      {formatAmount(
                        currencyView === "NT"
                          ? transaction.foreignCreditAmount
                          : transaction.creditAmount,
                        currencyView,
                      )}
                    </td>
                  </>
                )}
                <td>{transaction.memo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        page={1}
        pageCount={1}
        totalRows={selectedCustomer?.periodTransactions.length ?? 0}
        pageSize={50}
        onPage={() => undefined}
      />
    </>
  );
}

function Pagination({
  page,
  pageCount,
  totalRows,
  pageSize,
  onPage,
}: {
  page: number;
  pageCount: number;
  totalRows: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="workit-pagination">
      <div>
        <button type="button" disabled={page <= 1} onClick={() => onPage(1)}>
          «
        </button>
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
        >
          ‹
        </button>
        {Array.from(
          { length: Math.min(5, pageCount) },
          (_, index) => index + 1,
        ).map((item) => (
          <button
            className={page === item ? "is-active" : ""}
            type="button"
            key={item}
            onClick={() => onPage(item)}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
        >
          ›
        </button>
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPage(pageCount)}
        >
          »
        </button>
        <span>{pageSize} dòng / trang</span>
      </div>
      <span>
        {totalRows
          ? `${(page - 1) * pageSize + 1} - ${Math.min(page * pageSize, totalRows)} / ${totalRows} dòng`
          : "0 dòng"}
      </span>
    </div>
  );
}

type TransactionView = ReceivableTransactionMock & {
  customerCode: string;
  customerName: string;
  customerEmail: string;
};

function InvoiceTable({
  rows,
  currencyView,
}: {
  rows: TransactionView[];
  currencyView: CurrencyView;
}) {
  return (
    <SimpleGrid
      heading={`${rows.length} dòng chứng từ theo hóa đơn`}
      currencyView={currencyView}
    >
      <table className="data-table workit-grid">
        <thead>
          <tr>
            <th>Mã KH</th>
            <th>Khách hàng</th>
            <th>Số hóa đơn</th>
            <th>Ngày hóa đơn</th>
            <th>Ngày CT</th>
            <th>Số CT</th>
            <th>Hợp đồng</th>
            {currencyView !== "VND" ? (
              <>
                <th>Loại tiền</th>
                <th>Tỷ giá</th>
              </>
            ) : null}
            {currencyView === "VND+NT" ? (
              <>
                <th>PS Nợ</th>
                <th>PS Nợ NTệ</th>
                <th>PS Có</th>
                <th>PS Có NTệ</th>
              </>
            ) : (
              <>
                <th>PS Nợ{currencyView === "NT" ? " NTệ" : ""}</th>
                <th>PS Có{currencyView === "NT" ? " NTệ" : ""}</th>
              </>
            )}
            <th>Diễn giải</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.customerCode}</td>
              <td>{row.customerName}</td>
              <td>
                <strong>{row.invoiceNo}</strong>
              </td>
              <td>{formatDate(row.invoiceDate)}</td>
              <td>{formatDate(row.voucherDate)}</td>
              <td>{row.voucherNo}</td>
              <td>{row.contractNo}</td>
              {currencyView !== "VND" ? (
                <>
                  <td>{row.currencyCode}</td>
                  <td>{currency.format(row.exchangeRate)}</td>
                </>
              ) : null}
              {currencyView === "VND+NT" ? (
                <>
                  <td>{currency.format(row.debitAmount)}</td>
                  <td>{foreignCurrency.format(row.foreignDebitAmount)}</td>
                  <td>{currency.format(row.creditAmount)}</td>
                  <td>{foreignCurrency.format(row.foreignCreditAmount)}</td>
                </>
              ) : (
                <>
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
                </>
              )}
              <td>{row.memo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </SimpleGrid>
  );
}

function ContractTable({
  rows,
  currencyView,
}: {
  rows: TransactionView[];
  currencyView: CurrencyView;
}) {
  const groups = Object.values(
    rows.reduce<
      Record<
        string,
        {
          contractNo: string;
          customerCode: string;
          customerName: string;
          documents: number;
          debit: number;
          credit: number;
          foreignDebit: number;
          foreignCredit: number;
        }
      >
    >((result, row) => {
      const current = result[row.contractNo] ?? {
        contractNo: row.contractNo,
        customerCode: row.customerCode,
        customerName: row.customerName,
        documents: 0,
        debit: 0,
        credit: 0,
        foreignDebit: 0,
        foreignCredit: 0,
      };
      current.documents += 1;
      current.debit += row.debitAmount;
      current.credit += row.creditAmount;
      current.foreignDebit += row.foreignDebitAmount;
      current.foreignCredit += row.foreignCreditAmount;
      result[row.contractNo] = current;
      return result;
    }, {}),
  );
  return (
    <SimpleGrid
      heading={`${groups.length} hợp đồng có phát sinh`}
      currencyView={currencyView}
    >
      <table className="data-table workit-grid">
        <thead>
          <tr>
            <th>Số hợp đồng</th>
            <th>Mã KH</th>
            <th>Khách hàng</th>
            <th>Số chứng từ</th>
            {currencyView === "VND+NT" ? (
              <>
                <th>PS Nợ NTệ</th>
                <th>PS Nợ</th>
                <th>PS Có NTệ</th>
                <th>PS Có</th>
              </>
            ) : (
              <>
                <th>PS Nợ{currencyView === "NT" ? " NTệ" : ""}</th>
                <th>PS Có{currencyView === "NT" ? " NTệ" : ""}</th>
              </>
            )}
            <th>Chênh lệch</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((row) => (
            <tr key={row.contractNo}>
              <td>
                <strong>{row.contractNo}</strong>
              </td>
              <td>{row.customerCode}</td>
              <td>{row.customerName}</td>
              <td>{row.documents}</td>
              {currencyView === "VND+NT" ? (
                <>
                  <td>{foreignCurrency.format(row.foreignDebit)}</td>
                  <td>{currency.format(row.debit)}</td>
                  <td>{foreignCurrency.format(row.foreignCredit)}</td>
                  <td>{currency.format(row.credit)}</td>
                </>
              ) : (
                <>
                  <td>
                    {formatAmount(
                      currencyView === "NT" ? row.foreignDebit : row.debit,
                      currencyView,
                    )}
                  </td>
                  <td>
                    {formatAmount(
                      currencyView === "NT" ? row.foreignCredit : row.credit,
                      currencyView,
                    )}
                  </td>
                </>
              )}
              <td>
                <strong>
                  {formatAmount(
                    currencyView === "NT"
                      ? row.foreignDebit - row.foreignCredit
                      : row.debit - row.credit,
                    currencyView,
                  )}
                </strong>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </SimpleGrid>
  );
}

type AgingInvoice = {
  id: string;
  customerCode: string;
  customerName: string;
  customerEmail: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  currencyCode: string;
  exchangeRate: number;
  debit: number;
  credit: number;
  foreignDebit: number;
  foreignCredit: number;
};

type AgingCustomerGroup = {
  customerCode: string;
  customerName: string;
  customerEmail: string;
  invoices: AgingInvoice[];
  notDueCount: number;
  overdueCount: number;
  oldestOverdueDays: number;
  totalBalance: number;
  totalForeignBalance: number;
};

function agingLevelFromDays(days: number) {
  if (days <= 0) return { label: "Chưa quá hạn", status: "normal" };
  if (days <= 30) return { label: "1–30 ngày", status: "soon" };
  if (days <= 60) return { label: "31–60 ngày", status: "today" };
  return { label: "Trên 60 ngày", status: "overdue" };
}

function AgingCustomerTable({
  rows,
  currencyView,
}: {
  rows: TransactionView[];
  currencyView: CurrencyView;
}) {
  const invoices = useMemo(
    () =>
      Object.values(
        rows.reduce<Record<string, AgingInvoice>>((result, row) => {
          const key = `${row.customerCode}-${row.invoiceNo}`;
          const current = result[key] ?? {
            id: key,
            customerCode: row.customerCode,
            customerName: row.customerName,
            customerEmail: row.customerEmail,
            invoiceNo: row.invoiceNo,
            invoiceDate: row.invoiceDate,
            dueDate: row.dueDate,
            currencyCode: row.currencyCode,
            exchangeRate: row.exchangeRate,
            debit: 0,
            credit: 0,
            foreignDebit: 0,
            foreignCredit: 0,
          };
          current.invoiceDate = current.invoiceDate < row.invoiceDate ? current.invoiceDate : row.invoiceDate;
          current.dueDate = current.dueDate < row.dueDate ? current.dueDate : row.dueDate;
          current.debit += row.debitAmount;
          current.credit += row.creditAmount;
          current.foreignDebit += row.foreignDebitAmount;
          current.foreignCredit += row.foreignCreditAmount;
          result[key] = current;
          return result;
        }, {}),
      ),
    [rows],
  );

  const customerGroups = useMemo(
    () =>
      Object.values(
        invoices.reduce<Record<string, AgingCustomerGroup>>((result, invoice) => {
          const aging = getAging(invoice.dueDate);
          const current = result[invoice.customerCode] ?? {
            customerCode: invoice.customerCode,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail,
            invoices: [],
            notDueCount: 0,
            overdueCount: 0,
            oldestOverdueDays: 0,
            totalBalance: 0,
            totalForeignBalance: 0,
          };
          current.invoices.push(invoice);
          current.totalBalance += Math.max(0, invoice.debit - invoice.credit);
          current.totalForeignBalance += Math.max(0, invoice.foreignDebit - invoice.foreignCredit);
          if (aging.days > 0) {
            current.overdueCount += 1;
            current.oldestOverdueDays = Math.max(current.oldestOverdueDays, aging.days);
          } else {
            current.notDueCount += 1;
          }
          result[invoice.customerCode] = current;
          return result;
        }, {}),
      ),
    [invoices],
  );

  const [selectedCustomerCode, setSelectedCustomerCode] = useState(customerGroups[0]?.customerCode ?? "");
  const selectedGroup = customerGroups.find((group) => group.customerCode === selectedCustomerCode) ?? customerGroups[0];
  const [reminderGroup, setReminderGroup] = useState<AgingCustomerGroup | null>(null);
  const [reminderRecipient, setReminderRecipient] = useState("");
  const [reminderSubject, setReminderSubject] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");
  const [reminderStatus, setReminderStatus] = useState("");

  function openReminder(group: AgingCustomerGroup) {
    const overdueInvoices = group.invoices.filter((invoice) => getAging(invoice.dueDate).days > 0);
    setSelectedCustomerCode(group.customerCode);
    setReminderGroup(group);
    setReminderRecipient(group.customerEmail);
    setReminderSubject(`[NetViet] Thông báo công nợ quá hạn - ${group.customerCode}`);
    setReminderMessage(
      `Kính gửi ${group.customerName},\n\nTheo đối chiếu công nợ đến ngày 14/07/2026, Quý công ty hiện có ${overdueInvoices.length} hóa đơn quá hạn, tổng dư nợ ${currency.format(group.totalBalance)} VND.\n\nCác hóa đơn cần lưu ý: ${overdueInvoices.map((invoice) => invoice.invoiceNo).join(", ") || "Không có"}.\n\nKính đề nghị Quý công ty kiểm tra và phản hồi kế hoạch thanh toán.\n\nTrân trọng,\nPhòng Kế toán NetViet`,
    );
    setReminderStatus("");
  }

  function openEmailClient() {
    if (!reminderRecipient.trim() || !reminderRecipient.includes("@")) {
      setReminderStatus("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    const mailto = `mailto:${encodeURIComponent(reminderRecipient)}?subject=${encodeURIComponent(reminderSubject)}&body=${encodeURIComponent(reminderMessage)}`;
    window.location.href = mailto;
    setReminderStatus("Đã mở ứng dụng email. Vui lòng kiểm tra nội dung và nhấn Gửi trong ứng dụng email.");
  }

  useEffect(() => {
    if (customerGroups.length && !customerGroups.some((group) => group.customerCode === selectedCustomerCode)) {
      setSelectedCustomerCode(customerGroups[0].customerCode);
    }
  }, [customerGroups, selectedCustomerCode]);

  return (
    <>
      <div className="workit-detail-heading">
        <div>
          <strong>{customerGroups.length} khách hàng được phân loại tuổi nợ</strong>
          <span>Nhấn vào một khách hàng để xem toàn bộ hóa đơn ở bảng dưới.</span>
        </div>
        <span>Đơn vị: {currencyView === "NT" ? "Nguyên tệ" : currencyView === "VND+NT" ? "VND và nguyên tệ" : "VND"}</span>
      </div>
      <div className="workit-grid-scroll aging-customer-grid">
        <table className="data-table workit-grid">
          <thead><tr><th>Mã KH</th><th>Khách hàng</th><th>Số hóa đơn</th><th>HĐ chưa quá hạn</th><th>HĐ quá hạn</th><th>Quá hạn lâu nhất</th><th>Mức tuổi nợ cao nhất</th>{currencyView === "VND+NT" ? <><th>Tổng còn NTệ</th><th>Tổng còn VND</th></> : <th>Tổng còn phải thu{currencyView === "NT" ? " NTệ" : ""}</th>}<th>Nhắc nợ</th></tr></thead>
          <tbody>
            {customerGroups.map((group) => {
              const highestAging = agingLevelFromDays(group.oldestOverdueDays);
              return <tr className={selectedGroup?.customerCode === group.customerCode ? "is-selected" : ""} key={group.customerCode} onClick={() => setSelectedCustomerCode(group.customerCode)}><td><strong>{group.customerCode}</strong></td><td>{group.customerName}</td><td><strong>{group.invoices.length}</strong></td><td>{group.notDueCount}</td><td>{group.overdueCount}</td><td>{group.oldestOverdueDays ? `${group.oldestOverdueDays} ngày` : "—"}</td><td><span className={`deadline-pill ${highestAging.status}`}>{highestAging.label}</span></td>{currencyView === "VND+NT" ? <><td>{foreignCurrency.format(group.totalForeignBalance)}</td><td>{currency.format(group.totalBalance)}</td></> : <td><strong>{formatAmount(currencyView === "NT" ? group.totalForeignBalance : group.totalBalance, currencyView)}</strong></td>}<td><button className="reminder-detail-button" type="button" onClick={(event) => { event.stopPropagation(); openReminder(group); }}>Chi tiết</button></td></tr>;
            })}
          </tbody>
        </table>
      </div>

      <div className="workit-detail-heading">
        <div><strong>Hóa đơn của khách hàng</strong><span>{selectedGroup ? `${selectedGroup.customerCode} · ${selectedGroup.customerName}` : "Không có khách hàng phù hợp"}</span></div>
        <span>{selectedGroup?.invoices.length ?? 0} hóa đơn</span>
      </div>
      <div className="workit-grid-scroll aging-invoice-grid">
        <table className="data-table workit-grid">
          <thead><tr><th>Số hóa đơn</th><th>Ngày hóa đơn</th><th>Ngày đến hạn</th><th>Loại tiền</th><th>Tỷ giá</th><th>Nhóm tuổi nợ</th><th>Số ngày quá hạn</th>{currencyView === "VND+NT" ? <><th>Còn phải thu NTệ</th><th>Còn phải thu VND</th></> : <th>Còn phải thu{currencyView === "NT" ? " NTệ" : ""}</th>}</tr></thead>
          <tbody>
            {selectedGroup?.invoices.map((invoice) => {
              const aging = getAging(invoice.dueDate);
              const balance = Math.max(0, invoice.debit - invoice.credit);
              const foreignBalance = Math.max(0, invoice.foreignDebit - invoice.foreignCredit);
              return <tr key={invoice.id}><td><strong>{invoice.invoiceNo}</strong></td><td>{formatDate(invoice.invoiceDate)}</td><td>{formatDate(invoice.dueDate)}</td><td>{invoice.currencyCode}</td><td>{currency.format(invoice.exchangeRate)}</td><td><span className={`deadline-pill ${aging.status}`}>{aging.label}</span></td><td>{aging.days || "—"}</td>{currencyView === "VND+NT" ? <><td>{foreignCurrency.format(foreignBalance)}</td><td>{currency.format(balance)}</td></> : <td><strong>{formatAmount(currencyView === "NT" ? foreignBalance : balance, currencyView)}</strong></td>}</tr>;
            })}
          </tbody>
        </table>
      </div>

      {reminderGroup ? (
        <div className="receivable-reminder-backdrop" role="presentation" onMouseDown={() => setReminderGroup(null)}>
          <section className="receivable-reminder-dialog" role="dialog" aria-modal="true" aria-labelledby="reminder-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="receivable-reminder-head">
              <div><div className="eyebrow">Nhắc nợ khách hàng</div><h2 id="reminder-dialog-title">Chi tiết email nhắc nợ</h2><p>{reminderGroup.customerCode} · {reminderGroup.customerName}</p></div>
              <button className="button button-sm" type="button" onClick={() => setReminderGroup(null)}>Đóng</button>
            </div>
            <div className="receivable-reminder-summary">
              <span><small>Số hóa đơn</small><strong>{reminderGroup.invoices.length}</strong></span>
              <span><small>Hóa đơn quá hạn</small><strong>{reminderGroup.overdueCount}</strong></span>
              <span><small>Tổng còn phải thu</small><strong>{currency.format(reminderGroup.totalBalance)} VND</strong></span>
            </div>
            <label className="reminder-field"><span>Email người nhận</span><input className="field" type="email" value={reminderRecipient} onChange={(event) => setReminderRecipient(event.target.value)} /></label>
            <label className="reminder-field"><span>Tiêu đề</span><input className="field" value={reminderSubject} onChange={(event) => setReminderSubject(event.target.value)} /></label>
            <label className="reminder-field"><span>Nội dung nhắc nợ</span><textarea className="field reminder-message" value={reminderMessage} onChange={(event) => setReminderMessage(event.target.value)} /></label>
            {reminderStatus ? <div className="reminder-feedback">{reminderStatus}</div> : null}
            <div className="receivable-reminder-actions"><button className="button" type="button" onClick={() => setReminderGroup(null)}>Hủy</button><button className="button primary" type="button" onClick={openEmailClient}><AppIcon name="Send" /> Mở email để gửi</button></div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function AgingTable({
  rows,
  currencyView,
}: {
  rows: TransactionView[];
  currencyView: CurrencyView;
}) {
  return (
    <SimpleGrid
      heading={`${rows.length} khoản được phân loại theo ngày đến hạn`}
      currencyView={currencyView}
    >
      <table className="data-table workit-grid">
        <thead>
          <tr>
            <th>Mã KH</th>
            <th>Khách hàng</th>
            <th>Số hóa đơn</th>
            <th>Ngày hóa đơn</th>
            <th>Ngày đến hạn</th>
            <th>Nhóm tuổi nợ</th>
            <th>Số ngày quá hạn</th>
            {currencyView === "VND+NT" ? (
              <>
                <th>Giá trị NTệ</th>
                <th>Giá trị VND</th>
              </>
            ) : (
              <th>Giá trị còn theo dõi{currencyView === "NT" ? " NTệ" : ""}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const aging = getAging(row.dueDate);
            const amount = Math.max(0, row.debitAmount - row.creditAmount);
            const foreignAmount = Math.max(
              0,
              row.foreignDebitAmount - row.foreignCreditAmount,
            );
            return (
              <tr key={row.id}>
                <td>{row.customerCode}</td>
                <td>{row.customerName}</td>
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
                {currencyView === "VND+NT" ? (
                  <>
                    <td>{foreignCurrency.format(foreignAmount)}</td>
                    <td>{currency.format(amount)}</td>
                  </>
                ) : (
                  <td>
                    {formatAmount(
                      currencyView === "NT" ? foreignAmount : amount,
                      currencyView,
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </SimpleGrid>
  );
}

function SimpleGrid({
  heading,
  children,
  currencyView,
}: {
  heading: string;
  children: React.ReactNode;
  currencyView: CurrencyView;
}) {
  return (
    <>
      <div className="workit-detail-heading">
        <strong>{heading}</strong>
        <span>
          Đơn vị:{" "}
          {currencyView === "NT"
            ? "Nguyên tệ"
            : currencyView === "VND+NT"
              ? "VND và nguyên tệ"
              : "VND"}
        </span>
      </div>
      <div className="workit-grid-scroll workit-single-grid">{children}</div>
    </>
  );
}
