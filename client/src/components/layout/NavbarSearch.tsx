import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { fetchAutocomplete, type AutocompleteItem } from "../../services/productsService";
import AutocompleteDropdown from "../ui/AutocompleteDropdown";

interface NavbarSearchProps {
  searchOpen: boolean;
  onClose: () => void;
}

function AutocompleteResults({ query, onSelect }: { query: string; onSelect: (id: number) => void }) {
  const { data: suggestions = [], isFetching } = useQuery<AutocompleteItem[]>({
    queryKey: ["autocomplete", query],
    queryFn: () => fetchAutocomplete(query),
    staleTime: 1000 * 30,
  });

  return (
    <AutocompleteDropdown
      items={suggestions}
      onSelect={onSelect}
      noResults={!isFetching && suggestions.length === 0}
    />
  );
}

export default function NavbarSearch({ searchOpen, onClose }: NavbarSearchProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue), 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => mobileInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const activeQuery =
    showDropdown && debouncedQuery.trim().length >= 2 && inputValue === debouncedQuery
      ? debouncedQuery
      : null;

  function handleInputChange(value: string) {
    setInputValue(value);
    setShowDropdown(true);
  }

  function handleClose() {
    onClose();
    setShowDropdown(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    navigate(`/shop?query=${encodeURIComponent(q)}`);
    setInputValue("");
    setShowDropdown(false);
    handleClose();
  }

  function handleSuggestionSelect(id: number) {
    navigate(`/product/${id}`);
    setInputValue("");
    setShowDropdown(false);
    handleClose();
  }

  const sharedInputProps = {
    type: "search" as const,
    value: inputValue,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value),
    onFocus: () => setShowDropdown(true),
    onBlur: () => setTimeout(() => setShowDropdown(false), 150),
    onKeyDown: (e: React.KeyboardEvent) => e.key === "Escape" && setShowDropdown(false),
    placeholder: "Search for products...",
  };

  return (
    <>
      {/* Mobile: inline flex item, only rendered when searchOpen */}
      {searchOpen && (
        <div className="flex flex-1 items-center gap-2 md:hidden">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
            <form onSubmit={handleSubmit}>
              <input
                {...sharedInputProps}
                ref={mobileInputRef}
                className="w-full rounded-full bg-brand-gray py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black"
              />
            </form>
            {activeQuery && <AutocompleteResults query={activeQuery} onSelect={handleSuggestionSelect} />}
          </div>
          <button type="button" onClick={handleClose} aria-label="Close search">
            <X className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Desktop: centered search bar, always in the flex layout */}
      <div className="hidden flex-1 items-center justify-center px-8 md:flex">
        <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            {...sharedInputProps}
            className="w-full rounded-full bg-brand-gray py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          {activeQuery && <AutocompleteResults query={activeQuery} onSelect={handleSuggestionSelect} />}
        </form>
      </div>
    </>
  );
}
