import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

export default function Footer() {
  const { t, locale } = useTranslation();

  return (
    <footer className="bg-bafco-navy text-white">
      <div className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(200,16,46,0.08),transparent_70%)]" />
        <div className="container-bafco relative py-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-bafco-red to-bafco-red-dark shadow-lg shadow-bafco-red/20">
                  <span className="text-lg font-bold">B</span>
                </div>
                <div>
                  <span className="text-xl font-bold">BAFCO</span>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-bafco-gold/70 font-medium">{t('home.hero.subtitle')}</p>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                BAFCO Food Plant — delivering quality nutrition since 1976.
              </p>
              <div className="mt-6 flex gap-3">
                {[
                  { name: 'facebook', path: 'M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z' },
                  { name: 'twitter', path: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' },
                  { name: 'linkedin', path: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z' },
                  { name: 'youtube', path: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
                ].map((social) => (
                  <a
                    key={social.name}
                    href="#"
                    className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-gray-400 transition-all duration-300 hover:bg-bafco-red hover:text-white hover:shadow-lg hover:shadow-bafco-red/20"
                    aria-label={social.name}
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bafco-gold mb-5 relative">
                <span className="relative z-10">{locale === 'ar' ? 'روابط سريعة' : 'Quick Links'}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-bafco-gold/40" />
              </h3>
              <ul className="space-y-3">
                {[
                  { to: '/products', label: t('nav.products') },
                  { to: '/careers', label: t('nav.careers') },
                  { to: '/investors', label: t('nav.investors') },
                  { to: '/contact', label: t('nav.contact') },
                ].map((link) => (
                  <li key={link.to}>
                    <Link to={link.to} className="group inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white">
                      <span className="h-1 w-1 rounded-full bg-bafco-gold/0 transition-all group-hover:bg-bafco-gold/60 group-hover:w-2" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bafco-gold mb-5 relative">
                <span className="relative z-10">{locale === 'ar' ? 'المنتجات' : 'Products'}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-bafco-gold/40" />
              </h3>
              <ul className="space-y-3">
                {[
                  { slug: 'dairy-products', labelAr: 'منتجات الألبان', labelEn: 'Dairy Products' },
                  { slug: 'sauces-paste', labelAr: 'الصلصات والمعجون', labelEn: 'Sauces & Paste' },
                  { slug: 'beverages-juices', labelAr: 'المشروبات والعصائر', labelEn: 'Beverages & Juices' },
                  { slug: 'ready-food', labelAr: 'الأغذية الجاهزة', labelEn: 'Ready Food' },
                ].map((item) => (
                  <li key={item.slug}>
                    <Link
                      to={`/products?category=${item.slug}`}
                      className="group inline-flex items-center gap-1.5 text-sm text-gray-400 capitalize transition-colors hover:text-white"
                    >
                      <span className="h-1 w-1 rounded-full bg-bafco-gold/0 transition-all group-hover:bg-bafco-gold/60 group-hover:w-2" />
                      {locale === 'ar' ? item.labelAr : item.labelEn}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-bafco-gold mb-5 relative">
                <span className="relative z-10">{locale === 'ar' ? 'اتصل بنا' : 'Contact'}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-8 rounded-full bg-bafco-gold/40" />
              </h3>
              <ul className="space-y-4 text-sm text-gray-400">
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 shrink-0">
                    <svg className="h-3.5 w-3.5 text-bafco-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{locale === 'ar' ? 'العنوان' : 'Address'}</p>
                    <p className="text-white font-medium">Egypt - Cairo - 6 October</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 shrink-0">
                    <svg className="h-3.5 w-3.5 text-bafco-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{locale === 'ar' ? 'الهاتف' : 'Phone'}</p>
                    <p className="text-white font-medium" dir="ltr">+966 12 600 0000</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 shrink-0">
                    <svg className="h-3.5 w-3.5 text-bafco-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                    <a href="mailto:info@bafco.com" className="text-white font-medium hover:text-bafco-gold transition-colors">info@bafco.com</a>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/5 bg-black/10">
        <div className="container-bafco py-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} {t('footer.rights')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-300">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-sm text-gray-500 transition-colors hover:text-gray-300">
                {t('footer.terms')}
              </a>
            </div>
          </div>
          <div className="mt-4 border-t border-white/5 pt-4 text-center">
            <p className="text-xs text-gray-500">
              {locale === 'ar'
                ? 'تم التطوير بواسطة المهندس هشام المجمر'
                : 'Developed by Eng. Hisham Al-Majmar'}{' '}
              |
              <a href="tel:773988932" className="hover:text-bafco-gold transition-colors mx-1" dir="ltr">773988932</a>
              |
              <a href="tel:779254189" className="hover:text-bafco-gold transition-colors mx-1" dir="ltr">779254189</a>
              |
              <a href="mailto:hshamalmjmr53@gmail.com" className="hover:text-bafco-gold transition-colors ml-1">hshamalmjmr53@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}