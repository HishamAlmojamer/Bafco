import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { cart as cartApi, orders as ordersApi } from '../services/api';
import type { Cart as CartType } from '../types';

export default function CheckoutPage() {
  const { t, locale } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartType | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    fetchCart();
  }, [navigate, isLoggedIn]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await ordersApi.create(JSON.stringify(form));
      setSuccess(true);
      window.dispatchEvent(new Event('cart-update'));
      showToast('success', locale === 'ar' ? 'تم تقديم الطلب' : 'Order Placed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed');
      showToast('error', locale === 'ar' ? 'فشل تقديم الطلب' : 'Order Failed', err instanceof Error ? err.message : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  const total = cart?.items.reduce((s, i) => s + i.product.price * i.quantity, 0) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-bafco-red border-t-transparent" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="py-20">
        <div className="container-bafco">
          <div className="mx-auto max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {locale === 'ar' ? 'تم تقديم الطلب بنجاح!' : 'Order Placed Successfully!'}
            </h1>
            <p className="text-gray-500 mb-8">
              {locale === 'ar'
                ? 'سيتم التواصل معك قريباً لتأكيد الطلب.'
                : 'We will contact you shortly to confirm your order.'}
            </p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate('/dashboard')} className="btn-primary !px-6 !py-3">
                {locale === 'ar' ? 'عرض الطلبات' : 'View Orders'}
              </button>
              <button onClick={() => navigate('/products')} className="btn-secondary !px-6 !py-3">
                {locale === 'ar' ? 'متابعة التسوق' : 'Continue Shopping'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="py-20">
        <div className="container-bafco text-center">
          <svg className="mx-auto h-20 w-20 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {locale === 'ar' ? 'السلة فارغة' : 'Cart is Empty'}
          </h2>
          <button onClick={() => navigate('/products')} className="btn-primary !px-6 !py-3 mt-4">
            {locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16">
      <div className="container-bafco">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            {locale === 'ar' ? 'إتمام الطلب' : 'Checkout'}
          </h1>

          <div className="grid gap-8 lg:grid-cols-5">
            {/* Order Summary */}
            <div className="lg:col-span-3 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h2>
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4 rounded-xl border p-4">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {item.product.imageUrl ? (
                      <img src={item.product.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xl font-bold text-gray-300">
                        {item.product.nameAr?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {locale === 'ar' ? item.product.nameAr : item.product.nameEn}
                    </h3>
                    <p className="text-sm text-gray-500">{item.product.unitSize}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-600">
                        {item.quantity} x SAR {item.product.price.toFixed(2)}
                      </span>
                      <span className="font-bold text-gray-900">
                        SAR {(item.product.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment / Address Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border bg-gray-50 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {locale === 'ar' ? 'معلومات التوصيل' : 'Delivery Information'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{locale === 'ar' ? 'الاسم الكامل' : 'Full Name'} *</label>
                      <input required name="fullName" className="input-field mt-1" value={form.fullName} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'} *</label>
                      <input required type="email" name="email" className="input-field mt-1" value={form.email} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{locale === 'ar' ? 'رقم الجوال' : 'Phone'} *</label>
                      <input required type="tel" name="phone" className="input-field mt-1" value={form.phone} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{locale === 'ar' ? 'المدينة' : 'City'} *</label>
                      <input required name="city" className="input-field mt-1" value={form.city} onChange={handleChange} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{locale === 'ar' ? 'العنوان' : 'Address'} *</label>
                    <input required name="address" className="input-field mt-1" value={form.address} onChange={handleChange} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                    </label>
                    <textarea rows={2} name="notes" className="input-field mt-1" placeholder={locale === 'ar' ? 'أضف ملاحظاتك هنا...' : 'Add your notes here...'} value={form.notes} onChange={handleChange} />
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>{locale === 'ar' ? 'المجموع' : 'Total'}</span>
                      <span className="text-bafco-red">SAR {total.toFixed(2)}</span>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full !py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {locale === 'ar' ? 'جاري التقديم...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {locale === 'ar' ? 'تأكيد الطلب' : 'Place Order'}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
