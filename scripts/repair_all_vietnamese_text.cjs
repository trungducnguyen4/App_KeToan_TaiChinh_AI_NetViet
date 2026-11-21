const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function repair() {
  console.log("--- 1. Repairing Vouchers ---");
  await prisma.voucher.updateMany({
    where: { voucherNo: "PCN-202611-001" },
    data: {
      supplier_name: "Thương lái Ba Dừa (Bến Tre)",
      description: "Thu mua 12.5 tấn vỏ dừa tươi xe 71C-123.45 từ thương lái Ba Dừa Bến Tre"
    }
  });

  await prisma.voucher.updateMany({
    where: { voucherNo: "0048192" },
    data: {
      supplier_name: "Công ty Điện Lực Bến Tre",
      description: "Tiền điện sản xuất máy ép & lọc dầu dừa kỳ T11/2026"
    }
  });

  await prisma.voucher.updateMany({
    where: { voucherNo: "BC-0001" },
    data: {
      supplier_name: "Công ty TNHH Dầu Thực Vật Miền Tây",
      description: "Thu tiền chuyển khoản Vietcombank cho HĐ HDB-2026-001"
    }
  });

  await prisma.voucher.updateMany({
    where: { voucherNo: "HDB-2026-001" },
    data: {
      supplier_name: "Công ty TNHH Dầu Thực Vật Miền Tây",
      description: "Xuất bán 5,000 kg dầu dừa thô đợt 1 tháng 11"
    }
  });

  await prisma.voucher.updateMany({
    where: { voucherNo: "PC-076931" },
    data: {
      description: "Thanh toán cho Thương lái Ba Dừa (Bến Tre) theo phiếu cân PCN-202611-001"
    }
  });

  console.log("--- 2. Repairing Suppliers ---");
  await prisma.supplier.updateMany({
    where: { code: "TL-BADUA" },
    data: { name: "Thương lái Ba Dừa (Bến Tre)" }
  });

  await prisma.supplier.updateMany({
    where: { code: "NCC-6421" },
    data: { name: "Công ty Điện Lực Bến Tre" }
  });

  console.log("--- 3. Repairing Customers ---");
  await prisma.customer.updateMany({
    where: { code: "KH_CNGTYTNHHD_7639" },
    data: { name: "Công ty TNHH Dầu Thực Vật Miền Tây" }
  });

  console.log("--- 4. Repairing Production Batches ---");
  await prisma.productionBatch.updateMany({
    where: { batchCode: "ME-202611-001" },
    data: {
      supplierName: "Thương lái Ba Dừa (Bến Tre)",
      notes: "Mẻ ép đạt chuẩn chất lượng cao, vỏ dừa già khô đạt định mức xuất sắc."
    }
  });

  await prisma.productionBatch.updateMany({
    where: { batchCode: "ME-202611-002" },
    data: {
      supplierName: "Thương lái Tư Dừa (Mỏ Cày)",
      notes: "Mẻ ép ổn định, vận hành máy ép trục vít liên tục 8h."
    }
  });

  await prisma.productionBatch.updateMany({
    where: { batchCode: "ME-202611-003" },
    data: {
      supplierName: "Thương lái Năm Dừa (Giồng Trôm)",
      notes: "CẢNH BÁO: Vỏ dừa bị ẩm nhiều nước, tỷ lệ dầu thu hồi chỉ đạt 18.17%. Cần trừ độ ẩm các chuyến sau."
    }
  });

  console.log("--- 5. Checking Voucher Lines ---");
  const lines = await prisma.voucherLine.findMany();
  for (const line of lines) {
    if (line.description && (line.description.includes("?") || line.description.includes(""))) {
      console.log("Corrupted voucher line:", line.id, line.description);
      let fixed = line.description
        .replace(/Thu mua 12.5 t\?n v\? d\?a tuoi.*/g, "Thu mua 12.5 tấn vỏ dừa tươi xe 71C-123.45 từ thương lái Ba Dừa Bến Tre")
        .replace(/Ti\?n di\?n.*/g, "Tiền điện sản xuất máy ép & lọc dầu dừa kỳ T11/2026")
        .replace(/Thu ti\?n.*/g, "Thu tiền chuyển khoản Vietcombank cho HĐ HDB-2026-001")
        .replace(/Xu\?t b[a]n.*/g, "Xuất bán 5,000 kg dầu dừa thô đợt 1 tháng 11");
      await prisma.voucherLine.update({
        where: { id: line.id },
        data: { description: fixed }
      });
      console.log("Fixed to:", fixed);
    }
  }

  console.log("Done repair!");
}

repair().catch(console.error).finally(() => prisma.$disconnect());
