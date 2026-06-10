import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { products as productsApi, categories as categoriesApi } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import type { Product, Category } from '../types';

export default function ProductsPage() {
  const { t, locale } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'newest'>('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('q') || '';

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.q = searchQuery;
      params.take = 50;

      const [prodRes, catRes] = await Promise.all([
        productsApi.list(params),
        categoriesApi.list(),
      ]);

      setAllProducts(prodRes.items);
      setCategories(catRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategoryChange = (slug: string) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  const handleSearchChange = (q: string) => {
    const params = new URLSearchParams(searchParams);
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const toggleSort = (field: 'name' | 'price' | 'newest') => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const sortedProducts = [...allProducts].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    if (sortBy === 'name') {
      const aName = (locale === 'ar' ? a.nameAr : a.nameEn) || '';
      const bName = (locale === 'ar' ? b.nameAr : b.nameEn) || '';
      return aName.localeCompare(bName) * dir;
    }
    if (sortBy === 'price') return (a.price - b.price) * dir;
    return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * dir;
  });

  return (
    <div className="py-16">
      <div className="container-bafco">
        <div className="text-center mb-12">
          <h1 className="section-title">{t('products.title')}</h1>
          <p className="section-subtitle max-w-2xl mx-auto">
            {locale === 'ar'
              ? 'كتالوج منتجات بافكو مع بيانات غذائية واضحة وتصنيفات قابلة للتصفح.'
              : 'Explore BAFCO products with clear nutrition data and browsable categories.'}
          </p>
        </div>

        <ProductFilters
          categories={categories}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          onCategoryChange={handleCategoryChange}
          onSearchChange={handleSearchChange}
        />

        {!loading && !error && sortedProducts.length > 0 && (
          <div className="flex items-center justify-between mt-6 mb-4">
            <p className="text-sm text-gray-500">
              {sortedProducts.length} {locale === 'ar' ? 'منتج' : 'products'}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">{locale === 'ar' ? 'ترتيب:' : 'Sort:'}</span>
              {[
                { key: 'name', label: locale === 'ar' ? 'الاسم' : 'Name' },
                { key: 'price', label: locale === 'ar' ? 'السعر' : 'Price' },
                { key: 'newest', label: locale === 'ar' ? 'الأحدث' : 'Newest' },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => toggleSort(opt.key as 'name' | 'price' | 'newest')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    sortBy === opt.key
                      ? 'bg-bafco-red text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                  {sortBy === opt.key && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          {error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button onClick={fetchProducts} className="btn-primary">
                {t('common.retry')}
              </button>
            </div>
          ) : (
            <ProductGrid products={sortedProducts} loading={loading} />
          )}
        </div>
      </div>
    </div>
  );
}
