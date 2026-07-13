import CashLedgerListScreen from "./cash-ledger-list-screen";
import CashLedgerCreateScreen from "./cash-ledger-create-screen";

export function CashReceiptListScreen() {
  return (
    <CashLedgerListScreen
      voucherType="PT"
      title="Phiếu thu tiền mặt"
      createHref="/modules/cash/receipts/new"
      detailColumns={["TK Nợ", "TK Có", "YT1 Có", "YT2 Có", "Tỷ giá", "Tiền NTệ", "Tiền", "Diễn giải"]}
      rightSidebarHint="Dòng hạch toán đầu tiên"
    />
  );
}

export function CashReceiptCreateScreen() {
  return (
    <CashLedgerCreateScreen
      title="Phiếu thu tiền mặt"
      backHref="/modules/cash/receipts"
      codePrefix="PT"
      counterpartyLabel="Đơn vị nhận tiền"
      documentLabel="phiếu thu tiền mặt"
    />
  );
}
