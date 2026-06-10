// Bootstrap DB with an admin user (optional)
// Run after prisma migrate/dev and prisma generate.

const bcrypt = require('bcryptjs');
const { prisma } = require('./src/utils/prisma');

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: 'ADMIN' }
    });
    console.log('Created admin:', { email, id: user.id });
  } else {
    console.log('Admin already exists:', email);
  }

  // Add BAFCO Categories
  const categories = ['ألبان السعودية', 'آيس كريم السعودية', 'عصائر', 'منتجات الطماطم', 'حليب مكثف'];
  for (const catName of categories) {
    await prisma.category.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName }
    });
  }
  console.log('BAFCO categories seeded.');

  // Add sample BAFCO products
  const dairyCat = await prisma.category.findUnique({ where: { name: 'ألبان السعودية' } });
  const iceCreamCat = await prisma.category.findUnique({ where: { name: 'آيس كريم السعودية' } });
  const tomatoCat = await prisma.category.findUnique({ where: { name: 'منتجات الطماطم' } });

  const foodProducts = [
    { name: 'حليب السعودية كامل الدسم', description: 'حليب طويل الأجل عالي الجودة، غني بالكالسيوم والفيتامينات.', price: 6.0, categoryId: dairyCat.id },
    { name: 'آيس كريم السعودية فانيليا', description: 'آيس كريم كريمي غني بنكهة الفانيليا الطبيعية.', price: 5.0, categoryId: iceCreamCat.id },
    { name: 'معجون طماطم السعودية', description: 'معجون طماطم طبيعي 100% بدون مواد حافظة.', price: 1.5, categoryId: tomatoCat.id },
    { name: 'زبادي السعودية طازج', description: 'زبادي طازج ومغذي محضر من أفضل أنواع الحليب.', price: 2.0, categoryId: dairyCat.id },
    { name: 'حليب السعودية قليل الدسم', description: 'خيار صحي وخفيف مع الحفاظ على القيمة الغذائية الكاملة.', price: 6.0, categoryId: dairyCat.id }
  ];

  for (const p of foodProducts) {
    await prisma.product.upsert({
      where: { id: 0 }, // Just to use upsert pattern safely or use create
      update: {},
      create: p
    }).catch(async () => {
        // If upsert fails because of ID, just create
        await prisma.product.create({ data: p });
    });
  }
  console.log('BAFCO products seeded.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

