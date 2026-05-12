export default function AccountSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="divide-y divide-gray-100 animate-pulse">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center"
        >
          <div className="h-4 w-24 rounded bg-gray-200 sm:w-1/2" />
          <div className="h-4 w-32 rounded bg-gray-100 sm:w-1/2" />
        </div>
      ))}
    </div>
  );
}
