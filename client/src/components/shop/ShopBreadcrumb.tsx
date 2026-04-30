import type { Gender } from '../../types/gender';
import type { ProductType } from '../../types/productType';
import type { DressStyle } from '../../types/dressStyle';
import type { Brand } from '../../types/brand';
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

const BRAND_LABELS: Record<Brand, string> = {
  nike: 'Nike',
  levis: "Levi's",
  'tommy-hilfiger': 'Tommy Hilfiger',
  'ralph-lauren': 'Ralph Lauren',
  hm: 'H&M',
  zara: 'Zara',
  'calvin-klein': 'Calvin Klein',
};

interface ShopBreadcrumbProps {
  gender: Gender | 'all';
  productType: ProductType | 'all';
  dressStyle: DressStyle | 'all';
  brand: Brand | 'all';
}

export default function ShopBreadcrumb({ gender, productType, dressStyle, brand }: ShopBreadcrumbProps) {
  const onlyBrand = brand !== 'all' && gender === 'all' && productType === 'all' && dressStyle === 'all';
  const onlyStyle = dressStyle !== 'all' && gender === 'all' && productType === 'all' && brand === 'all';

  const items: { label: string; to?: string }[] = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: gender !== 'all' || productType !== 'all' || dressStyle !== 'all' || brand !== 'all' ? '/shop' : undefined },
  ];

  if (onlyBrand) {
    items.push({ label: BRAND_LABELS[brand] });
  } else if (onlyStyle) {
    items.push({ label: dressStyle.charAt(0).toUpperCase() + dressStyle.slice(1) });
  } else {
    if (gender !== 'all') {
      items.push({
        label: gender.charAt(0).toUpperCase() + gender.slice(1),
        to: productType !== 'all' || dressStyle !== 'all' || brand !== 'all' ? `/shop?gender=${gender}` : undefined,
      });
    }
    if (productType !== 'all') {
      items.push({ label: TYPE_LABELS[productType] });
    }
    if (dressStyle !== 'all') {
      items.push({ label: dressStyle.charAt(0).toUpperCase() + dressStyle.slice(1) });
    }
    if (brand !== 'all') {
      items.push({ label: BRAND_LABELS[brand] });
    }
  }

  return <Breadcrumb items={items} />;
}
