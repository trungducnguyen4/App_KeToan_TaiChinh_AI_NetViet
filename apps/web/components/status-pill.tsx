import type { ApprovalDeadline, ModuleStatus, VoucherStatus } from "@domain/types";

const labels: Record<string, string> = {
  ready: "Sẵn sàng",
  scaffold: "Khung v1",
  syncing: "Đang đồng bộ",
  draft: "Nháp",
  pending_approval: "Chờ duyệt",
  approved: "Đã duyệt",
  posted: "Đã ghi sổ",
  voided: "Đã hủy",
  overdue: "Đã quá hạn",
  today: "Hạn hôm nay",
  soon: "Sắp đến hạn",
  normal: "Bình thường"
};

export function StatusPill({ status }: { status: ModuleStatus | VoucherStatus | ApprovalDeadline }) {
  return <span className={`status-pill ${status}`}>{labels[status] ?? status}</span>;
}

export function DeadlinePill({ status }: { status: ApprovalDeadline }) {
  return <span className={`deadline-pill ${status}`}>{labels[status]}</span>;
}
