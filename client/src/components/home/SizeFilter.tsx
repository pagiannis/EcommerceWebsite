import type { Size } from '../../types/size';

interface SizeFilterProps {
  selected: Size[];
  onChange: (sizes: Size[]) => void;
}

const ALL_SIZES: Size[] = [
  'XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large', '3X-Large', '4X-Large',
];

export default function SizeFilter({ selected, onChange }: SizeFilterProps) {
  function toggle(size: Size) {
    onChange(
      selected.includes(size) ? selected.filter(s => s !== size) : [...selected, size]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_SIZES.map(size => (
        <button
          key={size}
          type="button"
          onClick={() => toggle(size)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            selected.includes(size)
              ? 'bg-brand-black text-white'
              : 'bg-brand-gray text-gray-700 hover:bg-gray-200'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
}
