interface Props {
  className?: string;
  count?: number;
}

export default function Skeleton({ className = 'h-4 w-full', count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`animate-pulse rounded bg-gray-200 ${className}`} />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse border border-gray-100 rounded-2xl overflow-hidden">
      <div className="aspect-square bg-gray-100" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-16 rounded bg-gray-200" />
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}
