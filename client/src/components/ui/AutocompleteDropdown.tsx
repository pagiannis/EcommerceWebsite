import type { AutocompleteItem } from "../../services/productsService";

interface AutocompleteDropdownProps {
  items: AutocompleteItem[];
  onSelect: (id: number) => void;
}

export default function AutocompleteDropdown({ items, onSelect }: AutocompleteDropdownProps) {
  if (items.length === 0) return null;
  return (
    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-xl border border-gray-100 bg-white shadow-lg overflow-hidden">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onMouseDown={() => onSelect(item.id)}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-brand-gray transition-colors"
        >
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-10 w-10 object-cover rounded-md flex-shrink-0 bg-brand-gray"
          />
          <span className="text-sm font-medium text-brand-black line-clamp-1">{item.name}</span>
        </button>
      ))}
    </div>
  );
}
