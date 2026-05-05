export default function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-64 w-full rounded-2xl bg-brand-gray" />
      <div className="mt-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
