import { useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  maximumFractionDigits: 0,
});

const foreignFormatter = new Intl.NumberFormat("vi-VN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

type CurrencyMode = "VND" | "NT" | "VND_NT";

type JournalRow = {
  id: string;
  voucherType: string;
  voucherNo: string;
  voucherDate: string;
  invoiceSeries?: string;
  invoiceNo?: string;
  invoiceDate?: string;
  currencyCode: "VND" | "NT";
  amount: number;
  foreignAmount?: number;
  unitName?: string;
  memo: string;
  debitAccount: string;
  debitDimension1?: string;
  debitDimension2?: string;
  creditAccount: string;
  creditDimension1?: string;
  creditDimension2?: string;
  project?: string;
};

type JournalFilterState = {
  fromDate: string;
  toDate: string;
  periodYear: string;
  fromAccount: string;
  toAccount: string;
  objectQuery: string;
  currencyCode: CurrencyMode;
};

type JournalAmountColumn = {
  key: string;
  label: string;
  className?: string;
  render: (row: JournalRow) => string;
  total: (rows: JournalRow[]) => string;
};

const journalRows: JournalRow[] = [
  {
    id: "gj-001",
    voucherType: "PT1",
    voucherNo: "26070001",
    voucherDate: "2026-07-02",
    currencyCode: "VND",
    amount: 10000000,
    unitName: "CÔNG TY CỔ PHẦN 32 (ASEC)",
    memo: "Thu tiền hàng theo hóa đơn số 111",
    debitAccount: "1111",
    creditAccount: "131",
    creditDimension1: "CÔNG TY CỔ PHẦN 32 (ASEC)",
  },
  {
    id: "gj-002",
    voucherType: "PT1",
    voucherNo: "26070002",
    voucherDate: "2026-07-02",
    currencyCode: "VND",
    amount: 15000000,
    unitName: "CÔNG TY CỔ PHẦN ANH THY",
    memo: "Thu hóa đơn ngày 02/07/2026",
    debitAccount: "1111",
    creditAccount: "131",
    creditDimension1: "CÔNG TY CỔ PHẦN ANH THY",
  },
  {
    id: "gj-003",
    voucherType: "HT1",
    voucherNo: "26070002",
    voucherDate: "2026-07-04",
    currencyCode: "VND",
    amount: 50000000,
    memo: "",
    debitAccount: "6421",
    debitDimension1: "Chuyển xà bần, rác xuống chân công trình",
    debitDimension2: "Bộ Phận Hành chính",
    creditAccount: "1111",
  },
  {
    id: "gj-004",
    voucherType: "HT1",
    voucherNo: "26070002",
    voucherDate: "2026-07-04",
    currencyCode: "VND",
    amount: 50000000,
    memo: "",
    debitAccount: "6421",
    debitDimension1: "Chuyển xà bần, rác xuống chân công trình",
    debitDimension2: "Bộ Phận Hành chính",
    creditAccount: "1111",
  },
  {
    id: "gj-005",
    voucherType: "PT1",
    voucherNo: "26070003",
    voucherDate: "2026-07-06",
    currencyCode: "VND",
    amount: 5000000,
    unitName: "CÔNG TY CỔ PHẦN 32 (ASEC)",
    memo: "Thu tiền hàng",
    debitAccount: "1111",
    creditAccount: "131",
    creditDimension1: "CÔNG TY CỔ PHẦN 32 (ASEC)",
  },
  {
    id: "gj-006",
    voucherType: "PN1",
    voucherNo: "26070001",
    voucherDate: "2026-07-08",
    currencyCode: "VND",
    amount: 0,
    memo: "Nhập kho tháng 6/2026",
    debitAccount: "1111",
    creditAccount: "1111",
  },
  {
    id: "gj-007",
    voucherType: "PN1",
    voucherNo: "26070002",
    voucherDate: "2026-07-09",
    currencyCode: "VND",
    amount: 0,
    memo: "Nhập kho năm 2026 t7",
    debitAccount: "1111",
    creditAccount: "1111",
  },
  {
    id: "gj-008",
    voucherType: "PX1",
    voucherNo: "26070001",
    voucherDate: "2026-07-09",
    currencyCode: "VND",
    amount: 0,
    memo: "Xuất hàng T7 2026",
    debitAccount: "1111",
    creditAccount: "1111",
  },
  {
    id: "gj-009",
    voucherType: "NK1",
    voucherNo: "26070009",
    voucherDate: "2026-07-10",
    currencyCode: "NT",
    amount: 0,
    foreignAmount: 24000160,
    unitName: "NCC-NK",
    memo: "Ghi nhận thuế GTGT hàng nhập khẩu bằng ngoại tệ",
    debitAccount: "133",
    creditAccount: "331",
    creditDimension1: "NCC-NK",
    project: "NK-2026",
  },
];

export default function GeneralJournalScreen() {
  const [filters, setFilters] = useState<JournalFilterState>(
    buildInitialFilters(),
  );
  const filteredRows = useMemo(() => filterRows(journalRows, filters), [filters]);
  const amountColumns = useMemo(
    () => buildAmountColumns(filters.currencyCode),
    [filters.currencyCode],
  );

  function chooseYear(periodYear: string) {
    setFilters((current) => ({ ...current, periodYear }));
  }

  function resetFilters() {
    setFilters(buildInitialFilters());
  }

  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting">
            Kế toán
          </a>
          <span>/</span>
          <a
            className="breadcrumb-link"
            href="/modules/accounting/report/general-journal"
          >
            Nhật ký chung
          </a>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Accounting report</div>
            <h2 className="hero-title">Nhật ký chung</h2>
          </div>
          <div className="sync-panel">
            <strong>
              {filteredRows.length}/{journalRows.length} dòng
            </strong>
            <span>
              Kỳ {filters.periodYear}, tiền tệ {getCurrencyLabel(filters.currencyCode)}.
            </span>
          </div>
        </section>

        <div className="section-title">
          <h2>Nhật ký chung</h2>
          <div className="topbar-actions">
            <a className="button" href="/modules/accounting">
              <AppIcon name="ArrowLeft" />
              Quay lại
            </a>
            <button className="button" type="button">
              <AppIcon name="Printer" />
              In
            </button>
          </div>
        </div>

        <section className="panel journal-panel">
          <div className="toolbar journal-toolbar">
            <input
              className="field"
              type="date"
              value={filters.fromDate}
              aria-label="Từ ngày"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  fromDate: event.target.value,
                }))
              }
            />
            <input
              className="field"
              type="date"
              value={filters.toDate}
              aria-label="Đến ngày"
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  toDate: event.target.value,
                }))
              }
            />
            <button
              className={`button ledger-year-button ${
                filters.periodYear === "2026" ? "is-active" : ""
              }`}
              type="button"
              onClick={() => chooseYear("2026")}
            >
              Năm 2026
            </button>
            <button
              className={`button ledger-year-button ${
                filters.periodYear === "2025" ? "is-active" : ""
              }`}
              type="button"
              onClick={() => chooseYear("2025")}
            >
              Năm 2025
            </button>
            <input
              className="search"
              placeholder="Từ TK"
              aria-label="Từ tài khoản"
              value={filters.fromAccount}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  fromAccount: event.target.value,
                }))
              }
            />
            <input
              className="search"
              placeholder="Đến TK"
              aria-label="Đến tài khoản"
              value={filters.toAccount}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  toAccount: event.target.value,
                }))
              }
            />
            <input
              className="search"
              placeholder="Chọn đối tượng"
              aria-label="Chọn đối tượng"
              value={filters.objectQuery}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  objectQuery: event.target.value,
                }))
              }
            />
            <select
              className="field"
              aria-label="Loại tiền"
              value={filters.currencyCode}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  currencyCode: event.target.value as CurrencyMode,
                }))
              }
            >
              <option value="VND">VNĐ</option>
              <option value="NT">NT</option>
              <option value="VND_NT">VNĐ + NT</option>
            </select>
            <button className="button journal-icon-button" type="button" onClick={resetFilters}>
              <AppIcon name="List" />
            </button>
            <button className="button primary journal-search-button" type="button">
              <AppIcon name="Search" />
              Tìm
            </button>
          </div>

          <div className="table-scroll journal-table-scroll">
            <table className="data-table ledger-report-table journal-table">
              <thead>
                <tr>
                  <th>Mã từ</th>
                  <th>Số</th>
                  <th>Ngày</th>
                  <th></th>
                  <th>Số seri</th>
                  <th>Số hóa đơn</th>
                  <th>Ngày hóa đơn</th>
                  <th>Loại tiền</th>
                  {amountColumns.map((column) => (
                    <th className="amount-col" key={column.key}>
                      {column.label}
                    </th>
                  ))}
                  <th>Tên đơn vị</th>
                  <th>Diễn giải</th>
                  <th className="journal-debit-col">TK Nợ</th>
                  <th className="journal-debit-col">Tên YT1 Nợ</th>
                  <th className="journal-debit-col">Tên YT2 Nợ</th>
                  <th className="journal-credit-col">TK Có</th>
                  <th className="journal-credit-col">Tên YT1 Có</th>
                  <th className="journal-credit-col">Tên YT2 Có</th>
                  <th>Dự án</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.voucherType}</td>
                    <td>{row.voucherNo}</td>
                    <td>{formatDate(row.voucherDate)}</td>
                    <td>
                      <a className="journal-view-link" href="/modules/accounting/journal-vouchers">
                        Xem
                      </a>
                    </td>
                    <td>{row.invoiceSeries ?? ""}</td>
                    <td>{row.invoiceNo ?? ""}</td>
                    <td>{row.invoiceDate ? formatDate(row.invoiceDate) : ""}</td>
                    <td>{row.currencyCode}</td>
                    {amountColumns.map((column) => (
                      <td className="amount-col" key={column.key}>
                        {column.render(row)}
                      </td>
                    ))}
                    <td>{row.unitName ?? ""}</td>
                    <td>{row.memo}</td>
                    <td>{row.debitAccount}</td>
                    <td>{row.debitDimension1 ?? ""}</td>
                    <td>{row.debitDimension2 ?? ""}</td>
                    <td>{row.creditAccount}</td>
                    <td>{row.creditDimension1 ?? ""}</td>
                    <td>{row.creditDimension2 ?? ""}</td>
                    <td>{row.project ?? ""}</td>
                  </tr>
                ))}
                <tr className="ledger-total-row">
                  <td colSpan={8}>Tổng cộng</td>
                  {amountColumns.map((column) => (
                    <td className="amount-col" key={column.key}>
                      {column.total(filteredRows)}
                    </td>
                  ))}
                  <td colSpan={9}></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="ledger-footer">
            <div className="ledger-pagination">
              <button className="button button-sm" type="button">‹</button>
              <button className="button button-sm ledger-year-button is-active" type="button">1</button>
              <button className="button button-sm" type="button">›</button>
              <select className="field">
                <option>15</option>
                <option>30</option>
                <option>50</option>
              </select>
              <span>dòng / trang</span>
            </div>
            <span>
              1 - {filteredRows.length} ({filteredRows.length} dòng)
            </span>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function buildInitialFilters(): JournalFilterState {
  return {
    fromDate: "2026-07-01",
    toDate: "2026-07-12",
    periodYear: "2026",
    fromAccount: "",
    toAccount: "",
    objectQuery: "",
    currencyCode: "VND",
  };
}

