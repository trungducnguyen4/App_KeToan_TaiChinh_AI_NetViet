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

type BalanceField =
  | "openingDebit"
  | "openingCredit"
  | "periodDebit"
  | "periodCredit"
  | "closingDebit"
  | "closingCredit";

type CurrencyMode = "VND" | "NT" | "VND_NT";
type ColumnTone = "opening" | "period" | "closing";

type TrialBalanceRow = {
  id: string;
  accountCode: string;
  accountName: string;
  isGroup?: boolean;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  foreign?: Partial<Record<BalanceField, number>>;
};

type TrialBalanceFilterState = {
  fromDate: string;
  toDate: string;
  periodYear: string;
  fromAccount: string;
  toAccount: string;
  currencyCode: CurrencyMode;
  factor1: string;
  factor2: string;
  offsetAccounts: boolean;
};

type AmountColumn = {
  key: string;
  label: string;
  tone: ColumnTone;
  format: (value: number) => string;
  getValue: (row: TrialBalanceRow) => number;
};

const trialBalanceRows: TrialBalanceRow[] = [
  {
    id: "tb-1111",
    accountCode: "1111",
    accountName: "Tiền Việt Nam",
    openingDebit: 1639297188,
    openingCredit: 0,
    periodDebit: 30000000,
    periodCredit: 100000000,
    closingDebit: 1569297188,
    closingCredit: 0,
  },
  {
    id: "tb-112",
    accountCode: "112",
    accountName: "Tiền gửi ngân hàng",
    isGroup: true,
    openingDebit: 28622942340,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 28622942340,
    closingCredit: 0,
  },
  {
    id: "tb-1121",
    accountCode: "1121",
    accountName: "Tiền Việt Nam",
    openingDebit: 28622942340,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 28622942340,
    closingCredit: 0,
  },
  {
    id: "tb-131",
    accountCode: "131",
    accountName: "Phải thu của khách hàng",
    openingDebit: 10178097552,
    openingCredit: 1274085958,
    periodDebit: 0,
    periodCredit: 30000000,
    closingDebit: 10148097552,
    closingCredit: 1274085958,
  },
  {
    id: "tb-133",
    accountCode: "133",
    accountName: "Thuế GTGT được khấu trừ",
    isGroup: true,
    openingDebit: 6528481882,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 6528481882,
    closingCredit: 0,
    foreign: {
      openingDebit: 24000160,
      openingCredit: 0,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: 24000160,
      closingCredit: 0,
    },
  },
  {
    id: "tb-1331",
    accountCode: "1331",
    accountName: "Thuế GTGT được khấu trừ của hàng hóa, dịch vụ",
    openingDebit: 6528481882,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 6528481882,
    closingCredit: 0,
    foreign: {
      openingDebit: 24000160,
      openingCredit: 0,
      periodDebit: 0,
      periodCredit: 0,
      closingDebit: 24000160,
      closingCredit: 0,
    },
  },
  {
    id: "tb-152",
    accountCode: "152",
    accountName: "Nguyên liệu, vật liệu",
    openingDebit: 148799840,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 148799840,
    closingCredit: 0,
  },
  {
    id: "tb-152lo",
    accountCode: "152.LO",
    accountName: "Nguyên liệu, vật liệu",
    openingDebit: 397027816,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 397027816,
    closingCredit: 0,
  },
  {
    id: "tb-154",
    accountCode: "154",
    accountName: "Chi phí sản xuất, kinh doanh dở dang",
    isGroup: true,
    openingDebit: 60230750988,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 60230750988,
    closingCredit: 0,
  },
  {
    id: "tb-154d1",
    accountCode: "154.D1",
    accountName: "Chi phí sản xuất, kinh doanh dở dang - Dược - Phân xưởng 1",
    openingDebit: 20486500,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 20486500,
    closingCredit: 0,
  },
  {
    id: "tb-154d2",
    accountCode: "154.D2",
    accountName: "Chi phí sản xuất, kinh doanh dở dang - Dược - Địa bàn 2",
    openingDebit: 30729750,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 30729750,
    closingCredit: 0,
  },
  {
    id: "tb-154d3",
    accountCode: "154.D3",
    accountName: "Chi phí sản xuất, kinh doanh dở dang - Dược - Địa bàn 3",
    openingDebit: 46094625,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 46094625,
    closingCredit: 0,
  },
  {
    id: "tb-154sx",
    accountCode: "154.SX",
    accountName: "Chi phí sản xuất, kinh doanh dở dang - SX",
    openingDebit: 66279811,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 66279811,
    closingCredit: 0,
  },
  {
    id: "tb-155",
    accountCode: "155",
    accountName: "Thành phẩm",
    isGroup: true,
    openingDebit: 1292421749,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 1292421749,
    closingCredit: 0,
  },
  {
    id: "tb-156",
    accountCode: "156",
    accountName: "Hàng hóa",
    isGroup: true,
    openingDebit: 4901233748,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 4901233748,
    closingCredit: 0,
  },
];

