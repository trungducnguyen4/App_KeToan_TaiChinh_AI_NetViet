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
type CurrencyTableMode = "VND" | "NT";
type BalanceField =
  | "openingDebit"
  | "openingCredit"
  | "periodDebit"
  | "periodCredit"
  | "closingDebit"
  | "closingCredit";
type ColumnTone = "opening" | "period" | "closing";

type LedgerBalanceRow = {
  id: string;
  accountCode: string;
  accountName: string;
  accountGroup: "asset" | "liability" | "equity" | "revenue" | "expense";
  normalBalance: "debit" | "credit";
  level: number;
  isPostable: boolean;
  customerCode?: string;
  supplierCode?: string;
  contractNo?: string;
  warehouseCode?: string;
  openingDebit: number;
  openingCredit: number;
  periodDebit: number;
  periodCredit: number;
  closingDebit: number;
  closingCredit: number;
  foreign?: Partial<Record<BalanceField, number>>;
  calculatedAt: string;
};

type LedgerDetailRow = {
  id: string;
  voucherType: string;
  voucherNo: string;
  voucherDate: string;
  postingDate: string;
  status: "draft" | "pending_approval" | "approved" | "posted" | "voided";
  approvalStatus: "not_required" | "pending" | "approved" | "rejected";
  accountCode: string;
  debitAmount: number;
  creditAmount: number;
  foreignDebitAmount?: number;
  foreignCreditAmount?: number;
  exchangeRate?: number;
  memo: string;
  debitAccount: string;
  debitDimension1?: string;
  debitDimension2?: string;
  creditAccount: string;
  creditDimension1?: string;
  creditDimension2?: string;
  customerCode?: string;
  supplierCode?: string;
  contractNo?: string;
  warehouseCode?: string;
};

type LedgerFilterState = {
  fromDate: string;
  toDate: string;
  periodYear: string;
  fromAccount: string;
  toAccount: string;
  currencyCode: CurrencyMode;
  factor1: string;
  factor2: string;
};

type BalanceColumn = {
  key: string;
  label: string;
  tone: ColumnTone;
  format: (value: number) => string;
  getValue: (row: LedgerBalanceRow) => number;
};

type DetailColumn = {
  key: string;
  label: string;
  className?: string;
  render: (row: LedgerDetailRow) => string;
};

const ledgerBalances: LedgerBalanceRow[] = [
  {
    id: "lb-1111",
    accountCode: "1111",
    accountName: "Tiền Việt Nam",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 2,
    isPostable: true,
    openingDebit: 1639297188,
    openingCredit: 0,
    periodDebit: 30000000,
    periodCredit: 100000000,
    closingDebit: 1569297188,
    closingCredit: 0,
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-112",
    accountCode: "112",
    accountName: "Tiền gửi ngân hàng",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 1,
    isPostable: false,
    openingDebit: 28622942340,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 28622942340,
    closingCredit: 0,
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-1121",
    accountCode: "1121",
    accountName: "Tiền Việt Nam",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 2,
    isPostable: true,
    openingDebit: 28622942340,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 28622942340,
    closingCredit: 0,
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-131",
    accountCode: "131",
    accountName: "Phải thu của khách hàng",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 1,
    isPostable: true,
    customerCode: "KH-A01",
    contractNo: "HD-2026-001",
    openingDebit: 8904011594,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 30000000,
    closingDebit: 8874011594,
    closingCredit: 0,
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-133",
    accountCode: "133",
    accountName: "Thuế GTGT được khấu trừ",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 1,
    isPostable: false,
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
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-1331",
    accountCode: "1331",
    accountName: "Thuế GTGT được khấu trừ của hàng hóa, dịch vụ",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 2,
    isPostable: true,
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
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-152",
    accountCode: "152",
    accountName: "Nguyên liệu, vật liệu",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 1,
    isPostable: true,
    warehouseCode: "KHO-NVL",
    openingDebit: 148799840,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 148799840,
    closingCredit: 0,
    calculatedAt: "2026-07-10 09:00",
  },
  {
    id: "lb-154",
    accountCode: "154",
    accountName: "Chi phí sản xuất, kinh doanh dở dang",
    accountGroup: "asset",
    normalBalance: "debit",
    level: 1,
    isPostable: false,
    openingDebit: 60230750988,
    openingCredit: 0,
    periodDebit: 0,
    periodCredit: 0,
    closingDebit: 60230750988,
    closingCredit: 0,
    calculatedAt: "2026-07-10 09:00",
  },
];

