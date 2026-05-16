function CartItemSkeleton() {
  return (
    <div className="flex gap-4 rounded-2xl border border-gray-200 p-4 animate-pulse">
      <div className="h-24 w-20 flex-shrink-0 rounded-xl bg-gray-200" />
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-4 w-40 rounded bg-gray-200" />
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
          <div className="h-5 w-5 rounded bg-gray-200" />
        </div>
        <div className="flex items-center justify-between">
          <div className="h-5 w-14 rounded bg-gray-200" />
          <div className="h-9 w-28 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <div className="w-full rounded-2xl border border-gray-200 p-6 lg:w-96 lg:flex-shrink-0 h-fit animate-pulse">
      <div className="h-6 w-36 rounded bg-gray-200" />
      <div className="mt-5 space-y-3">
        <div className="flex justify-between">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-14 rounded bg-gray-200" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-20 rounded bg-gray-200" />
          <div className="h-4 w-12 rounded bg-gray-200" />
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <div className="h-5 w-12 rounded bg-gray-200" />
          <div className="h-5 w-16 rounded bg-gray-200" />
        </div>
      </div>
      <div className="mt-5 h-11 w-full rounded-full bg-gray-200" />
      <div className="mt-5 h-12 w-full rounded-full bg-gray-200" />
    </div>
  );
}

export default function CartSkeleton() {
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <div className="flex-1 space-y-4">
        <CartItemSkeleton />
        <CartItemSkeleton />
        <CartItemSkeleton />
      </div>
      <OrderSummarySkeleton />
    </div>
  );
}
