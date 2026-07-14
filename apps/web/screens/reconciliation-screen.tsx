"use client";

import { useEffect, useMemo, useState } from "react";
import { reconciliationItems, reconciliationScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi, postApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const selectedBankAccount = {
  accountNo: "VCB-001",
  bankName: "Vietcombank - CN Sai Gon",
  holderName: "Cong ty Workit Demo"
};

const importedStatementFile = "VCB_auto_reconciliation_demo_2026-07-14.csv";

type ReconciliationPayload = typeof reconciliationItems;

type DemoScenario = {
  id: string;
  category?: string;
  rowNo?: number;
  title: string;
  subtitle: string;
  icon: string;
  tone: "green" | "blue" | "amber" | "red";
  voucherId: string;
  voucherNo: string;
  statementLineId: string;
  referenceNo: string;
  transactionDate: string;
  description: string;
  amount: number;
  confidence: number;
  status: "matched" | "partial" | "split" | "unmatched";
  matchReason: string;
  accountingEntry: Array<{ debitAccount: string; creditAccount: string; amount: number; description: string }>;
  allocations?: Array<{ invoiceNo: string; amount: number }>;
};

const demoScenarios: DemoScenario[] = [
  {
    id: "matched",
    title: "Khớp hoàn toàn",
    subtitle: "Số tiền, tham chiếu và nội dung đều trùng",
    icon: "ShieldCheck",
    tone: "green",
    voucherId: "cash-voucher-003",
    voucherNo: "BN1-26070003",
    statementLineId: "statement-line-demo-001",
    referenceNo: "BN1-26070003",
    transactionDate: "2026-07-14",
    description: "THANH TOAN NCC TTP MH-26070008 REF BN1-26070003",
    amount: 62000000,
    confidence: 100,
    status: "matched",
    matchReason: "Trùng số tiền, mã chứng từ BN1-26070003 và nội dung nhà cung cấp TTP.",
    accountingEntry: [
      {
        debitAccount: "331",
        creditAccount: "1121",
        amount: 62000000,
        description: "Thanh toán nhà cung cấp TTP qua ngân hàng."
      }
    ]
  },
  {
    id: "partial",
    title: "Khớp một phần",
    subtitle: "Khách thanh toán thấp hơn công nợ còn lại",
    icon: "Calculator",
    tone: "blue",
    voucherId: "cash-voucher-004",
    voucherNo: "BC1-26070005",
    statementLineId: "statement-line-demo-002",
    referenceNo: "FT2619600101",
    transactionDate: "2026-07-14",
    description: "CONG TY CO PHAN 32 TT MOT PHAN BH-26070011",
    amount: 30000000,
    confidence: 88,
    status: "partial",
    matchReason: "Trùng khách hàng KH32 và hóa đơn BH-26070011, nhưng số tiền chỉ khớp một phần.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount: 30000000,
        description: "Ghi nhận KH32 thanh toán một phần."
      }
    ],
    allocations: [
      {
        invoiceNo: "BH-26070011",
        amount: 30000000
      },
      {
        invoiceNo: "Còn lại",
        amount: 24000000
      }
    ]
  },
  {
    id: "split",
    title: "Một giao dịch nhiều hóa đơn",
    subtitle: "Tổng tiền khớp nhiều hóa đơn",
    icon: "ArrowLeftRight",
    tone: "amber",
    voucherId: "demo-split-voucher",
    voucherNo: "BC-DEMO-SPLIT",
    statementLineId: "statement-line-demo-003",
    referenceNo: "FT2619600102",
    transactionDate: "2026-07-14",
    description: "CONG TY ABC TT HD00256 HD00257 HD00258",
    amount: 15500000,
    confidence: 92,
    status: "split",
    matchReason: "Nội dung chứa 3 số hóa đơn, tổng tiền khớp tổng các khoản phải thu đề xuất.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount: 15500000,
        description: "Khách hàng ABC thanh toán nhiều hóa đơn trong một giao dịch."
      }
    ],
    allocations: [
      { invoiceNo: "HD00256", amount: 5500000 },
      { invoiceNo: "HD00257", amount: 7000000 },
      { invoiceNo: "HD00258", amount: 3000000 }
    ]
  },
  {
    id: "unmatched",
    title: "Ngoại lệ chưa khớp",
    subtitle: "Phí ngân hàng cần kế toán xử lý",
    icon: "FileText",
    tone: "red",
    voucherId: "demo-unmatched-voucher-1",
    voucherNo: "Chưa có chứng từ",
    statementLineId: "statement-line-demo-004",
    referenceNo: "FEE-VCB-1407",
    transactionDate: "2026-07-14",
    description: "PHI DICH VU NGAN HANG THANG 07/2026",
    amount: 330000,
    confidence: 0,
    status: "unmatched",
    matchReason: "Không tìm thấy chứng từ hiện hữu; hệ thống đưa vào danh sách ngoại lệ.",
    accountingEntry: [
      {
        debitAccount: "642",
        creditAccount: "1121",
        amount: 330000,
        description: "Đề xuất tạo bút toán phí dịch vụ ngân hàng."
      }
    ]
  }
] as const;

