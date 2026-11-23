const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mirror filterByPeriod from web
function filterByPeriod(items, getDate, period) {
  if (period === "ALL") return items;
  const now = new Date("2026-11-23T00:00:00.000Z");
  const months = period === "1M" ? 1 : period === "3M" ? 3 : 6;
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months);
  return items.filter(item => {
    const d = new Date(getDate(item));
    return d >= cutoff;
  });
}

async function main() {
  const batches = await prisma.productionBatch.findMany();
  console.log("Total batches:", batches.length);

  for (const p of ["1M", "3M", "6M", "ALL"]) {
    const pb = filterByPeriod(batches, b => b.batchDate, p);
    const rawTons = pb.reduce((s, b) => s + Number(b.rawMaterialKg), 0) / 1000;
    const oilTons = pb.reduce((s, b) => s + Number(b.crudeOilKg), 0) / 1000;
    const liters = pb.reduce((s, b) => s + Number(b.crudeOilLiters), 0);
    const bypTons = pb.reduce((s, b) => s + Number(b.byproductKg), 0) / 1000;

    const crudeOilTons = Number((oilTons * 0.50).toFixed(2));
    const filteredOilTons = Number((oilTons - crudeOilTons).toFixed(2));
    const crudeOilLiters = Math.round(liters * 0.50);
    const filteredOilLiters = Math.round(liters - crudeOilLiters);

    const mealBrownTons = Number((bypTons * 0.303).toFixed(2));
    const mealWhiteTons = Number((bypTons * 0.278).toFixed(2));
    const mealWholeTons = Number((bypTons - mealBrownTons - mealWhiteTons).toFixed(2));

    console.log(`\n--- Period ${p} (${pb.length} batches) ---`);
    console.log(`Raw: ${rawTons.toFixed(2)} Tấn`);
    console.log(`Oil: ${oilTons.toFixed(2)} Tấn (~${liters.toLocaleString("vi-VN")} L)`);
    console.log(`  -> Dầu thô: ${crudeOilTons.toFixed(2)} Tấn (~${crudeOilLiters.toLocaleString("vi-VN")} L)`);
    console.log(`  -> Dầu lọc: ${filteredOilTons.toFixed(2)} Tấn (~${filteredOilLiters.toLocaleString("vi-VN")} L)`);
    console.log(`Byproduct: ${bypTons.toFixed(2)} Tấn`);
    console.log(`  -> Cám nâu: ${mealBrownTons.toFixed(2)} Tấn (${(bypTons > 0 ? (mealBrownTons / bypTons * 100).toFixed(1) : 0)}%)`);
    console.log(`  -> Cám trắng: ${mealWhiteTons.toFixed(2)} Tấn (${(bypTons > 0 ? (mealWhiteTons / bypTons * 100).toFixed(1) : 0)}%)`);
    console.log(`  -> Cám nguyên: ${mealWholeTons.toFixed(2)} Tấn (${(bypTons > 0 ? (mealWholeTons / bypTons * 100).toFixed(1) : 0)}%)`);
    console.log(`  -> Check sum: ${(mealBrownTons + mealWhiteTons + mealWholeTons).toFixed(2)} vs ${bypTons.toFixed(2)}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
