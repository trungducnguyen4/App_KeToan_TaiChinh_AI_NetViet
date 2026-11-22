const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE vouchers ADD COLUMN due_date DATE NULL AFTER posting_date');
    console.log('Added due_date column');
  } catch (e) {
    console.log('due_date column might already exist:', e.message);
  }
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE vouchers ADD COLUMN payment_term_days INT NULL DEFAULT 0 AFTER due_date');
    console.log('Added payment_term_days column');
  } catch (e) {
    console.log('payment_term_days column might already exist:', e.message);
  }
  await prisma.$disconnect();
}
main().catch(console.error);