const matchedDemoRows: DemoScenario[] = Array.from({ length: 10 }, (_, index) => {
  const rowNo = index + 1;
  const amount = 12500000 + index * 1750000;
  const voucherNo = `BC-DEMO-M${String(rowNo).padStart(2, "0")}`;
  const customerCode = `KH${String(101 + index).padStart(3, "0")}`;

  return {
    id: `matched-${rowNo}`,
    category: "matched",
    rowNo,
    title: "Khớp hoàn toàn",
    subtitle: `${voucherNo} · ${customerCode}`,
    icon: "ShieldCheck",
    tone: "green",
    voucherId: `demo-voucher-matched-${rowNo}`,
    voucherNo,
    statementLineId: `statement-line-matched-${rowNo}`,
    referenceNo: `FT-MATCH-${String(260700 + rowNo)}`,
    transactionDate: "2026-07-14",
    description: `${customerCode} thanh toan dung so tien cho hoa don ${voucherNo}`,
    amount,
    confidence: 98 + (rowNo % 3),
    status: "matched",
    matchReason: "Trùng số tiền, số chứng từ, mã khách hàng và nội dung chuyển khoản.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount,
        description: `Ghi nhận ${customerCode} thanh toán đủ qua ngân hàng.`
      }
    ]
  };
});

const partialDemoRows: DemoScenario[] = [30000000, 18500000, 42000000].map((amount, index) => {
  const rowNo = index + 1;
  const invoiceNo = `BH-PART-${String(rowNo).padStart(2, "0")}`;
  const remainingAmount = [24000000, 9500000, 18000000][index];

  return {
    id: `partial-${rowNo}`,
    category: "partial",
    rowNo,
    title: "Khớp một phần",
    subtitle: `${invoiceNo} còn ${currency.format(remainingAmount)}`,
    icon: "Calculator",
    tone: "blue",
    voucherId: `demo-voucher-partial-${rowNo}`,
    voucherNo: `BC-PART-${String(rowNo).padStart(2, "0")}`,
    statementLineId: `statement-line-partial-${rowNo}`,
    referenceNo: `FT-PART-${String(260800 + rowNo)}`,
    transactionDate: "2026-07-14",
    description: `Khach hang thanh toan mot phan ${invoiceNo}`,
    amount,
    confidence: 84 + rowNo,
    status: "partial",
    matchReason: "Trùng khách hàng và hóa đơn, nhưng số tiền nhỏ hơn công nợ còn lại.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount,
        description: "Ghi nhận thanh toán một phần công nợ khách hàng."
      }
    ],
    allocations: [
      { invoiceNo, amount },
      { invoiceNo: "Còn lại", amount: remainingAmount }
    ]
  };
});

