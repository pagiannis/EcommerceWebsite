import type { CartItem as CartItemType } from '../../types/cartItem';
import type { Size } from '../../types/size';
import QuantityStepper from '../ui/QuantityStepper';

interface CartItemProps {
  item: CartItemType;
  onRemove: (productId: string, color: string, size: Size) => void;
  onQuantityChange: (productId: string, color: string, size: Size, qty: number) => void;
}

export default function CartItem({ item, onRemove, onQuantityChange }: CartItemProps) {
  return (
    <div className="flex gap-4 rounded-2xl border border-gray-200 p-4">
      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-gray">
        <img
          src={item.product.images[0]}
          alt={item.product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
            <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Color:
              <span
                className="inline-block h-3 w-3 rounded-full border border-gray-300"
                style={{ backgroundColor: item.selectedColor }}
              />
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRemove(item.product.id, item.selectedColor, item.selectedSize)}
            className="text-brand-red hover:opacity-70"
            aria-label="Remove item"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0 1 16.138 21H7.862a2 2 0 0 1-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">${item.product.price}</span>
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) =>
              onQuantityChange(item.product.id, item.selectedColor, item.selectedSize, qty)
            }
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
