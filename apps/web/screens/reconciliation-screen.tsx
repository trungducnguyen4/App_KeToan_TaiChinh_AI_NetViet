import { useEffect, useState } from "react";
import { reconciliationItems, reconciliationScreen } from "@domain/index";
import type { ReconciliationItem } from "@domain/types";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { fetchApi, postApi } from "../lib/api";

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

type ReconciliationPayload = {
  vouchers: ReconciliationItem[];
  statements: ReconciliationItem[];
};

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

  async function handleMatch() {
    if (!selectedVoucherId || !selectedStatementLineId || !matchedAmount) {
      setFeedback("Vui lòng chọn chứng từ, dòng sao kê và nhập số tiền cần đối chiếu.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await postApi<{ id: string; status: string }>("/cash/reconciliation/match", {
        voucherId: selectedVoucherId,
        bankStatementLineId: selectedStatementLineId,
        matchedAmount: Number(matchedAmount),
        note: "Đối chiếu qua giao diện"
      });
      setRecentMatchId(result.id);
      setFeedback(`Đã đối chiếu thành công: ${result.status === "matched" ? "Đã khớp hoàn toàn" : result.status}`);
      setSelectedVoucherId("");
      setSelectedStatementLineId("");
      setMatchedAmount("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không thể đối chiếu");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnmatch() {
    if (!recentMatchId) {
      setFeedback("Chưa có mã đối chiếu nào để thực hiện hủy.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await postApi<{ status: string }>("/cash/reconciliation/unmatch", {
        matchId: recentMatchId,
        reason: "Hủy đối chiếu qua giao diện"
      });
      setFeedback(`Đã hoàn tác đối chiếu: ${result.status}`);
      setRecentMatchId("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Không thể hủy đối chiếu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/cash">Sổ quỹ &amp; Ngân hàng</a>
          <span>/</span>
          <span>{reconciliationScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Đối Soát • Sổ Quỹ &amp; Ngân Hàng</div>
            <h2 className="hero-title">{reconciliationScreen.title}</h2>
            <p className="hero-copy">{reconciliationScreen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{items.statements.length} dòng sao kê cần xử lý</strong>
            <span>Hỗ trợ đối soát Chưa khớp (Unmatched), Khớp một phần (Partial), Đã khớp (Matched) và lưu vết kiểm toán.</span>
          </div>
        </section>

        <div className="section-title">
          <h2>Thiết lập &amp; Thực hiện Đối chiếu</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleMatch} disabled={isSubmitting}>
              <AppIcon name="CheckCheck" />
              {isSubmitting ? "Đang xử lý..." : "Đối chiếu khớp"}
            </button>
            <button className="button" type="button" onClick={handleUnmatch} disabled={isSubmitting}>
              <AppIcon name="RefreshCw" />
              Hủy đối chiếu
            </button>
          </div>
        </div>
        <section className="panel">
          <form className="form-grid">
            {reconciliationScreen.fields.map((field) => (
              <label className={`form-field ${field.width ?? "md"}`} key={field.key}>
                <span>{field.label}{field.required ? " *" : ""}</span>
                <input className="field" type={field.type === "date" ? "date" : "text"} defaultValue={defaultFilterValue(field.key)} />
              </label>
            ))}
            <label className="form-field lg">
              <span>Mã chứng từ được chọn (Voucher ID)</span>
              <input className="field" value={selectedVoucherId} onChange={(event) => setSelectedVoucherId(event.target.value)} placeholder="Nhấp chọn dòng bảng bên dưới" />
            </label>
            <label className="form-field lg">
              <span>Mã dòng sao kê được chọn (Statement Line ID)</span>
              <input className="field" value={selectedStatementLineId} onChange={(event) => setSelectedStatementLineId(event.target.value)} placeholder="Nhấp chọn dòng bảng bên dưới" />
            </label>
            <label className="form-field md">
              <span>Số tiền đối chiếu khớp (VNĐ)</span>
              <input className="field" value={matchedAmount} onChange={(event) => setMatchedAmount(event.target.value)} placeholder="Nhập số tiền" />
            </label>
          </form>

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16, background: "#f0fdf4", borderColor: "#86efac" }}>
              <strong style={{ color: "#166534" }}>Trạng thái xử lý</strong>
              <p style={{ color: "#15803d" }}>{feedback}</p>
              {recentMatchId ? <p style={{ fontSize: "12px", color: "#64748b" }}>Mã đối chiếu: {recentMatchId}</p> : null}
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Bảng so sánh Chứng từ (BN/BC) &amp; Dòng sao kê</h2>
          <span className="module-meta">Đối chiếu 2 chiều trực quan</span>
        </div>
        <div className="split-grid">
          <section className="panel table-scroll">
            <div className="subsection">
              <h3>Chứng từ Ngân hàng (BN/BC) Chưa đối chiếu</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loại CT</th>
                  <th>Số CT</th>
                  <th>Ngày CT</th>
                  <th>Đối tượng</th>
                  <th style={{ textAlign: "right" }}>Số tiền</th>
                  <th style={{ textAlign: "center" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.vouchers.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => {
                      setSelectedVoucherId(item.voucherId ?? "");
                      setMatchedAmount(item.amount.toString());
                    }}
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedVoucherId === item.voucherId ? "rgba(15, 23, 42, 0.06)" : undefined
                    }}
                  >
                    <td><strong>{item.voucherType}</strong></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{item.voucherNo}</td>
                    <td>{item.transactionDate}</td>
                    <td>{item.counterpartyName}</td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currency.format(item.amount)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`status-pill ${item.matchingStatus === "matched" ? "is-success" : item.matchingStatus === "partial" ? "is-info" : "is-warning"}`}>
                        {item.matchingStatus === "matched" ? "Đã khớp" : item.matchingStatus === "partial" ? "Khớp 1 phần" : "Chưa khớp"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="panel table-scroll">
            <div className="subsection">
              <h3>Dòng giao dịch Sao kê Chưa đối chiếu</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ngày GD</th>
                  <th>Diễn giải</th>
                  <th>Tài khoản NH</th>
                  <th style={{ textAlign: "right" }}>Số tiền</th>
                  <th style={{ textAlign: "center" }}>Trạng thái</th>
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
                    style={{
                      cursor: "pointer",
                      backgroundColor: selectedStatementLineId === item.statementLineId ? "rgba(15, 23, 42, 0.06)" : undefined
                    }}
                  >
                    <td>{item.transactionDate}</td>
                    <td>{item.description}</td>
                    <td><strong>{item.bankAccountCode}</strong></td>
                    <td style={{ textAlign: "right", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{currency.format(item.amount)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={`status-pill ${item.matchingStatus === "matched" ? "is-success" : item.matchingStatus === "partial" ? "is-info" : "is-warning"}`}>
                        {item.matchingStatus === "matched" ? "Đã khớp" : item.matchingStatus === "partial" ? "Khớp 1 phần" : "Chưa khớp"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>

        <div className="section-title">
          <h2>Hướng dẫn thao tác đối chiếu</h2>
          <span className="module-meta">Quy trình kiểm soát số liệu</span>
        </div>
        <section className="panel">
          <div className="attachments">
            <div className="attachment-box">
              <strong>Đối chiếu Khớp 1-1</strong>
              <p>Nhấp chọn 1 chứng từ và 1 dòng sao kê tương ứng, sau đó nhấn "Đối chiếu khớp" để hệ thống tự động ghi nhận vào cơ sở dữ liệu.</p>
            </div>
            <div className="attachment-box">
              <strong>Đối chiếu Khớp một phần (Partial)</strong>
              <p>Cho phép điều chỉnh số tiền đối chiếu thực tế trước khi nhấn "Đối chiếu khớp" trong trường hợp thanh toán từng đợt.</p>
            </div>
            <div className="attachment-box">
              <strong>Hủy đối chiếu (Unmatch)</strong>
              <p>Nút "Hủy đối chiếu" cho phép hoàn tác lượt đối chiếu vừa thực hiện và khôi phục trạng thái chưa khớp của chứng từ.</p>
            </div>
          </div>
        </section>
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
