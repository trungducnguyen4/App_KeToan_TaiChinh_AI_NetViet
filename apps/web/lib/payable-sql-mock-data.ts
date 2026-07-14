export type PayableTransactionMock = {
  id: string;
  voucherType: "HT" | "PC" | "BN";
  voucherNo: string;
  voucherDate: string;
  invoiceNo: string;
  invoiceDate: string;
  dueDate: string;
  contractNo: string;
  currencyCode: "VND" | "USD" | "EUR";
  exchangeRate: number;
  debitAmount: number;
  creditAmount: number;
  foreignDebitAmount: number;
  foreignCreditAmount: number;
  memo: string;
};

export type PayableSupplierMock = {
  id: string;
  accountCode: "331";
  supplierCode: string;
  supplierName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  openingDebit: number;
  openingCredit: number;
  openingForeignDebit: number;
  openingForeignCredit: number;
  transactions: PayableTransactionMock[];
};

const supplierNames = [
  "CÂU LẠC BỘ DOANH NHÂN BẾN TRE",
  "CÔNG TY BÁNH NGỌT PHÁP",
  "CÔNG TY CỔ PHẦN 32 (ASECO)",
  "CÔNG TY CỔ PHẦN BÁNH NGỌT ANH",
  "CÔNG TY CỔ PHẦN BÁNH NGỌT MỸ",
  "CÔNG TY CỔ PHẦN CẤP NƯỚC CHỢ LỚN",
  "CÔNG TY CP VẬT TƯ Y TẾ HỒNG THIỆN MỸ",
  "CÔNG TY CP KHỬ TRÙNG VIỆT NAM - CN HCM",
  "CÔNG TY TNHH QUỐC ANH TIỀN GIANG",
  "CÔNG TY TNHH HỆ THỐNG THÔNG TIN GMC FPT",
  "CÔNG TY CỔ PHẦN NHẬT NAM",
  "CÔNG TY TNHH MTV GỖ ĐẶNG AN HIỆP",
  "CÔNG TY CP BAO BÌ BIÊN HÒA",
  "CÔNG TY TNHH THIẾT BỊ MINH LONG",
  "CÔNG TY CP LOGISTICS TÂN CẢNG",
  "CÔNG TY TNHH NGUYÊN LIỆU Á CHÂU",
  "CÔNG TY CP THÉP HÒA PHÁT",
  "CÔNG TY TNHH DỊCH VỤ VẬN TẢI ĐÔNG NAM",
  "CÔNG TY CP HÓA CHẤT MIỀN NAM",
  "CÔNG TY TNHH THƯƠNG MẠI PHÚ GIA",
  "CÔNG TY CP CƠ KHÍ TÂN BÌNH",
  "CÔNG TY TNHH GIẢI PHÁP SỐ VIỆT",
  "CÔNG TY CP NHỰA ĐỒNG NAI",
  "CÔNG TY TNHH ĐIỆN CÔNG NGHIỆP AN PHÁT",
  "CÔNG TY CP VĂN PHÒNG PHẨM HỒNG HÀ",
  "CÔNG TY TNHH THỰC PHẨM ĐẠI DƯƠNG",
  "CÔNG TY CP XĂNG DẦU MIỀN ĐÔNG",
  "CÔNG TY TNHH BAO BÌ MINH KHANG",
  "CÔNG TY CP DỊCH VỤ KỸ THUẬT SÀI GÒN",
  "CÔNG TY TNHH XÂY DỰNG THÀNH ĐẠT"
];

const provinces = ["TP. Hồ Chí Minh", "Bình Dương", "Đồng Nai", "Tiền Giang", "Bến Tre", "Long An"];
const memos = ["Ghi nhận hóa đơn mua hàng", "Thanh toán tiền hàng qua ngân hàng", "Chi tiền nhà cung cấp", "Điều chỉnh công nợ phải trả"];

function buildTransactions(index: number): PayableTransactionMock[] {
  return Array.from({ length: 2 + (index % 4) }, (_, transactionIndex) => {
    const sequence = index * 6 + transactionIndex + 1;
    const isPayment = transactionIndex % 3 === 1 || transactionIndex === 4;
    const voucherType = isPayment ? (index % 2 ? "PC" : "BN") : "HT";
    const amount = (25 + ((index * 23 + transactionIndex * 17) % 260)) * 1_000_000;
    const isForeign = index % 6 === 0 && transactionIndex < 2;
    const currencyCode = isForeign ? (index % 12 === 0 ? "USD" : "EUR") : "VND";
    const exchangeRate = currencyCode === "USD" ? 25_450 : currencyCode === "EUR" ? 27_680 : 1;
    const foreignAmount = isForeign ? Math.round((amount / exchangeRate) * 100) / 100 : 0;
    const paymentRate = 0.35 + (index % 4) * 0.1;
    const day = 1 + ((index * 2 + transactionIndex * 5) % 14);
    return {
      id: `ap-tx-${String(sequence).padStart(3, "0")}`,
      voucherType,
      voucherNo: `${voucherType}2607${String(sequence).padStart(4, "0")}`,
      voucherDate: `2026-07-${String(day).padStart(2, "0")}`,
      invoiceNo: `MH${String(2607000 + index * 3 + (isPayment ? 1 : transactionIndex + 1))}`,
      invoiceDate: `2026-06-${String(1 + ((index * 3 + transactionIndex * 4) % 28)).padStart(2, "0")}`,
      dueDate: `2026-07-${String(1 + ((index * 4 + transactionIndex * 7) % 28)).padStart(2, "0")}`,
      contractNo: `HĐMH-2026-${String(index + 1).padStart(3, "0")}`,
      currencyCode,
      exchangeRate,
      debitAmount: isPayment ? Math.round(amount * paymentRate) : 0,
      creditAmount: isPayment ? 0 : amount,
      foreignDebitAmount: isPayment ? Math.round(foreignAmount * paymentRate * 100) / 100 : 0,
      foreignCreditAmount: isPayment ? 0 : foreignAmount,
      memo: memos[(index + transactionIndex) % memos.length]
    };
  });
}

export const payableSupplierMocks: PayableSupplierMock[] = supplierNames.map((supplierName, index) => ({
  id: `ap-supplier-${String(index + 1).padStart(3, "0")}`,
  accountCode: "331",
  supplierCode: `NCC${String(index + 1).padStart(4, "0")}`,
  supplierName,
  taxCode: `03${String(12000000 + index * 7919).padStart(8, "0")}`,
  phone: `0${28 + (index % 3)} ${String(3700 + index * 13)} ${String(1100 + index * 29)}`,
  email: `congno.ncc${index + 1}@demo-netviet.vn`,
  address: `${18 + index} Đường Công Nghiệp, ${provinces[index % provinces.length]}`,
  openingDebit: index % 11 === 10 ? (5 + index) * 1_000_000 : 0,
  openingCredit: (42 + ((index * 71) % 1_480)) * 1_000_000 + ((index * 836_529) % 1_000_000),
  openingForeignDebit: index % 18 === 12 ? 420 + index * 9 : 0,
  openingForeignCredit: index % 6 === 0 ? 2_100 + index * 185 : 0,
  transactions: buildTransactions(index)
}));
