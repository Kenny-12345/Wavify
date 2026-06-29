/**
 * Skeleton.jsx — Loading skeleton component
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: 'rgba(255,255,255,0.06)' }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="w-44 flex-shrink-0 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
      <Skeleton className="w-full aspect-square mb-3" />
      <Skeleton className="h-3.5 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function TrackRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="w-6 h-4" />
      <Skeleton className="w-10 h-10 rounded" />
      <div className="flex-1">
        <Skeleton className="h-3.5 w-48 mb-1.5" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-3 w-12 hidden md:block" />
      <Skeleton className="h-3 w-8" />
    </div>
  );
}
