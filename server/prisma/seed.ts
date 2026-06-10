import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Admin@12345', 12);

  await prisma.user.upsert({
    where: { email: 'admin@bafco.com' },
    update: { name: 'BAFCO Admin', role: 'ADMIN' },
    create: {
      email: 'admin@bafco.com',
      passwordHash,
      name: 'BAFCO Admin',
      role: 'ADMIN',
      address: 'Egypt - Cairo - 6 October',
    },
  });

  const categories = [
    { nameAr: 'منتجات الألبان', nameEn: 'Dairy Products', slug: 'dairy-products', sortOrder: 1 },
    { nameAr: 'الصلصات والمعجون', nameEn: 'Sauces & Paste', slug: 'sauces-paste', sortOrder: 2 },
    { nameAr: 'المشروبات والعصائر', nameEn: 'Beverages & Juices', slug: 'beverages-juices', sortOrder: 3 },
    { nameAr: 'الأغذية الجاهزة', nameEn: 'Ready Food', slug: 'ready-food', sortOrder: 4 },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  const dairy = await prisma.category.findUniqueOrThrow({ where: { slug: 'dairy-products' } });
  const sauces = await prisma.category.findUniqueOrThrow({ where: { slug: 'sauces-paste' } });
  const beverages = await prisma.category.findUniqueOrThrow({ where: { slug: 'beverages-juices' } });

  const products = [
    {
      nameAr: 'حليب بافكو كامل الدسم',
      nameEn: 'BAFCO Full Cream Milk',
      slug: 'bafco-full-cream-milk',
      descriptionAr: 'حليب طويل الأجل بطعم متوازن، مناسب للاستخدام اليومي والتوريد التجاري.',
      descriptionEn: 'Balanced UHT milk for daily use and trade supply.',
      shortDescAr: 'حليب كامل الدسم طويل الأجل',
      shortDescEn: 'Full cream UHT milk',
      price: 6.0,
      isFeatured: true,
      stockQuantity: 500,
      sku: 'BAF-MILK-001',
      unitSize: '1L',
      categoryId: dairy.id,
      servingSize: '100ml',
      calories: 62,
      totalFat: '3.4g',
      saturatedFat: '2.1g',
      sugars: '4.8g',
      protein: '3.2g',
      calcium: '120mg',
      sodium: '50mg',
      allergenWarningAr: 'يحتوي على الحليب.',
      allergenWarningEn: 'Contains milk.',
      ingredientsAr: 'حليب بقري كامل الدسم، فيتامين أ، فيتامين د.',
      ingredientsEn: 'Whole cow milk, Vitamin A, Vitamin D.',
    },
    {
      nameAr: 'معجون طماطم بافكو',
      nameEn: 'BAFCO Tomato Paste',
      slug: 'bafco-tomato-paste',
      descriptionAr: 'معجون طماطم مركز مناسب للمطاعم والتجزئة، بقوام ثابت ونكهة طبيعية.',
      descriptionEn: 'Concentrated tomato paste for foodservice and retail with stable texture.',
      shortDescAr: 'معجون طماطم مركز',
      shortDescEn: 'Concentrated tomato paste',
      price: 2.25,
      isFeatured: true,
      stockQuantity: 800,
      sku: 'BAF-TOM-140',
      unitSize: '140g',
      categoryId: sauces.id,
      servingSize: '30g',
      calories: 82,
      totalFat: '0.5g',
      totalCarbs: '18g',
      sugars: '12g',
      sodium: '30mg',
      allergenWarningAr: 'خال من مسببات الحساسية الشائعة.',
      allergenWarningEn: 'Free from common allergens.',
      ingredientsAr: 'طماطم طبيعية مركزة.',
      ingredientsEn: 'Concentrated natural tomatoes.',
    },
    {
      nameAr: 'عصير مانجو بافكو',
      nameEn: 'BAFCO Mango Juice',
      slug: 'bafco-mango-juice',
      descriptionAr: 'مشروب مانجو جاهز للتقديم بقوام غني وتعبئة مناسبة لقنوات التجزئة.',
      descriptionEn: 'Ready-to-serve mango beverage with rich texture for retail channels.',
      shortDescAr: 'مشروب مانجو جاهز',
      shortDescEn: 'Ready mango beverage',
      price: 4.5,
      isFeatured: true,
      stockQuantity: 350,
      sku: 'BAF-JUI-MAN',
      unitSize: '250ml',
      categoryId: beverages.id,
      servingSize: '250ml',
      calories: 110,
      totalCarbs: '26g',
      sugars: '24g',
      sodium: '20mg',
      ingredientsAr: 'ماء، لب مانجو، سكر، منظم حموضة.',
      ingredientsEn: 'Water, mango pulp, sugar, acidity regulator.',
    },
    {
      nameAr: 'صلصة البافكو الحارة',
      nameEn: 'BAFCO Hot Sauce',
      slug: 'bafco-hot-sauce',
      descriptionAr: 'صلصة حارة متوازنة مناسبة للوجبات السريعة والمطاعم.',
      descriptionEn: 'Balanced hot sauce suitable for fast food and restaurants.',
      shortDescAr: 'صلصة حارة جاهزة',
      shortDescEn: 'Ready hot sauce',
      price: 3.75,
      isFeatured: true,
      stockQuantity: 600,
      sku: 'BAF-SAU-HOT',
      unitSize: '500ml',
      categoryId: sauces.id,
      servingSize: '15ml',
      calories: 15,
      totalFat: '0.1g',
      sodium: '200mg',
      totalCarbs: '3g',
      sugars: '2g',
      ingredientsAr: 'ماء، فلفل حار، ثوم، خل، ملح، توابل.',
      ingredientsEn: 'Water, chili pepper, garlic, vinegar, salt, spices.',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: product,
      create: product,
    });
  }

  const jobs = [
    {
      titleAr: 'مشرف جودة',
      titleEn: 'Quality Supervisor',
      slug: 'quality-supervisor',
      departmentAr: 'الجودة',
      departmentEn: 'Quality',
      locationAr: 'مصر - القاهرة - ٦ أكتوبر',
      locationEn: 'Egypt - Cairo - 6 October',
      typeAr: 'دوام كامل',
      typeEn: 'Full-time',
      descriptionAr: 'الإشراف على تطبيق إجراءات سلامة الغذاء ومتابعة سجلات الجودة اليومية.',
      descriptionEn: 'Oversee food safety procedures and daily quality records.',
      requirementsAr: 'خبرة في أنظمة HACCP أو ISO 22000، وإلمام ببيئة مصانع الأغذية.',
      requirementsEn: 'Experience with HACCP or ISO 22000 and food manufacturing environments.',
      salaryMin: 7000,
      salaryMax: 10000,
      status: 'PUBLISHED',
    },
    {
      titleAr: 'فني إنتاج',
      titleEn: 'Production Technician',
      slug: 'production-technician',
      departmentAr: 'الإنتاج',
      departmentEn: 'Production',
      locationAr: 'مصر - القاهرة - ٦ أكتوبر',
      locationEn: 'Egypt - Cairo - 6 October',
      typeAr: 'دوام كامل',
      typeEn: 'Full-time',
      descriptionAr: 'تشغيل خطوط الإنتاج ومتابعة النظافة الصناعية وإجراءات السلامة.',
      descriptionEn: 'Operate production lines and follow hygiene and safety procedures.',
      requirementsAr: 'خبرة تشغيلية أساسية وقدرة على العمل بنظام الورديات.',
      requirementsEn: 'Basic operational experience and ability to work shifts.',
      salaryMin: 4500,
      salaryMax: 6500,
      status: 'PUBLISHED',
    },
  ];

  for (const job of jobs) {
    await prisma.job.upsert({
      where: { slug: job.slug },
      update: job,
      create: job,
    });
  }

  const documents = [
    {
      titleAr: 'ملف حوكمة الجودة',
      titleEn: 'Quality Governance Profile',
      slug: 'quality-governance-profile',
      type: 'governance',
      fileUrl: '/documents/quality-governance-profile.pdf',
      year: 2026,
      isPublished: true,
      sortOrder: 1,
    },
    {
      titleAr: 'تقرير الاستدامة 2026',
      titleEn: 'Sustainability Report 2026',
      slug: 'sustainability-report-2026',
      type: 'presentation',
      fileUrl: '/documents/sustainability-report-2026.pdf',
      year: 2026,
      isPublished: true,
      sortOrder: 2,
    },
  ];

  for (const document of documents) {
    await prisma.investorDocument.upsert({
      where: { slug: document.slug },
      update: document,
      create: document,
    });
  }

  const news = [
    {
      titleAr: 'بافكو تطلق برنامج تتبع دفعات الإنتاج',
      titleEn: 'BAFCO Launches Batch Traceability Program',
      slug: 'bafco-batch-traceability-program',
      excerptAr: 'برنامج جديد يربط المواد الخام ودفعات الإنتاج وبيانات الجودة لتعزيز الشفافية التشغيلية.',
      excerptEn: 'A new program links raw materials, production batches, and quality data to strengthen operational transparency.',
      category: 'quality',
      isPublished: true,
      publishedAt: new Date('2026-05-15'),
    },
    {
      titleAr: 'مبادرة بافكو لخفض الهدر التشغيلي',
      titleEn: 'BAFCO Operational Waste Reduction Initiative',
      slug: 'bafco-operational-waste-reduction',
      excerptAr: 'تستهدف المبادرة تحسين استخدام الموارد وتقليل الهدر في عمليات التعبئة والتوريد.',
      excerptEn: 'The initiative improves resource use and reduces waste across packing and supply operations.',
      category: 'sustainability',
      isPublished: true,
      publishedAt: new Date('2026-04-20'),
    },
  ];

  for (const item of news) {
    await prisma.newsArticle.upsert({
      where: { slug: item.slug },
      update: item,
      create: item,
    });
  }

  const contactInfo = [
    { key: 'address', valueAr: 'جدة، المملكة العربية السعودية', valueEn: 'Jeddah, Saudi Arabia' },
    { key: 'phone', valueAr: '+966 12 600 0000', valueEn: '+966 12 600 0000' },
    { key: 'email', valueAr: 'info@bafco.com', valueEn: 'info@bafco.com' },
  ];

  for (const item of contactInfo) {
    await prisma.contactInfo.upsert({
      where: { key: item.key },
      update: item,
      create: item,
    });
  }

  console.log('BAFCO seed completed.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