const ledgerDetails: LedgerDetailRow[] = [
  {
    id: "vl-001",
    voucherType: "PT1",
    voucherNo: "26070001",
    voucherDate: "2026-07-02",
    postingDate: "2026-07-02",
    status: "posted",
    approvalStatus: "approved",
    accountCode: "131",
    debitAmount: 0,
    creditAmount: 10000000,
    exchangeRate: 25000,
    memo: "Thu tiền hàng theo hóa đơn số 111",
    debitAccount: "1111",
    debitDimension1: "",
    debitDimension2: "",
    creditAccount: "131",
    creditDimension1: "KH-A01",
    creditDimension2: "HD-2026-001",
    customerCode: "KH-A01",
    contractNo: "HD-2026-001",
  },
  {
    id: "vl-002",
    voucherType: "PT1",
    voucherNo: "26070002",
    voucherDate: "2026-07-02",
    postingDate: "2026-07-02",
    status: "posted",
    approvalStatus: "approved",
    accountCode: "131",
    debitAmount: 0,
    creditAmount: 15000000,
    exchangeRate: 25000,
    memo: "Thu hóa đơn ngày 02/07/2026",
    debitAccount: "1111",
    debitDimension1: "",
    debitDimension2: "",
    creditAccount: "131",
    creditDimension1: "KH-A01",
    creditDimension2: "",
    customerCode: "KH-A01",
  },
  {
    id: "vl-003",
    voucherType: "PT1",
    voucherNo: "26070003",
    voucherDate: "2026-07-06",
    postingDate: "2026-07-06",
    status: "posted",
    approvalStatus: "approved",
    accountCode: "131",
    debitAmount: 0,
    creditAmount: 5000000,
    exchangeRate: 25000,
    memo: "Thu tiền hàng",
    debitAccount: "1111",
    debitDimension1: "",
    debitDimension2: "",
    creditAccount: "131",
    creditDimension1: "KH-A01",
    creditDimension2: "",
    customerCode: "KH-A01",
  },
  {
    id: "vl-004",
    voucherType: "PNK",
    voucherNo: "26070011",
    voucherDate: "2026-07-08",
    postingDate: "2026-07-08",
    status: "posted",
    approvalStatus: "approved",
    accountCode: "133",
    debitAmount: 0,
    creditAmount: 0,
    foreignDebitAmount: 24000160,
    foreignCreditAmount: 0,
    exchangeRate: 1,
    memo: "Ghi nhận thuế GTGT hàng nhập khẩu bằng ngoại tệ",
    debitAccount: "133",
    debitDimension1: "NK-2026",
    debitDimension2: "",
    creditAccount: "331",
    creditDimension1: "NCC-NK",
    creditDimension2: "",
    supplierCode: "NCC-NK",
  },
];

