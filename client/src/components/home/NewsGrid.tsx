import { useTranslation } from '../../hooks/useTranslation';
import { useApi } from '../../hooks/useApi';
import { investors } from '../../services/api';

export default function NewsGrid() {
  const { t, locale } = useTranslation();
  const { data, loading } = useApi(
    () => investors.listNews({ take: 3 }),
    []
  );

  const articles = data?.items || [];

  return (
    <section className="bg-white py-24">
      <div className="container-bafco">
        <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="section-title">{t('home.news.title')}</h2>
            <p className="section-subtitle max-w-2xl">
              {locale === 'ar'
                ? 'تحديثات تشغيلية ومؤسسية من مصنع بافكو.'
                : 'Operational and corporate updates from BAFCO.'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="mb-4 h-2 w-16 rounded bg-gray-200" />
                <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="card card-hover border border-gray-100 p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-bafco-red/10 px-3 py-1 text-xs font-medium capitalize text-bafco-red">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(article.publishedAt).toLocaleDateString(
                      locale === 'ar' ? 'ar-SA' : 'en-US',
                      { year: 'numeric', month: 'short', day: 'numeric' }
                    )}
                  </span>
                </div>
                <h3 className="line-clamp-2 text-lg font-bold text-gray-900 transition-colors group-hover:text-bafco-red">
                  {locale === 'ar' ? article.titleAr : article.titleEn}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">
                  {locale === 'ar' ? article.excerptAr : article.excerptEn}
                </p>
              </article>
            ))}
          </div>
        )}

        {!loading && articles.length === 0 && (
          <p className="text-center text-gray-500">
            {locale === 'ar' ? 'لا توجد أخبار منشورة بعد.' : 'No news articles yet.'}
          </p>
        )}
      </div>
    </section>
  );
}
