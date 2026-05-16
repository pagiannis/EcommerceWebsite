export default function OrdersSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-100" />
            </div>
            <div className="h-6 w-20 rounded-full bg-gray-100" />
          </div>
          <div className="mt-4 flex flex-col divide-y divide-gray-100">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center gap-4 py-3">
                <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-100" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-4 w-40 rounded bg-gray-200" />
                  <div className="h-3 w-28 rounded bg-gray-100" />
                </div>
                <div className="h-4 w-14 rounded bg-gray-100" />
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="h-4 w-24 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
