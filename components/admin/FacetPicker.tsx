"use client";

interface FacetPickerProps {
  label: string;
  hint?: string;
  options: readonly string[];
  labels: Record<string, string>;
  value: string;
  onChange: (value: string) => void;
}

/**
 * One-tap picker for an optional product facet.
 *
 * Chips rather than a select: every option is visible at once and costs a
 * single tap, which matters when the whole catalogue gets entered from a
 * phone. Tapping the chosen one clears it, so a facet that does not apply is
 * as easy to leave blank as to set.
 */
export default function FacetPicker({
  label,
  hint,
  options,
  labels,
  value,
  onChange,
}: FacetPickerProps) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="block text-sm font-medium text-gray-700">{label}</span>
        <span className="text-xs text-gray-400">boleh dikosongkan</span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = value === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(selected ? "" : option)}
              className={`px-4 py-2.5 rounded-full border text-sm font-medium transition-colors ${
                selected
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {labels[option] ?? option}
            </button>
          );
        })}
      </div>

      {hint && <p className="text-xs text-gray-500 mt-1.5">{hint}</p>}
    </div>
  );
}
