import { useMemo, useState } from "react";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";

const money = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

type PrepaidStatus = "allocating" | "ending" | "completed" | "paused";

type PrepaidExpenseMock = {
  id: string;
  prepaidCode: string;
  prepaidName: string;
  supplierName: string;
  startDate: string;
  endDate: string;
  originalAmount: number;
  allocatedAmount: number;
  allocationMonths: number;
  expenseAccount: string;
  prepaidAccount: string;
  department: string;
  project: string;
  status: PrepaidStatus;
};

const prepaidExpenseMocks: PrepaidExpenseMock[] = [
  {
    id: "prepaid-erp-license",
    prepaidCode: "CPPT-2607-001",
    prepaidName: "Phí bản quyền phần mềm kế toán 12 tháng",
    supplierName: "Công ty Công nghệ Sao Việt",
    startDate: "2026-07-01",
    endDate: "2027-06-30",
    originalAmount: 240000000,
    allocatedAmount: 20000000,
    allocationMonths: 12,
    expenseAccount: "642",
    prepaidAccount: "242",
    department: "Văn phòng",
    project: "DA-ERP-2026",
    status: "allocating",
  },
  {
    id: "prepaid-rent",
    prepaidCode: "CPPT-2606-014",
    prepaidName: "Thuê kho nguyên liệu trả trước",
    supplierName: "Công ty Kho vận Đông Nam",
    startDate: "2026-06-01",
    endDate: "2026-11-30",
    originalAmount: 360000000,
    allocatedAmount: 120000000,
    allocationMonths: 6,
    expenseAccount: "627",
    prepaidAccount: "242",
    department: "Sản xuất",
    project: "KHO-NVL-Q3",
    status: "allocating",
  },
  {
    id: "prepaid-insurance",
    prepaidCode: "CPPT-2601-003",
    prepaidName: "Bảo hiểm cháy nổ nhà xưởng",
    supplierName: "Bảo hiểm Bảo Minh",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    originalAmount: 180000000,
    allocatedAmount: 90000000,
    allocationMonths: 12,
    expenseAccount: "627",
    prepaidAccount: "242",
    department: "Nhà máy",
    project: "FACTORY-OPS",
    status: "allocating",
  },
  {
    id: "prepaid-marketing",
    prepaidCode: "CPPT-2603-009",
    prepaidName: "Chi phí chiến dịch marketing 6 tháng",
    supplierName: "Agency Blue Ocean",
    startDate: "2026-03-01",
    endDate: "2026-08-31",
    originalAmount: 150000000,
    allocatedAmount: 125000000,
    allocationMonths: 6,
    expenseAccount: "641",
    prepaidAccount: "242",
    department: "Bán hàng",
    project: "MKT-H2-2026",
    status: "ending",
  },
  {
    id: "prepaid-maintenance",
    prepaidCode: "CPPT-2512-021",
    prepaidName: "Bảo trì máy cắt giấy trả trước",
    supplierName: "Cơ khí Tân Phát",
    startDate: "2025-12-01",
    endDate: "2026-05-31",
    originalAmount: 96000000,
    allocatedAmount: 96000000,
    allocationMonths: 6,
    expenseAccount: "627",
    prepaidAccount: "242",
    department: "Sản xuất",
    project: "MAINT-2026",
    status: "completed",
  },
  {
    id: "prepaid-training",
    prepaidCode: "CPPT-2607-018",
    prepaidName: "Đào tạo vận hành hệ thống mới",
    supplierName: "Viện Đào tạo Quản trị",
    startDate: "2026-07-01",
    endDate: "2026-10-31",
    originalAmount: 80000000,
    allocatedAmount: 0,
    allocationMonths: 4,
    expenseAccount: "642",
    prepaidAccount: "242",
    department: "Nhân sự",
    project: "HR-UPSKILL",
    status: "paused",
  },
];

const statusLabels: Record<PrepaidStatus, string> = {
  allocating: "Đang phân bổ",
  ending: "Sắp hết kỳ",
  completed: "Đã phân bổ xong",
  paused: "Tạm dừng",
};

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "allocating", label: "Đang phân bổ" },
  { value: "ending", label: "Sắp hết kỳ" },
  { value: "completed", label: "Đã phân bổ xong" },
  { value: "paused", label: "Tạm dừng" },
] as const;

const allocationPeriod = "2026-07";

function formatDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function monthLabel(value: string) {
  const [year, month] = value.split("-");
  return `Tháng ${month}/${year}`;
}

function monthlyAllocation(row: PrepaidExpenseMock) {
  return Math.round(row.originalAmount / row.allocationMonths);
}

function remainingAmount(row: PrepaidExpenseMock) {
  return Math.max(0, row.originalAmount - row.allocatedAmount);
}

function remainingMonths(row: PrepaidExpenseMock) {
  return Math.ceil(remainingAmount(row) / Math.max(1, monthlyAllocation(row)));
}

