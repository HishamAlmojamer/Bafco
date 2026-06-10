import { useTranslation } from '../hooks/useTranslation';
import { useApi } from '../hooks/useApi';
import { investors as investorsApi } from '../services/api';

function StockWidget() {
  const { t, locale } = useTranslation();
  const data = [
    { labelAr: 'الحوكمة', labelEn: 'Governance', valueAr: 'موثقة', valueEn: 'Documented' },
    { labelAr: 'نظام الجودة', labelEn: 'Quality System', valueAr: 'متوافق مع ISO/HACCP', valueEn: 'ISO/HACCP aligned' },
    { labelAr: 'تركيز التوريد', labelEn: 'Supply Focus', valueAr: 'أعمال + تجزئة', valueEn: 'B2B + Retail' },
    { labelAr: 'التقارير', labelEn: 'Reporting', valueAr: 'تحديثات سنوية', valueEn: 'Annual updates' },
  ];

  return (
    <div className="card border border-gray-100 p-6">
      <h3 className="mb-4 text-base font-bold text-gray-900">{t('investors.stock')}</h3>
      <div className="divide-y divide-gray-100">
        {data.map((row) => (
          <div key={row.labelEn} className="flex items-center justify-between gap-4 py-2.5">
            <span className="text-sm text-gray-500">{locale === 'ar' ? row.labelAr : row.labelEn}</span>
            <span className="text-right text-sm font-semibold text-gray-900">
              {locale === 'ar' ? row.valueAr : row.valueEn}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocumentCard({
  doc,
  locale,
}: {
  doc: { titleAr: string; titleEn: string; type: string; fileUrl: string; year?: number | null; quarter?: number | null };
  locale: string;
}) {
  const typeLabels: Record<string, string> = {
    financial_report: locale === 'ar' ? 'تقرير مالي' : 'Financial Report',
    governance: locale === 'ar' ? 'حوكمة' : 'Governance',
    agm: locale === 'ar' ? 'جمعية عمومية' : 'AGM Document',
    presentation: locale === 'ar' ? 'عرض تقديمي' : 'Presentation',
  };

  return (
    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="card card-hover group flex items-start gap-4 border border-gray-100 p-5">
      <span className="mt-1 h-9 w-1.5 shrink-0 rounded-full bg-bafco-red" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-bafco-red">
          {locale === 'ar' ? doc.titleAr : doc.titleEn}
        </p>
        <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
          <span className="rounded bg-gray-100 px-2 py-0.5 font-medium">{typeLabels[doc.type] || doc.type}</span>
          {doc.year && <span>{doc.year}{doc.quarter ? ` Q${doc.quarter}` : ''}</span>}
        </div>
      </div>
      <svg className="h-5 w-5 shrink-0 text-gray-400 transition-colors group-hover:text-bafco-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </a>
  );
}

export default function InvestorsPage() {
  const { t, locale } = useTranslation();

  const { data: docsData, loading: docsLoading } = useApi(
    () => investorsApi.listDocuments(),
    []
  );

  const docs = docsData || [];
  const sections = [
    { title: t('investors.financial'), type: 'financial_report' },
    { title: t('investors.governance'), type: 'governance' },
    { title: t('investors.agm'), type: 'agm' },
    { title: t('investors.presentations'), type: 'presentation' },
  ];

  return (
    <div className="py-16">
      <div className="container-bafco">
        <div className="mb-12 text-center">
          <h1 className="section-title">{t('investors.title')}</h1>
          <p className="section-subtitle mx-auto max-w-2xl">
            {locale === 'ar'
              ? 'حوكمة واضحة ووثائق مؤسسية تساعد الشركاء على تقييم جاهزية بافكو.'
              : 'Clear governance and corporate documents help partners evaluate BAFCO readiness.'}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="space-y-10 lg:col-span-3">
            {sections.map((section) => {
              const items = docs.filter((doc) => doc.type === section.type);
              return (
                <div key={section.type}>
                  <h2 className="mb-4 text-xl font-bold text-gray-900">{section.title}</h2>
                  {docsLoading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="card animate-pulse p-5">
                          <div className="h-4 w-1/2 rounded bg-gray-200" />
                        </div>
                      ))}
                    </div>
                  ) : items.length > 0 ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {items.map((doc) => (
                        <DocumentCard key={doc.id} doc={doc} locale={locale} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-gray-400">
                      {locale === 'ar' ? 'لا توجد مستندات متاحة حاليا.' : 'No documents available yet.'}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <StockWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
