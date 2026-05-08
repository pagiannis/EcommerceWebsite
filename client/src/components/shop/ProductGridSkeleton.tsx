import ProductCardSkeleton from '../product/ProductCardSkeleton';

const SKELETON_COUNT = 9;

export default function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
