interface Props {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-5 w-5 border-2', md: 'h-8 w-8 border-3', lg: 'h-12 w-12 border-4' };

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      className={`animate-spin rounded-full border-bafco-red border-t-transparent ${sizes[size]} ${className}`}
    />
  );
}
