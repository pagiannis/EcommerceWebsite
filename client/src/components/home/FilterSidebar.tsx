import type { FilterState } from "../../types/filterState";
import FilterContent from "./FilterContent";

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  allColors: string[];
  open: boolean;
  onClose: () => void;
}

export default function FilterSidebar({
  filters,
  onChange,
  allColors,
  open,
  onClose,
}: FilterSidebarProps) {
  return (
    <>
      {/* Mobile drawer */}
      <div
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl bg-white p-5 transition-transform duration-300 ${
            open ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <FilterContent
            key={JSON.stringify(filters)}
            filters={filters}
            onChange={onChange}
            allColors={allColors}
            onClose={onClose}
            showCloseButton
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0 self-start rounded-2xl border border-gray-200 p-5">
        <FilterContent
          key={JSON.stringify(filters)}
          filters={filters}
          onChange={onChange}
          allColors={allColors}
          onClose={onClose}
          showCloseButton={false}
        />
      </aside>
    </>
  );
}
