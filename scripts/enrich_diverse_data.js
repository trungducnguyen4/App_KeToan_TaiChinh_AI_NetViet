const http = require('http');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function post(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request('http://localhost:4000/api' + path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  console.log("=== 1. ĐA DẠNG HÓA CÁC HÓA ĐƠN BÁN HÀNG HIỆN CÓ TRONG CSDL ===");

  // A. Lấy tất cả các hóa đơn bán bã dừa (BK-2026-xxx)
  const bkList = await prisma.voucher.findMany({
    where: { voucherType: 'HDB', voucherNo: { startsWith: 'BK-' } },
    orderBy: { voucherNo: 'asc' }
  });
  console.log(`Tìm thấy ${bkList.length} hóa đơn bã dừa BK`);

  // Phân bổ bã dừa thành 4 nhóm sản phẩm:
  // - MEAL_BROWN (Cám dừa nâu - thức ăn gia súc)
  // - MEAL_WHITE (Cám dừa trắng - làm bánh kẹo / thực phẩm)
  // - MEAL_WHOLE (Cám dừa nguyên - tiêu chuẩn xuất khẩu / hữu cơ)
  // - BYPRODUCT (Cám dừa thành phẩm / hỗn hợp)
  for (let i = 0; i < bkList.length; i++) {
    const v = bkList[i];
    let newType = "BYPRODUCT";
    let newDesc = v.description;
    let newCustomer = v.supplier_name;

    if (i % 4 === 0) {
      newType = "MEAL_BROWN";
      newCustomer = i % 2 === 0 ? "Cơ sở Sản xuất Thức Ăn Chăn Nuôi Hòa Phát" : "Trang trại Nuôi Bò Sữa Ba Tri";
      newDesc = v.description.replace(/phụ phẩm xác dừa ép|bã dừa/gi, "cám dừa nâu ép khô");
    } else if (i % 4 === 1) {
      newType = "MEAL_WHITE";
      newCustomer = i % 2 === 1 ? "Công ty CP Bánh Kẹo Bibica Miền Tây" : "Xưởng Sản Xuất Bánh Dừa Nướng Đặc Sản Bến Tre";
      newDesc = v.description.replace(/phụ phẩm xác dừa ép|bã dừa/gi, "cám dừa trắng ép mịn (làm bánh kẹo)");
    } else if (i % 4 === 2) {
      newType = "MEAL_WHOLE";
      newCustomer = "Hợp tác xã Nông Nghiệp Hữu Cơ Ba Tri";
      newDesc = v.description.replace(/phụ phẩm xác dừa ép|bã dừa/gi, "cám dừa nguyên chất ép khô hữu cơ");
    } else {
      newType = "BYPRODUCT";
      newCustomer = "Hợp tác xã Chăn Nuôi Thủy Sản Châu Thành";
      newDesc = v.description.replace(/phụ phẩm xác dừa ép/gi, "cám dừa hỗn hợp thành phẩm");
    }

    await prisma.voucher.update({
      where: { id: v.id },
      data: {
        cost_category: newType,
        supplier_name: newCustomer,
        description: newDesc
      }
    });

    await prisma.voucherLine.updateMany({
      where: { voucherId: v.id },
      data: {
        cost_category: newType,
        memo: newDesc
      }
    });
  }

  // B. Lấy các hóa đơn dầu dừa (HDB-2026-xxx)
  const hdbList = await prisma.voucher.findMany({
    where: { voucherType: 'HDB', voucherNo: { startsWith: 'HDB-' } },
    orderBy: { voucherNo: 'asc' }
  });
  console.log(`Tìm thấy ${hdbList.length} hóa đơn dầu dừa HDB`);

  // Phân bổ dầu dừa thành 2 nhóm:
  // - CRUDE_OIL: Dầu dừa thô (khoảng 50%)
  // - FILTERED_OIL: Dầu dừa lọc (khoảng 50%)
  for (let i = 0; i < hdbList.length; i++) {
    const v = hdbList[i];
    let newType = "CRUDE_OIL";
    let newDesc = v.description;
    let newCustomer = v.supplier_name;

    if (i % 2 === 1) {
      newType = "FILTERED_OIL";
      if (i % 4 === 1) {
        newCustomer = "Công ty Mỹ Phẩm Quốc Tế Cỏ Cây Hoa Lá";
      } else {
        newCustomer = "Công ty TNHH Chế Biến Dừa Bến Tre (Betrimex)";
      }
      newDesc = v.description ? v.description.replace(/dầu dừa thô/gi, "dầu dừa lọc tinh khiết đạt chuẩn đóng phuy") : `Xuất bán dầu dừa lọc tinh khiết cho ${newCustomer}`;
    } else {
      newType = "CRUDE_OIL";
    }

    await prisma.voucher.update({
      where: { id: v.id },
      data: {
        cost_category: newType,
        supplier_name: newCustomer,
        description: newDesc
      }
    });

    await prisma.voucherLine.updateMany({
      where: { voucherId: v.id },
      data: {
        cost_category: newType,
        memo: newDesc
      }
    });
  }

  console.log("=== 2. TẠO THÊM CÁC HÓA ĐƠN BÁN HÀNG MỚI ĐỦ CÁC CHỦNG LOẠI ===");

  const newSales = [
    {
      docType: "VAT_INVOICE",
      voucherNo: "HDB-2026-050",
      voucherDate: "2026-11-15T09:00:00.000Z",
      customerName: "Công ty Mỹ Phẩm Quốc Tế Cỏ Cây Hoa Lá",
      taxCode: "0108992233",
      invoiceSeries: "1C26TNV",
      productType: "FILTERED_OIL",
      quantity: 4500,
      unit: "kg",
      unitPrice: 36000,
      subtotal: 162000000,
      vatRate: 8,
      vatAmount: 12960000,
      totalAmount: 174960000,
      description: "Xuất bán 4.500 kg dầu dừa lọc tinh khiết đạt chuẩn mỹ phẩm đóng phuy 200L cho Cỏ Cây Hoa Lá",
      pay: true
    },
    {
      docType: "VAT_INVOICE",
      voucherNo: "HDB-2026-051",
      voucherDate: "2026-11-19T10:30:00.000Z",
      customerName: "Công ty TNHH Dược Phẩm & Hóa Mỹ Phẩm Đông Á",
      taxCode: "0314567890",
      invoiceSeries: "1C26TNV",
      productType: "FILTERED_OIL",
      quantity: 3200,
      unit: "kg",
      unitPrice: 37500,
      subtotal: 120000000,
      vatRate: 8,
      vatAmount: 9600000,
      totalAmount: 129600000,
      description: "Xuất bán 3.200 kg dầu dừa lọc độ tinh khiết cao cho Dược Phẩm Đông Á",
      pay: false // UNPAID
    },
    {
      docType: "SALES_RECEIPT",
      voucherNo: "BK-2026-052",
      voucherDate: "2026-11-16T14:00:00.000Z",
      customerName: "Công ty CP Bánh Kẹo Bibica Miền Tây",
      taxCode: "1200889911",
      productType: "MEAL_WHITE",
      quantity: 12000,
      unit: "kg",
      unitPrice: 2400,
      subtotal: 28800000,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 28800000,
      description: "Xuất bán 12.000 kg cám dừa trắng ép mịn làm nguyên liệu bánh kẹo cho Bibica Miền Tây",
      pay: true
    },
    {
      docType: "SALES_RECEIPT",
      voucherNo: "BK-2026-053",
      voucherDate: "2026-11-20T11:00:00.000Z",
      customerName: "Xưởng Sản Xuất Bánh Dừa Nướng Đặc Sản Bến Tre",
      taxCode: "1300994422",
      productType: "MEAL_WHITE",
      quantity: 6500,
      unit: "kg",
      unitPrice: 2500,
      subtotal: 16250000,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 16250000,
      description: "Xuất bán 6.500 kg cám dừa trắng tuyển chọn làm bánh dừa nướng",
      pay: false // UNPAID
    },
    {
      docType: "SALES_RECEIPT",
      voucherNo: "BK-2026-054",
      voucherDate: "2026-11-17T15:00:00.000Z",
      customerName: "Cơ sở Sản xuất Thức Ăn Chăn Nuôi Hòa Phát",
      taxCode: "1300554433",
      productType: "MEAL_BROWN",
      quantity: 26000,
      unit: "kg",
      unitPrice: 1300,
      subtotal: 33800000,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 33800000,
      description: "Xuất bán 26.000 kg cám dừa nâu ép khô làm thức ăn bò sữa cho Hòa Phát",
      pay: true
    },
    {
      docType: "SALES_RECEIPT",
      voucherNo: "BK-2026-055",
      voucherDate: "2026-11-21T09:30:00.000Z",
      customerName: "Trang trại Nuôi Bò Sữa Ba Tri",
      taxCode: "1300887766",
      productType: "MEAL_BROWN",
      quantity: 18500,
      unit: "kg",
      unitPrice: 1250,
      subtotal: 23125000,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 23125000,
      description: "Xuất bán 18.500 kg cám dừa nâu giàu xơ cho Trang trại Bò Sữa Ba Tri",
      pay: false // UNPAID
    },
    {
      docType: "SALES_RECEIPT",
      voucherNo: "BK-2026-056",
      voucherDate: "2026-11-18T16:00:00.000Z",
      customerName: "Hợp tác xã Nông Nghiệp Hữu Cơ Ba Tri",
      taxCode: "1300667788",
      productType: "MEAL_WHOLE",
      quantity: 15000,
      unit: "kg",
      unitPrice: 1650,
      subtotal: 24750000,
      vatRate: 0,
      vatAmount: 0,
      totalAmount: 24750000,
      description: "Xuất bán 15.000 kg cám dừa nguyên chất tiêu chuẩn hữu cơ cho HTX Ba Tri",
      pay: true
    },
    {
      docType: "VAT_INVOICE",
      voucherNo: "HDB-2026-057",
      voucherDate: "2026-11-22T08:30:00.000Z",
      customerName: "Công ty CP Thực Phẩm Hữu Cơ Bến Tre",
      taxCode: "1300778899",
      invoiceSeries: "1C26TNV",
      productType: "CRUDE_OIL",
      quantity: 6000,
      unit: "kg",
      unitPrice: 30500,
      subtotal: 183000000,
      vatRate: 8,
      vatAmount: 14640000,
      totalAmount: 197640000,
      description: "Xuất bán 6.000 kg dầu dừa thô mẻ ép mới cho Công ty CP Thực Phẩm Hữu Cơ Bến Tre",
      pay: false // UNPAID
    }
  ];

  for (const s of newSales) {
    const res = await post('/sales/invoices', {
      docType: s.docType,
      voucherNo: s.voucherNo,
      voucherDate: s.voucherDate,
      customerName: s.customerName,
      taxCode: s.taxCode,
      invoiceSeries: s.invoiceSeries,
      productType: s.productType,
      quantity: s.quantity,
      unit: s.unit,
      unitPrice: s.unitPrice,
      subtotal: s.subtotal,
      vatRate: s.vatRate,
      vatAmount: s.vatAmount,
      totalAmount: s.totalAmount,
      description: s.description
    });

    if (res.status === 201) {
      console.log(`Đã tạo hóa đơn bán ${s.voucherNo} (${s.productType})`);
      if (s.pay) {
        await post(`/sales/invoices/${res.data.id}/payment`, {
          paymentChannel: s.docType === "VAT_INVOICE" ? "bank" : "cash",
          description: `Khách hàng ${s.customerName} thanh toán hóa đơn ${s.voucherNo}`
        });
      }
    } else {
      console.log(`Bỏ qua hoặc đã tồn tại: ${s.voucherNo} (${res.status})`);
    }
  }

  console.log("\n=== 3. TẠO THÊM CÁC CHỨNG TỪ CHI PHÍ PHÁT SINH & VẬN HÀNH ===");

  const newPurchasing = [
    // Chi phí phát sinh (OVERHEAD)
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PC-202611-002",
      voucherDate: "2026-11-12T12:00:00.000Z",
      supplierName: "Nhà hàng Sông Quê (Tiếp thương lái)",
      costCategory: "OVERHEAD",
      allocationMode: "PERIOD",
      subtotal: 1450000,
      totalAmount: 1450000,
      description: "Cơm trưa tiếp đoàn thương lái Bến Tre & Tiền Giang ký biên bản bao tiêu dừa tháng 11",
      pay: true
    },
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PC-202611-003",
      voucherDate: "2026-11-15T19:30:00.000Z",
      supplierName: "Cửa hàng Tạp Hóa Cô Út",
      costCategory: "OVERHEAD",
      allocationMode: "PERIOD",
      subtotal: 480000,
      totalAmount: 480000,
      description: "Mua nước suối, sữa chua và đồ ăn nhẹ bồi dưỡng công nhân tăng ca xưởng ép",
      pay: true
    },
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PC-202611-004",
      voucherDate: "2026-11-18T10:00:00.000Z",
      supplierName: "Tiệm Sửa Xe Cơ Giới Ba Tri",
      costCategory: "OVERHEAD",
      allocationMode: "PERIOD",
      subtotal: 750000,
      totalAmount: 750000,
      description: "Vá vỏ và thay ruột xe ba gác chở bã dừa nội bộ trong xưởng",
      pay: true
    },
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PC-202611-005",
      voucherDate: "2026-11-20T14:30:00.000Z",
      supplierName: "Trung tâm Kiểm định Đo lường 3",
      costCategory: "OVERHEAD",
      allocationMode: "PERIOD",
      subtotal: 2200000,
      totalAmount: 2200000,
      description: "Chi phí kiểm định định kỳ và dán tem cân ô tô điện tử 80 tấn phục vụ vụ thu mua",
      pay: false
    },
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PC-202611-006",
      voucherDate: "2026-11-21T08:00:00.000Z",
      supplierName: "Cây xăng Petrolimex Châu Thành",
      costCategory: "OVERHEAD",
      allocationMode: "PERIOD",
      subtotal: 900000,
      totalAmount: 900000,
      description: "Tiền xăng xe bán tải đi kiểm tra chất lượng dừa nguyên liệu tại các vườn Mỏ Cày & Giồng Trôm",
      pay: true
    },
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PC-202611-007",
      voucherDate: "2026-11-22T12:30:00.000Z",
      supplierName: "Nhà hàng Hương Dừa Bến Tre",
      costCategory: "OVERHEAD",
      allocationMode: "PERIOD",
      subtotal: 1850000,
      totalAmount: 1850000,
      description: "Tiếp khách đại diện phòng QA/QC công ty Mỹ Phẩm Cỏ Cây Hoa Lá đến nghiệm thu mẫu dầu lọc",
      pay: false
    },

    // Chi phí vận hành (PROCESSING)
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PCN-202611-063",
      voucherDate: "2026-11-14T17:00:00.000Z",
      supplierName: "Tổ trưởng Vận hành Ca Ép/Lọc (Anh Bảy)",
      costCategory: "PROCESSING",
      processStage: "EP",
      allocationMode: "PERIOD",
      subtotal: 16500000,
      totalAmount: 16500000,
      description: "Chi tiền công nhân lực ca ép dầu & vận hành máy lọc khung bản đợt 1 tháng 11/2026",
      pay: true
    },
    {
      docType: "VAT_INVOICE",
      voucherNo: "0048250",
      voucherDate: "2026-11-16T15:00:00.000Z",
      supplierName: "Xưởng Cơ Khí & Bảo Trì Nam Long",
      taxCode: "1300987654",
      invoiceSeries: "1C26TNL",
      costCategory: "PROCESSING",
      processStage: "EP",
      allocationMode: "PERIOD",
      subtotal: 6800000,
      vatRate: 8,
      vatAmount: 544000,
      totalAmount: 7344000,
      description: "Gia công phục hồi trục ép đùn số 2 và thay vòng bi máy ép đùn công suất lớn",
      pay: true
    },
    {
      docType: "VAT_INVOICE",
      voucherNo: "0048251",
      voucherDate: "2026-11-19T11:00:00.000Z",
      supplierName: "Công ty Màng Lọc Tân Phát",
      taxCode: "0312456789",
      invoiceSeries: "1C26TTP",
      costCategory: "PROCESSING",
      processStage: "LOC",
      allocationMode: "PERIOD",
      subtotal: 5400000,
      vatRate: 8,
      vatAmount: 432000,
      totalAmount: 5832000,
      description: "Cung cấp 50 bộ vải lọc khung bản chất liệu PP chịu nhiệt và 200kg trợ lọc diatomite",
      pay: false
    },
    {
      docType: "PURCHASE_SLIP",
      voucherNo: "PCN-202611-064",
      voucherDate: "2026-11-20T16:00:00.000Z",
      supplierName: "Nhà máy Cấp Nước Sạch Châu Thành",
      costCategory: "PROCESSING",
      processStage: "LOC",
      allocationMode: "PERIOD",
      subtotal: 3850000,
      totalAmount: 3850000,
      description: "Tiền nước công nghiệp làm mát tuần hoàn máy ép và xịt rửa vệ sinh nhà xưởng",
      pay: true
    }
  ];

  for (const p of newPurchasing) {
    const res = await post('/purchasing/invoices', {
      docType: p.docType,
      voucherNo: p.voucherNo,
      voucherDate: p.voucherDate,
      supplierName: p.supplierName,
      taxCode: p.taxCode,
      invoiceSeries: p.invoiceSeries,
      costCategory: p.costCategory,
      processStage: p.processStage,
      allocationMode: p.allocationMode,
      subtotal: p.subtotal,
      vatRate: p.vatRate,
      vatAmount: p.vatAmount,
      totalAmount: p.totalAmount,
      description: p.description
    });

    if (res.status === 201) {
      console.log(`Đã tạo chứng từ chi phí ${p.voucherNo} (${p.costCategory})`);
      if (p.pay) {
        await post(`/purchasing/invoices/${res.data.id}/create-payment`, {
          paymentChannel: p.docType === "VAT_INVOICE" ? "bank" : "cash"
        });
      }
    } else {
      console.log(`Bỏ qua hoặc đã tồn tại: ${p.voucherNo} (${res.status})`);
    }
  }

  console.log("\n=== 4. KIỂM TRA PHÂN PHỐI DỮ LIỆU SAU KHI ĐA DẠNG HÓA ===");
  const afterSales = await prisma.voucher.findMany({
    where: { voucherType: 'HDB' },
    select: { cost_category: true }
  });
  const salesCounts = {};
  afterSales.forEach(v => {
    const cat = v.cost_category || 'EMPTY';
    salesCounts[cat] = (salesCounts[cat] || 0) + 1;
  });
  console.log('Phân bổ Hóa đơn Bán hàng (HDB):', salesCounts);

  const afterPur = await prisma.voucher.findMany({
    where: { voucherType: { in: ['PNK', 'HDM'] } },
    select: { voucherType: true, cost_category: true }
  });
  const purCounts = {};
  afterPur.forEach(v => {
    const k = `${v.voucherType} | ${v.cost_category || 'EMPTY'}`;
    purCounts[k] = (purCounts[k] || 0) + 1;
  });
  console.log('Phân bổ Chi phí & Thu mua:', purCounts);

  await prisma.$disconnect();
}

main().catch(console.error);
