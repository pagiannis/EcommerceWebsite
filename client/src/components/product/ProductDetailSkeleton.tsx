export default function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-10 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-8 flex items-center gap-2">
        {[80, 48, 72, 64, 96].map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            {i > 0 && <div className="h-3 w-3 rounded-full bg-gray-200" />}
            <div className="h-4 rounded bg-gray-200" style={{ width: w }} />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-10 lg:flex-row">
        {/* Image gallery */}
        <div className="flex flex-col-reverse gap-3 lg:w-1/2 lg:flex-row lg:gap-4">
          <div className="flex flex-row gap-3 lg:flex-col">
            {[0, 1, 2].map(i => (
              <div key={i} className="h-20 w-16 flex-shrink-0 rounded-xl bg-gray-200" />
            ))}
          </div>
          <div className="flex-1 rounded-2xl bg-gray-200" style={{ minHeight: 420 }} />
        </div>

        {/* Product info */}
        <div className="flex-1 space-y-0">
          {/* Name */}
          <div className="h-9 w-3/4 rounded bg-gray-200" />
          {/* Rating */}
          <div className="mt-3 flex items-center gap-2">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-4 w-10 rounded bg-gray-200" />
          </div>
          {/* Price */}
          <div className="mt-4 flex items-center gap-3">
            <div className="h-8 w-20 rounded bg-gray-200" />
            <div className="h-6 w-14 rounded bg-gray-200" />
          </div>
          {/* Description lines */}
          <div className="mt-4 space-y-2">
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-2/3 rounded bg-gray-200" />
          </div>

          <hr className="my-5 border-gray-200" />

          {/* Colors */}
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="mt-3 flex gap-2">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className="h-9 w-9 rounded-full bg-gray-200" />
            ))}
          </div>

          <hr className="my-5 border-gray-200" />

          {/* Sizes */}
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="mt-3 flex flex-wrap gap-2">
            {[64, 56, 72, 56, 80, 88, 80].map((w, i) => (
              <div key={i} className="h-9 rounded-full bg-gray-200" style={{ width: w }} />
            ))}
          </div>

          <hr className="my-5 border-gray-200" />

          {/* Add to cart row */}
          <div className="flex items-center gap-4">
            <div className="h-12 w-32 rounded-full bg-gray-200" />
            <div className="h-12 flex-1 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <div className="flex gap-8 border-b border-gray-200 pb-3">
          <div className="h-5 w-24 rounded bg-gray-200" />
          <div className="h-5 w-20 rounded bg-gray-200" />
        </div>
        <div className="mt-6 space-y-3">
          <div className="h-4 rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-2/3 rounded bg-gray-200" />
        </div>
      </div>

      {/* Related products */}
      <div className="mt-14">
        <div className="mb-6 h-7 w-48 rounded bg-gray-200" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] rounded-2xl bg-gray-200" />
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-4 w-1/2 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
