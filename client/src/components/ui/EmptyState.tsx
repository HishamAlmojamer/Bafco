import { Link } from 'react-router-dom';

interface Props {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; to: string; onClick?: () => void };
}

const defaultIcon = (
  <svg className="h-14 w-14 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

export default function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-400 mb-6 max-w-xs">{description}</p>}
      {action && (
        <Link
          to={action.to}
          onClick={action.onClick}
          className="btn-primary !px-8 !py-3 text-sm"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
