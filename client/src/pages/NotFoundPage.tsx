import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

export default function NotFoundPage() {
  const { locale } = useTranslation();

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-16 px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-bafco-red/10 to-bafco-red/5">
          <span className="text-6xl font-black text-bafco-red">404</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {locale === 'ar' ? 'الصفحة غير موجودة' : 'Page Not Found'}
        </h1>
        <p className="mt-4 text-gray-500">
          {locale === 'ar'
            ? 'عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.'
            : 'Sorry, the page you are looking for does not exist or has been moved.'}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            {locale === 'ar' ? 'العودة إلى الرئيسية' : 'Go Home'}
          </Link>
          <Link to="/products" className="btn-secondary">
            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </Link>
        </div>
      </div>
    </div>
  );
}
