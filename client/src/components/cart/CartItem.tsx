import { Trash2 } from "lucide-react";
import type { CartItem as CartItemType } from "../../types/cartItem";
import QuantityStepper from "../ui/QuantityStepper";
import { useRemoveFromCart, useUpdateCartQuantity } from "../../hooks/useCart";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { mutate: remove, isPending: removing } = useRemoveFromCart();
  const { mutate: updateQty, isPending: updating } = useUpdateCartQuantity();

  return (
    <div className="flex gap-4 rounded-2xl border border-gray-200 p-4">
      <div className="h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-brand-gray">
        {item.product.images[0] ? (
          <img
            src={item.product.images[0]}
            alt={item.product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full" />
        )}
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
              remove({
                productId: item.product.id,
                color: item.selectedColor,
                size: item.selectedSize,
              })
            }
            disabled={removing}
            className="text-brand-red hover:opacity-70 disabled:opacity-40"
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
              updateQty({
                productId: item.product.id,
                color: item.selectedColor,
                size: item.selectedSize,
                qty,
              })
            }
            disabled={updating}
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
