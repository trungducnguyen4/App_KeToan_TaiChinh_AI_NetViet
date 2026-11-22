const http = require('http');

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

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:4000/api' + path, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    }).on('error', reject);
  });
}

// Suppliers data
const SUPPLIERS = [
  { name: "Thương lái Ba Dừa (Bến Tre)", plate: "71C-123.45", phone: "0918.234.567", area: "Châu Thành, Bến Tre", yieldBase: 22.8 },
  { name: "Thương lái Tư Dừa (Mỏ Cày)", plate: "71C-234.56", phone: "0903.888.777", area: "Mỏ Cày Nam, Bến Tre", yieldBase: 21.2 },
  { name: "Thương lái Năm Dừa (Giồng Trôm)", plate: "71C-345.67", phone: "0939.112.233", area: "Giồng Trôm, Bến Tre", yieldBase: 18.5 },
  { name: "Thương lái Sáu Dừa (Chợ Lách)", plate: "71C-456.78", phone: "0988.456.789", area: "Chợ Lách, Bến Tre", yieldBase: 22.1 },
  { name: "Thương lái Bảy Dừa (Bình Đại)", plate: "71C-567.89", phone: "0977.654.321", area: "Bình Đại, Bến Tre", yieldBase: 20.4 }
];

// Utility suppliers
const UTILITY_SUPPLIERS = [
  { name: "Công ty Điện Lực Bến Tre", taxCode: "1300123456", series: "1C26TBT", category: "PROCESSING", stage: "EP", desc: "Tiền điện sản xuất máy ép & lọc dầu dừa kỳ" },
  { name: "Công ty Màng Lọc Công Nghiệp Tân Phát", taxCode: "0312456789", series: "1C26TTP", category: "PROCESSING", stage: "LOC", desc: "Màng lọc dầu dừa và phụ gia trợ lọc kỳ" },
  { name: "Xưởng Cơ Khí & Bảo Trì Máy Nam Long", taxCode: "1300987654", series: "1C26TNL", category: "PROCESSING", stage: "EP", desc: "Bảo trì thay vòng bi & trục vít máy ép số 1 & 2 kỳ" },
  { name: "Công ty Bao Bì Thùng Phuy Miền Tây", taxCode: "1200345678", series: "1C26TBT", category: "OVERHEAD", stage: "DONG_PHUY", desc: "Phuy sắt 200L & can nhựa 30L chuyên dụng chứa dầu kỳ" }
];

// Customers data
const CUSTOMERS = [
  { name: "Công ty CP Dược Mỹ Phẩm Sài Gòn", taxCode: "0309998888", series: "1C26TNV", ratio: 0.30 },
  { name: "Công ty TNHH Dầu Thực Vật Miền Tây", taxCode: "1800112233", series: "1C26TNV", ratio: 0.30 },
  { name: "Công ty Mỹ Phẩm Quốc Tế Cỏ Cây Hoa Lá", taxCode: "0108992233", series: "1C26TNV", ratio: 0.20 },
  { name: "Công ty CP Thực Phẩm Hữu Cơ Bến Tre", taxCode: "1300778899", series: "1C26TNV", ratio: 0.20 }
];

const BYPRODUCT_BUYERS = [
  { name: "Cơ sở Sản xuất Thức Ăn Chăn Nuôi Hòa Phát", taxCode: "1300554433", unitPrice: 1300, productType: "MEAL_BROWN", label: "cám dừa nâu ép khô" },
  { name: "Công ty CP Bánh Kẹo Bibica Miền Tây", taxCode: "1200889911", unitPrice: 2400, productType: "MEAL_WHITE", label: "cám dừa trắng ép mịn" },
  { name: "Hợp tác xã Nông Nghiệp Hữu Cơ Ba Tri", taxCode: "1300667788", unitPrice: 1650, productType: "MEAL_WHOLE", label: "cám dừa nguyên chất" },
  { name: "Trang trại Nuôi Bò Sữa Ba Tri", taxCode: "1300887766", unitPrice: 1250, productType: "MEAL_BROWN", label: "cám dừa nâu" },
  { name: "Xưởng Sản Xuất Bánh Dừa Nướng Đặc Sản Bến Tre", taxCode: "1300994422", unitPrice: 2500, productType: "MEAL_WHITE", label: "cám dừa trắng thượng hạng" },
  { name: "Hợp tác xã Chăn Nuôi Thủy Sản Châu Thành", taxCode: "1300443322", unitPrice: 1350, productType: "BYPRODUCT", label: "cám dừa thành phẩm" }
];