export default function AccountLedgerScreen() {
  const [filters, setFilters] = useState<LedgerFilterState>(
    buildInitialFilters(),
  );
  const [selectedAccountCode, setSelectedAccountCode] = useState<string | null>(
    null,
  );
  const [listMessage, setListMessage] = useState("");

  const filteredBalances = useMemo(
    () => filterBalances(ledgerBalances, filters),
    [filters],
  );
  const selectedBalance = selectedAccountCode
    ? filteredBalances.find((row) => row.accountCode === selectedAccountCode)
    : undefined;
  const filteredDetails = useMemo(
    () => filterDetails(ledgerDetails, filters, selectedBalance?.accountCode),
    [filters, selectedBalance?.accountCode],
  );
  const balanceColumns = useMemo(
    () => buildBalanceColumns(filters.currencyCode),
    [filters.currencyCode],
  );
  const detailColumns = useMemo(
    () => buildDetailColumns(filters.currencyCode),
    [filters.currencyCode],
  );

  function handleApplyFilters() {
    setListMessage(
      `Đã tìm thấy ${filteredBalances.length} tài khoản và ${filteredDetails.length} dòng phát sinh`,
    );
  }

  function handleResetFilters() {
    setFilters(buildInitialFilters());
    setSelectedAccountCode(null);
    setListMessage("Đã xóa bộ lọc");
  }

  function handleSelectBalance(row: LedgerBalanceRow) {
    setSelectedAccountCode(row.accountCode);
    setListMessage(
      `Đang xem chi tiết TK ${row.accountCode} - ${row.accountName}`,
    );
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
            href="/modules/accounting/report/account-ledger"
          >
            Sổ cái tài khoản
          </a>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Ledger report engine</div>
            <h2 className="hero-title">Sổ cái tài khoản</h2>
          </div>
          <div className="sync-panel">
            <strong>
              {filteredBalances.length}/{ledgerBalances.length} tài khoản
            </strong>
            <span>
              Kỳ {filters.periodYear}, tiền tệ{" "}
              {getCurrencyLabel(filters.currencyCode)}. Tài khoản đang chọn:{" "}
              {selectedBalance?.accountCode ?? "chưa có"}.
            </span>
          </div>
        </section>

        <div className="section-title">
          <h2>Bảng tổng hợp sổ cái</h2>
          <div className="topbar-actions">
            <a className="button" href="/modules/accounting">
              <AppIcon name="ArrowLeft" />
              Quay lại
            </a>
            <button className="button" type="button">
              Export
            </button>
            <button className="button" type="button">
              <AppIcon name="Printer" />
              In
            </button>
          </div>
        </div>

        <section className="panel ledger-report-panel">
          <div className="toolbar ledger-report-toolbar">
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
              onClick={() =>
                setFilters((current) => ({ ...current, periodYear: "2026" }))
              }
            >
              Năm 2026
            </button>
            <button
              className={`button ledger-year-button ${
                filters.periodYear === "2025" ? "is-active" : ""
              }`}
              type="button"
              onClick={() =>
                setFilters((current) => ({ ...current, periodYear: "2025" }))
              }
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
            <button
              className="button primary ledger-search-button"
              type="button"
              onClick={handleApplyFilters}
            >
              <AppIcon name="Search" />
              Tìm
            </button>
            <button
              className="button"
              type="button"
              onClick={handleResetFilters}
            >
              Xóa lọc
            </button>
          </div>

          <div className="ledger-filter-row">
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

          {/* {listMessage ? (
            <div className="attachment-box ledger-message">{listMessage}</div>
          ) : null} */}

          <LedgerSummaryTable
            columns={balanceColumns}
            filteredBalances={filteredBalances}
            selectedAccountCode={selectedBalance?.accountCode}
            title={getCurrencyLabel(filters.currencyCode)}
            onSelectBalance={handleSelectBalance}
          />
        </section>

        {selectedBalance ? (
          <>
            <div className="section-title">
              <h2>Chi tiết phát sinh TK {selectedBalance.accountCode}</h2>
              <span className="module-meta">
                {filteredDetails.length} dòng từ voucher
              </span>
            </div>
            <section className="panel ledger-report-panel">
              <LedgerDetailTable
                columns={detailColumns}
                filteredDetails={filteredDetails}
                title={`Phát sinh ${getCurrencyLabel(filters.currencyCode)}`}
              />
            </section>
          </>
        ) : null}
      </div>
    </AppShell>
  );
}

