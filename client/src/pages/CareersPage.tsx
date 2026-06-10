import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useApi } from '../hooks/useApi';
import { careers as careersApi } from '../services/api';
import type { Job } from '../types';

function JobCard({ job, onApply }: { job: Job; onApply: () => void }) {
  const { locale } = useTranslation();
  return (
    <div className="card p-6 card-hover">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            {locale === 'ar' ? job.titleAr : job.titleEn}
          </h3>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              {locale === 'ar' ? job.departmentAr : job.departmentEn}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locale === 'ar' ? job.locationAr : job.locationEn}
            </span>
            <span className="flex items-center gap-1">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {locale === 'ar' ? job.typeAr : job.typeEn}
            </span>
          </div>
        </div>
        <button onClick={onApply} className="btn-primary shrink-0">
          Apply Now
        </button>
      </div>
      {(locale === 'ar' ? job.descriptionAr : job.descriptionEn) && (
        <p className="mt-4 text-sm text-gray-600 line-clamp-2">
          {locale === 'ar' ? job.descriptionAr : job.descriptionEn}
        </p>
      )}
      {job.salaryMin && (
        <p className="mt-3 text-sm font-medium text-bafco-red">
          SAR {job.salaryMin.toLocaleString()} {job.salaryMax ? `- ${job.salaryMax.toLocaleString()}` : ''}
        </p>
      )}
    </div>
  );
}

function ApplicationModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const { t, locale } = useTranslation();
  const [form, setForm] = useState({
    fullNameAr: '',
    fullNameEn: '',
    email: '',
    phone: '',
    coverLetter: '',
    portfolioUrl: '',
    linkedInUrl: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('jobId', String(job.id));
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (cvFile) fd.append('cv', cvFile);
      await careersApi.apply(fd);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">{t('careers.success')}</h3>
          <button onClick={onClose} className="btn-primary mt-6">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 my-8" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {locale === 'ar' ? job.titleAr : job.titleEn}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('careers.fullName')} (AR) *</label>
              <input required className="input-field mt-1" value={form.fullNameAr} onChange={(e) => setForm({ ...form, fullNameAr: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('careers.fullName')} (EN)</label>
              <input className="input-field mt-1" value={form.fullNameEn} onChange={(e) => setForm({ ...form, fullNameEn: e.target.value })} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('careers.email')} *</label>
              <input required type="email" className="input-field mt-1" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('careers.phone')} *</label>
              <input required type="tel" className="input-field mt-1" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('careers.coverLetter')}</label>
            <textarea rows={4} className="input-field mt-1" value={form.coverLetter} onChange={(e) => setForm({ ...form, coverLetter: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('careers.uploadCV')} * (PDF/DOC)</label>
            <input
              required
              type="file"
              accept=".pdf,.doc,.docx"
              className="input-field mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-bafco-red/10 file:text-bafco-red hover:file:bg-bafco-red/20"
              onChange={(e) => setCvFile(e.target.files?.[0] || null)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('careers.portfolio')}</label>
              <input type="url" className="input-field mt-1" value={form.portfolioUrl} onChange={(e) => setForm({ ...form, portfolioUrl: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('careers.linkedin')}</label>
              <input type="url" className="input-field mt-1" value={form.linkedInUrl} onChange={(e) => setForm({ ...form, linkedInUrl: e.target.value })} />
            </div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? t('common.loading') : t('careers.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CareersPage() {
  const { t, locale } = useTranslation();
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => careersApi.listJobs({ department: departmentFilter || undefined, take: 50 }),
    [departmentFilter]
  );

  const jobs = data?.items || [];
  const departments = [...new Set(jobs.map((j) => locale === 'ar' ? j.departmentAr : j.departmentEn))];

  return (
    <div className="py-16">
      <div className="container-bafco">
        <div className="text-center mb-12">
          <h1 className="section-title">{t('careers.title')}</h1>
          <p className="section-subtitle max-w-2xl mx-auto">{t('careers.description')}</p>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <button
            onClick={() => setDepartmentFilter('')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${!departmentFilter ? 'bg-bafco-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t('products.all')}
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${departmentFilter === dept ? 'bg-bafco-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {dept}
            </button>
          ))}
        </div>

        {error && (
          <div className="text-center py-10">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={refetch} className="btn-primary">{t('common.retry')}</button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-gray-500">{t('careers.noJobs')}</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={() => setSelectedJob(job)} />
            ))}
          </div>
        )}
      </div>

      {selectedJob && (
        <ApplicationModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}
    </div>
  );
}
