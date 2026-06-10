import { useTranslation } from '../../hooks/useTranslation';
import type { Product } from '../../types';

interface Props {
  product: Product;
}

interface NutritionRow {
  labelKey: string;
  value?: string | number | null;
}

export default function NutritionTable({ product }: Props) {
  const { t } = useTranslation();

  const rows: NutritionRow[] = [
    { labelKey: 'products.servingSize', value: product.servingSize },
    { labelKey: 'products.calories', value: product.calories },
    { labelKey: 'products.totalFat', value: product.totalFat },
    { labelKey: 'products.saturatedFat', value: product.saturatedFat },
    { labelKey: 'products.transFat', value: product.transFat },
    { labelKey: 'products.cholesterol', value: product.cholesterol },
    { labelKey: 'products.sodium', value: product.sodium },
    { labelKey: 'products.totalCarbs', value: product.totalCarbs },
    { labelKey: 'products.dietaryFiber', value: product.dietaryFiber },
    { labelKey: 'products.sugars', value: product.sugars },
    { labelKey: 'products.protein', value: product.protein },
    { labelKey: 'products.calcium', value: product.calcium },
    { labelKey: 'products.iron', value: product.iron },
  ];

  const hasNutrition = rows.some((r) => r.value !== null && r.value !== undefined && r.value !== '');

  if (!hasNutrition) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
        <h3 className="text-sm font-bold text-gray-900">{t('products.nutrition')}</h3>
        <p className="text-xs text-gray-500">{t('products.per100g')}</p>
      </div>
      <div className="divide-y divide-gray-100">
        {rows.map((row) => {
          if (!row.value && row.value !== 0) return null;
          return (
            <div key={row.labelKey} className="flex items-center justify-between px-5 py-2.5">
              <span className="text-sm text-gray-600">{t(row.labelKey)}</span>
              <span className="text-sm font-medium text-gray-900">{row.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