function LedgerSummaryTable({
  columns,
  filteredBalances,
  selectedAccountCode,
  title,
  onSelectBalance,
}: {
  columns: BalanceColumn[];
  filteredBalances: LedgerBalanceRow[];
  selectedAccountCode?: string;
  title: string;
  onSelectBalance: (row: LedgerBalanceRow) => void;
}) {
  return (
    <div className="ledger-currency-block">
      {/* <div className="ledger-currency-title">{title}</div> */}
      <div className="table-scroll ledger-table-scroll">
        <table className="data-table ledger-report-table ledger-summary-table">
          <thead>
            <tr>
              <th>Mã TK</th>
              <th>Tên TK</th>
              {columns.map((column) => (
                <th className={`ledger-${column.tone}-col`} key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredBalances.map((row) => (
              <tr
                className={
                  row.accountCode === selectedAccountCode
                    ? "ledger-active-row"
                    : row.isPostable
                      ? ""
                      : "ledger-parent-row"
                }
                key={row.id}
                onClick={() => onSelectBalance(row)}
              >
                <td>{row.accountCode}</td>
                <td>{row.accountName}</td>
                {columns.map((column) => (
                  <td key={column.key}>
                    {column.format(column.getValue(row))}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="ledger-total-row">
              <td colSpan={2}>Tổng cộng</td>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.format(sumBalanceColumn(filteredBalances, column))}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LedgerDetailTable({
  columns,
  filteredDetails,
  title,
}: {
  columns: DetailColumn[];
  filteredDetails: LedgerDetailRow[];
  title: string;
}) {
  return (
    <div className="ledger-currency-block">
      <div className="ledger-currency-title">{title}</div>
      <div className="table-scroll ledger-table-scroll">
        <table className="data-table ledger-report-table ledger-detail-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th className={column.className} key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDetails.length ? (
              filteredDetails.map((row) => (
                <tr key={row.id}>
                  {columns.map((column) => (
                    <td className={column.className} key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>Dữ liệu rỗng</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function buildInitialFilters(): LedgerFilterState {
  return {
    fromDate: "2026-07-01",
    toDate: "2026-07-12",
    periodYear: "2026",
    fromAccount: "",
    toAccount: "",
    currencyCode: "VND",
    factor1: "",
    factor2: "",
  };
}

function buildBalanceColumns(mode: CurrencyMode): BalanceColumn[] {
  if (mode === "VND_NT") {
    return [
      ...buildBalanceColumnGroup("VND"),
      ...buildBalanceColumnGroup("NT"),
    ];
  }

  return buildBalanceColumnGroup(mode);
}

function buildBalanceColumnGroup(mode: CurrencyTableMode): BalanceColumn[] {
  const suffix = mode === "NT" ? " NTệ" : "";
  const formatter = mode === "NT" ? foreignFormatter : vndFormatter;
  const getValue =
    mode === "NT"
      ? (row: LedgerBalanceRow, field: BalanceField) =>
          row.foreign?.[field] ?? 0
      : (row: LedgerBalanceRow, field: BalanceField) => row[field];

  return [
    {
      key: `openingDebit-${mode}`,
      label: `Dư đầu Nợ${suffix}`,
      tone: "opening",
      format: formatter.format,
      getValue: (row) => getValue(row, "openingDebit"),
    },
    {
      key: `openingCredit-${mode}`,
      label: `Dư đầu Có${suffix}`,
      tone: "opening",
      format: formatter.format,
      getValue: (row) => getValue(row, "openingCredit"),
    },
    {
      key: `periodDebit-${mode}`,
      label: `PS Nợ${suffix}`,
      tone: "period",
      format: formatter.format,
      getValue: (row) => getValue(row, "periodDebit"),
    },
    {
      key: `periodCredit-${mode}`,
      label: `PS Có${suffix}`,
      tone: "period",
      format: formatter.format,
      getValue: (row) => getValue(row, "periodCredit"),
    },
    {
      key: `closingDebit-${mode}`,
      label: `Dư cuối Nợ${suffix}`,
      tone: "closing",
      format: formatter.format,
      getValue: (row) => getValue(row, "closingDebit"),
    },
    {
      key: `closingCredit-${mode}`,
      label: `Dư cuối Có${suffix}`,
      tone: "closing",
      format: formatter.format,
      getValue: (row) => getValue(row, "closingCredit"),
    },
  ];
}

function buildDetailColumns(mode: CurrencyMode): DetailColumn[] {
  const amountColumns = buildDetailAmountColumns(mode);

  return [
    { key: "voucherType", label: "Mã CTừ", render: (row) => row.voucherType },
    { key: "voucherNo", label: "Số CTừ", render: (row) => row.voucherNo },
    { key: "voucherDate", label: "Ngày CTừ", render: (row) => row.voucherDate },
    ...amountColumns,
    { key: "memo", label: "Diễn giải", render: (row) => row.memo },
    { key: "debitAccount", label: "TK Nợ", render: (row) => row.debitAccount },
    {
      key: "debitDimension1",
      label: "YT1 Nợ",
      render: (row) => row.debitDimension1 ?? "",
    },
    {
      key: "debitDimension2",
      label: "YT2 Nợ",
      render: (row) => row.debitDimension2 ?? "",
    },
    {
      key: "creditAccount",
      label: "TK Có",
      render: (row) => row.creditAccount,
    },
    {
      key: "creditDimension1",
      label: "YT1 Có",
      render: (row) => row.creditDimension1 ?? "",
    },
    {
      key: "creditDimension2",
      label: "YT2 Có",
      render: (row) => row.creditDimension2 ?? "",
    },
  ];
}

function buildDetailAmountColumns(mode: CurrencyMode): DetailColumn[] {
  const vndColumns: DetailColumn[] = [
    {
      key: "debitAmount",
      label: "PS Nợ",
      className: "amount-col",
      render: (row: LedgerDetailRow) => vndFormatter.format(row.debitAmount),
    },
    {
      key: "creditAmount",
      label: "PS Có",
      className: "amount-col",
      render: (row: LedgerDetailRow) => vndFormatter.format(row.creditAmount),
    },
  ];
  const foreignColumns: DetailColumn[] = [
    {
      key: "exchangeRate",
      label: "Tỷ giá",
      className: "amount-col",
      render: (row: LedgerDetailRow) =>
        row.exchangeRate ? foreignFormatter.format(row.exchangeRate) : "",
    },
    {
      key: "foreignDebitAmount",
      label: "PS Nợ NTệ",
      className: "amount-col",
      render: (row: LedgerDetailRow) =>
        foreignFormatter.format(row.foreignDebitAmount ?? 0),
    },
    {
      key: "foreignCreditAmount",
      label: "PS Có NTệ",
      className: "amount-col",
      render: (row: LedgerDetailRow) =>
        foreignFormatter.format(row.foreignCreditAmount ?? 0),
    },
  ];

  if (mode === "NT") return foreignColumns;
  if (mode === "VND_NT") return [...vndColumns, ...foreignColumns];
  return vndColumns;
}

function getCurrencyLabel(currencyCode: CurrencyMode | CurrencyTableMode) {
  if (currencyCode === "NT") return "NT";
  if (currencyCode === "VND_NT") return "VNĐ + NT";
  return "VNĐ";
}

function sumBalanceColumn(rows: LedgerBalanceRow[], column: BalanceColumn) {
  return rows.reduce((sum, row) => sum + column.getValue(row), 0);
}

function filterBalances(rows: LedgerBalanceRow[], filters: LedgerFilterState) {
  const factorQuery = [filters.factor1, filters.factor2]
    .join(" ")
    .trim()
    .toLowerCase();
  const fromAccount = filters.fromAccount.trim();
  const toAccount = filters.toAccount.trim();

  return rows.filter((row) => {
    if (fromAccount && row.accountCode < fromAccount) return false;
    if (toAccount && row.accountCode > toAccount) return false;
    if (!factorQuery) return true;
    return [
      row.accountCode,
      row.accountName,
      row.customerCode,
      row.supplierCode,
      row.contractNo,
      row.warehouseCode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(factorQuery);
  });
}

function filterDetails(
  rows: LedgerDetailRow[],
  filters: LedgerFilterState,
  accountCode?: string,
) {
  const factorQuery = [filters.factor1, filters.factor2]
    .join(" ")
    .trim()
    .toLowerCase();

  return rows.filter((row) => {
    if (accountCode && row.accountCode !== accountCode) return false;
    if (filters.fromDate && row.voucherDate < filters.fromDate) return false;
    if (filters.toDate && row.voucherDate > filters.toDate) return false;
    if (!factorQuery) return true;
    return [
      row.voucherType,
      row.voucherNo,
      row.memo,
      row.customerCode,
      row.supplierCode,
      row.contractNo,
      row.warehouseCode,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(factorQuery);
  });
}
