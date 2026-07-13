import CashLedgerListScreen from "./cash-ledger-list-screen";
import CashLedgerCreateScreen from "./cash-ledger-create-screen";

export function CashPaymentListScreen() {
  return (
    <CashLedgerListScreen
      voucherType="PC"
      title="Phiếu chi tiền mặt"
      createHref="/modules/cash/payments/new"
      detailColumns={["TK Nợ", "TK Có", "YT1 Có", "YT2 Có", "Tỷ giá", "Tiền NTệ", "Tiền", "Diễn giải"]}
      rightSidebarHint="Dòng hạch toán đầu tiên"
    />
  );
}

export function CashPaymentCreateScreen() {
  return (
    <CashLedgerCreateScreen
      title="Phiếu chi tiền mặt"
      backHref="/modules/cash/payments"
      codePrefix="PC"
      counterpartyLabel="Đơn vị nhận chi"
      documentLabel="phiếu chi tiền mặt"
    />
  );
}
