import { Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../../types/cartItem";
import type { Size } from "../../types/size";
import QuantityStepper from "../ui/QuantityStepper";

interface CartItemProps {
  item: CartItemType;
  onRemove: (productId: string, color: string, size: Size) => void;
  onQuantityChange: (
    productId: string,
    color: string,
    size: Size,
    qty: number,
  ) => void;
}

export default function CartItem({
  item,
  onRemove,
  onQuantityChange,
}: CartItemProps) {
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
            onClick={() =>
              onRemove(item.product.id, item.selectedColor, item.selectedSize)
            }
            className="text-brand-red hover:opacity-70"
            aria-label="Remove item"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">${item.product.price}</span>
          <QuantityStepper
            value={item.quantity}
            onChange={(qty) =>
              onQuantityChange(
                item.product.id,
                item.selectedColor,
                item.selectedSize,
                qty,
              )
            }
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
