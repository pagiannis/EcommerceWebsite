function FieldSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="h-4 w-24 rounded bg-gray-200" />
      <div className="h-10 rounded-xl bg-gray-100" />
    </div>
  );
}

export default function ShippingStepSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-2xl border border-gray-200 p-8">
        <div className="mb-6 h-6 w-40 rounded bg-gray-200" />

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldSkeleton />
            <FieldSkeleton />
          </div>

          <FieldSkeleton />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <FieldSkeleton />
            <FieldSkeleton />
            <FieldSkeleton />
          </div>

          <FieldSkeleton />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="h-11 w-48 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