function buildSchedule(row: PrepaidExpenseMock) {
  const [yearText, monthText] = row.startDate.split("-");
  const startYear = Number(yearText);
  const startMonth = Number(monthText);
  const amount = monthlyAllocation(row);

  return Array.from({ length: row.allocationMonths }, (_, index) => {
    const absoluteMonth = startMonth - 1 + index;
    const year = startYear + Math.floor(absoluteMonth / 12);
    const month = (absoluteMonth % 12) + 1;
    const period = `${year}-${String(month).padStart(2, "0")}`;
    const cumulative = Math.min(row.originalAmount, amount * (index + 1));

    return {
      period,
      amount: index === row.allocationMonths - 1 ? row.originalAmount - amount * index : amount,
      cumulative,
      status:
        period < allocationPeriod
          ? "Đã phân bổ"
          : period === allocationPeriod
            ? "Kỳ hiện tại"
            : "Dự kiến",
    };
  });
}

export default function PrepaidExpenseAllocationScreen() {
  const [selectedId, setSelectedId] = useState(prepaidExpenseMocks[0].id);
  const [period, setPeriod] = useState(allocationPeriod);
  const [status, setStatus] = useState<(typeof statusOptions)[number]["value"]>("all");
  const [department, setDepartment] = useState("all");
  const [expenseAccount, setExpenseAccount] = useState("all");
  const [feedback, setFeedback] = useState("");

  const departments = useMemo(
    () => ["all", ...Array.from(new Set(prepaidExpenseMocks.map((item) => item.department)))],
    [],
  );
  const expenseAccounts = useMemo(
    () => ["all", ...Array.from(new Set(prepaidExpenseMocks.map((item) => item.expenseAccount)))],
    [],
  );
  const filteredRows = useMemo(
    () =>
      prepaidExpenseMocks.filter(
        (item) =>
          (status === "all" || item.status === status) &&
          (department === "all" || item.department === department) &&
          (expenseAccount === "all" || item.expenseAccount === expenseAccount),
      ),
    [department, expenseAccount, status],
  );
  const selected = filteredRows.find((item) => item.id === selectedId) ?? filteredRows[0] ?? prepaidExpenseMocks[0];
  const schedule = buildSchedule(selected);
  const currentAllocation =
    selected.status === "completed" || selected.status === "paused"
      ? 0
      : Math.min(monthlyAllocation(selected), remainingAmount(selected));
  const totalOriginal = filteredRows.reduce((sum, item) => sum + item.originalAmount, 0);
  const totalAllocated = filteredRows.reduce((sum, item) => sum + item.allocatedAmount, 0);
  const totalRemaining = filteredRows.reduce((sum, item) => sum + remainingAmount(item), 0);
  const dueThisPeriod = filteredRows.reduce((sum, item) => {
    if (item.status === "completed" || item.status === "paused") {
      return sum;
    }
    return sum + Math.min(monthlyAllocation(item), remainingAmount(item));
  }, 0);

  function createDraftJournal() {
    if (!currentAllocation) {
      setFeedback(`Khoản ${selected.prepaidCode} không có số phân bổ cho ${monthLabel(period)}.`);
      return;
    }

    setFeedback(
      `Đã tạo bút toán nháp PB-${selected.prepaidCode}-${period}: Nợ ${selected.expenseAccount} / Có ${selected.prepaidAccount} ${money.format(currentAllocation)}.`,
    );
  }

  return (
    <AppShell activeModule="accounting">
      <div className="workspace prepaid-workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/modules/accounting">
            Kế toán
          </a>
          <span>/</span>
          <span>Chi phí trả trước</span>
          <span>/</span>
          <span>Phân bổ CP trả trước</span>
        </div>

        <section className="hero-panel prepaid-hero">
          <div>
            <div className="eyebrow">Prepaid expense allocation</div>
            <h2 className="hero-title">Phân bổ chi phí trả trước</h2>
            <p className="hero-copy">
              Theo dõi chi phí trả trước theo kỳ, phòng ban/dự án và sinh bút toán phân bổ đề xuất. Dữ liệu hiện là mock frontend để demo quy trình.
            </p>
          </div>
          <div className="sync-panel">
            <strong>{filteredRows.length} khoản CP trả trước</strong>
            <span>Kỳ phân bổ đang xem: {monthLabel(period)}</span>
          </div>
        </section>

        <div className="prepaid-kpi-grid">
          <article>
            <span>Tổng nguyên giá</span>
            <strong>{money.format(totalOriginal)}</strong>
            <small>{filteredRows.length} khoản theo bộ lọc</small>
          </article>
          <article>
            <span>Đã phân bổ</span>
            <strong>{money.format(totalAllocated)}</strong>
            <small>Ghi nhận các kỳ trước</small>
          </article>
          <article>
            <span>Còn lại</span>
            <strong>{money.format(totalRemaining)}</strong>
            <small>Tiếp tục phân bổ</small>
          </article>
          <article>
            <span>Kỳ cần phân bổ</span>
            <strong>{money.format(dueThisPeriod)}</strong>
            <small>{monthLabel(period)}</small>
          </article>
        </div>

        <section className="panel prepaid-filter-panel">
          <label>
            <span>Kỳ phân bổ</span>
            <input className="field" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
          </label>
          <label>
            <span>Trạng thái</span>
            <select className="field" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              {statusOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Phòng ban/dự án</span>
            <select className="field" value={department} onChange={(event) => setDepartment(event.target.value)}>
              {departments.map((item) => (
                <option value={item} key={item}>
                  {item === "all" ? "Tất cả phòng ban" : item}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Tài khoản chi phí</span>
            <select className="field" value={expenseAccount} onChange={(event) => setExpenseAccount(event.target.value)}>
              {expenseAccounts.map((item) => (
                <option value={item} key={item}>
                  {item === "all" ? "Tất cả tài khoản" : item}
                </option>
              ))}
            </select>
          </label>
        </section>

        <div className="prepaid-layout">
          <section className="panel prepaid-table-card">
            <div className="subsection">
              <h3>Danh sách chi phí trả trước</h3>
              <span className="module-meta">Bấm một dòng để xem lịch phân bổ và bút toán đề xuất</span>
            </div>
            <div className="table-scroll">
              <table className="data-table prepaid-table">
                <thead>
                  <tr>
                    <th>Mã CP</th>
                    <th>Tên CP trả trước</th>
                    <th>NCC</th>
                    <th>Bắt đầu</th>
                    <th>Kết thúc</th>
                    <th>Nguyên giá</th>
                    <th>Đã phân bổ</th>
                    <th>Còn lại</th>
                    <th>Số kỳ còn</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <tr className={row.id === selected.id ? "is-selected" : ""} key={row.id} onClick={() => setSelectedId(row.id)}>
                      <td>{row.prepaidCode}</td>
                      <td>{row.prepaidName}</td>
                      <td>{row.supplierName}</td>
                      <td>{formatDate(row.startDate)}</td>
                      <td>{formatDate(row.endDate)}</td>
                      <td>{money.format(row.originalAmount)}</td>
                      <td>{money.format(row.allocatedAmount)}</td>
                      <td>{money.format(remainingAmount(row))}</td>
                      <td>{remainingMonths(row)}</td>
                      <td>
                        <span className={`prepaid-status status-${row.status}`}>{statusLabels[row.status]}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="panel prepaid-detail-card">
            <span className={`prepaid-status status-${selected.status}`}>{statusLabels[selected.status]}</span>
            <h3>{selected.prepaidName}</h3>
            <p>{selected.prepaidCode} · {selected.supplierName}</p>
            <div className="prepaid-detail-grid">
              <span>
                <small>TK trả trước</small>
                <strong>{selected.prepaidAccount}</strong>
              </span>
              <span>
                <small>TK chi phí</small>
                <strong>{selected.expenseAccount}</strong>
              </span>
              <span>
                <small>Phòng ban</small>
                <strong>{selected.department}</strong>
              </span>
              <span>
                <small>Dự án</small>
                <strong>{selected.project}</strong>
              </span>
            </div>
            <div className="prepaid-progress">
              <div>
                <span>Tiến độ phân bổ</span>
                <strong>{Math.round((selected.allocatedAmount / selected.originalAmount) * 100)}%</strong>
              </div>
              <i>
                <b style={{ width: `${Math.min(100, (selected.allocatedAmount / selected.originalAmount) * 100)}%` }} />
              </i>
            </div>
            <div className="prepaid-journal-box">
              <span>Bút toán đề xuất kỳ này</span>
              <strong>
                Nợ {selected.expenseAccount} / Có {selected.prepaidAccount}: {money.format(currentAllocation)}
              </strong>
              <small>{monthLabel(period)} · chưa ghi sổ thật</small>
              <button className="button primary" type="button" onClick={createDraftJournal}>
                <AppIcon name="ReceiptText" size={16} />
                Tạo bút toán phân bổ kỳ này
              </button>
            </div>
            {feedback ? (
              <div className="attachment-box prepaid-feedback">
                <strong>Trạng thái demo</strong>
                <p>{feedback}</p>
              </div>
            ) : null}
          </aside>
        </div>

        <section className="panel prepaid-schedule-card">
          <div className="subsection">
            <h3>Lịch phân bổ theo tháng</h3>
            <span className="module-meta">{selected.prepaidCode} · {selected.allocationMonths} kỳ</span>
          </div>
          <div className="prepaid-schedule-grid">
            {schedule.map((item) => (
              <article className={item.period === period ? "is-current" : ""} key={item.period}>
                <span>{monthLabel(item.period)}</span>
                <strong>{money.format(item.amount)}</strong>
                <small>{item.status}</small>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