const splitDemoRows: DemoScenario[] = [
  {
    customer: "Cong ty ABC",
    invoices: [
      ["HD00256", 5500000],
      ["HD00257", 7000000],
      ["HD00258", 3000000]
    ]
  },
  {
    customer: "Cong ty Minh Chau",
    invoices: [
      ["HD00301", 8200000],
      ["HD00302", 6400000],
      ["HD00303", 4100000]
    ]
  },
  {
    customer: "Cong ty Nam Viet",
    invoices: [
      ["HD00410", 12000000],
      ["HD00411", 9000000],
      ["HD00412", 7500000]
    ]
  }
].map((group, index) => {
  const rowNo = index + 1;
  const allocations = group.invoices.map(([invoiceNo, amount]) => ({ invoiceNo: String(invoiceNo), amount: Number(amount) }));
  const amount = allocations.reduce((sum, item) => sum + item.amount, 0);

  return {
    id: `split-${rowNo}`,
    category: "split",
    rowNo,
    title: "Một giao dịch nhiều hóa đơn",
    subtitle: `${group.customer} · ${allocations.length} hóa đơn`,
    icon: "ArrowLeftRight",
    tone: "amber",
    voucherId: `demo-voucher-split-${rowNo}`,
    voucherNo: `BC-SPLIT-${String(rowNo).padStart(2, "0")}`,
    statementLineId: `statement-line-split-${rowNo}`,
    referenceNo: `FT-SPLIT-${String(260900 + rowNo)}`,
    transactionDate: "2026-07-14",
    description: `${group.customer} thanh toan ${allocations.map((item) => item.invoiceNo).join(" ")}`,
    amount,
    confidence: 90 + rowNo,
    status: "split",
    matchReason: "Một dòng sao kê chứa nhiều số hóa đơn, tổng tiền khớp cụm công nợ đề xuất.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "131",
        amount,
        description: "Ghi nhận một giao dịch ngân hàng phân bổ cho nhiều hóa đơn."
      }
    ],
    allocations
  };
});

const unmatchedDemoRows: DemoScenario[] = [
  {
    id: "unmatched-1",
    category: "unmatched",
    rowNo: 1,
    title: "Ngoại lệ chưa khớp",
    subtitle: "Phí ngân hàng",
    icon: "FileText",
    tone: "red",
    voucherId: "demo-unmatched-voucher-2",
    voucherNo: "Chưa có chứng từ",
    statementLineId: "statement-line-unmatched-1",
    referenceNo: "FEE-VCB-1407",
    transactionDate: "2026-07-14",
    description: "PHI DICH VU NGAN HANG THANG 07/2026",
    amount: 330000,
    confidence: 0,
    status: "unmatched",
    matchReason: "Không tìm thấy chứng từ hiện hữu; cần kế toán tạo bút toán phí ngân hàng.",
    accountingEntry: [
      {
        debitAccount: "642",
        creditAccount: "1121",
        amount: 330000,
        description: "Đề xuất tạo bút toán phí dịch vụ ngân hàng."
      }
    ]
  },
  {
    id: "unmatched-2",
    category: "unmatched",
    rowNo: 2,
    title: "Ngoại lệ chưa khớp",
    subtitle: "Lãi tiền gửi",
    icon: "FileText",
    tone: "red",
    voucherId: "",
    voucherNo: "Chưa có chứng từ",
    statementLineId: "statement-line-unmatched-2",
    referenceNo: "INT-VCB-1407",
    transactionDate: "2026-07-14",
    description: "LAI TIEN GUI KHONG KY HAN",
    amount: 250000,
    confidence: 0,
    status: "unmatched",
    matchReason: "Không có chứng từ kế toán tương ứng; đề xuất tạo bút toán lãi tiền gửi.",
    accountingEntry: [
      {
        debitAccount: "1121",
        creditAccount: "515",
        amount: 250000,
        description: "Đề xuất tạo bút toán lãi tiền gửi."
      }
    ]
  }
];

const demoRows: DemoScenario[] = [...matchedDemoRows, ...partialDemoRows, ...splitDemoRows, ...unmatchedDemoRows];

const reconciliationRules = [
  {
    title: "Ưu tiên tham chiếu chắc chắn",
    description: "Mã giao dịch, số chứng từ và số hóa đơn được ưu tiên trước nội dung diễn giải."
  },
  {
    title: "So khớp theo số tiền",
    description: "Trùng tiền tuyệt đối sẽ đề xuất matched; lệch tiền sẽ chuyển sang partial hoặc ngoại lệ."
  },
  {
    title: "Không tự ghi sổ",
    description: "Hệ thống chỉ đề xuất match và bút toán; kế toán duyệt rồi mới chốt."
  },
  {
    title: "Giữ audit trail",
    description: "Mỗi thao tác match, unmatch, import và tạo bút toán cần được ghi nhận để truy vết."
  }
] as const;

