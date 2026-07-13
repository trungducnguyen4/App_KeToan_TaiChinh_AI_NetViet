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

type ReconciliationPayload = typeof reconciliationItems;

const reconciliationRules = [
  {
    title: "Tự động ưu tiên BN/BC",
    description: "Giao dịch ngân hàng là trung tâm; PT/PC chỉ là nguồn đối chiếu bổ trợ."
  },
  {
    title: "File đầu vào ưu tiên",
    description: "CSV/XLSX trước, PDF điện tử sau; PDF scan/OCR để giai đoạn sau."
  },
  {
    title: "Không ghi sổ tự động 100%",
    description: "Hệ thống chỉ đề xuất match, kế toán duyệt rồi mới chốt."
  },
  {
    title: "Kiểm tra tính hợp lệ",
    description: "Số dư đầu/cuối kỳ, trùng lặp file, ngày giao dịch và tổng nội dung."
  }
] as const;

const processSteps = [
  "Nhập sao kê",
  "Đối chiếu giao dịch",
  "Giao dịch chưa khớp",
  "Quy tắc đối chiếu",
  "Lịch sử & báo cáo"
] as const;

export default function ReconciliationScreen() {
  const [items, setItems] = useState<ReconciliationPayload>(reconciliationItems);
  const [selectedVoucherId, setSelectedVoucherId] = useState("");
  const [selectedStatementLineId, setSelectedStatementLineId] = useState("");
  const [matchedAmount, setMatchedAmount] = useState("");
  const [feedback, setFeedback] = useState("");
  const [recentMatchId, setRecentMatchId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadReconciliation() {
    const data = await fetchApi<ReconciliationPayload>("/cash/reconciliation");
    setItems(data);
  }

  useEffect(() => {
    void loadReconciliation().catch(() => undefined);
  }, []);

  const autoCandidates = useMemo(() => items.vouchers.filter((voucher) => voucher.voucherType !== "PT"), [items.vouchers]);

  async function handleMatch() {
    if (!selectedVoucherId || !selectedStatementLineId || !matchedAmount) {
      setFeedback("Cần chọn giao dịch BN/BC, dòng sao kê và số tiền khớp.");
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
      setFeedback("Chưa có đủ dữ liệu BN/BC và sao kê để tự động đối chiếu.");
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
            <div className="eyebrow">Operational matching</div>
            <h2 className="hero-title">{reconciliationScreen.title}</h2>
            <p className="hero-copy">
              Flow này tập trung đối chiếu giao dịch ngân hàng với BN/BC. PT/PC là tiền mặt và chỉ đóng vai trò bổ trợ
              khi cần tham chiếu lại công nợ hoặc biến động tiền mặt.
            </p>
            <div className="hero-actions">
              <a className="button primary" href={reconciliationScreen.route}>
                <AppIcon name="Search" />
                Mở đối chiếu BN/BC
              </a>
              <button className="button" type="button" onClick={handleAutoMatch}>
                <AppIcon name="ArrowLeftRight" />
                Gợi ý match tự động
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>{items.statements.length} dòng sao kê</strong>
            <span>
              Nên ưu tiên CSV/XLSX và PDF điện tử. PDF scan/OCR có thể thêm sau, không phải đầu vào chính của MVP.
            </span>
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
          <h2>Nhập sao kê</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleMatch} disabled={isSubmitting}>
              <AppIcon name="Search" />
              {isSubmitting ? "Đang xử lý..." : "Match BN/BC"}
            </button>
            <button className="button" type="button" onClick={handleAutoMatch} disabled={isSubmitting}>
              <AppIcon name="ArrowLeftRight" />
              Đề xuất match
            </button>
            <button className="button" type="button" onClick={handleUnmatch} disabled={isSubmitting}>
              Unmatch
            </button>
          </div>
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
          <h2>Giao dịch chưa khớp</h2>
          <span className="module-meta">Đề xuất tạo chứng từ mới hoặc tách nhiều-một</span>
        </div>
        <section className="panel">
          <div className="attachments">
            <div className="attachment-box">
              <strong>Giao dịch thiếu chứng từ</strong>
              <p>Hệ thống đề xuất tạo BN/BC nháp, chưa ghi sổ tự động.</p>
            </div>
            <div className="attachment-box">
              <strong>Một giao dịch nhiều hóa đơn</strong>
              <p>Cho phép phân bổ số tiền vào nhiều invoice hoặc công nợ liên quan.</p>
            </div>
            <div className="attachment-box">
              <strong>Một hóa đơn nhiều lần thu</strong>
              <p>Hỗ trợ tách match thành nhiều dòng nếu khách hàng thanh toán từng phần.</p>
            </div>
          </div>
        </section>

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
    statementDate: "2026-07-09",
    matchingStatus: "unmatched"
  };

  return values[key] ?? "";
}
