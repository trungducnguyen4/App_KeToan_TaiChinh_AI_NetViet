import { journalVoucherScreen } from "@domain/index";
import { AppShell } from "../components/app-shell";
import { AppIcon } from "../components/icons";
import { StatusPill } from "../components/status-pill";

export default function JournalVoucherCreateScreen() {
  return (
    <AppShell activeModule="accounting">
      <div className="workspace">
        <div className="breadcrumb">
          <a className="breadcrumb-link" href="/">Trang chủ</a>
          <span>/</span>
          <a className="breadcrumb-link" href="/modules/accounting/journal-vouchers">Kế toán</a>
          <span>/</span>
          <span>Tạo mới phiếu hạch toán</span>
        </div>

        <section className="hero-panel">
          <div>
            <div className="eyebrow">Mã phân hệ 5018</div>
            <h2 className="hero-title">Tạo phiếu hạch toán</h2>
            <p className="hero-copy">
              Trang riêng cho nhập liệu chứng từ. Danh sách và chi tiết hạch toán nằm ở màn trước, còn màn này chỉ dùng để tạo mới và lưu.
            </p>
          </div>
          <div className="sync-panel">
            <strong>Draft</strong>
            <span>Form này tách khỏi danh sách để người dùng không bị chiếm toàn bộ màn hình khi chỉ đang xem chứng từ.</span>
          </div>
        </section>

        <div className="section-title">
          <h2>Thông tin</h2>
          <div className="topbar-actions">
            <button className="button primary" type="button">
              <AppIcon name="Save" />
              Lưu (F8)
            </button>
            <button className="button danger" type="button">Hủy</button>
          </div>
        </div>

        <section className="panel">
          <div className="subsection">
            <h3>Thông tin chung</h3>
            <StatusPill status="draft" />
          </div>

          <form className="form-grid journal-form">
            {journalVoucherScreen.fields.map((field) => (
              <label className={`form-field ${field.width ?? "md"} ${journalFieldClass(field.key)}`} key={field.key}>
                <span>{field.label}{field.required ? " *" : ""}</span>
                {field.type === "textarea" ? (
                  <textarea className="field" defaultValue={defaultFieldValue(field.key)} />
                ) : (
                  <input
                    className="field"
                    type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                    defaultValue={defaultFieldValue(field.key)}
                  />
                )}
              </label>
            ))}
          </form>
        </section>
      </div>
    </AppShell>
  );
}

function journalFieldClass(key: string) {
  const map: Record<string, string> = {
    voucherType: "sm",
    voucherDate: "sm",
    voucherNo: "md",
    currency: "sm",
    sourceDocument: "lg",
    counterpartyCode: "sm",
    counterpartyName: "xl",
    address: "xl",
    taxCode: "md",
    phone: "sm",
    contactCode: "sm",
    contactName: "md",
    contactPhone: "sm",
    content: "xl",
    dueDays: "sm",
    dueDate: "sm"
  };

  return map[key] ?? "";
}

function defaultFieldValue(key: string) {
  const values: Record<string, string> = {
    voucherType: "HT1",
    voucherDate: "2026-07-10",
    voucherNo: "26070003",
    currency: "VND",
    sourceDocument: "",
    counterpartyCode: "AAA",
    counterpartyName: "Cong ty AAA",
    address: "123 Le Loi, Q1",
    taxCode: "0312345678",
    phone: "028 0000 0000",
    contactCode: "LH001",
    contactName: "Phong ke toan",
    contactPhone: "0900 000 000",
    content: "Ghi nhận điều chỉnh chi phí tháng 07",
    dueDays: "30",
    dueDate: "2026-07-31"
  };

  return values[key] ?? "";
}
