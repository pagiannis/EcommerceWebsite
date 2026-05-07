export default function TestimonialCardSkeleton() {
  return (
    <div className="w-[calc(100%-32px)] flex-shrink-0 animate-pulse rounded-2xl border border-gray-200 p-6 lg:w-[360px]">
      <div className="h-5 w-28 rounded-full bg-gray-200" />
      <div className="mt-3 h-4 w-24 rounded-full bg-gray-200" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded-full bg-gray-200" />
        <div className="h-3 w-full rounded-full bg-gray-200" />
        <div className="h-3 w-3/4 rounded-full bg-gray-200" />
      </div>
    </div>
  );
}
