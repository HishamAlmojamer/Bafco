import { useTranslation } from '../../hooks/useTranslation';
import type { Category } from '../../types';

interface Props {
  categories: Category[];
  selectedCategory: string;
  searchQuery: string;
  onCategoryChange: (slug: string) => void;
  onSearchChange: (q: string) => void;
}

export default function ProductFilters({
  categories,
  selectedCategory,
  searchQuery,
  onCategoryChange,
  onSearchChange,
}: Props) {
  const { t, locale } = useTranslation();

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange('')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
            !selectedCategory
              ? 'bg-bafco-red text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('products.all')}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => onCategoryChange(cat.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              selectedCategory === cat.slug
                ? 'bg-bafco-red text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {locale === 'ar' ? cat.nameAr : cat.nameEn}
          </button>
        ))}
      </div>

      <div className="relative w-full lg:w-80">
        <svg
          className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${locale === 'ar' ? 'right-3' : 'left-3'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('products.search')}
          className={`input-field py-2.5 ${locale === 'ar' ? 'pr-10' : 'pl-10'}`}
        />
      </div>
      </div>
    </div>
  );
}
