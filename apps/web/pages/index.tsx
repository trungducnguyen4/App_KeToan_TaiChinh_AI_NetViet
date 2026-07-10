import { approvalItems } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { DeadlinePill } from "../components/status-pill";

export default function IndexPage() {
  const total = approvalItems.length;
  const overdue = approvalItems.filter((item) => item.status === "overdue").length;
  const today = approvalItems.filter((item) => item.status === "today").length;
  const soon = approvalItems.filter((item) => item.status === "soon").length;

  return (
    <AppShell activeModule="">
      <div className="workspace">
        <div className="breadcrumb">
          <span>Trang chủ</span>
          <span>/</span>
          <span>Chờ phê duyệt</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Backlog điều hành</div>
            <h2 className="hero-title">Chờ phê duyệt</h2>
            <p className="hero-copy">
              Danh sách phiếu, đề nghị và yêu cầu cần người có thẩm quyền xem trước khi đi tiếp vào nghiệp vụ.
            </p>
            <div className="hero-actions">
              <button className="button primary" type="button">
                <AppIcon name="ShieldCheck" />
                Duyệt nhanh
              </button>
              <button className="button" type="button">
                <AppIcon name="Search" />
                Lọc backlog
              </button>
            </div>
          </div>
          <div className="sync-panel">
            <strong>{total} phiếu</strong>
            <span>Trang này chỉ dùng để gom backlog phê duyệt. Khi vào từng nghiệp vụ, block này không lặp lại nữa.</span>
          </div>
        </section>

        <div className="kpi-grid">
          <article className="kpi-card">
            <div className="kpi-label">Tất cả</div>
            <div className="kpi-value">{total}</div>
            <div className="kpi-delta">Tổng backlog hiện có</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Quá hạn</div>
            <div className="kpi-value">{overdue}</div>
            <div className="kpi-delta">Cần xử lý sớm</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Hôm nay</div>
            <div className="kpi-value">{today}</div>
            <div className="kpi-delta">Đến hạn trong ngày</div>
          </article>
          <article className="kpi-card">
            <div className="kpi-label">Sắp đến hạn</div>
            <div className="kpi-value">{soon}</div>
            <div className="kpi-delta">Nên xem trước</div>
          </article>
        </div>

        <div className="section-title">
          <h2>Danh sách chờ phê duyệt</h2>
          <span className="module-meta">{total} nghiệp vụ cần xem</span>
        </div>

        <section className="panel table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nghiệp vụ</th>
                <th>Phiếu</th>
                <th>Nội dung</th>
                <th>Người đề nghị</th>
                <th>Trạng thái</th>
                <th>Hạn xử lý</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {approvalItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.module}</td>
                  <td>{item.voucherNo}</td>
                  <td>{item.content}</td>
                  <td>{item.requester}</td>
                  <td>
                    <DeadlinePill status={item.status} />
                  </td>
                  <td>{item.dueAt}</td>
                  <td>
                    <div className="topbar-actions">
                      <button className="button" type="button">Xem</button>
                      <button className="button primary" type="button">Duyệt</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </AppShell>
  );
}
