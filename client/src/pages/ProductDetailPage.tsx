import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../contexts/AuthContext';
import { useApi } from '../hooks/useApi';
import { products as productsApi, cart as cartApi } from '../services/api';
import NutritionTable from '../components/products/NutritionTable';

function AddToCartButton({ productId }: { productId: number }) {
  const { locale } = useTranslation();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleClick = async () => {
    setAdding(true);
    try {
      await cartApi.addItem(productId);
      setAdded(true);
      window.dispatchEvent(new Event('cart-update'));
      setTimeout(() => setAdded(false), 2000);
    } catch {
    } finally {
      setAdding(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={adding}
      className={`mt-6 w-full rounded-xl py-4 text-base font-bold flex items-center justify-center gap-3 transition-all ${
        added
          ? 'bg-green-500 text-white'
          : 'bg-bafco-red text-white hover:bg-bafco-red/90 active:scale-[0.98] shadow-lg shadow-bafco-red/20'
      }`}
    >
      {adding ? (
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : added ? (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {locale === 'ar' ? 'تمت الإضافة ✓' : 'Added to Cart ✓'}
        </>
      ) : (
        <>
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          {locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
        </>
      )}
    </button>
  );
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, locale } = useTranslation();
  const { isLoggedIn } = useAuth();

  const { data: product, loading, error } = useApi(
    () => productsApi.get(slug!),
    [slug]
  );

  if (loading) {
    return (
      <div className="py-20">
        <div className="container-bafco">
          <div className="grid gap-12 lg:grid-cols-2 animate-pulse">
            <div className="aspect-square rounded-3xl bg-gray-200" />
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="h-8 bg-gray-200 rounded w-1/4 mt-6" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="py-20 text-center">
        <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
        <Link to="/products" className="btn-primary">{t('common.back')}</Link>
      </div>
    );
  }

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const description = locale === 'ar' ? product.descriptionAr : product.descriptionEn;
  const allergen = locale === 'ar' ? product.allergenWarningAr : product.allergenWarningEn;
  const ingredients = locale === 'ar' ? product.ingredientsAr : product.ingredientsEn;
  const categoryName = product.category
    ? (locale === 'ar' ? product.category.nameAr : product.category.nameEn)
    : '';

  return (
    <div className="py-16">
      <div className="container-bafco">
        <nav className="mb-8 text-sm text-gray-500">
          <Link to="/" className="hover:text-bafco-red transition-colors">{t('nav.home')}</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-bafco-red transition-colors">{t('nav.products')}</Link>
          {categoryName && (
            <>
              <span className="mx-2">/</span>
              <span>{categoryName}</span>
            </>
          )}
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="text-center">
                <span className="text-8xl font-black text-gray-300">
                  {product.nameAr?.charAt(0) || product.nameEn?.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div>
            {categoryName && (
              <p className="text-sm font-semibold uppercase tracking-wider text-bafco-red mb-2">
                {categoryName}
              </p>
            )}
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{name}</h1>
            {description && (
              <p className="mt-4 text-lg text-gray-600 leading-relaxed">{description}</p>
            )}

            <div className="mt-8 flex flex-wrap gap-6 border-y border-gray-200 py-6">
              {product.sku && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">{t('products.sku')}</p>
                  <p className="text-sm font-semibold text-gray-900">{product.sku}</p>
                </div>
              )}
              {product.unitSize && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">{t('products.unitSize')}</p>
                  <p className="text-sm font-semibold text-gray-900">{product.unitSize}</p>
                </div>
              )}
              {product.barcode && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Barcode</p>
                  <p className="text-sm font-semibold text-gray-900">{product.barcode}</p>
                </div>
              )}
            </div>

            <p className="mt-6 text-3xl font-bold text-bafco-red">
              {product.price.toFixed(2)} {t('products.price')}
            </p>

            {isLoggedIn && (
              <AddToCartButton productId={product.id} />
            )}

            <div className="mt-8 space-y-6">
              <NutritionTable product={product} />

              {allergen && (
                <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                  <h3 className="text-sm font-bold text-yellow-800 mb-1">{t('products.allergens')}</h3>
                  <p className="text-sm text-yellow-700">{allergen}</p>
                </div>
              )}

              {ingredients && (
                <div className="rounded-xl border border-gray-200 bg-white px-5 py-4">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{t('products.ingredients')}</h3>
                  <p className="text-sm text-gray-600">{ingredients}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

