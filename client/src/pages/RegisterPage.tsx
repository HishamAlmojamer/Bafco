import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { FormField } from '../components/ui';

export default function RegisterPage() {
  const { t, locale } = useTranslation();
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = locale === 'ar' ? 'الاسم مطلوب' : 'Name is required';
    if (!form.email.trim()) errs.email = locale === 'ar' ? 'البريد الإلكتروني مطلوب' : 'Email is required';
    if (form.password.length < 6) errs.password = locale === 'ar' ? 'كلمة المرور 6 أحرف على الأقل' : 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = locale === 'ar' ? 'كلمة المرور غير متطابقة' : 'Passwords do not match';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register(form.email, form.password, form.name, form.phone);
      showToast('success', locale === 'ar' ? 'تم إنشاء الحساب' : 'Account created successfully');
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-16 px-4">
      <div className="w-full max-w-md">
        <div className="card p-8 sm:p-10">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-bafco-red to-bafco-red-dark shadow-lg shadow-bafco-red/20">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('register.title')}</h1>
            <p className="mt-2 text-sm text-gray-500">{t('register.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              label={t('register.name')}
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={validate}
              error={fieldErrors.name}
              required
              placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
            />

            <FormField
              label={t('register.email')}
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={validate}
              error={fieldErrors.email}
              required
              placeholder="email@example.com"
            />

            <FormField
              label={t('register.phone')}
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              placeholder={locale === 'ar' ? '05xxxxxxxx' : '+966 5xxxxxxxx'}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label={t('register.password')}
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                onBlur={validate}
                error={fieldErrors.password}
                required
                placeholder="••••••••"
              />
              <FormField
                label={t('register.confirmPassword')}
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={validate}
                error={fieldErrors.confirmPassword}
                required
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {t('register.loading')}
                </span>
              ) : t('register.submit')}
            </button>

            <p className="text-center text-xs text-gray-400">
              {t('register.terms')}{' '}
              <a href="#" className="text-bafco-red hover:underline">{t('register.termsLink')}</a>{' '}
              {t('register.and')}{' '}
              <a href="#" className="text-bafco-red hover:underline">{t('register.privacyLink')}</a>
            </p>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {t('register.haveAccount')}{' '}
              <Link to="/login" className="font-semibold text-bafco-red hover:text-bafco-red-dark transition-colors">
                {t('register.loginNow')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
