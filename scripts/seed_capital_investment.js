const { PrismaClient } = require('@prisma/client');
const { randomUUID } = require('crypto');
const prisma = new PrismaClient();

async function seedCapitalAndFeasibility() {
  console.log('Seeding Capital Investment, Machinery CAPEX and Shareholders...');

  let org = await prisma.organization.findFirst({ orderBy: { createdAt: 'asc' } });
  if (!org) {
    console.error('No organization found');
    return;
  }
  const orgId = org.id;

  // 1. Seed Fixed Assets (Máy móc Dây chuyền ép dầu & Nhà xưởng Bến Tre)
  // Tổng nguyên giá đầu tư ban đầu (CAPEX): ~ 2.450.000.000 VNĐ
  const initialAssets = [
    {
      code: 'TSCD-NX01',
      name: 'Nhà xưởng ép dầu & Kho bãi (Mặt bằng 1.200m2, nền bê tông chịu tải, mái tôn cách nhiệt)',
      category: 'INFRASTRUCTURE',
      date: new Date('2026-06-10'),
      cost: 650000000,
      residual: 50000000,
      months: 120, // 10 năm
      brand: 'Công ty Xây dựng Công nghiệp Miền Tây',
      method: 'Đường thẳng (10 năm)'
    },
    {
      code: 'TSCD-DC01',
      name: 'Dây chuyền 02 Máy ép trục vít công suất 30 tấn/ngày (Ép kiệt dầu thô)',
      category: 'MACHINERY',
      date: new Date('2026-06-25'),
      cost: 820000000,
      residual: 40000000,
      months: 60, // 5 năm
      brand: 'Tập đoàn Cơ khí Chế tạo Máy Công nghiệp Tân Phát',
      method: 'Đường thẳng (5 năm)'
    },
    {
      code: 'TSCD-LC02',
      name: 'Hệ thống Máy lọc khung bản áp lực cao 50m2 + Máy ly tâm siêu tốc làm trong dầu',
      category: 'MACHINERY',
      date: new Date('2026-07-05'),
      cost: 380000000,
      residual: 20000000,
      months: 60, // 5 năm
      brand: 'Công ty Thiết bị Lọc Công nghiệp Sài Gòn',
      method: 'Đường thẳng (5 năm)'
    },
    {
      code: 'TSCD-SY03',
      name: 'Lò sấy cơm dừa công nghiệp tầng sôi (Tách ẩm nhanh giữ màu dầu sáng)',
      category: 'MACHINERY',
      date: new Date('2026-07-15'),
      cost: 260000000,
      residual: 10000000,
      months: 60, // 5 năm
      brand: 'Cơ khí Nhiệt Nam Long Bến Tre',
      method: 'Đường thẳng (5 năm)'
    },
    {
      code: 'TSCD-TEC04',
      name: 'Hệ thống Cụm 04 Bồn chứa Inox 304 (Dung tích 10.000 lít/bồn) kèm bơm tuần hoàn',
      category: 'STORAGE_TANK',
      date: new Date('2026-07-20'),
      cost: 210000000,
      residual: 30000000,
      months: 84, // 7 năm
      brand: 'Inox Kỹ nghệ Bến Tre',
      method: 'Đường thẳng (7 năm)'
    },
    {
      code: 'TSCD-CAN05',
      name: 'Trạm Cân điện tử xe tải 60 tấn chuyên dụng cân xe dừa (Kèm phần mềm in phiếu cân tự động)',
      category: 'VEHICLE_SCALE',
      date: new Date('2026-08-01'),
      cost: 130000000,
      residual: 10000000,
      months: 60, // 5 năm
      brand: 'Cân điện tử Vạn An Phát',
      method: 'Đường thẳng (5 năm)'
    }
  ];

  for (const asset of initialAssets) {
    const existing = await prisma.fixed_assets.findFirst({
      where: { organization_id: orgId, asset_code: asset.code }
    });
    if (!existing) {
      await prisma.fixed_assets.create({
        data: {
          id: randomUUID(),
          organization_id: orgId,
          asset_code: asset.code,
          asset_name: asset.name,
          asset_category: asset.category,
          acquisition_date: asset.date,
          original_cost: asset.cost,
          residual_value: asset.residual,
          useful_life_months: asset.months,
          depreciation_method: asset.method,
          status: 'ACTIVE',
          source_record_id: asset.brand,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      console.log(` -> Created asset: ${asset.code} - ${asset.name}`);
    }
  }

  // 2. Seed Vouchers Góp Vốn & Rót Vốn Cổ Đông (Vốn điều lệ cam kết: 4.000.000.000 VNĐ)
  // Thực góp: 3.500.000.000 VNĐ (gồm 2.45 tỷ mua CAPEX máy móc và 1.05 tỷ vốn lưu động mua dừa)
  const initialContributions = [
    // Đợt 1: Vốn ban đầu thành lập xưởng (T6/2026)
    {
      no: 'GV-202606-001',
      date: new Date('2026-06-05'),
      shareholder: 'Nguyễn Văn Đạt (Quản đốc)',
      amount: 1000000000,
      type: 'INITIAL_CAPEX',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Nguyễn Văn Đạt góp vốn đợt 1 thành lập xưởng ép dầu dừa (Thuê mặt bằng & đặt cọc máy móc)'
    },
    {
      no: 'GV-202606-002',
      date: new Date('2026-06-05'),
      shareholder: 'Trần Minh Quang (Đầu tư)',
      amount: 800000000,
      type: 'INITIAL_CAPEX',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Trần Minh Quang chuyển khoản góp vốn đợt 1 (Đầu tư dây chuyền máy ép và lọc ly tâm)'
    },
    {
      no: 'GV-202606-003',
      date: new Date('2026-06-08'),
      shareholder: 'Lê Hoàng Phúc (Vận hành & Kỹ thuật)',
      amount: 500000000,
      type: 'INITIAL_CAPEX',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Lê Hoàng Phúc góp vốn thành lập xưởng (Lắp đặt bồn Inox, trạm cân điện tử và hệ thống điện 3 pha)'
    },
    // Đợt 2: Rót vốn hoàn thiện lắp đặt máy móc nghiệm thu (T7/2026)
    {
      no: 'GV-202607-001',
      date: new Date('2026-07-10'),
      shareholder: 'Nguyễn Văn Đạt (Quản đốc)',
      amount: 400000000,
      type: 'INITIAL_CAPEX',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Nguyễn Văn Đạt thanh toán đợt cuối nghiệm thu dây chuyền ép & sấy tầng sôi'
    },
    {
      no: 'GV-202607-002',
      date: new Date('2026-07-12'),
      shareholder: 'Trần Minh Quang (Đầu tư)',
      amount: 300000000,
      type: 'INITIAL_CAPEX',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Trần Minh Quang chuyển khoản góp bổ sung mua trạm cân 60 tấn và bồn inox dự trữ'
    },
    // Đợt 3: Rót vốn lưu động chuẩn bị vào mùa ép rộ (T8/2026)
    {
      no: 'GV-202608-001',
      date: new Date('2026-08-15'),
      shareholder: 'Nguyễn Văn Đạt (Quản đốc)',
      amount: 200000000,
      type: 'WORKING_CAPITAL',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Nguyễn Văn Đạt rót vốn lưu động bổ sung quỹ tiền mặt thanh toán nhanh dừa cho thương lái'
    },
    {
      no: 'GV-202608-002',
      date: new Date('2026-08-20'),
      shareholder: 'Trần Minh Quang (Đầu tư)',
      amount: 200000000,
      type: 'WORKING_CAPITAL',
      channel: 'bank',
      bank: 'Vietcombank Bến Tre (TK 0071001234567)',
      desc: 'Trần Minh Quang bổ sung vốn lưu động bảo lãnh thu mua vỏ dừa số lượng lớn'
    },
    {
      no: 'GV-202608-003',
      date: new Date('2026-08-25'),
      shareholder: 'Lê Hoàng Phúc (Vận hành & Kỹ thuật)',
      amount: 100000000,
      type: 'WORKING_CAPITAL',
      channel: 'cash',
      bank: 'Quỹ tiền mặt xưởng (1111)',
      desc: 'Lê Hoàng Phúc nộp quỹ tiền mặt xưởng bổ sung chi phí bảo trì & vật tư màng lọc'
    }
  ];

  for (const c of initialContributions) {
    const existing = await prisma.voucher.findFirst({
      where: { organizationId: orgId, voucherNo: c.no }
    });
    if (!existing) {
      await prisma.voucher.create({
        data: {
          id: randomUUID(),
          organizationId: orgId,
          voucherType: c.channel === 'bank' ? 'BC_VON' : 'GOP_VON',
          voucherNo: c.no,
          voucherDate: c.date,
          status: 'posted',
          approval_status: 'approved',
          description: c.desc,
          total_debit: c.amount,
          total_credit: c.amount,
          supplier_name: c.shareholder,
          cost_category: c.type,
          payment_channel: c.channel,
          source_record_id: c.shareholder,
          createdAt: c.date,
          updatedAt: c.date
        }
      });
      console.log(` -> Created contribution voucher: ${c.no} - ${c.shareholder} (${c.amount.toLocaleString('vi-VN')} đ)`);
    }
  }

  console.log('Capital investment seeding completed successfully!');
  await prisma.$disconnect();
}

seedCapitalAndFeasibility().catch((err) => {
  console.error('Error seeding capital:', err);
  process.exit(1);
});
