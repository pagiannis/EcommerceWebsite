import type { Gender } from '../../types/gender';
import type { ProductType } from '../../types/productType';
import type { DressStyle } from '../../types/dressStyle';
import Breadcrumb from '../ui/Breadcrumb';

const TYPE_LABELS: Record<ProductType, string> = {
  't-shirt': 'T-Shirts',
  jeans: 'Jeans',
  shirt: 'Shirts',
  polo: 'Polo',
  hoodie: 'Hoodies',
  shorts: 'Shorts',
  blazer: 'Blazers',
};

interface ShopBreadcrumbProps {
  gender: Gender | 'all';
  productType: ProductType | 'all';
  dressStyle: DressStyle | 'all';
}

export default function ShopBreadcrumb({ gender, productType, dressStyle }: ShopBreadcrumbProps) {
  const items: { label: string; to?: string }[] = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: gender !== 'all' || productType !== 'all' || dressStyle !== 'all' ? '/shop' : undefined },
  ];

  if (gender !== 'all') {
    items.push({
      label: gender.charAt(0).toUpperCase() + gender.slice(1),
      to: productType !== 'all' ? `/shop?gender=${gender}` : undefined,
    });
  }

  if (productType !== 'all') {
    items.push({ label: TYPE_LABELS[productType] });
  }

  if (dressStyle !== 'all' && gender === 'all' && productType === 'all') {
    // When only dress style is active, show it directly: Home > Shop > Casual
    items[1] = { label: 'Shop', to: '/shop' };
    items.push({ label: dressStyle.charAt(0).toUpperCase() + dressStyle.slice(1) });
  } else if (dressStyle !== 'all') {
    items.push({ label: dressStyle.charAt(0).toUpperCase() + dressStyle.slice(1) });
  }

  return <Breadcrumb items={items} />;
}
