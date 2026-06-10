import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export default function HeroSection() {
  const { t, locale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const capabilityCards = [
    { value: '24/7', labelAr: 'جاهزية تشغيل', labelEn: 'Operational Readiness', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { value: 'QC', labelAr: 'مختبر جودة', labelEn: 'Quality Lab', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' },
    { value: 'GMP', labelAr: 'ممارسات تصنيع', labelEn: 'Manufacturing Practice', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { value: 'KSA', labelAr: 'مركز إمداد', labelEn: 'Supply Hub', icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ];

  const badges = [
    { label: 'ISO 22000', subAr: 'سلامة الغذاء', subEn: 'Food Safety' },
    { label: 'HACCP', subAr: 'تحكم بالمخاطر', subEn: 'Hazard Control' },
    { label: 'SASO', subAr: 'مطابقة سعودية', subEn: 'Saudi Compliance' },
  ];

  return (
    <section className="relative overflow-hidden bg-bafco-navy text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-br from-bafco-red/5 via-transparent to-bafco-navy" />
      <div className="absolute top-0 -right-40 h-96 w-96 rounded-full bg-bafco-red/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-bafco-gold/5 blur-3xl" />

      <div className="container-bafco relative z-10 py-20">
        <div className="grid min-h-[78vh] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <div className={`transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${locale === 'ar' ? 'lg:order-2' : ''}`}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-bafco-gold" />
              {t('home.hero.subtitle')}
            </div>

            <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
              {locale === 'ar' ? 'مصنع بافكو للأغذية' : 'BAFCO Food Plant'}
            </h1>
            <p className="mt-4 text-lg font-medium text-white/80 sm:text-xl">
              {t('home.hero.title')}
            </p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/65">
              {t('home.hero.description')}
            </p>

            <div className={`mt-10 flex flex-wrap gap-4 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
              <Link to="/products" className="group btn-primary !px-8 !py-4 text-base shadow-lg shadow-bafco-red/20 hover:shadow-xl hover:shadow-bafco-red/30 transition-all">
                {t('home.hero.cta')}
                <svg className={`h-5 w-5 transition-transform group-hover:translate-x-1 ${locale === 'ar' ? 'mr-2 rotate-180' : 'ml-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link to="/contact" className="group btn-gold !px-8 !py-4 text-base">
                {t('home.hero.cta2')}
              </Link>
            </div>

            <div className={`mt-12 flex flex-wrap items-center gap-8 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
              {badges.map((badge, i) => (
                <div
                  key={badge.label}
                  className="text-center transition-all duration-500"
                  style={{ animationDelay: `${i * 150}ms`, opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(10px)' }}
                >
                  <div className="mb-1 flex items-center gap-2">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-bafco-gold" />
                    <p className="text-sm font-bold text-white tracking-wide">{badge.label}</p>
                  </div>
                  <p className="text-xs text-white/50">{locale === 'ar' ? badge.subAr : badge.subEn}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`hidden lg:block transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${locale === 'ar' ? 'lg:order-1' : ''}`}>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.07] p-8 shadow-2xl backdrop-blur-sm hover:bg-white/[0.09] transition-all duration-500">
              <div className="rounded-xl bg-white p-6 text-bafco-navy shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex h-2 w-2 rounded-full bg-bafco-red" />
                  <span className="flex h-2 w-2 rounded-full bg-bafco-gold" />
                  <span className="flex h-2 w-2 rounded-full bg-bafco-green" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-wider text-bafco-red">
                  {locale === 'ar' ? 'نظام جودة تشغيلي' : 'Operational Quality System'}
                </p>
                <p className="mt-3 text-3xl font-black">BAFCO</p>
                <p className="mt-2 text-sm text-gray-600">
                  {locale === 'ar'
                    ? 'منشأة غذائية تركز على الثبات، التتبع، وكفاءة الإنتاج.'
                    : 'A food plant focused on consistency, traceability, and efficient production.'}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {capabilityCards.map((item, i) => (
                  <div
                    key={item.value}
                    className="group rounded-xl border border-white/10 bg-white/[0.08] p-4 transition-all duration-300 hover:bg-white/[0.14] hover:border-white/20"
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <svg className="mb-2 h-5 w-5 text-bafco-gold/70 group-hover:text-bafco-gold transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                    </svg>
                    <p className="text-2xl font-bold text-bafco-gold">{item.value}</p>
                    <p className="mt-1 text-xs text-white/55">
                      {locale === 'ar' ? item.labelAr : item.labelEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
