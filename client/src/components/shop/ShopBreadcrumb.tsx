import Breadcrumb from '../ui/Breadcrumb';

interface ShopBreadcrumbProps {
  category: string;
}

export default function ShopBreadcrumb({ category }: ShopBreadcrumbProps) {
  return (
    <Breadcrumb
      items={[
        { label: 'Home', to: '/' },
        { label: category === 'all' ? 'Shop' : category },
      ]}
    />
  );
}
