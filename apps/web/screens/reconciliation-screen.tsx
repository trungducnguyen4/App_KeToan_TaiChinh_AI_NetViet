import { useEffect, useState } from "react";
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
      setFeedback("Can chon voucher, dong sao ke va so tien khop.");
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
      setFeedback(`Da match: ${result.status}`);
      setSelectedVoucherId("");
      setSelectedStatementLineId("");
      setMatchedAmount("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Khong match duoc");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUnmatch() {
    if (!recentMatchId) {
      setFeedback("Chua co match ID de huy.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      const result = await postApi<{ status: string }>("/cash/reconciliation/unmatch", {
        matchId: recentMatchId,
        reason: "UI unmatch"
      });
      setFeedback(`Da ${result.status}`);
      setRecentMatchId("");
      await loadReconciliation();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Khong unmatch duoc");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell activeModule="cash">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chu</span>
          <span>/</span>
          <span>So quy &amp; Ngan hang</span>
          <span>/</span>
          <span>{reconciliationScreen.title}</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Operational matching</div>
            <h2 className="hero-title">{reconciliationScreen.title}</h2>
            <p className="hero-copy">{reconciliationScreen.description}</p>
          </div>
          <div className="sync-panel">
            <strong>{items.statements.length} line can xu ly</strong>
            <span>Ho tro unmatched, partial, matched va thao tac match/unmatch co audit.</span>
          </div>
        </section>

        <div className="section-title">
          <h2>Bo loc doi chieu</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button" onClick={handleMatch} disabled={isSubmitting}>
              <AppIcon name="Search" />
              {isSubmitting ? "Dang xu ly..." : "Match"}
            </button>
            <button className="button" type="button" onClick={handleUnmatch} disabled={isSubmitting}>Unmatch</button>
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
              <span>Voucher ID duoc chon</span>
              <input className="field" value={selectedVoucherId} onChange={(event) => setSelectedVoucherId(event.target.value)} />
            </label>
            <label className="form-field lg">
              <span>Statement line ID duoc chon</span>
              <input className="field" value={selectedStatementLineId} onChange={(event) => setSelectedStatementLineId(event.target.value)} />
            </label>
            <label className="form-field md">
              <span>So tien khop</span>
              <input className="field" value={matchedAmount} onChange={(event) => setMatchedAmount(event.target.value)} />
            </label>
          </form>

          {feedback ? (
            <div className="attachment-box" style={{ marginTop: 16 }}>
              <strong>Trang thai</strong>
              <p>{feedback}</p>
              {recentMatchId ? <p>Match ID: {recentMatchId}</p> : null}
            </div>
          ) : null}
        </section>

        <div className="section-title">
          <h2>Voucher vs sao ke</h2>
          <span className="module-meta">Split master-detail matching</span>
        </div>
        <div className="split-grid">
          <section className="panel table-scroll">
            <div className="subsection">
              <h3>BN / BC chua khop</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Loai</th>
                  <th>So CT</th>
                  <th>Ngay</th>
                  <th>Doi tuong</th>
                  <th>So tien</th>
                  <th>Status</th>
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
              <h3>Statement line chua khop</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ngay</th>
                  <th>Dien giai</th>
                  <th>Tai khoan</th>
                  <th>So tien</th>
                  <th>Status</th>
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
          <h2>Thao tac match</h2>
          <span className="module-meta">Partial va full match</span>
        </div>
        <section className="panel">
          <div className="attachments">
            <div className="attachment-box">
              <strong>Match 1-1</strong>
              <p>Click mot voucher va mot statement line, sau do bam Match de ghi xuong database that.</p>
            </div>
            <div className="attachment-box">
              <strong>Partial</strong>
              <p>Cho phep sua so tien khop truoc khi bam Match.</p>
            </div>
            <div className="attachment-box">
              <strong>Unmatch</strong>
              <p>Nut Unmatch hien dang huy match gan nhat tao tu giao dien nay.</p>
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
