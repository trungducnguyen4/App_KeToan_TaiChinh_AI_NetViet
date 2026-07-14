import { useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import {
  debtDashboardMocks,
  debtOpeningBalanceMocks,
  ledgerBalanceMocks,
  monitoringAlertMocks,
  profitabilityMocks,
  reportMetricMocks,
  reportSnapshotMock,
  voucherMocks,
} from "../lib/report-sql-mock-data";
import type {
  MonitoringAlertCategory,
  MonitoringAlertSeverity,
  MonitoringAlertStatus,
} from "../lib/report-sql-mock-data";

type ReportKey = "cash-flow" | "receivables" | "profit" | "management";
type PeriodType = "day" | "week" | "month";
type MonitoringFilter = "all" | MonitoringAlertCategory;

const metricValue = (code: string) =>
  reportMetricMocks.find((item) => item.metric_code === code)?.metric_value ??
  0;
const billions = (value: number) =>
  `${(value / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
const money = (value: number) => value.toLocaleString("vi-VN");
const sumDebt = (
  rows: Array<{
    opening_amount: number;
    current_amount: number;
    overdue_amount: number;
  }>,
  field: "opening_amount" | "current_amount" | "overdue_amount",
) => rows.reduce((total, row) => total + row[field], 0);

type ReportGroup = {
  key: ReportKey;
  title: string;
  shortTitle: string;
  description: string;
  icon: string;
  tone: string;
  schedule: string;
  source: string;
  metrics: string[];
  actions: Array<{ label: string; href: string; primary?: boolean }>;
};

const reportGroups: ReportGroup[] = [
  {
    key: "cash-flow",
    title: "Báo cáo dòng tiền",
    shortTitle: "Dòng tiền",
    description:
      "Thu – chi thực tế và dự báo ngắn hạn từ các khoản công nợ đến hạn.",
    icon: "WalletCards",
    tone: "green",
    schedule: "Hằng ngày · 07:30",
    source: "PT/PC, BN/BC, sao kê và công nợ đến hạn",
    metrics: [
      "Thu – chi thực tế",
      "Dòng tiền thuần",
      "Dự báo 7/30 ngày",
      "Cảnh báo thiếu hụt",
    ],
    actions: [
      { label: "Mở dashboard thu chi", href: "/modules/cash", primary: true },
      { label: "Đối chiếu ngân hàng", href: "/modules/cash/reconciliation" },
    ],
  },
  {
    key: "receivables",
    title: "Báo cáo công nợ",
    shortTitle: "Công nợ",
    description:
      "Tuổi nợ phải thu/phải trả, top khách nợ, cảnh báo quá hạn và đề xuất ưu tiên thu.",
    icon: "ReceiptText",
    tone: "blue",
    schedule: "Hằng ngày · 08:00",
    source: "TK 131/331, khách hàng, nhà cung cấp và hóa đơn",
    metrics: [
      "Tuổi nợ phải thu",
      "Tuổi nợ phải trả",
      "Top khách nợ",
      "Nợ quá hạn",
    ],
    actions: [
      {
        label: "Mở phân hệ công nợ",
        href: "/modules/receivables",
        primary: true,
      },
    ],
  },
  {
    key: "profit",
    title: "Báo cáo chi phí & lợi nhuận",
    shortTitle: "Chi phí & lợi nhuận",
    description:
      "Theo khoản mục 621/622/627/641/642 và biên lợi nhuận theo đơn hàng, mặt hàng.",
    icon: "TrendingUp",
    tone: "amber",
    schedule: "Hằng tuần · Thứ Hai",
    source: "Sổ cái, đơn hàng, mặt hàng và các tài khoản chi phí",
    metrics: [
      "Chi phí 621/622/627",
      "Chi phí 641/642",
      "Lãi gộp đơn hàng",
      "Biên lợi nhuận mặt hàng",
    ],
    actions: [
      {
        label: "Mở dữ liệu kế toán",
        href: "/modules/accounting",
        primary: true,
      },
      { label: "Mở phân hệ bán hàng", href: "/modules/sales" },
    ],
  },
  {
    key: "management",
    title: "Báo cáo tài chính quản trị",
    shortTitle: "Tài chính quản trị",
    description:
      "Cân đối phát sinh, số dư tài khoản, sổ cái và đối chiếu ngược với WORKIT.",
    icon: "Calculator",
    tone: "red",
    schedule: "Hằng tháng · Ngày cuối kỳ",
    source: "Bút toán đã ghi sổ, số dư tài khoản và dữ liệu WORKIT",
    metrics: [
      "Cân đối phát sinh",
      "Số dư tài khoản",
      "Sổ cái",
      "Chênh lệch WORKIT",
    ],
    actions: [
      {
        label: "Cân đối phát sinh",
        href: "/modules/accounting/report/account-trial-balance",
        primary: true,
      },
      {
        label: "Sổ cái tài khoản",
        href: "/modules/accounting/report/account-ledger",
      },
      {
        label: "Nhật ký chung",
        href: "/modules/accounting/report/general-journal",
      },
    ],
  },
];

const summaryMetrics = [
  {
    label: "Báo cáo tự động",
    value: "4",
    hint: "Theo đề án M5",
    icon: "PieChart",
    tone: "green",
  },
  {
    label: "Lịch đang hoạt động",
    value: "4/4",
    hint: "Ngày · tuần · tháng",
    icon: "RefreshCw",
    tone: "blue",
  },
  {
    label: "Đối soát WORKIT",
    value: "100%",
    hint: "Nguồn đọc GD1",
    icon: "ShieldCheck",
    tone: "amber",
  },
  {
    label: "Cảnh báo cần xem",
    value: "03",
    hint: "Dữ liệu minh họa",
    icon: "Bot",
    tone: "red",
  },
] as const;

const monitoringFilters: Array<{
  key: MonitoringFilter;
  label: string;
  icon: string;
}> = [
  { key: "all", label: "Tất cả", icon: "LayoutGrid" },
  { key: "debt_overdue", label: "Nợ quá hạn", icon: "ReceiptText" },
  { key: "expense_limit", label: "Chi vượt định mức", icon: "Calculator" },
  { key: "cashflow_negative", label: "Dòng tiền âm", icon: "WalletCards" },
  { key: "journal_anomaly", label: "Bút toán lệch", icon: "FileText" },
];

const monitoringCategoryLabels: Record<MonitoringAlertCategory, string> = {
  debt_overdue: "Nợ quá hạn",
  expense_limit: "Chi vượt định mức",
  cashflow_negative: "Dòng tiền âm dự báo",
  journal_anomaly: "Bút toán lệch/bất thường",
};

const monitoringSeverityLabels: Record<MonitoringAlertSeverity, string> = {
  critical: "Nghiêm trọng",
  high: "Cao",
  medium: "TB",
  low: "Thấp",
};

const monitoringStatusLabels: Record<MonitoringAlertStatus, string> = {
  new: "Mới phát hiện",
  reviewing: "Đang rà soát",
  resolved: "Đã xử lý",
};

const dashboardData: Record<
  ReportKey,
  {
    kpis: Array<{ label: string; value: string; change: string; tone: string }>;
    trendTitle: string;
    trendUnit: string;
    trend: Array<{
      label: string;
      primary: number;
      secondary: number;
      forecast?: boolean;
    }>;
    primaryLabel: string;
    secondaryLabel: string;
    breakdownTitle: string;
    breakdown: Array<{ label: string; value: string; percent: number }>;
    columns: string[];
    rows: string[][];
  }
> = {
  "cash-flow": {
    kpis: [
      {
        label: "Tổng thu tháng",
        value: "1,49 tỷ",
        change: "+12,4% so với tháng trước",
        tone: "green",
      },
      {
        label: "Tổng chi tháng",
        value: "1,12 tỷ",
        change: "+4,8% so với tháng trước",
        tone: "blue",
      },
      {
        label: "Dòng tiền thuần",
        value: "+370 triệu",
        change: "Duy trì trạng thái dương",
        tone: "green",
      },
      {
        label: "Dự báo cuối kỳ",
        value: "2,84 tỷ",
        change: "Cảnh báo thiếu hụt: 0",
        tone: "amber",
      },
    ],
    trendTitle: "Thu – chi thực tế và dự báo 7 ngày",
    trendUnit: "Triệu VND",
    primaryLabel: "Thu",
    secondaryLabel: "Chi",
    trend: [
      { label: "T2", primary: 72, secondary: 42 },
      { label: "T3", primary: 55, secondary: 63 },
      { label: "T4", primary: 86, secondary: 52 },
      { label: "T5", primary: 64, secondary: 48 },
      { label: "T6", primary: 92, secondary: 68 },
      { label: "T7", primary: 58, secondary: 44, forecast: true },
      { label: "CN", primary: 76, secondary: 57, forecast: true },
    ],
    breakdownTitle: "Cơ cấu dòng tiền vào",
    breakdown: [
      { label: "Thu khách hàng", value: "820 triệu", percent: 78 },
      { label: "Thu khác", value: "280 triệu", percent: 42 },
      { label: "Hoàn ứng", value: "96 triệu", percent: 22 },
      { label: "Lãi tiền gửi", value: "24 triệu", percent: 12 },
    ],
    columns: [
      "Ngày",
      "Nội dung",
      "Nguồn",
      "Thu",
      "Chi",
      "Loại",
      "Số dư dự kiến",
    ],
    rows: [
      [
        "13/07",
        "Thu tiền Công ty Minh An",
        "BC1-26070012",
        "245.000.000",
        "—",
        "Thực tế",
        "2.315.000.000",
      ],
      [
        "14/07",
        "Thanh toán NCC Tín Phát",
        "BN1-26070008",
        "—",
        "118.000.000",
        "Thực tế",
        "2.197.000.000",
      ],
      [
        "16/07",
        "Công nợ KH đến hạn",
        "HĐ BH-26070118",
        "320.000.000",
        "—",
        "Dự báo",
        "2.517.000.000",
      ],
      [
        "18/07",
        "Công nợ NCC đến hạn",
        "HĐ MH-26070041",
        "—",
        "164.000.000",
        "Dự báo",
        "2.353.000.000",
      ],
    ],
  },
  receivables: {
    kpis: [
      {
        label: "Phải thu",
        value: billions(metricValue("receivable_total")),
        change: "TK 131 · ledger_balances",
        tone: "blue",
      },
      {
        label: "Phải trả",
        value: billions(metricValue("payable_total")),
        change: "TK 331 · ledger_balances",
        tone: "amber",
      },
      {
        label: "Nợ quá hạn",
        value: `${money(metricValue("debt_overdue") / 1_000_000)} triệu`,
        change: "Tổng hợp theo due_date",
        tone: "red",
      },
      {
        label: "Đến hạn 7 ngày",
        value: "1,05 tỷ",
        change: "Ưu tiên thu 5 khoản",
        tone: "green",
      },
    ],
    trendTitle: "Tuổi nợ phải thu và phải trả",
    trendUnit: "% tổng công nợ",
    primaryLabel: "Phải thu",
    secondaryLabel: "Phải trả",
    trend: [
      { label: "Chưa hạn", primary: 88, secondary: 74 },
      { label: "1–30", primary: 62, secondary: 56 },
      { label: "31–60", primary: 38, secondary: 44 },
      { label: "61–90", primary: 24, secondary: 30 },
      { label: "> 90", primary: 18, secondary: 12 },
    ],
    breakdownTitle: "Top khách hàng còn nợ",
    breakdown: [
      { label: "Công ty Minh An", value: "820 triệu", percent: 88 },
      { label: "Công ty Cổ phần 32", value: "640 triệu", percent: 70 },
      { label: "Nhựa Đông Á", value: "420 triệu", percent: 48 },
      { label: "Thương mại Phú Gia", value: "286 triệu", percent: 34 },
    ],
    columns: [
      "Đối tượng",
      "Loại",
      "Tổng nợ",
      "Quá hạn",
      "Ngày đến hạn",
      "Mức ưu tiên",
      "Đề xuất",
    ],
    rows: debtOpeningBalanceMocks.map((item) => [
      item.counterparty_name,
      item.account_code === "131" ? "Phải thu" : "Phải trả",
      money(item.amount),
      item.overdue_amount ? money(item.overdue_amount) : "—",
      item.due_date.split("-").reverse().join("/"),
      item.priority,
      item.recommendation,
    ]),
  },
  profit: {
    kpis: [
      {
        label: "Doanh thu thuần",
        value: billions(metricValue("revenue_net")),
        change: "metric_code: revenue_net",
        tone: "green",
      },
      {
        label: "Tổng chi phí",
        value: billions(metricValue("cost_total")),
        change: "621/622/627/641/642",
        tone: "amber",
      },
      {
        label: "Lợi nhuận gộp",
        value: "2,46 tỷ",
        change: "Biên gộp 28,5%",
        tone: "blue",
      },
      {
        label: "Lợi nhuận ròng",
        value: "1,12 tỷ",
        change: "Biên ròng 13,0%",
        tone: "green",
      },
    ],
    trendTitle: "Doanh thu và lợi nhuận theo tháng",
    trendUnit: "Tỷ VND",
    primaryLabel: "Doanh thu",
    secondaryLabel: "Lợi nhuận",
    trend: [
      { label: "T2", primary: 62, secondary: 24 },
      { label: "T3", primary: 70, secondary: 28 },
      { label: "T4", primary: 68, secondary: 31 },
      { label: "T5", primary: 82, secondary: 38 },
      { label: "T6", primary: 78, secondary: 34 },
      { label: "T7", primary: 92, secondary: 42 },
    ],
    breakdownTitle: "Chi phí theo tài khoản",
    breakdown: [
      { label: "621 · Nguyên vật liệu", value: "2,86 tỷ", percent: 92 },
      { label: "622 · Nhân công", value: "1,24 tỷ", percent: 58 },
      { label: "627 · Sản xuất chung", value: "980 triệu", percent: 46 },
      { label: "641/642 · Bán hàng & QLDN", value: "1,10 tỷ", percent: 52 },
    ],
    columns: [
      "Đơn hàng/Mặt hàng",
      "Doanh thu",
      "Giá vốn",
      "Chi phí",
      "Lợi nhuận",
      "Biên LN",
      "Đánh giá",
    ],
    rows: profitabilityMocks.map((item) => {
      const profit = item.revenue - item.cost_of_goods - item.operating_cost;
      const margin = (profit / item.revenue) * 100;
      return [
        `${item.source_id} · ${item.item_name}`,
        money(item.revenue),
        money(item.cost_of_goods),
        money(item.operating_cost),
        money(profit),
        `${margin.toLocaleString("vi-VN", { maximumFractionDigits: 1 })}%`,
        margin >= 25 ? "Tốt" : margin >= 15 ? "Ổn định" : "Cần xem",
      ];
    }),
  },
  management: {
    kpis: [
      {
        label: "Tổng tài sản",
        value: billions(metricValue("asset_total")),
        change: "materialized_metrics",
        tone: "blue",
      },
      {
        label: "Nợ phải trả",
        value: billions(metricValue("liability_total")),
        change: "Cân đối nguồn vốn",
        tone: "amber",
      },
      {
        label: "Vốn chủ sở hữu",
        value: billions(metricValue("equity_total")),
        change: "Tài sản trừ nợ phải trả",
        tone: "green",
      },
      {
        label: "Chênh lệch WORKIT",
        value: `${money(metricValue("workit_difference"))} VND`,
        change: "dimension_key: GD1",
        tone: "green",
      },
    ],
    trendTitle: "Phát sinh Nợ/Có theo kỳ",
    trendUnit: "Tỷ VND",
    primaryLabel: "Phát sinh Nợ",
    secondaryLabel: "Phát sinh Có",
    trend: [
      { label: "T2", primary: 68, secondary: 66 },
      { label: "T3", primary: 72, secondary: 71 },
      { label: "T4", primary: 64, secondary: 65 },
      { label: "T5", primary: 83, secondary: 81 },
      { label: "T6", primary: 76, secondary: 75 },
      { label: "T7", primary: 90, secondary: 89 },
    ],
    breakdownTitle: "Cơ cấu tài sản",
    breakdown: [
      { label: "Tiền & tương đương tiền", value: "10,62 tỷ", percent: 72 },
      { label: "Các khoản phải thu", value: "8,48 tỷ", percent: 58 },
      { label: "Hàng tồn kho", value: "12,16 tỷ", percent: 82 },
      { label: "Tài sản dài hạn", value: "11,54 tỷ", percent: 76 },
    ],
    columns: [
      "Tài khoản",
      "Tên tài khoản",
      "Dư đầu kỳ",
      "Phát sinh Nợ",
      "Phát sinh Có",
      "Dư cuối kỳ",
      "WORKIT",
    ],
    rows: ledgerBalanceMocks.map((item) => [
      item.account_code,
      item.account_name,
      money(Math.max(item.opening_debit, item.opening_credit)),
      money(item.period_debit),
      money(item.period_credit),
      money(Math.max(item.closing_debit, item.closing_credit)),
      "Khớp",
    ]),
  },
};

const cashMonths = Array.from({ length: 12 }, (_, index) => index + 1);
const metricByMonth = (code: string, month: number, dimension?: string) =>
  reportMetricMocks.find(
    (item) =>
      item.metric_code === code &&
      Number(item.metric_date.slice(5, 7)) === month &&
      (dimension === undefined || item.dimension_key === dimension),
  )?.metric_value ?? 0;
const incomeDimensions = ["sales", "asset_disposal", "borrowing", "other"];
const expenseDimensions = [
  "inventory",
  "selling_admin",
  "payroll",
  "tax_interest",
];

function isoWeekRange(value: string) {
  const [yearText, weekText] = value.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const januaryFourth = new Date(Date.UTC(year, 0, 4));
  const day = januaryFourth.getUTCDay() || 7;
  const monday = new Date(januaryFourth);
  monday.setUTCDate(januaryFourth.getUTCDate() - day + 1 + (week - 1) * 7);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return [
    monday.toISOString().slice(0, 10),
    sunday.toISOString().slice(0, 10),
  ] as const;
}

function datesBetween(from: string, to: string) {
  const dates: string[] = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

export default function ReportsDashboardScreen() {
  const [selectedKey, setSelectedKey] = useState<ReportKey>("cash-flow");
  const [monitoringFilter, setMonitoringFilter] =
    useState<MonitoringFilter>("all");
  const [selectedAlertId, setSelectedAlertId] = useState(
    monitoringAlertMocks[0]?.id ?? "",
  );
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [periodValues, setPeriodValues] = useState<Record<PeriodType, string>>({
    day: "2026-07-13",
    week: "2026-W29",
    month: "2026-07",
  });
  const [appliedPeriod, setAppliedPeriod] = useState("Tháng 07/2026");
  const [appliedFilter, setAppliedFilter] = useState<{
    type: PeriodType;
    value: string;
  }>({ type: "month", value: "2026-07" });
  const selected =
    reportGroups.find((item) => item.key === selectedKey) ?? reportGroups[0];
  const dashboard = dashboardData[selectedKey];
  const filteredAlerts = useMemo(
    () =>
      monitoringFilter === "all"
        ? monitoringAlertMocks
        : monitoringAlertMocks.filter((alert) => alert.category === monitoringFilter),
    [monitoringFilter],
  );
  const selectedAlert =
    filteredAlerts.find((alert) => alert.id === selectedAlertId) ??
    filteredAlerts[0] ??
    monitoringAlertMocks[0];
  const monitoringSummary = useMemo(
    () => ({
      total: monitoringAlertMocks.length,
      critical: monitoringAlertMocks.filter((alert) => alert.severity === "critical").length,
      reviewing: monitoringAlertMocks.filter((alert) => alert.status === "reviewing").length,
      sourceModules: new Set(monitoringAlertMocks.map((alert) => alert.sourceModule)).size,
    }),
    [],
  );

  function formatPeriod(type: PeriodType, value: string) {
    if (type === "day") {
      const [year, month, day] = value.split("-");
      return value ? `Ngày ${day}/${month}/${year}` : "Chưa chọn ngày";
    }
    if (type === "week") {
      const [year, week] = value.split("-W");
      return value ? `Tuần ${week}/${year}` : "Chưa chọn tuần";
    }
    const [year, month] = value.split("-");
    return value ? `Tháng ${month}/${year}` : "Chưa chọn tháng";
  }

  function applyPeriod() {
    const value = periodValues[periodType];
    if (!value) {
      return;
    }
    setAppliedFilter({ type: periodType, value });
    setAppliedPeriod(formatPeriod(periodType, value));
  }

  const cashView = useMemo(() => {
    if (appliedFilter.type === "month") {
      const [yearText, monthText] = appliedFilter.value.split("-");
      const selectedMonth = Number(monthText);
      const months = cashMonths;
      const elapsedMonths = cashMonths.filter(
        (month) => month <= selectedMonth,
      );
      const latestIn = metricByMonth("cash_in", selectedMonth);
      const latestOut = metricByMonth("cash_out", selectedMonth);
      const cumulativeIn = elapsedMonths.reduce(
        (total, month) => total + metricByMonth("cash_in", month),
        0,
      );
      const cumulativeOut = elapsedMonths.reduce(
        (total, month) => total + metricByMonth("cash_out", month),
        0,
      );
      const incomeTotals = months.map((month) =>
        metricByMonth("cash_in", month),
      );
      const expenseTotals = months.map((month) =>
        metricByMonth("cash_out", month),
      );
      const maxCash = Math.max(1, ...incomeTotals, ...expenseTotals);
      let previousClosing = 0;
      const closings = months.map((month) => {
        const currentClosing = metricByMonth("cash_closing", month);
        if (currentClosing > 0) {
          previousClosing = currentClosing;
        }
        return previousClosing;
      });
      const closing = closings[Math.max(0, selectedMonth - 1)] ?? 0;
      const min = Math.min(...closings);
      const max = Math.max(...closings);
      return {
        modeLabel: "THÁNG",
        labels: months.map((month) => `T${String(month).padStart(2, "0")}`),
        income: months.map((month) =>
          incomeDimensions.map(
            (dimension) =>
              (metricByMonth("cash_in_by_source", month, dimension) / maxCash) *
              100,
          ),
        ),
        expense: months.map((month) =>
          expenseDimensions.map(
            (dimension) =>
              (metricByMonth("cash_out_by_purpose", month, dimension) /
                maxCash) *
              100,
          ),
        ),
        incomeTotals,
        expenseTotals,
        visibleIndexes: months
          .map((_, index) => index)
          .filter(
            (index) => incomeTotals[index] > 0 || expenseTotals[index] > 0,
          ),
        closingLine: closings.map(
          (value) => 50 + ((value - min) / Math.max(1, max - min)) * 25,
        ),
        latestIn,
        latestOut,
        cumulativeIn,
        cumulativeOut,
        closing,
        sourceCount: reportMetricMocks.filter((item) =>
          item.metric_date.startsWith(`${yearText}-${monthText}`),
        ).length,
      };
    }

    const [from, to] =
      appliedFilter.type === "day"
        ? [appliedFilter.value, appliedFilter.value]
        : isoWeekRange(appliedFilter.value);
    const dates = datesBetween(from, to);
    const filteredVouchers = voucherMocks.filter(
      (voucher) =>
        voucher.voucher_date >= from &&
        voucher.voucher_date <= to &&
        voucher.status === "posted",
    );
    const daily = dates.map((date) => {
      const rows = filteredVouchers.filter(
        (voucher) => voucher.voucher_date === date,
      );
      const cashIn =
        rows
          .filter(
            (voucher) =>
              voucher.voucher_type === "PT" || voucher.voucher_type === "BC",
          )
          .reduce((total, voucher) => total + voucher.total_debit, 0) /
        1_000_000;
      const cashOut =
        rows
          .filter(
            (voucher) =>
              voucher.voucher_type === "PC" || voucher.voucher_type === "BN",
          )
          .reduce((total, voucher) => total + voucher.total_credit, 0) /
        1_000_000;
      return { date, cashIn, cashOut };
    });
    const totalIn = daily.reduce((total, item) => total + item.cashIn, 0);
    const totalOut = daily.reduce((total, item) => total + item.cashOut, 0);
    const incomeTotals = daily.map((item) => item.cashIn);
    const expenseTotals = daily.map((item) => item.cashOut);
    const maxCash = Math.max(1, ...incomeTotals, ...expenseTotals);
    let runningClosing = metricByMonth("cash_closing", 6);
    const closingLine = daily.map((item) => {
      runningClosing += item.cashIn - item.cashOut;
      return runningClosing;
    });
    const min = Math.min(...closingLine);
    const max = Math.max(...closingLine);
    return {
      modeLabel: appliedFilter.type === "day" ? "NGÀY" : "TUẦN",
      labels: daily.map(
        (item) => item.date.slice(8, 10) + "/" + item.date.slice(5, 7),
      ),
      income: daily.map((item) => [(item.cashIn / maxCash) * 100, 0, 0, 0]),
      expense: daily.map((item) => [(item.cashOut / maxCash) * 100, 0, 0, 0]),
      incomeTotals,
      expenseTotals,
      visibleIndexes: daily.map((_, index) => index),
      closingLine: closingLine.map(
        (value) => 50 + ((value - min) / Math.max(1, max - min)) * 25,
      ),
      latestIn: totalIn,
      latestOut: totalOut,
      cumulativeIn: totalIn,
      cumulativeOut: totalOut,
      closing: closingLine.at(-1) ?? metricByMonth("cash_closing", 6),
      sourceCount: filteredVouchers.length,
    };
  }, [appliedFilter]);

  const debtView = useMemo(() => {
    const receivables = [...debtDashboardMocks.receivables]
      .sort((a, b) => b.current_amount - a.current_amount)
      .slice(0, 10);
    const payables = [...debtDashboardMocks.payables]
      .sort((a, b) => b.current_amount - a.current_amount)
      .slice(0, 10);

    return {
      receivables,
      payables,
      receivableMax: Math.max(
        1,
        ...receivables.map((item) => item.current_amount),
      ),
      payableMax: Math.max(1, ...payables.map((item) => item.current_amount)),
      kpis: [
        {
          label: "Dư nợ KH đầu năm",
          value: billions(sumDebt(receivables, "opening_amount")),
          icon: "BadgeDollarSign",
          tone: "mint",
        },
        {
          label: "Dư nợ KH hiện tại",
          value: billions(sumDebt(receivables, "current_amount")),
          icon: "CircleDollarSign",
          tone: "cyan",
        },
        {
          label: "Dư nợ KH quá hạn",
          value: billions(sumDebt(receivables, "overdue_amount")),
          icon: "ReceiptText",
          tone: "red",
        },
        {
          label: "Dư nợ NCC đầu năm",
          value: billions(sumDebt(payables, "opening_amount")),
          icon: "Landmark",
          tone: "green",
        },
        {
          label: "Dư nợ NCC hiện tại",
          value: billions(sumDebt(payables, "current_amount")),
          icon: "WalletCards",
          tone: "purple",
        },
        {
          label: "Dư nợ NCC quá hạn",
          value: billions(sumDebt(payables, "overdue_amount")),
          icon: "RefreshCw",
          tone: "orange",
        },
      ],
    };
  }, []);

  return (
    <AppShell activeModule="reports">
      <div className="workspace reports-workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">
            Trang chủ
          </a>
          <span>/</span>
          <span>Báo cáo & Dashboard</span>
        </div>

        <div className="reports-summary-grid">
          {summaryMetrics.map((metric) => (
            <article
              className={`reports-summary-card tone-${metric.tone}`}
              key={metric.label}
            >
              <span className="reports-summary-icon">
                <AppIcon name={metric.icon} size={18} />
              </span>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <small>{metric.hint}</small>
              </div>
            </article>
          ))}
        </div>

        {selectedAlert ? (
          <section className="monitoring-panel">
            <header className="monitoring-header">
              <div>
                <span className="eyebrow">Giám sát vận hành</span>
                <h2>Giám sát & Cảnh báo bất thường</h2>
                <p>
                  Hệ thống phân tích dữ liệu WORKIT đã đồng bộ để phát hiện nợ
                  quá hạn, chi vượt định mức, dòng tiền âm dự báo và bút toán
                  lệch cần kế toán rà soát.
                </p>
              </div>
              <div className="monitoring-health-card">
                <AppIcon name="ShieldCheck" size={22} />
                <span>
                  <small>Cảnh báo cần xem</small>
                  <strong>
                    {String(monitoringSummary.total).padStart(2, "0")}
                  </strong>
                </span>
              </div>
            </header>

            <div className="monitoring-kpi-grid">
              <article>
                <span>Tổng cảnh báo</span>
                <strong>{monitoringSummary.total}</strong>
                <small>Mock data demo</small>
              </article>
              <article className="tone-red">
                <span>Nghiêm trọng</span>
                <strong>{monitoringSummary.critical}</strong>
                <small>Cần xử lý trước</small>
              </article>
              <article className="tone-amber">
                <span>Đang rà soát</span>
                <strong>{monitoringSummary.reviewing}</strong>
                <small>Kế toán đang kiểm tra</small>
              </article>
              <article className="tone-blue">
                <span>Nguồn phân hệ</span>
                <strong>{monitoringSummary.sourceModules}</strong>
                <small>Công nợ · Tiền · Sổ cái</small>
              </article>
            </div>

            <div className="monitoring-filter-row" aria-label="Lọc cảnh báo">
              {monitoringFilters.map((filter) => (
                <button
                  className={monitoringFilter === filter.key ? "is-active" : ""}
                  type="button"
                  key={filter.key}
                  onClick={() => setMonitoringFilter(filter.key)}
                >
                  <AppIcon name={filter.icon} size={15} />
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="monitoring-content-grid">
              <div className="monitoring-alert-list">
                {filteredAlerts.map((alert) => (
                  <button
                    className={`monitoring-alert-card severity-${alert.severity} ${selectedAlert.id === alert.id ? "is-selected" : ""}`}
                    type="button"
                    key={alert.id}
                    onClick={() => setSelectedAlertId(alert.id)}
                  >
                    <span className="monitoring-alert-icon">
                      <AppIcon
                        name={
                          alert.category === "debt_overdue"
                            ? "ReceiptText"
                            : alert.category === "expense_limit"
                              ? "Calculator"
                              : alert.category === "cashflow_negative"
                                ? "WalletCards"
                                : "FileText"
                        }
                        size={18}
                      />
                    </span>
                    <span className="monitoring-alert-copy">
                      <strong>{alert.title}</strong>
                      <small>
                        {monitoringCategoryLabels[alert.category]} ·{" "}
                        {alert.entityRef}
                      </small>
                    </span>
                    <span
                      className={`monitoring-severity severity-${alert.severity}`}
                    >
                      {monitoringSeverityLabels[alert.severity]}
                    </span>
                  </button>
                ))}
              </div>

              <article
                className={`monitoring-detail-card severity-${selectedAlert.severity}`}
              >
                <div className="monitoring-detail-title">
                  <div>
                    <span className="eyebrow">
                      {monitoringCategoryLabels[selectedAlert.category]}
                    </span>
                    <h3>{selectedAlert.title}</h3>
                    <p>{selectedAlert.recommendation}</p>
                  </div>
                  <span
                    className={`monitoring-status status-${selectedAlert.status}`}
                  >
                    {monitoringStatusLabels[selectedAlert.status]}
                  </span>
                </div>

                <div className="monitoring-rule-grid">
                  <div>
                    <span>Ngưỡng cảnh báo</span>
                    <strong>{selectedAlert.threshold}</strong>
                  </div>
                  <div>
                    <span>Giá trị thực tế</span>
                    <strong>{selectedAlert.actual}</strong>
                  </div>
                  <div>
                    <span>Chênh lệch</span>
                    <strong>{selectedAlert.variance}</strong>
                  </div>
                  <div>
                    <span>Thời điểm phát hiện</span>
                    <strong>{selectedAlert.detectedAt}</strong>
                  </div>
                </div>

                <div className="monitoring-analysis-box">
                  <header>
                    <h4>Thuộc tính đã phân tích</h4>
                    <span>{selectedAlert.period}</span>
                  </header>
                  <div>
                    {selectedAlert.analysisFields.map((field) => (
                      <span key={`${selectedAlert.id}-${field.label}`}>
                        <small>{field.label}</small>
                        <strong>{field.value}</strong>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="monitoring-detail-footer">
                  <span>
                    <small>Phân hệ nguồn</small>
                    <strong>{selectedAlert.sourceModule}</strong>
                  </span>
                  <span>
                    <small>Người phụ trách</small>
                    <strong>{selectedAlert.owner}</strong>
                  </span>
                  <a className="button primary" href={selectedAlert.drilldownHref}>
                    Mở chi tiết
                    <AppIcon name="ArrowRight" size={15} />
                  </a>
                </div>
              </article>
            </div>

            <div className="monitoring-table-wrap">
              <div className="dashboard-table-heading">
                <div>
                  <h3>Danh sách cảnh báo</h3>
                  <span>
                    Frontend mock · Ngưỡng cảnh báo có thể cấu hình ở GĐ sau
                  </span>
                </div>
              </div>
              <div className="table-scroll">
                <table className="data-table monitoring-table">
                  <thead>
                    <tr>
                      <th>Loại cảnh báo</th>
                      <th>Đối tượng</th>
                      <th>Số tiền</th>
                      <th>Ngưỡng</th>
                      <th>Mức độ</th>
                      <th>Trạng thái</th>
                      <th>Khuyến nghị</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAlerts.map((alert) => (
                      <tr key={`row-${alert.id}`}>
                        <td>{monitoringCategoryLabels[alert.category]}</td>
                        <td>{alert.entityRef}</td>
                        <td>{money(alert.amount)}</td>
                        <td>{alert.threshold}</td>
                        <td>
                          <span
                            className={`monitoring-severity severity-${alert.severity}`}
                          >
                            {monitoringSeverityLabels[alert.severity]}
                          </span>
                        </td>
                        <td>{monitoringStatusLabels[alert.status]}</td>
                        <td>{alert.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}

        <div className="section-title reports-section-heading">
          <div>
            <h2>Chọn nhóm báo cáo</h2>
            <p>
              Chọn một nhóm để xem chỉ tiêu, nguồn dữ liệu và lối truy cập
              nhanh.
            </p>
          </div>
          <span className="module-meta">Tự động theo ngày · tuần · tháng</span>
        </div>

        <div className="auto-report-grid">
          {reportGroups.map((report) => (
            <button
              className={`auto-report-card tone-${report.tone} ${selectedKey === report.key ? "is-selected" : ""}`}
              type="button"
              key={report.key}
              onClick={() => setSelectedKey(report.key)}
              aria-pressed={selectedKey === report.key}
            >
              <span className="auto-report-icon">
                <AppIcon name={report.icon} size={22} />
              </span>
              <span className="auto-report-copy">
                <strong>{report.title}</strong>
                <small>{report.description}</small>
              </span>
              <span className="auto-report-arrow">
                <AppIcon name="ArrowRight" size={17} />
              </span>
            </button>
          ))}
        </div>

        <section className={`report-detail-panel tone-${selected.tone}`}>
          <header className="report-detail-header">
            <div>
              <span className="eyebrow">Đang chọn · {selected.shortTitle}</span>
              <h2>{selected.title}</h2>
              <p>{selected.description}</p>
            </div>
            <div className="report-schedule-badge">
              <AppIcon name="RefreshCw" size={16} />
              <span>
                <small>Lịch tự động</small>
                <strong>{selected.schedule}</strong>
              </span>
            </div>
          </header>

          <div className="report-period-filter">
            <div className="report-period-tabs" aria-label="Kiểu thời gian">
              {(
                [
                  ["day", "Ngày"],
                  ["week", "Tuần"],
                  ["month", "Tháng"],
                ] as const
              ).map(([type, label]) => (
                <button
                  className={periodType === type ? "is-active" : ""}
                  type="button"
                  key={type}
                  onClick={() => setPeriodType(type)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="report-period-input">
              <span>Chọn kỳ báo cáo</span>
              <input
                type={periodType}
                value={periodValues[periodType]}
                onChange={(event) =>
                  setPeriodValues((current) => ({
                    ...current,
                    [periodType]: event.target.value,
                  }))
                }
              />
            </label>
            <button
              className="button primary report-filter-apply"
              type="button"
              onClick={applyPeriod}
            >
              <AppIcon name="Search" size={16} /> Áp dụng
            </button>
            <div className="report-applied-period">
              <small>Đang hiển thị</small>
              <strong>{appliedPeriod}</strong>
            </div>
          </div>

          {selectedKey === "cash-flow" ? (
            <div className="cashflow-classic-dashboard">
              <div className="cashflow-classic-titlebar">
                <div>
                  <span>
                    Báo cáo quản trị · {cashView.sourceCount} bản ghi nguồn
                  </span>
                  <h2>BÁO CÁO DÒNG TIỀN</h2>
                </div>
                <div>
                  <small>Kỳ báo cáo · {reportSnapshotMock.report_code}</small>
                  <strong>{appliedPeriod}</strong>
                </div>
              </div>

              <div className="cashflow-classic-kpis">
                <article>
                  <span>Dòng thu</span>
                  <strong>{money(cashView.latestIn)}</strong>
                  <small>Lũy kế: {money(cashView.cumulativeIn)}</small>
                </article>
                <article>
                  <span>Dòng chi</span>
                  <strong>-{money(cashView.latestOut)}</strong>
                  <small>Lũy kế: -{money(cashView.cumulativeOut)}</small>
                </article>
                <article>
                  <span>Lưu chuyển tiền thuần</span>
                  <strong>
                    {money(cashView.latestIn - cashView.latestOut)}
                  </strong>
                  <small>
                    Lũy kế:{" "}
                    {money(cashView.cumulativeIn - cashView.cumulativeOut)}
                  </small>
                </article>
                <article>
                  <span>Tiền cuối kỳ</span>
                  <strong>{money(cashView.closing)}</strong>
                  <small className="positive">Đã tính theo kỳ áp dụng</small>
                </article>
              </div>

              <article className="cashflow-stacked-chart cashflow-grouped-chart">
                <header>
                  <h3>TỔNG THU CHI THEO {cashView.modeLabel}</h3>
                  <span>Đơn vị: triệu VND</span>
                </header>
                <div className="cashflow-chart-area cashflow-grouped-area">
                  {cashView.labels.map((label, index) => {
                    const incomeHeight = cashView.income[index].reduce(
                      (sum, value) => sum + value,
                      0,
                    );
                    const expenseHeight = cashView.expense[index].reduce(
                      (sum, value) => sum + value,
                      0,
                    );
                    return (
                      <div
                        className="cashflow-stack-group"
                        key={`cash-${label}`}
                      >
                        <div className="cashflow-paired-bars">
                          <div
                            className="cashflow-paired-bar income"
                            style={{ height: `${incomeHeight}%` }}
                          >
                            <span>{money(cashView.incomeTotals[index])}</span>
                          </div>
                          <div
                            className="cashflow-paired-bar expense"
                            style={{ height: `${expenseHeight}%` }}
                          >
                            <span>{money(cashView.expenseTotals[index])}</span>
                          </div>
                        </div>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="cashflow-combined-legend">
                  <span className="income">Thu</span>
                  <span className="expense">Chi</span>
                </div>
              </article>

              <article className="cashflow-combined-chart">
                <header>
                  <h3>DÒNG TIỀN</h3>
                  <span>Thu · Chi · Số dư cuối kỳ</span>
                </header>
                <div className="cashflow-combined-area">
                  <svg
                    className="cashflow-line"
                    viewBox="0 0 800 160"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <polyline
                      points={cashView.visibleIndexes
                        .map(
                          (dataIndex, visibleIndex) =>
                            `${(visibleIndex + 0.5) * (800 / Math.max(1, cashView.visibleIndexes.length))},${145 - cashView.closingLine[dataIndex] * 1.45}`,
                        )
                        .join(" ")}
                    />
                    {cashView.visibleIndexes.map((dataIndex, visibleIndex) => (
                      <circle
                        cx={
                          (visibleIndex + 0.5) *
                          (800 / Math.max(1, cashView.visibleIndexes.length))
                        }
                        cy={145 - cashView.closingLine[dataIndex] * 1.45}
                        r="4"
                        key={dataIndex}
                      />
                    ))}
                  </svg>
                  {cashView.visibleIndexes.map((index) => (
                    <div
                      className="cashflow-net-group"
                      key={`net-${cashView.labels[index]}`}
                    >
                      <div>
                        <i
                          className="income"
                          style={{
                            height: `${cashView.income[index].reduce((sum, value) => sum + value, 0)}%`,
                          }}
                        />
                        <i
                          className="expense"
                          style={{
                            height: `${cashView.expense[index].reduce((sum, value) => sum + value, 0) * 0.72}%`,
                          }}
                        />
                      </div>
                      <span>{cashView.labels[index]}</span>
                    </div>
                  ))}
                </div>
                <div className="cashflow-combined-legend">
                  <span className="income">Tổng dòng thu</span>
                  <span className="expense">Tổng dòng chi</span>
                  <span className="closing">Số dư cuối kỳ</span>
                </div>
              </article>
            </div>
          ) : selectedKey === "receivables" ? (
            <div className="debt-dashboard">
              <div className="debt-kpi-grid">
                {debtView.kpis.map((kpi) => (
                  <article
                    className={`debt-kpi-card tone-${kpi.tone}`}
                    key={kpi.label}
                  >
                    <span className="debt-kpi-icon">
                      <AppIcon name={kpi.icon} size={20} />
                    </span>
                    <div>
                      <span>{kpi.label}</span>
                      <strong>{kpi.value}</strong>
                      <small>{appliedPeriod}</small>
                    </div>
                  </article>
                ))}
              </div>

              <div className="debt-chart-grid">
                {[
                  {
                    title: "Top 10 công nợ phải thu",
                    rows: debtView.receivables,
                    max: debtView.receivableMax,
                    type: "receivable",
                  },
                  {
                    title: "Top 10 công nợ phải trả",
                    rows: debtView.payables,
                    max: debtView.payableMax,
                    type: "payable",
                  },
                ].map((chart) => (
                  <article className="debt-horizontal-chart" key={chart.type}>
                    <header>
                      <h3>{chart.title} theo kỳ</h3>
                      <span>Đơn vị: VND</span>
                    </header>
                    <div className="debt-horizontal-list">
                      {chart.rows.map((row) => (
                        <div
                          className="debt-horizontal-row"
                          key={row.counterparty_code}
                        >
                          <span title={row.counterparty_name}>
                            {row.counterparty_name}
                          </span>
                          <div className="debt-bar-track">
                            <i
                              style={{
                                width: `${(row.current_amount / chart.max) * 100}%`,
                              }}
                            />
                          </div>
                          <strong>{money(row.current_amount)}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="selected-dashboard-kpis">
                {dashboard.kpis.map((kpi) => (
                  <article
                    className={`selected-dashboard-kpi tone-${kpi.tone}`}
                    key={kpi.label}
                  >
                    <span>{kpi.label}</span>
                    <strong>{kpi.value}</strong>
                    <small>{kpi.change}</small>
                  </article>
                ))}
              </div>

              <div className="selected-dashboard-visuals">
                <article className="dashboard-chart-card">
                  <header>
                    <div>
                      <h3>{dashboard.trendTitle}</h3>
                      <span>{dashboard.trendUnit}</span>
                    </div>
                    <div className="chart-legend">
                      <span className="primary">{dashboard.primaryLabel}</span>
                      <span className="secondary">
                        {dashboard.secondaryLabel}
                      </span>
                    </div>
                  </header>
                  <div className="dashboard-bar-chart">
                    {dashboard.trend.map((point) => (
                      <div
                        className={`dashboard-bar-group ${point.forecast ? "is-forecast" : ""}`}
                        key={point.label}
                      >
                        <div className="dashboard-bars">
                          <i
                            className="primary"
                            style={{ height: `${point.primary}%` }}
                          />
                          <i
                            className="secondary"
                            style={{ height: `${point.secondary}%` }}
                          />
                        </div>
                        <span>{point.label}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="dashboard-breakdown-card">
                  <header>
                    <h3>{dashboard.breakdownTitle}</h3>
                    <span>Giá trị tổng hợp</span>
                  </header>
                  <div className="dashboard-breakdown-list">
                    {dashboard.breakdown.map((item) => (
                      <div key={item.label}>
                        <div>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </div>
                        <i>
                          <b style={{ width: `${item.percent}%` }} />
                        </i>
                      </div>
                    ))}
                  </div>
                  <div className="dashboard-source-note">
                    <AppIcon name="Database" size={14} />
                    <span>
                      <strong>Nguồn dữ liệu</strong>
                      {selected.source}
                    </span>
                  </div>
                </article>
              </div>

              <div className="dashboard-detail-table-wrap">
                <div className="dashboard-table-heading">
                  <div>
                    <h3>Chi tiết báo cáo</h3>
                    <span>
                      Dữ liệu minh họa · Có thể truy ngược về chứng từ nguồn
                    </span>
                  </div>
                  <button className="button button-sm" type="button">
                    <AppIcon name="Upload" size={15} />
                    Xuất báo cáo
                  </button>
                </div>
                <div className="table-scroll">
                  <table className="data-table dashboard-detail-table">
                    <thead>
                      <tr>
                        {dashboard.columns.map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.rows.map((row, rowIndex) => (
                        <tr key={`${selectedKey}-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={`${cell}-${cellIndex}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <footer className="report-detail-actions">
            {selected.actions.map((action) => (
              <a
                className={`button ${action.primary ? "primary" : ""}`}
                href={action.href}
                key={action.label}
              >
                {action.label}
                <AppIcon name="ArrowRight" size={15} />
              </a>
            ))}
          </footer>
        </section>
      </div>
    </AppShell>
  );
}