const processSteps = ["Nhập sao kê", "Chọn case demo", "Gợi ý match", "Kế toán duyệt", "Ghi nhận audit"] as const;

export default function ReconciliationScreen() {
  const [items, setItems] = useState<ReconciliationPayload>(reconciliationItems);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [selectedStatementLineId, setSelectedStatementLineId] = useState("");
  const [matchedAmount, setMatchedAmount] = useState("");
  const [feedback, setFeedback] = useState("");
  const [recentMatchId, setRecentMatchId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDemoId, setSelectedDemoId] = useState(demoScenarios[0].id);
  const [selectedDemoRowId, setSelectedDemoRowId] = useState(matchedDemoRows[0].id);

  const visibleDemoRows = demoRows.filter((row) => row.category === selectedDemoId);
  const selectedDemo = visibleDemoRows.find((row) => row.id === selectedDemoRowId) ?? visibleDemoRows[0] ?? demoRows[0];

  async function loadReconciliation() {
    const data = await fetchApi<ReconciliationPayload>("/cash/reconciliation");
    setItems(data);
  }

  useEffect(() => {
    void loadReconciliation().catch(() => undefined);
  }, []);

  useEffect(() => {
    const firstRow = visibleDemoRows[0];
    if (firstRow) {
      setSelectedDemoRowId(firstRow.id);
      applyDemoScenario(firstRow);
    }
  }, [selectedDemoId]);

  const autoCandidates = useMemo(() => items.vouchers.filter((voucher) => voucher.voucherType !== "PT"), [items.vouchers]);

  function applyDemoScenario(scenario: DemoScenario) {
    setSelectedVoucherId(scenario.voucherId);
    setSelectedStatementLineId(scenario.statementLineId);
    setMatchedAmount(String(scenario.amount));
    setFeedback(`${scenario.title}: ${scenario.matchReason}`);
  }

  async function handleMatch() {
    if (!selectedVoucherId || !selectedStatementLineId || !matchedAmount) {
      setFeedback("Cần chọn chứng từ BN/BC, dòng sao kê và số tiền khớp trước khi match.");
      return;
    }

    if (demoRows.some((row) => row.statementLineId === selectedStatementLineId)) {
      setRecentMatchId(`DEMO-${selectedDemo.id.toUpperCase()}`);
      setFeedback(`Demo đã match: ${selectedDemo.title}. Đây là mô phỏng, chưa ghi vào database.`);
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await postApi<{ id: string; status: string }>("/cash/reconciliation/match", {
        voucherId: selectedVoucherId,
        bankStatementLineId: selectedStatementLineId,
        matchedAmount: Number(matchedAmount),
        note: "UI match"
      });
      setRecentMatchId(result.id);
      setFeedback(`Đã match: ${result.status}`);
      setSelectedVoucherId("");
      setSelectedStatementLineId("");
      setMatchedAmount("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không match được");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAutoMatch() {
    const fallbackVoucher = autoCandidates[0];
    const fallbackStatement = items.statements[0];

    if (!fallbackVoucher || !fallbackStatement) {
      applyDemoScenario(selectedDemo);
      return;
    }

    setSelectedVoucherId(fallbackVoucher.voucherId ?? fallbackVoucher.id);
    setSelectedStatementLineId(fallbackStatement.statementLineId ?? fallbackStatement.id);
    setMatchedAmount(String(Math.min(fallbackVoucher.amount, fallbackStatement.amount)));
    setFeedback("Đã gợi ý cặp giao dịch BN/BC phù hợp. Vui lòng xác nhận và Match.");
  }

  async function handleUnmatch() {
    if (!recentMatchId) {
      setFeedback("Chưa có match ID để hủy.");
      return;
    }

    if (recentMatchId.startsWith("DEMO-")) {
      setRecentMatchId("");
      applyDemoScenario(selectedDemo);
      setFeedback("Đã reset match demo.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await postApi<{ status: string }>("/cash/reconciliation/unmatch", {
        matchId: recentMatchId,
        reason: "UI unmatch"
      });
      setFeedback(`Đã ${result.status}`);
      setRecentMatchId("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không unmatch được");
    } finally {
      setIsSubmitting(false);
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
          <span>{reconciliationScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Automatic bank reconciliation</div>
            <h2 className="hero-title">{reconciliationScreen.title}</h2>
            <p className="hero-copy">
              Chọn một tình huống demo để xem hệ thống đọc sao kê, gợi ý chứng từ tương ứng, tính độ tin cậy và đề xuất bút toán kế toán.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button" onClick={handleMatch} disabled={isSubmitting}>
                <AppIcon name="Search" />
                {isSubmitting ? "Đang xử lý..." : "Match case đang chọn"}
              </button>
              <button className="button" type="button" onClick={handleAutoMatch} disabled={isSubmitting}>
                <AppIcon name="ArrowLeftRight" />
                Gợi ý từ dữ liệu thật
              </button>
              <button className="button" type="button" onClick={handleUnmatch} disabled={isSubmitting}>
                Unmatch
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>{demoScenarios.length} case demo</strong>
            <span>Khớp hoàn toàn, khớp một phần, một giao dịch nhiều hóa đơn và ngoại lệ chưa khớp.</span>
          </div>
        </section>

        <div className="cash-recon-steps">
          {processSteps.map((step, index) => (
            <div className="cash-recon-step" key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>

        <div className="section-title">
          <h2>Demo đối chiếu tự động</h2>
          <span className="module-meta">Bấm từng nút để đổi tình huống trình bày</span>
        </div>
        <section className="panel">
          <div className="recon-source-grid">
            <label className="recon-source-field">
              <span>Số tài khoản & ngân hàng đã chọn</span>
              <strong>{selectedBankAccount.accountNo} · {selectedBankAccount.bankName}</strong>
              <small>{selectedBankAccount.holderName}</small>
            </label>
            <label className="recon-source-field">
              <span>Tên file đã import</span>
              <strong>{importedStatementFile}</strong>
              <small>Mock CSV dùng cho demo đối chiếu tự động</small>
            </label>
          </div>

          <div className="recon-demo-grid">
            {demoScenarios.map((scenario) => {
              const count = demoRows.filter((row) => row.category === scenario.id).length;

              return (
                <button
                  className={`recon-demo-button tone-${scenario.tone} ${selectedDemoId === scenario.id ? "is-active" : ""}`}
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedDemoId(scenario.id)}
                >
                  <span className="recon-demo-icon">
                    <AppIcon name={scenario.icon} />
                  </span>
                  <span>
                    <strong>{scenario.title}</strong>
                    <small>{count} dòng · {scenario.subtitle}</small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="recon-demo-table-wrap">
            <div className="subsection">
              <h3>{visibleDemoRows.length} dòng sao kê demo</h3>
              <span className="module-meta">Bấm từng dòng để xem chi tiết match</span>
            </div>
            <div className="table-scroll">
              <table className="data-table recon-demo-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Ngày</th>
                    <th>Tham chiếu</th>
                    <th>Diễn giải sao kê</th>
                    <th>Chứng từ đề xuất</th>
                    <th>Số tiền</th>
                    <th>Tin cậy</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDemoRows.map((row) => (
                    <tr
                      className={selectedDemo.id === row.id ? "is-selected" : ""}
                      key={row.id}
                      onClick={() => {
                        setSelectedDemoRowId(row.id);
                        applyDemoScenario(row);
                      }}
                    >
                      <td>{row.rowNo}</td>
                      <td>{row.transactionDate}</td>
                      <td>{row.referenceNo}</td>
                      <td>{row.description}</td>
                      <td>{row.voucherNo}</td>
                      <td>{currency.format(row.amount)}</td>
                      <td>{row.confidence}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="recon-visual-panel">
            <article className="recon-visual-card">
              <span className="recon-visual-label">Dòng sao kê</span>
              <strong>{selectedDemo.referenceNo}</strong>
              <p>{selectedDemo.description}</p>
              <div className="recon-visual-amount">{currency.format(selectedDemo.amount)}</div>
            </article>
            <div className="recon-visual-arrow">
              <AppIcon name="ArrowLeftRight" size={22} />
            </div>
            <article className="recon-visual-card">
              <span className="recon-visual-label">Chứng từ đề xuất</span>
              <strong>{selectedDemo.voucherNo}</strong>
              <p>{selectedDemo.matchReason}</p>
              <div className={`recon-confidence tone-${selectedDemo.tone}`}>{selectedDemo.confidence}% tin cậy</div>
            </article>
          </div>

          {selectedDemo.allocations ? (
            <div className="recon-allocation-grid">
              {selectedDemo.allocations.map((item) => (
                <div className="recon-allocation-card" key={item.invoiceNo}>
                  <span>{item.invoiceNo}</span>
                  <strong>{currency.format(item.amount)}</strong>
                </div>
              ))}
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Thông tin match đang chọn</h2>
          <span className="module-meta">{selectedDemo.title}</span>
        </div>
        <section className="panel">
          <form className="form-grid">
            {reconciliationScreen.fields.map((field) => (
              <label className={`form-field ${field.width ?? "md"}`} key={field.key}>
                <span>
                  {field.label}
                  {field.required ? " *" : ""}
                </span>
                <input className="field" type={field.type === "date" ? "date" : "text"} defaultValue={defaultFilterValue(field.key)} />
              </label>
            ))}
            <label className="form-field lg">
              <span>Voucher BN/BC được chọn</span>
              <input className="field" value={selectedVoucherId} onChange={(event) => setSelectedVoucherId(event.target.value)} />
            </label>
            <label className="form-field lg">
              <span>Statement line được chọn</span>
              <input className="field" value={selectedStatementLineId} onChange={(event) => setSelectedStatementLineId(event.target.value)} />
            </label>
            <label className="form-field md">
              <span>Số tiền khớp</span>
              <input className="field" value={matchedAmount} onChange={(event) => setMatchedAmount(event.target.value)} />
            </label>
          </form>

          <div className="recon-entry-grid">
            {selectedDemo.accountingEntry.map((entry) => (
              <div className="attachment-box" key={`${entry.debitAccount}-${entry.creditAccount}-${entry.amount}`}>
                <strong>Bút toán đề xuất</strong>
                <p>
                  Nợ {entry.debitAccount} / Có {entry.creditAccount}: {currency.format(entry.amount)}
                </p>
                <p>{entry.description}</p>
              </div>
            ))}
          </div>

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>Trạng thái</strong>
              <p>{feedback}</p>
              {recentMatchId ? <p>Match ID: {recentMatchId}</p> : null}
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Đối chiếu giao dịch</h2>
          <span className="module-meta">
            BN / BC <span aria-hidden="true">→</span> sao kê ngân hàng
          </span>
        </div>
        <div className="split-grid">
          <section className="panel table-scroll">
            <div className="subsection">
              <h3>BN / BC chưa khớp</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại</th>
                  <th>Số CT</th>
                  <th>Ngày</th>
                  <th>Đối tượng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.vouchers
                  .filter((item) => item.voucherType !== "PT")
                  .map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => {
                        setSelectedVoucherId(item.voucherId ?? "");
                        setMatchedAmount(item.amount.toString());
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <td>{item.voucherType}</td>
                      <td>{item.voucherNo}</td>
                      <td>{item.transactionDate}</td>
                      <td>{item.counterpartyName}</td>
                      <td>{currency.format(item.amount)}</td>
                      <td>{item.matchingStatus}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>

          <section className="panel table-scroll">
            <div className="subsection">
              <h3>Statement line chưa khớp</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Diễn giải</th>
                  <th>Tài khoản</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.statements.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedStatementLineId(item.statementLineId ?? "");
                      if (!matchedAmount) {
                        setMatchedAmount(item.amount.toString());
                      }
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{item.transactionDate}</td>
                    <td>{item.description}</td>
                    <td>{item.bankAccountCode}</td>
                    <td>{currency.format(item.amount)}</td>
                    <td>{item.matchingStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="section-title">
          <h2>Quy tắc đối chiếu</h2>
          <span className="module-meta">Ưu tiên match chắc chắn, sau đó mới đến suy đoán</span>
        </div>
        <div className="cash-rule-grid">
          {reconciliationRules.map((rule) => (
            <article className="cash-rule-card" key={rule.title}>
              <strong>{rule.title}</strong>
              <p>{rule.description}</p>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function defaultFilterValue(key: string) {
  const values: Record<string, string> = {
    bankAccountCode: "VCB-001",
    statementDate: "2026-07-14",
    matchingStatus: "unmatched"
  };

  return values[key] ?? "";
}
