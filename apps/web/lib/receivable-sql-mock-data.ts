export type ReceivableTransactionMock = {
  id: string;
  voucherType: "HT" | "PT" | "BC";
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

export type ReceivableCustomerMock = {
  id: string;
  accountCode: "131";
  customerCode: string;
  customerName: string;
  taxCode: string;
  phone: string;
  email: string;
  address: string;
  openingDebit: number;
  openingCredit: number;
  openingForeignDebit: number;
  openingForeignCredit: number;
  transactions: ReceivableTransactionMock[];
};

const customers = [
  ["CÔNG TY CỔ PHẦN 32 (ASECO)", "0312456789", "028 3822 1101", "12 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN ANH THY", "0315984201", "028 3945 2210", "88 Cộng Hòa, Tân Bình, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN BỆNH VIỆN ĐA KHOA CAO SU ĐỒNG NAI", "3601029475", "0251 3891 122", "Long Khánh, Đồng Nai"],
  ["CÔNG TY CỔ PHẦN BÔNG THIÊN HÀ", "0312288106", "028 3771 9988", "22 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN BỘT GIẶT NET", "3600642822", "0251 3836 151", "KCN Biên Hòa 1, Đồng Nai"],
  ["CÔNG TY CỔ PHẦN CAO SU TÂY NINH", "3900242832", "0276 3822 348", "Quốc lộ 22B, Tây Ninh"],
  ["CÔNG TY CỔ PHẦN CƠ ĐIỆN LẠNH LÂM SƠN", "0314205688", "028 6258 0044", "Thủ Đức, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN DƯỢC PHẨM CỬU LONG", "1500202535", "0270 3822 115", "Phường 5, Vĩnh Long"],
  ["CÔNG TY CỔ PHẦN ĐẦU TƯ NAM LONG", "0301438936", "028 5416 1718", "Quận 7, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN GIẢI PHÁP KỸ THUẬT VIỆT", "0313920187", "028 6682 9031", "Bình Thạnh, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN HẠ TẦNG ĐÔNG Á", "0316829015", "028 7301 5577", "Quận 2, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN NHỰA BÌNH MINH", "0301464823", "028 3969 0973", "Quận 6, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN PHÚC SINH", "0303070338", "028 3820 7270", "Quận 1, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN SẢN XUẤT TÂN THÀNH", "3701189024", "0274 3766 810", "Dĩ An, Bình Dương"],
  ["CÔNG TY CỔ PHẦN THÉP NAM KIM", "3700477019", "0274 3748 848", "Thuận An, Bình Dương"],
  ["CÔNG TY CỔ PHẦN THỰC PHẨM AN VIỆT", "0315208841", "028 7770 2244", "Hóc Môn, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH CƠ KHÍ CHÍNH XÁC MINH PHÁT", "0314490872", "028 6673 1995", "Bình Tân, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH DỊCH VỤ E-CUSTOMS FCS", "0312167045", "028 3948 1122", "Tân Bình, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH ĐIỆN TỬ HOÀNG GIA", "0316112340", "028 7308 6633", "Quận 10, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH KỸ THUẬT TÂN TIẾN", "3702145098", "0274 3890 450", "Tân Uyên, Bình Dương"],
  ["CÔNG TY TNHH MTV THƯƠNG MẠI HỒNG VÂN", "0312678004", "028 3911 0882", "Phú Nhuận, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH NỘI THẤT THÀNH CÔNG", "0315089127", "028 6264 5088", "Gò Vấp, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH PHÂN PHỐI NAM SÀI GÒN", "0317713206", "028 3775 2266", "Nhà Bè, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH SẢN XUẤT BAO BÌ Á CHÂU", "3700928145", "0274 3711 966", "Bến Cát, Bình Dương"],
  ["CÔNG TY TNHH THIẾT BỊ CÔNG NGHIỆP ĐẠI PHÁT", "0316204871", "028 6688 1225", "Thủ Đức, TP. Hồ Chí Minh"],
  ["CÔNG TY TNHH THƯƠNG MẠI MINH KHANG", "0314087326", "028 3975 6188", "Quận 12, TP. Hồ Chí Minh"],
  ["HỢP TÁC XÃ LÚA GẠO AN GIANG", "1602138704", "0296 3852 477", "Châu Thành, An Giang"],
  ["CÔNG TY CP THƯƠNG MẠI & DU LỊCH BẢN ĐÔN", "6000448126", "0262 3950 115", "Buôn Đôn, Đắk Lắk"],
  ["CÔNG TY TNHH VẬN TẢI BIỂN ĐÔNG", "0313907725", "028 3848 6612", "Quận 4, TP. Hồ Chí Minh"],
  ["CÔNG TY CỔ PHẦN XÂY DỰNG PHƯƠNG NAM", "0312880461", "028 6288 4155", "Bình Chánh, TP. Hồ Chí Minh"]
] as const;

const memos = [
  "Ghi nhận doanh thu bán hàng theo hóa đơn",
  "Thu tiền hàng qua ngân hàng",
  "Thu tiền mặt theo hóa đơn",
  "Điều chỉnh công nợ khách hàng",
  "Ghi nhận công nợ dịch vụ trong kỳ"
];

function buildTransactions(index: number): ReceivableTransactionMock[] {
  const transactionCount = 2 + (index % 4);
  return Array.from({ length: transactionCount }, (_, transactionIndex) => {
    const sequence = index * 6 + transactionIndex + 1;
    const isCollection = transactionIndex % 3 === 1 || transactionIndex === transactionCount - 1;
    const voucherType = isCollection ? (index % 2 === 0 ? "BC" : "PT") : "HT";
    const day = 1 + ((index * 3 + transactionIndex * 4) % 14);
    const amount = (18 + ((index * 17 + transactionIndex * 11) % 185)) * 1_000_000;
    const isForeignCurrency = index % 5 === 0 && transactionIndex < 2;
    const currencyCode = isForeignCurrency ? (index % 10 === 0 ? "USD" : "EUR") : "VND";
    const exchangeRate = currencyCode === "USD" ? 25_450 : currencyCode === "EUR" ? 27_680 : 1;
    const foreignAmount = isForeignCurrency ? Math.round((amount / exchangeRate) * 100) / 100 : 0;
    return {
      id: `ar-tx-${String(sequence).padStart(3, "0")}`,
      voucherType,
      voucherNo: `${String(voucherType)}2607${String(sequence).padStart(4, "0")}`,
      voucherDate: `2026-07-${String(day).padStart(2, "0")}`,
      invoiceNo: isCollection && transactionIndex % 2 === 1 ? `HD${String(2607000 + index * 3 + 1)}` : `HD${String(2607000 + index * 3 + transactionIndex + 1)}`,
      invoiceDate: `2026-06-${String(1 + ((index * 2 + transactionIndex * 5) % 28)).padStart(2, "0")}`,
      dueDate: `2026-07-${String(1 + ((index * 5 + transactionIndex * 7) % 28)).padStart(2, "0")}`,
      contractNo: `HĐMB-2026-${String(index + 1).padStart(3, "0")}`,
      currencyCode,
      exchangeRate,
      debitAmount: isCollection ? 0 : amount,
      creditAmount: isCollection ? Math.round(amount * (0.35 + (index % 4) * 0.12)) : 0,
      foreignDebitAmount: isCollection ? 0 : foreignAmount,
      foreignCreditAmount: isCollection ? Math.round(foreignAmount * (0.35 + (index % 4) * 0.12) * 100) / 100 : 0,
      memo: memos[(index + transactionIndex) % memos.length]
    };
  });
}

export const receivableCustomerMocks: ReceivableCustomerMock[] = customers.map((customer, index) => {
  const customerCode = `KH${String(index + 1).padStart(4, "0")}`;
  return {
    id: `ar-customer-${String(index + 1).padStart(3, "0")}`,
    accountCode: "131",
    customerCode,
    customerName: customer[0],
    taxCode: customer[1],
    phone: customer[2],
    email: `congno${index + 1}@demo-netviet.vn`,
    address: customer[3],
    openingDebit: (24 + ((index * 37) % 480)) * 1_000_000 + ((index * 897_053) % 1_000_000),
    openingCredit: index % 9 === 8 ? (8 + index) * 1_000_000 : 0,
    openingForeignDebit: index % 5 === 0 ? 1_200 + index * 175 : 0,
    openingForeignCredit: index % 15 === 10 ? 350 + index * 12 : 0,
    transactions: buildTransactions(index)
  };
});
