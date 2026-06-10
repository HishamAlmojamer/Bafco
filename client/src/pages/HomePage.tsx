import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroSection from '../components/home/HeroSection';
import StatsCounter from '../components/home/StatsCounter';
import NewsGrid from '../components/home/NewsGrid';
import { useTranslation } from '../hooks/useTranslation';
import { products as productsApi, cart as cartApi } from '../services/api';
import type { Product } from '../types';

export default function HomePage() {
  const { t, locale } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.list({ take: 4 })
      .then((data) => setFeatured(data?.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (productId: number) => {
    await cartApi.addItem(productId);
    window.dispatchEvent(new Event('cart-update'));
  };

  const pillars = [
    {
      titleAr: 'سلامة الغذاء',
      titleEn: 'Food Safety',
      descAr: 'إجراءات تحقق ومراقبة على مراحل الإنتاج والتعبئة والتخزين.',
      descEn: 'Verification and control procedures across production, packing, and storage.',
    },
    {
      titleAr: 'تتبع تشغيلي',
      titleEn: 'Traceability',
      descAr: 'ربط المواد الخام والتشغيل والدفعات النهائية بسجلات قابلة للمراجعة.',
      descEn: 'Raw materials, production runs, and finished batches linked to auditable records.',
    },
    {
      titleAr: 'استدامة الموارد',
      titleEn: 'Resource Efficiency',
      descAr: 'خفض الهدر وتحسين استهلاك المياه والطاقة داخل عمليات المصنع.',
      descEn: 'Reduced waste and improved water and energy use inside factory operations.',
    },
    {
      titleAr: 'جاهزية التوزيع',
      titleEn: 'Distribution Readiness',
      descAr: 'منتجات مجهزة للتوريد التجاري، البيع المؤسسي، وقنوات التجزئة.',
      descEn: 'Products prepared for trade supply, institutional sales, and retail channels.',
    },
  ];

  const testimonials = [
    {
      nameAr: 'محمد الشهري',
      nameEn: 'Mohammed Al-Shehri',
      roleAr: 'مدير مشتريات',
      roleEn: 'Procurement Manager',
      textAr: 'بافكو شريك موثوق في توريد المنتجات الغذائية. الجودة ثابتة والالتزام بالمواعيد ممتاز.',
      textEn: 'BAFCO is a reliable partner for food supply. Consistent quality and excellent on-time delivery.',
    },
    {
      nameAr: 'سارة القحطاني',
      nameEn: 'Sara Al-Qahtani',
      roleAr: 'مدير جودة',
      roleEn: 'Quality Manager',
      textAr: 'نظام التتبع ومعايير سلامة الغذاء في بافكو من الأفضل في السوق السعودي.',
      textEn: 'BAFCO\'s traceability system and food safety standards are among the best in the Saudi market.',
    },
    {
      nameAr: 'عبدالله الغامدي',
      nameEn: 'Abdullah Al-Ghamdi',
      roleAr: 'شريك تجاري',
      roleEn: 'Business Partner',
      textAr: 'التعامل مع بافكو يمنحنا ثقة كبيرة في جودة المنتج وثبات التوريد.',
      textEn: 'Working with BAFCO gives us great confidence in product quality and supply consistency.',
    },
  ];

  return (
    <>
      <HeroSection />
      <StatsCounter />

      {/* Featured Products */}
      <section className="bg-white py-24">
        <div className="container-bafco">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-bafco-green">
                {locale === 'ar' ? 'منتجاتنا' : 'Our Products'}
              </span>
              <h2 className="section-title mt-2">
                {locale === 'ar' ? 'منتجات مختارة' : 'Featured Products'}
              </h2>
              <p className="section-subtitle max-w-2xl">
                {locale === 'ar'
                  ? 'تشكيلة من أفضل منتجاتنا الغذائية عالية الجودة.'
                  : 'A selection of our finest high-quality food products.'}
              </p>
            </div>
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 text-sm font-semibold text-bafco-red hover:text-bafco-red/80 transition-colors"
            >
              {locale === 'ar' ? 'عرض الكل' : 'View All'}
              <svg className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card animate-pulse border border-gray-100 p-5">
                  <div className="mb-4 aspect-square rounded-xl bg-gray-100" />
                  <div className="mb-3 h-4 w-3/4 rounded bg-gray-100" />
                  <div className="mb-2 h-3 w-1/2 rounded bg-gray-100" />
                  <div className="h-3 w-1/3 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((product) => (
                <div
                  key={product.id}
                  className="group card card-hover border border-gray-100 overflow-hidden"
                >
                  <Link to={`/products/${product.slug}`}>
                    <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={locale === 'ar' ? product.nameAr : product.nameEn}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-bafco-red/10">
                          <span className="text-3xl font-bold text-bafco-red">
                            {product.nameAr?.charAt(0) || '?'}
                          </span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    {product.category && (
                      <p className="text-xs font-medium text-bafco-red uppercase tracking-wider mb-1">
                        {locale === 'ar' ? product.category.nameAr : product.category.nameEn}
                      </p>
                    )}
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-bafco-red transition-colors line-clamp-2">
                        {locale === 'ar' ? product.nameAr : product.nameEn}
                      </h3>
                    </Link>
                    {product.unitSize && (
                      <p className="text-xs text-gray-400 mt-1">{product.unitSize}</p>
                    )}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                      <span className="text-lg font-bold text-bafco-red">SAR {product.price.toFixed(2)}</span>
                      <button
                        onClick={() => handleAddToCart(product.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-bafco-red text-white hover:bg-bafco-red/90 active:scale-95 transition-all shadow-lg shadow-bafco-red/20"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Operational Standards */}
      <section className="bg-gray-50 py-24">
        <div className="container-bafco">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-bafco-green">
                {locale === 'ar' ? 'معايير التشغيل' : 'Operational Standards'}
              </span>
              <h2 className="section-title mt-2">
                {locale === 'ar' ? 'جودة غذائية قابلة للقياس' : 'Measurable Food Quality'}
              </h2>
              <p className="section-subtitle">
                {locale === 'ar'
                  ? 'يركز مصنع بافكو على بناء تجربة توريد موثوقة: منتجات واضحة البيانات، جودة ثابتة، واستجابة أفضل لاحتياجات العملاء والشركاء.'
                  : 'BAFCO focuses on a dependable supply experience: clear product data, consistent quality, and stronger response to customer and partner needs.'}
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {pillars.map((item) => (
                <div key={item.titleEn} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 h-1.5 w-12 rounded-full bg-bafco-red" />
                  <h3 className="text-base font-bold text-gray-900">
                    {locale === 'ar' ? item.titleAr : item.titleEn}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    {locale === 'ar' ? item.descAr : item.descEn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white py-24">
        <div className="container-bafco">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-bafco-green">
              {locale === 'ar' ? 'شهادات العملاء' : 'Testimonials'}
            </span>
            <h2 className="section-title mt-2">
              {locale === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm hover:shadow-lg transition-shadow"
              >
                <svg className="absolute top-6 right-6 h-8 w-8 text-bafco-red/10" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
                <p className="relative z-10 text-sm leading-relaxed text-gray-600 mb-6 italic">
                  &ldquo;{locale === 'ar' ? item.textAr : item.textEn}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-bafco-red/10 text-sm font-bold text-bafco-red">
                    {locale === 'ar' ? item.nameAr.charAt(0) : item.nameEn.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {locale === 'ar' ? item.nameAr : item.nameEn}
                    </p>
                    <p className="text-xs text-gray-400">
                      {locale === 'ar' ? item.roleAr : item.roleEn}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <NewsGrid />

      {/* CTA Banner */}
      <section className="relative overflow-hidden bg-gradient-to-r from-bafco-navy via-bafco-red to-bafco-navy py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container-bafco relative z-10">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              {locale === 'ar' ? 'هل تبحث عن شريك توريد موثوق؟' : 'Looking for a Reliable Supply Partner?'}
            </h2>
            <p className="mt-4 text-lg text-white/70">
              {locale === 'ar'
                ? 'تواصل مع فريق المبيعات لدينا للحصول على عروض الأسعار والمعلومات التقنية.'
                : 'Contact our sales team for pricing and technical information.'}
            </p>
            <div className={`mt-10 flex flex-wrap justify-center gap-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Link
                to="/contact"
                className="btn-primary !px-8 !py-4 text-base shadow-lg shadow-white/10"
              >
                {locale === 'ar' ? 'اتصل بنا' : 'Contact Us'}
              </Link>
              <Link
                to="/products"
                className="rounded-xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all"
              >
                {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
