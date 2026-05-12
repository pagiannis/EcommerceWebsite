export default function AccountSkeleton() {
  return (
    <div className="animate-pulse divide-y divide-gray-100">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start">
          <div className="h-4 w-28 rounded bg-gray-200 sm:w-1/2" />
          <div className="h-10 rounded-xl bg-gray-100 sm:w-1/2" />
        </div>
      ))}
      <div className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center">
        <div className="h-4 w-28 rounded bg-gray-200 sm:w-1/2" />
        <div className="h-4 w-36 rounded bg-gray-100 sm:w-1/2" />
      </div>
    </div>
  );
}