function buildAmountColumns(currencyCode: CurrencyMode): JournalAmountColumn[] {
  const vndColumn: JournalAmountColumn = {
    key: "amount",
    label: "Tiền",
    className: "amount-col",
    render: (row) => vndFormatter.format(row.amount),
    total: (rows) => vndFormatter.format(rows.reduce((sum, row) => sum + row.amount, 0)),
  };
  const foreignColumn: JournalAmountColumn = {
    key: "foreignAmount",
    label: "Tiền NTệ",
    className: "amount-col",
    render: (row) => foreignFormatter.format(row.foreignAmount ?? 0),
    total: (rows) =>
      foreignFormatter.format(
        rows.reduce((sum, row) => sum + (row.foreignAmount ?? 0), 0),
      ),
  };

  if (currencyCode === "NT") return [foreignColumn];
  if (currencyCode === "VND_NT") return [vndColumn, foreignColumn];
  return [vndColumn];
}

function filterRows(rows: JournalRow[], filters: JournalFilterState) {
  const fromAccount = filters.fromAccount.trim();
  const toAccount = filters.toAccount.trim();
  const objectQuery = filters.objectQuery.trim().toLowerCase();

  return rows.filter((row) => {
    if (filters.fromDate && row.voucherDate < filters.fromDate) return false;
    if (filters.toDate && row.voucherDate > filters.toDate) return false;
    if (filters.currencyCode === "VND" && row.currencyCode !== "VND") return false;
    if (filters.currencyCode === "NT" && row.currencyCode !== "NT") return false;
    if (fromAccount && !accountInRange(row, fromAccount, "from")) return false;
    if (toAccount && !accountInRange(row, toAccount, "to")) return false;
    if (!objectQuery) return true;
    return [
      row.voucherType,
      row.voucherNo,
      row.unitName,
      row.memo,
      row.debitDimension1,
      row.debitDimension2,
      row.creditDimension1,
      row.creditDimension2,
      row.project,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(objectQuery);
  });
}

function accountInRange(
  row: JournalRow,
  accountCode: string,
  direction: "from" | "to",
) {
  const accounts = [row.debitAccount, row.creditAccount];
  if (direction === "from") {
    return accounts.some((account) => account >= accountCode);
  }
  return accounts.some((account) => account <= accountCode);
}

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function getCurrencyLabel(currencyCode: CurrencyMode) {
  if (currencyCode === "NT") return "NT";
  if (currencyCode === "VND_NT") return "VNĐ + NT";
  return "VNĐ";
}
