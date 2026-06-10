import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { cart as cartApi } from '../../services/api';
import type { Product } from '../../types';
import { useToast } from '../../contexts/ToastContext';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { t, locale } = useTranslation();
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const desc = locale === 'ar' ? product.shortDescAr || product.descriptionAr : product.shortDescEn || product.descriptionEn;
  const unit = product.sku ? `SKU: ${product.sku}` : '';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) return;
    setAdding(true);
    try {
      await cartApi.addItem(product.id);
      setAdded(true);
      window.dispatchEvent(new Event('cart-update'));
      showToast('success', locale === 'ar' ? 'تمت الإضافة' : 'Added to Cart', name);
      setTimeout(() => setAdded(false), 2000);
    } catch {
      showToast('error', locale === 'ar' ? 'فشلت الإضافة' : 'Failed to Add');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="card group flex min-h-[420px] flex-col overflow-hidden border border-gray-100">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="text-center p-8">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-bafco-red/10">
                <span className="text-3xl font-bold text-bafco-red">
                  {product.nameAr?.charAt(0) || product.nameEn?.charAt(0)}
                </span>
              </div>
            </div>
          )}
          {product.unitSize && (
            <span className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-gray-700 backdrop-blur-sm shadow-sm">
              {product.unitSize}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          {product.category && (
            <p className="text-xs font-medium text-bafco-red uppercase tracking-wider mb-1">
              {locale === 'ar' ? product.category.nameAr : product.category.nameEn}
            </p>
          )}
          <h3 className="text-base font-bold text-gray-900 group-hover:text-bafco-red transition-colors line-clamp-2">
            {name}
          </h3>
          {desc && (
            <p className="mt-1 text-sm text-gray-500 line-clamp-2 flex-1">{desc}</p>
          )}
          <div className="flex items-center justify-between pt-4">
            <span className="text-lg font-bold text-bafco-red">
              {product.price.toFixed(2)} {t('products.price')}
            </span>
            {unit && <span className="text-xs text-gray-400">{unit}</span>}
          </div>
        </div>
      </Link>

      {isLoggedIn && (
        <div className="px-5 pb-5">
          <button
            onClick={handleAddToCart}
            disabled={adding || added}
            className={`w-full rounded-lg py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-bafco-red text-white hover:bg-bafco-red/90 active:scale-[0.98]'
            } disabled:opacity-70`}
          >
            {adding ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : added ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {locale === 'ar' ? 'تمت الإضافة' : 'Added'}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {locale === 'ar' ? 'أضف إلى السلة' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
