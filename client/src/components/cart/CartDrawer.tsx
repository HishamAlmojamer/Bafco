import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { cart as cartApi } from '../../services/api';
import type { Cart as CartType } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function CartDrawer({ open, onClose, onUpdate }: Props) {
  const { t, locale } = useTranslation();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setAnimating(true);
      fetchCart();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      const timer = setTimeout(() => setAnimating(false), 300);
      return () => clearTimeout(timer);
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      const data = await cartApi.get();
      setCart(data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantity = async (itemId: number, qty: number) => {
    if (qty < 1) return;
    try {
      await cartApi.updateItem(itemId, qty);
    } catch { return; }
    fetchCart();
    onUpdate();
    window.dispatchEvent(new Event('cart-update'));
  };

  const handleRemove = async (itemId: number) => {
    try {
      await cartApi.removeItem(itemId);
    } catch { return; }
    fetchCart();
    onUpdate();
    window.dispatchEvent(new Event('cart-update'));
  };

  const total = cart?.items.reduce((s, i) => s + i.product.price * i.quantity, 0) ?? 0;
  const count = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        role="presentation"
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`fixed top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl transition-all duration-300 ease-in-out ${
          locale === 'ar' ? 'left-0' : 'right-0'
        } ${
          open ? 'translate-x-0' : locale === 'ar' ? '-translate-x-full' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-bafco-red text-[10px] font-bold text-white shadow-md">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>
              <div>
                <h2 id="cart-drawer-title" className="text-lg font-bold text-gray-900">
                  {t('cart.title') || 'Shopping Cart'}
                </h2>
                <p className="text-xs text-gray-400">
                  {count > 0
                    ? `${count} ${locale === 'ar' ? 'منتج' : 'items'}`
                    : locale === 'ar' ? 'سلة التسوق' : 'Cart'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-bafco-red border-t-transparent" />
                <p className="text-sm text-gray-400">
                  {locale === 'ar' ? 'جاري تحميل السلة...' : 'Loading cart...'}
                </p>
              </div>
            ) : !cart || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100">
                  <svg className="h-14 w-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? 'سلة التسوق فارغة' : 'Your Cart is Empty'}
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs">
                  {locale === 'ar'
                    ? 'تصفح منتجاتنا وأضف ما يعجبك إلى السلة'
                    : 'Browse our products and add your favorites to the cart'}
                </p>
                <Link
                  to="/products"
                  onClick={onClose}
                  className="btn-primary !px-8 !py-3 text-sm"
                >
                  {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.items.map((item) => {
                  const itemTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.id}
                      className="group relative flex gap-4 rounded-2xl border border-gray-100 bg-white p-4 transition-all hover:border-gray-200 hover:shadow-md"
                    >
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm">
                        {item.product.imageUrl ? (
                          <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-3xl font-bold text-gray-300">
                            {item.product.nameAr?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col justify-between min-w-0">
                        <div className="pr-6">
                          <h3 className="text-sm font-bold text-gray-900 truncate">
                            {locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                          </h3>
                          {item.product.unitSize && (
                            <p className="text-xs text-gray-400 mt-0.5">{item.product.unitSize}</p>
                          )}
                          <p className="text-sm font-bold text-bafco-red mt-1.5">
                            SAR {item.product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
                            <button
                              onClick={() => handleQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-gray-900 tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantity(item.id, item.quantity + 1)}
                              className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-sm font-bold text-gray-900 tabular-nums">
                            SAR {itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-lg text-gray-300 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className="border-t border-gray-100 bg-white px-6 py-5 space-y-4 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{locale === 'ar' ? 'مجموع المنتجات' : 'Subtotal'}</span>
                  <span className="font-semibold text-gray-900">SAR {total.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{locale === 'ar' ? 'التوصيل' : 'Delivery'}</span>
                  <span className="font-semibold text-green-600">
                    {locale === 'ar' ? 'مجاني' : 'Free'}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">{locale === 'ar' ? 'المجموع الكلي' : 'Total'}</span>
                  <span className="text-xl font-bold text-bafco-red">SAR {total.toFixed(2)}</span>
                </div>
              </div>
              <Link
                to="/checkout"
                onClick={onClose}
                className="btn-primary w-full flex items-center justify-center gap-2 !py-3.5 text-sm rounded-xl shadow-lg shadow-bafco-red/20 hover:shadow-xl hover:shadow-bafco-red/30 transition-all"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {locale === 'ar' ? 'إتمام الطلب' : 'Proceed to Checkout'}
              </Link>
              <button
                onClick={onClose}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                {locale === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
