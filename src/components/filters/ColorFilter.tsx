interface ColorFilterProps {
  colors: string[];
  selected: string[];
  onChange: (colors: string[]) => void;
}

export default function ColorFilter({ colors, selected, onChange }: ColorFilterProps) {
  function toggle(color: string) {
    onChange(
      selected.includes(color) ? selected.filter(c => c !== color) : [...selected, color]
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {colors.map(color => (
        <button
          key={color}
          type="button"
          onClick={() => toggle(color)}
          style={{ backgroundColor: color }}
          className={`h-8 w-8 rounded-full border-2 transition ${
            selected.includes(color) ? 'border-brand-black scale-110' : 'border-transparent'
          }`}
          aria-label={color}
        />
      ))}
    </div>
  );
}
