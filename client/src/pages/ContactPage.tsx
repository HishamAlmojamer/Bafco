import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { contact as contactApi } from '../services/api';
import type { InquiryType } from '../types';

const inquiryTypes: { value: InquiryType; labelKey: string }[] = [
  { value: 'GENERAL', labelKey: 'General Inquiry' },
  { value: 'DISTRIBUTOR', labelKey: 'Distributor Inquiry' },
  { value: 'SUPPLIER', labelKey: 'Supplier Inquiry' },
  { value: 'PARTNERSHIP', labelKey: 'Partnership Proposal' },
  { value: 'COMPLAINT', labelKey: 'Complaint' },
];

function ContactForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ type: 'GENERAL', fullName: '', email: '', phone: '', company: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await contactApi.sendInquiry(form as Parameters<typeof contactApi.sendInquiry>[0]);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">{t('contact.form.success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.form.name')} *</label>
          <input required className="input-field mt-1" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.form.email')} *</label>
          <input required type="email" className="input-field mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.form.phone')}</label>
          <input type="tel" className="input-field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.form.company')}</label>
          <input className="input-field mt-1" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('contact.form.subject')} *</label>
        <input required className="input-field mt-1" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('contact.form.message')} *</label>
        <textarea required rows={5} className="input-field mt-1 resize-y" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting ? t('common.loading') : t('contact.form.submit')}
      </button>
    </form>
  );
}

function B2BForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', type: 'DISTRIBUTOR', message: '' });
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('attachment', file);
      await contactApi.sendB2B(fd);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-2xl bg-green-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-900">{t('contact.form.success')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.b2b.companyName')} *</label>
          <input required className="input-field mt-1" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.b2b.contactName')} *</label>
          <input required className="input-field mt-1" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.form.email')} *</label>
          <input required type="email" className="input-field mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.form.phone')} *</label>
          <input required type="tel" className="input-field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.b2b.type')} *</label>
          <select className="input-field mt-1" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            {inquiryTypes.filter((t) => t.value !== 'COMPLAINT').map((it) => (
              <option key={it.value} value={it.value}>{it.labelKey}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('contact.b2b.attachment')}</label>
          <input type="file" className="input-field mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bafco-red/10 file:text-bafco-red" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">{t('contact.form.message')} *</label>
        <textarea required rows={5} className="input-field mt-1 resize-y" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
        {submitting ? t('common.loading') : t('contact.form.submit')}
      </button>
    </form>
  );
}

export default function ContactPage() {
  const { t, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<'general' | 'b2b'>('general');

  return (
    <div className="py-16">
      <div className="container-bafco">
        <div className="text-center mb-12">
          <h1 className="section-title">{t('contact.title')}</h1>
          <p className="section-subtitle max-w-2xl mx-auto">{t('contact.subtitle')}</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-3">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{t('contact.info.title')}</h3>
              <div className="space-y-4 text-sm text-gray-600">
                <div className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-bafco-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Address</p>
                    <p>Egypt - Cairo - 6 October</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-bafco-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p dir="ltr">+966 12 600 0000</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="mt-1 h-5 w-5 shrink-0 text-bafco-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
<a href="mailto:info@bafco.com" className="text-bafco-red hover:underline">info@bafco.com</a>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Working Hours</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Sunday - Thursday</span>
                  <span className="font-medium">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday - Saturday</span>
                  <span className="font-medium text-gray-400">Closed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Forms */}
          <div className="lg:col-span-2">
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1 mb-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('contact.form.title')}
              </button>
              <button
                onClick={() => setActiveTab('b2b')}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                  activeTab === 'b2b' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('contact.b2b.title')}
              </button>
            </div>

            <div className="card p-6 sm:p-8">
              {activeTab === 'general' ? <ContactForm /> : <B2BForm />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