export default function AccountTrialBalanceScreen() {
  const [filters, setFilters] = useState<TrialBalanceFilterState>(
    buildInitialFilters(),
  );
  const [selectedAccountCode, setSelectedAccountCode] = useState("112");
  const filteredRows = useMemo(
    () => filterRows(trialBalanceRows, filters),
    [filters],
  );
  const amountColumns = useMemo(
    () => buildAmountColumns(filters.currencyCode),
    [filters.currencyCode],
  );

  function chooseYear(periodYear: string) {
    setFilters((current) => ({ ...current, periodYear }));
  }

  function resetFilters() {
    setFilters(buildInitialFilters());
    setSelectedAccountCode("112");
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
            href="/modules/accounting/report/account-trial-balance"
          >
            Bảng cân đối tài khoản
          </a>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Financial report</div>
            <h2 className="hero-title">Bảng cân đối tài khoản</h2>
            <p className="hero-copy">
              Tổng hợp số dư đầu kỳ, phát sinh trong kỳ và số dư cuối kỳ theo hệ
              thống tài khoản.
            </p>
          </div>
          <div className="sync-panel">
            <strong>
              {filteredRows.length}/{trialBalanceRows.length} tài khoản
            </strong>
            <span>
              Kỳ báo cáo năm {filters.periodYear}, tiền tệ{" "}
              {getCurrencyLabel(filters.currencyCode)}. Tài khoản đang chọn:{" "}
              {selectedAccountCode}.
            </span>
          </div>
        </section>

        <div className="section-title">
          <h2>Bảng cân đối tài khoản</h2>
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

        <section className="panel trial-balance-panel">
          <div className="toolbar trial-balance-toolbar">
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
            <label className="trial-checkbox">
              <input
                type="checkbox"
                checked={filters.offsetAccounts}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    offsetAccounts: event.target.checked,
                  }))
                }
              />
              Bù trừ TK
            </label>
            <button
              className="button primary trial-balance-search-button"
              type="button"
            >
              <AppIcon name="Search" />
              Tìm
            </button>
            <button className="button" type="button" onClick={resetFilters}>
              Xóa lọc
            </button>
          </div>

          <div className="trial-factor-row">
            <input
              className="search"
              placeholder="Chọn yếu tố 1"
              aria-label="Chọn yếu tố 1"
              value={filters.factor1}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  factor1: event.target.value,
                }))
              }
            />
            <input
              className="search"
              placeholder="Chọn yếu tố 2"
              aria-label="Chọn yếu tố 2"
              value={filters.factor2}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  factor2: event.target.value,
                }))
              }
            />
          </div>

          <div className="table-scroll trial-balance-table-scroll">
            <table className="data-table ledger-report-table trial-balance-table">
              <thead>
                <tr>
                  <th>Mã TK</th>
                  <th>Tên TK</th>
                  {amountColumns.map((column) => (
                    <th className={`trial-${column.tone}-col`} key={column.key}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr
                    className={`${row.isGroup ? "ledger-parent-row" : ""} ${
                      row.accountCode === selectedAccountCode
                        ? "ledger-active-row"
                        : ""
                    }`}
                    key={row.id}
                    onClick={() => setSelectedAccountCode(row.accountCode)}
                  >
                    <td>{row.accountCode}</td>
                    <td>{row.accountName}</td>
                    {amountColumns.map((column) => (
                      <td key={column.key}>
                        {column.format(column.getValue(row))}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="trial-balance-total-row">
                  <td colSpan={2}>Tổng cộng</td>
                  {amountColumns.map((column) => (
                    <td key={column.key}>
                      {column.format(sumColumn(filteredRows, column))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function buildInitialFilters(): TrialBalanceFilterState {
  return {
    fromDate: "2026-01-01",
    toDate: "2026-12-31",
    periodYear: "2026",
    fromAccount: "",
    toAccount: "",
    currencyCode: "VND",
    factor1: "",
    factor2: "",
    offsetAccounts: false,
  };
}

function buildAmountColumns(currencyCode: CurrencyMode): AmountColumn[] {
  const vndColumns = buildCurrencyColumns("", vndFormatter, (row, field) => row[field]);
  const foreignColumns = buildCurrencyColumns(" NTệ", foreignFormatter, getForeignValue);

  if (currencyCode === "NT") return foreignColumns;
  if (currencyCode === "VND_NT") return [...vndColumns, ...foreignColumns];
  return vndColumns;
}

function buildCurrencyColumns(
  suffix: string,
  formatter: Intl.NumberFormat,
  getValue: (row: TrialBalanceRow, field: BalanceField) => number,
): AmountColumn[] {
  return [
    {
      key: `openingDebit${suffix}`,
      label: `Dư đầu Nợ${suffix}`,
      tone: "opening",
      format: formatter.format,
      getValue: (row) => getValue(row, "openingDebit"),
    },
    {
      key: `openingCredit${suffix}`,
      label: `Dư đầu Có${suffix}`,
      tone: "opening",
      format: formatter.format,
      getValue: (row) => getValue(row, "openingCredit"),
    },
    {
      key: `periodDebit${suffix}`,
      label: `PS Nợ${suffix}`,
      tone: "period",
      format: formatter.format,
      getValue: (row) => getValue(row, "periodDebit"),
    },
    {
      key: `periodCredit${suffix}`,
      label: `PS Có${suffix}`,
      tone: "period",
      format: formatter.format,
      getValue: (row) => getValue(row, "periodCredit"),
    },
    {
      key: `closingDebit${suffix}`,
      label: `Dư cuối Nợ${suffix}`,
      tone: "closing",
      format: formatter.format,
      getValue: (row) => getValue(row, "closingDebit"),
    },
    {
      key: `closingCredit${suffix}`,
      label: `Dư cuối Có${suffix}`,
      tone: "closing",
      format: formatter.format,
      getValue: (row) => getValue(row, "closingCredit"),
    },
  ];
}

function getForeignValue(row: TrialBalanceRow, field: BalanceField) {
  return row.foreign?.[field] ?? 0;
}

function sumColumn(rows: TrialBalanceRow[], column: AmountColumn) {
  return rows.reduce((sum, row) => sum + column.getValue(row), 0);
}

function getCurrencyLabel(currencyCode: CurrencyMode) {
  if (currencyCode === "NT") return "NT";
  if (currencyCode === "VND_NT") return "VNĐ + NT";
  return "VNĐ";
}

function filterRows(rows: TrialBalanceRow[], filters: TrialBalanceFilterState) {
  const fromAccount = filters.fromAccount.trim();
  const toAccount = filters.toAccount.trim();
  const factorQuery = [filters.factor1, filters.factor2]
    .join(" ")
    .trim()
    .toLowerCase();

  return rows.filter((row) => {
    if (fromAccount && row.accountCode < fromAccount) return false;
    if (toAccount && row.accountCode > toAccount) return false;
    if (!factorQuery) return true;
    return [row.accountCode, row.accountName]
      .join(" ")
      .toLowerCase()
      .includes(factorQuery);
  });
}
