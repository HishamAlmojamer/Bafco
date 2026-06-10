import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { cart as cartApi } from '../../services/api';
import { getLocale, setLocale } from '../../i18n/config';
import CartDrawer from '../cart/CartDrawer';
import type { Locale } from '../../i18n/config';

const navLinks = [
  { href: '/', key: 'nav.home' },
  { href: '/products', key: 'nav.products' },
  { href: '/careers', key: 'nav.careers' },
  { href: '/investors', key: 'nav.investors' },
  { href: '/contact', key: 'nav.contact' },
];

export default function Header() {
  const { t, locale } = useTranslation();
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const currentLang = getLocale();

  const fetchCartCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const data = await cartApi.get();
      setCartCount(data.items.reduce((s, i) => s + i.quantity, 0));
    } catch {
      setCartCount(0);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchCartCount();
    const handle = () => fetchCartCount();
    window.addEventListener('cart-update', handle);
    return () => window.removeEventListener('cart-update', handle);
  }, [fetchCartCount]);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="container-bafco">
        <div className="flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-bafco-red">
              <span className="text-xl font-bold text-white">B</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-lg font-bold text-gray-900">BAFCO</p>
              <p className="text-xs text-gray-500">{t('home.hero.subtitle')}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'bg-bafco-red/10 text-bafco-red'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {isLoggedIn && (
              <button
                onClick={() => setCartOpen(true)}
                className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Cart"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {cartCount > 0 && (
                  <span className={`absolute -top-0.5 ${locale === 'ar' ? '-left-0.5' : '-right-0.5'} flex h-5 w-5 items-center justify-center rounded-full bg-bafco-red text-[10px] font-bold text-white shadow`}>
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {currentLang === 'ar' ? 'English' : 'العربية'}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-50">
                  <button
                    onClick={() => { setLocale('ar' as Locale); setLangOpen(false); }}
                    className={`block w-full px-4 py-2 text-right text-sm ${
                      currentLang === 'ar' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    onClick={() => { setLocale('en' as Locale); setLangOpen(false); }}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      currentLang === 'en' ? 'bg-gray-100 font-medium' : 'text-gray-700'
                    }`}
                  >
                    English
                  </button>
                </div>
              )}
            </div>

            {isLoggedIn ? (
              <Link to="/dashboard" className="btn-primary !px-4 !py-2 text-sm flex items-center gap-2">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t('nav.dashboard')}
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/register" className="rounded-lg border border-bafco-red/30 px-3 py-2 text-sm font-medium text-bafco-red transition-colors hover:bg-bafco-red/5">
                  {t('nav.register')}
                </Link>
                <Link to="/login" className="btn-primary !px-4 !py-2 text-sm">
                  {t('nav.login')}
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 pb-4 pt-2 animate-slide-down">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-3 text-sm font-medium ${
                  location.pathname === link.href
                    ? 'bg-bafco-red/10 text-bafco-red'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {t(link.key)}
              </Link>
            ))}
          </div>
        )}
      </div>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onUpdate={fetchCartCount} />
    </header>
  );
}
