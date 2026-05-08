import { FaCheck } from "react-icons/fa6";

interface ColorFilterProps {
  colors: string[];
  selected: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorFilter({
  colors,
  selected,
  onChange,
}: ColorFilterProps) {
  function toggle(color: string) {
    onChange(
      selected.includes(color)
        ? selected.filter((c) => c !== color)
        : [...selected, color],
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => toggle(color)}
          style={{ backgroundColor: color }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-black/20 transition"
          aria-label={color}
        >
          {selected.includes(color) && (
            <span className="text-sm font-bold leading-none text-white">
              <FaCheck />
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