async function seedThreeMonths() {
  console.log("=== BẮT ĐẦU SEED DỮ LIỆU HOẠT ĐỘNG 3 THÁNG (T9, T10, T11/2026) ===");

  // We will generate:
  // Tháng 9: 01/09/2026 -> 30/09/2026
  // Tháng 10: 01/10/2026 -> 31/10/2026
  // Tháng 11: 01/11/2026 -> 21/11/2026

  const startDate = new Date("2026-09-01T07:30:00.000Z");
  const endDate = new Date("2026-11-21T16:00:00.000Z");

  let currentDate = new Date(startDate);
  let batchIndex = 4; // ME-202611-001..003 already exist, we will use dated codes
  let slipIndex = 3;  // PCN-202611-001..002 already exist
  let vatVoucherSeq = 100;
  let salesVoucherSeq = 10;

  let totalBatchesCreated = 0;
  let totalPurchasingCreated = 0;
  let totalPaymentsCreated = 0;
  let totalSalesCreated = 0;
  let totalSalesPaymentsCreated = 0;

  // Track crude oil produced and byproduct produced
  let currentInventoryOilKg = 0;
  let currentInventoryByproductKg = 0;

  while (currentDate <= endDate) {
    const dayOfWeek = currentDate.getUTCDay(); // 0 is Sunday
    const dateStr = currentDate.toISOString().split('T')[0];
    const month = currentDate.getUTCMonth() + 1;
    const year = currentDate.getUTCFullYear();
    const day = currentDate.getUTCDate();

    // 1. Every 2-3 days (except Sunday), there is coconut husk purchasing and pressing
    if (dayOfWeek !== 0 && (day % 3 === 0 || day % 3 === 1)) {
      const supplier = SUPPLIERS[(slipIndex + day) % SUPPLIERS.length];
      const slipNo = `PCN-${year}${String(month).padStart(2, '0')}-${String(slipIndex++).padStart(3, '0')}`;
      
      // Randomize raw weight between 11.5 and 16.5 tons
      const rawWeightKg = Math.round((11500 + Math.random() * 5000) / 100) * 100;
      const tareWeightKg = 5500 + Math.round(Math.random() * 1000);
      const grossWeightKg = rawWeightKg + tareWeightKg;
      const unitPrice = 4100 + (day % 4) * 50; // 4,100 to 4,250 đ/kg
      const handlingFee = 800000 + (day % 3) * 100000;
      const subtotal = rawWeightKg * unitPrice;
      const totalAmount = subtotal + handlingFee;

      // Create Purchasing Voucher (PCN)
      const pcnRes = await post('/purchasing/invoices', {
        docType: "PURCHASE_SLIP",
        voucherNo: slipNo,
        voucherDate: `${dateStr}T08:00:00.000Z`,
        supplierName: supplier.name,
        costCategory: "RAW_MATERIAL",
        allocationMode: "BATCH",
        vehiclePlate: supplier.plate,
        grossWeightKg,
        tareWeightKg,
        netWeightKg: rawWeightKg,
        unitPrice,
        handlingFee,
        subtotal,
        totalAmount,
        description: `Thu mua ${(rawWeightKg / 1000).toFixed(1)} tấn vỏ dừa tươi xe ${supplier.plate} từ ${supplier.name}`
      });

      if (pcnRes.status === 201) {
        totalPurchasingCreated++;
        const pcnId = pcnRes.data.id;

        // Auto pay 85% of purchase slips right at the scale
        if (Math.random() > 0.15) {
          const payChannel = Math.random() > 0.35 ? "cash" : "bank";
          const payRes = await post(`/purchasing/invoices/${pcnId}/create-payment`, {
            paymentChannel: payChannel
          });
          if (payRes.status === 201) totalPaymentsCreated++;
        }

        // 2. Immediate Production Batch for this delivery
        const batchCode = `ME-${year}${String(month).padStart(2, '0')}-${String(batchIndex++).padStart(3, '0')}`;
        // Slight fluctuation around supplier's yieldBase
        const yieldVariation = (Math.random() * 1.6) - 0.8;
        const actualYield = Math.max(17.8, Math.min(23.5, supplier.yieldBase + yieldVariation));
        const crudeOilKg = Math.round((rawWeightKg * actualYield) / 100);
        const byproductKg = Math.round(rawWeightKg * 0.72); // ~72% coconut husk cake/fiber
        
        let note = `Mẻ ép từ xe ${supplier.plate} của ${supplier.name}. Tỷ lệ thu hồi dầu đạt ${actualYield.toFixed(2)}%.`;
        if (actualYield < 19.0) {
          note = `CẢNH BÁO: Tỷ lệ thu hồi dầu thấp (${actualYield.toFixed(2)}%). Vỏ dừa có độ ẩm cao, cần lưu ý thương lái.`;
        } else if (actualYield > 22.0) {
          note = `Mẻ ép chất lượng xuất sắc, tỷ lệ thu hồi đạt ${actualYield.toFixed(2)}%, vỏ dừa già khô ráo.`;
        }

        const batchRes = await post('/production/batches', {
          batchCode,
          batchDate: `${dateStr}T10:30:00.000Z`,
          supplierName: supplier.name,
          rawMaterialKg: rawWeightKg,
          crudeOilKg,
          byproductKg,
          status: "COMPLETED",
          notes: note
        });

        if (batchRes.status === 201) {
          totalBatchesCreated++;
          currentInventoryOilKg += crudeOilKg;
          currentInventoryByproductKg += byproductKg;
        }
      }
    }

    // 3. Weekly or bi-weekly sales dispatch
    // When crude oil inventory reaches >= 6,000 kg, dispatch an invoice
    if (currentInventoryOilKg >= 6000) {
      const customer = CUSTOMERS[salesVoucherSeq % CUSTOMERS.length];
      const isFiltered = salesVoucherSeq % 2 === 1;
      const productType = isFiltered ? "FILTERED_OIL" : "CRUDE_OIL";
      const dispatchKg = Math.min(currentInventoryOilKg - 1000, 4500 + Math.round(Math.random() * 3000));
      const unitPrice = isFiltered ? (35000 + (month === 11 ? 1000 : 0)) : (30000 + (month === 11 ? 500 : 0));
      const subtotal = dispatchKg * unitPrice;
      const vatRate = 8; // 8% VAT for vegetable oil
      const vatAmount = Math.round(subtotal * 0.08);
      const totalAmount = subtotal + vatAmount;
      const voucherNo = `HDB-${year}-${String(salesVoucherSeq++).padStart(3, '0')}`;
      const productDesc = isFiltered ? "dầu dừa lọc tinh khiết đạt chuẩn" : "dầu dừa thô xuất xưởng";

      const saleRes = await post('/sales/invoices', {
        docType: "VAT_INVOICE",
        voucherNo,
        voucherDate: `${dateStr}T14:00:00.000Z`,
        customerName: customer.name,
        taxCode: customer.taxCode,
        invoiceSeries: customer.series,
        productType,
        quantity: dispatchKg,
        unit: "kg",
        unitPrice,
        subtotal,
        vatRate,
        vatAmount,
        totalAmount,
        description: `Xuất bán ${(dispatchKg).toLocaleString('vi-VN')} kg ${productDesc} cho ${customer.name}`
      });

      if (saleRes.status === 201) {
        totalSalesCreated++;
        currentInventoryOilKg -= dispatchKg;
        const saleId = saleRes.data.id;

        // Customer payments: 80% paid via bank transfer
        if (Math.random() > 0.20) {
          const paySaleRes = await post(`/sales/invoices/${saleId}/payment`, {
            paymentChannel: "bank",
            description: `Khách hàng ${customer.name} chuyển khoản thanh toán HĐ ${voucherNo}`
          });
          if (paySaleRes.status === 201) totalSalesPaymentsCreated++;
        }
      }
    }

    // 4. Byproduct sale (Cám dừa thành phẩm: nâu, trắng, nguyên) once every ~10 days
    if (currentInventoryByproductKg >= 20000) {
      const buyer = BYPRODUCT_BUYERS[salesVoucherSeq % BYPRODUCT_BUYERS.length];
      const saleQty = Math.round((currentInventoryByproductKg * 0.7) / 1000) * 1000;
      const subtotal = saleQty * buyer.unitPrice;
      const totalAmount = subtotal;
      const voucherNo = `BK-${year}-${String(salesVoucherSeq++).padStart(3, '0')}`;

      const saleRes = await post('/sales/invoices', {
        docType: "SALES_RECEIPT",
        voucherNo,
        voucherDate: `${dateStr}T15:30:00.000Z`,
        customerName: buyer.name,
        taxCode: buyer.taxCode,
        productType: buyer.productType,
        quantity: saleQty,
        unit: "kg",
        unitPrice: buyer.unitPrice,
        subtotal,
        vatRate: 0,
        vatAmount: 0,
        totalAmount,
        description: `Xuất bán ${(saleQty).toLocaleString('vi-VN')} kg ${buyer.label} cho ${buyer.name}`
      });

      if (saleRes.status === 201) {
        totalSalesCreated++;
        currentInventoryByproductKg -= saleQty;
        const saleId = saleRes.data.id;
        // Byproduct buyer pays cash
        const payRes = await post(`/sales/invoices/${saleId}/payment`, {
          paymentChannel: "cash",
          description: `Thu tiền mặt bán cám dừa theo phiếu ${voucherNo}`
        });
        if (payRes.status === 201) totalSalesPaymentsCreated++;
      }
    }

    // Advance 1 day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  // 5. Monthly utility and overhead bills for T9, T10, T11
  const months = [
    { m: 9, date: "2026-09-30", elec: 18450000, filter: 6200000, maint: 4500000, drum: 8500000 },
    { m: 10, date: "2026-10-31", elec: 21320000, filter: 7800000, maint: 5200000, drum: 9800000 },
    { m: 11, date: "2026-11-20", elec: 19926000, filter: 6500000, maint: 3800000, drum: 7200000 }
  ];

  for (const item of months) {
    // We already have electricity for T11 (0048192), so create others
    for (const util of UTILITY_SUPPLIERS) {
      if (item.m === 11 && util.category === "PROCESSING" && util.stage === "EP" && util.name.includes("Điện Lực")) {
        continue; // Already exists
      }
      const invNo = `${String(vatVoucherSeq++).padStart(7, '0')}`;
      let costVal = item.elec;
      if (util.name.includes("Màng Lọc")) costVal = item.filter;
      else if (util.name.includes("Cơ Khí")) costVal = item.maint;
      else if (util.name.includes("Bao Bì")) costVal = item.drum;

      const vatAmt = Math.round(costVal * 0.08);
      const total = costVal + vatAmt;

      const invRes = await post('/purchasing/invoices', {
        docType: "VAT_INVOICE",
        voucherNo: invNo,
        voucherDate: `${item.date}T16:00:00.000Z`,
        supplierName: util.name,
        taxCode: util.taxCode,
        invoiceSeries: util.series,
        costCategory: util.category,
        processStage: util.stage,
        allocationMode: "PERIOD",
        subtotal: costVal,
        vatRate: 8,
        vatAmount: vatAmt,
        totalAmount: total,
        description: `${util.desc} T${item.m}/2026`
      });

      if (invRes.status === 201) {
        totalPurchasingCreated++;
        // Pay previous months' utility bills via bank
        if (item.m < 11) {
          const payRes = await post(`/purchasing/invoices/${invRes.data.id}/create-payment`, {
            paymentChannel: "bank"
          });
          if (payRes.status === 201) totalPaymentsCreated++;
        }
      }
    }
  }

  console.log("\n=== KẾT QUẢ SEED DATA 3 THÁNG HOÀN TẤT ===");
  console.log(`- Mẻ ép sản xuất đã tạo: ${totalBatchesCreated}`);
  console.log(`- Chứng từ mua vào & chi phí đã tạo: ${totalPurchasingCreated}`);
  console.log(`- Phiếu chi & báo nợ thanh toán mua vào: ${totalPaymentsCreated}`);
  console.log(`- Hóa đơn bán hàng & phụ phẩm đã tạo: ${totalSalesCreated}`);
  console.log(`- Phiếu thu & báo có thu tiền bán hàng: ${totalSalesPaymentsCreated}`);
}

seedThreeMonths().catch(console.error);
