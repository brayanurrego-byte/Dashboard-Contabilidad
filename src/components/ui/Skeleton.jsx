export function Skeleton({ className = "", width, height }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width: width || "100%", height: height || "20px" }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="glass p-6 space-y-3">
      <Skeleton height="14px" width="60%" />
      <Skeleton height="32px" width="40%" />
      <Skeleton height="12px" width="80%" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <div className="glass p-6 space-y-3">
      <Skeleton height="16px" width="30%" />
      <div className="space-y-2 mt-4">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} height="40px" />
        ))}
      </div>
    </div>
  );
}
