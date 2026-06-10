import { useTranslation } from '../../hooks/useTranslation';

type InputEl = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

interface Props {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<InputEl>) => void;
  onBlur?: (e: React.FocusEvent<InputEl>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  as?: 'input' | 'textarea' | 'select';
  rows?: number;
  children?: React.ReactNode;
  dir?: string;
  disabled?: boolean;
}

export default function FormField({
  label, name, type = 'text', value, onChange, onBlur, error, required, placeholder,
  as: asTag = 'input', rows, children, dir, disabled,
}: Props) {
  const { isRtl } = useTranslation();
  const id = `field-${name}`;
  const errorId = `error-${name}`;
  const inputDir = dir || (isRtl ? 'rtl' : 'ltr');

  const baseClass = `input-field w-full ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      {asTag === 'textarea' ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          rows={rows || 3}
          required={required}
          disabled={disabled}
          dir={inputDir}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseClass}
        />
      ) : asTag === 'select' ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          dir={inputDir}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseClass}
        >
          {children}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          dir={inputDir}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={baseClass}
        />
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}
