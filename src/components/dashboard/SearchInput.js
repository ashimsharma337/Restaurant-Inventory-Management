// src/components/dashboard/SearchInput.js
// Debounced search input with autocomplete dropdown.
// Reads/writes ?q= via useInventoryFilters hook (URL params).

import { useCallback, useEffect, useRef, useState } from 'react';
import { useInventoryFilters } from '@/hooks/useInventoryFilters';

// ─── Config ───────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;
const MAX_RESULTS = 8;

const TYPE_CONFIG = {
  ingredient: {
    icon: 'nutrition',
    label: 'Ingredient',
    colorClass:
      'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40',
  },
  meal: {
    icon: 'restaurant',
    label: 'Meal',
    colorClass:
      'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40',
  },
  category: {
    icon: 'category',
    label: 'Category',
    colorClass:
      'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/40',
  },
  supplier: {
    icon: 'local_shipping',
    label: 'Supplier',
    colorClass:
      'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/40',
  },
};

// Chips shown in the empty-state dropdown (focused, no input yet)
const SUGGESTIONS = [
  { label: 'Dairy',         query: 'dairy',     icon: 'egg' },
  { label: 'Chicken',       query: 'chicken',   icon: 'nutrition' },
  { label: 'Italian meals', query: 'Italian',   icon: 'restaurant' },
  { label: 'Seafood',       query: 'seafood',   icon: 'set_meal' },
  { label: 'Fresh produce', query: 'produce',   icon: 'eco' },
  { label: 'Beverages',     query: 'beverage',  icon: 'local_cafe' },
];

// ─── Custom debounce hook ─────────────────────────────────────────────────────

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SearchInput() {
  const { query: urlQuery, setQuery } = useInventoryFilters();

  // Local input value — tracks keystrokes; only pushed to URL on commit
  const [inputValue, setInputValue] = useState(urlQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const abortRef = useRef(null);

  const debouncedValue = useDebounce(inputValue, DEBOUNCE_MS);

  // Keep local input in sync if URL query changes externally
  // (e.g. user hits browser back)
  useEffect(() => {
    setInputValue(urlQuery);
  }, [urlQuery]);

  // ── Fetch autocomplete results ─────────────────────────────────────────────
  useEffect(() => {
    const q = debouncedValue.trim();

    if (q.length < MIN_LENGTH) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    // Cancel the previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setIsLoading(true);

    fetch(
      `/api/search?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS}&mode=autocomplete`,
      { signal: abortRef.current.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setResults(data.results ?? []);
        setIsLoading(false);
        setActiveIndex(-1);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setResults([]);
          setIsLoading(false);
        }
      });
  }, [debouncedValue]);

  // ── Commit search → update URL ─────────────────────────────────────────────
  const commitSearch = useCallback(
    (value) => {
      const q = value.trim();
      setInputValue(q);
      setIsOpen(false);
      setActiveIndex(-1);
      setQuery(q); // writes ?q= to URL via useInventoryFilters
      inputRef.current?.blur();
    },
    [setQuery]
  );

  // ── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            results.length === 0 ? -1 : (prev + 1) % results.length
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev <= 0 ? results.length - 1 : prev - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && results[activeIndex]) {
            commitSearch(results[activeIndex].name);
          } else {
            commitSearch(inputValue);
          }
          break;

        case 'Escape':
          setIsOpen(false);
          setActiveIndex(-1);
          inputRef.current?.blur();
          break;

        default:
          break;
      }
    },
    [results, activeIndex, inputValue, commitSearch]
  );

  // ── Open dropdown on focus ─────────────────────────────────────────────────
  useEffect(() => {
    if (isFocused) setIsOpen(true);
  }, [isFocused]);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        !dropdownRef.current?.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Scroll active item into view ───────────────────────────────────────────
  useEffect(() => {
    if (activeIndex >= 0 && dropdownRef.current) {
      dropdownRef.current
        .querySelector(`[data-index="${activeIndex}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex]);

  // ── Clear ──────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setInputValue('');
    setResults([]);
    setActiveIndex(-1);
    setQuery('');
    inputRef.current?.focus();
  };

  // ── Derived display flags ──────────────────────────────────────────────────
  const showDropdown = isOpen && isFocused;
  const isTyping = inputValue.trim().length >= MIN_LENGTH;
  const showSuggestions = showDropdown && !isTyping;
  const showResults = showDropdown && isTyping;
  const hasResults = results.length > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-96 max-w-md">

      {/* Input wrapper */}
      <div
        className={[
          'flex items-center gap-2 w-full rounded-xl border px-3 py-2',
          'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm',
          'transition-all duration-200',
          isFocused
            ? 'border-teal-400 dark:border-teal-500 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]'
            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
        ].join(' ')}
      >
        {/* Search icon / spinner */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {isLoading ? (
            <span className="block w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span
              className={[
                'material-symbols-outlined text-[18px] leading-none transition-colors',
                isFocused
                  ? 'text-teal-500 dark:text-teal-400'
                  : 'text-slate-400 dark:text-slate-500',
              ].join(' ')}
            >
              search
            </span>
          )}
        </div>

        {/* Text input */}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="search-listbox"
          aria-activedescendant={
            activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
          }
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            // Small delay so dropdown click events fire first
            setTimeout(() => setIsFocused(false), 150);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search ingredients, meals, suppliers..."
          autoComplete="off"
          spellCheck="false"
          className={[
            'flex-1 bg-transparent border-none outline-none p-0 focus:ring-0',
            'text-sm font-medium text-slate-800 dark:text-slate-100',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
          ].join(' ')}
        />

        {/* Clear button */}
        {inputValue && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className={[
              'flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full',
              'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
              'hover:bg-slate-100 dark:hover:bg-slate-700',
              'transition-all duration-150 active:scale-90',
            ].join(' ')}
          >
            <span className="material-symbols-outlined text-[15px] leading-none">
              close
            </span>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          id="search-listbox"
          role="listbox"
          className={[
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-white dark:bg-slate-900',
            'border border-slate-200 dark:border-slate-700',
            'rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40',
            'overflow-hidden',
          ].join(' ')}
        >

          {/* ── Empty state: suggestion chips ─────────────────────────────── */}
          {showSuggestions && (
            <div className="p-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 px-1">
                Try searching for
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s.query}
                    type="button"
                    onClick={() => {
                      setInputValue(s.query);
                      commitSearch(s.query);
                    }}
                    className={[
                      'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
                      'text-slate-600 dark:text-slate-300',
                      'bg-slate-50 dark:bg-slate-800',
                      'border border-slate-200 dark:border-slate-700',
                      'hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50',
                      'dark:hover:border-teal-500 dark:hover:text-teal-300 dark:hover:bg-teal-900/30',
                      'transition-all duration-150 active:scale-95',
                    ].join(' ')}
                  >
                    <span className="material-symbols-outlined text-[13px] leading-none">
                      {s.icon}
                    </span>
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">
                  info
                </span>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Searches across all ingredients, meals, and suppliers
                </p>
              </div>
            </div>
          )}

          {/* ── Results ───────────────────────────────────────────────────── */}
          {showResults && (
            <>
              {/* Loading skeletons */}
              {isLoading && !hasResults && (
                <div className="p-2 space-y-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse"
                    >
                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Result rows */}
              {!isLoading && hasResults && (
                <ul className="p-2" role="group">
                  {results.map((result, idx) => {
                    const config = TYPE_CONFIG[result.type];
                    const isActive = idx === activeIndex;
                    return (
                      <li key={`${result.type}-${result.id}`} role="none">
                        <button
                          id={`search-option-${idx}`}
                          role="option"
                          data-index={idx}
                          aria-selected={isActive}
                          type="button"
                          onClick={() => commitSearch(result.name)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={[
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
                            'transition-colors duration-100',
                            isActive
                              ? 'bg-teal-50 dark:bg-teal-900/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
                          ].join(' ')}
                        >
                          {/* Type icon badge */}
                          <div
                            className={[
                              'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                              config.colorClass,
                            ].join(' ')}
                          >
                            <span className="material-symbols-outlined text-[15px] leading-none">
                              {config.icon}
                            </span>
                          </div>

                          {/* Name + subtitle */}
                          <div className="flex-1 min-w-0">
                            {/*
                              FTS5 highlight() wraps matches in <mark> tags.
                              dangerouslySetInnerHTML is safe here because nameHl
                              comes from your own SQLite DB, not from user input.
                            */}
                            <p
                              className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate [&_mark]:bg-teal-100 [&_mark]:dark:bg-teal-900/60 [&_mark]:text-teal-800 [&_mark]:dark:text-teal-200 [&_mark]:rounded-sm [&_mark]:px-0.5 [&_mark]:font-semibold"
                              dangerouslySetInnerHTML={{ __html: result.nameHl }}
                            />
                            <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                              {result.subtitle}
                            </p>
                          </div>

                          {/* Type label */}
                          <span
                            className={[
                              'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
                              config.colorClass,
                            ].join(' ')}
                          >
                            {config.label}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              {/* No results */}
              {!isLoading && !hasResults && (
                <div className="px-4 py-8 text-center">
                  <span className="material-symbols-outlined text-[32px] text-slate-300 dark:text-slate-600 block mb-2">
                    search_off
                  </span>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No results for &ldquo;{inputValue}&rdquo;
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Try a different keyword or check the spelling
                  </p>
                </div>
              )}

              {/* Footer hints */}
              {!isLoading && hasResults && (
                <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {results.length === MAX_RESULTS
                      ? `Top ${MAX_RESULTS} results`
                      : `${results.length} result${results.length !== 1 ? 's' : ''}`}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[10px]">
                        ↵
                      </kbd>
                      full results
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[10px]">
                        ↑↓
                      </kbd>
                      navigate
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}


// old code ...
// // src/components/dashboard/SearchInput.js
// // Debounced search input with autocomplete dropdown.
// // Reads/writes ?q= via useInventoryFilters hook (URL params).

// import { useCallback, useEffect, useRef, useState } from 'react';
// import { useInventoryFilters } from '@/hooks/useInventoryFilters';

// // ─── Config ───────────────────────────────────────────────────────────────────

// const DEBOUNCE_MS = 300;
// const MIN_LENGTH = 2;
// const MAX_RESULTS = 8;

// const TYPE_CONFIG = {
//   ingredient: {
//     icon: 'nutrition',
//     label: 'Ingredient',
//     colorClass:
//       'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/40',
//   },
//   meal: {
//     icon: 'restaurant',
//     label: 'Meal',
//     colorClass:
//       'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/40',
//   },
//   supplier: {
//     icon: 'local_shipping',
//     label: 'Supplier',
//     colorClass:
//       'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/40',
//   },
// };

// // Chips shown in the empty-state dropdown (focused, no input yet)
// const SUGGESTIONS = [
//   { label: 'Dairy',         query: 'dairy',     icon: 'egg' },
//   { label: 'Chicken',       query: 'chicken',   icon: 'nutrition' },
//   { label: 'Italian meals', query: 'Italian',   icon: 'restaurant' },
//   { label: 'Seafood',       query: 'seafood',   icon: 'set_meal' },
//   { label: 'Fresh produce', query: 'produce',   icon: 'eco' },
//   { label: 'Beverages',     query: 'beverage',  icon: 'local_cafe' },
// ];

// // ─── Custom debounce hook ─────────────────────────────────────────────────────

// function useDebounce(value, delay) {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const timer = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(timer);
//   }, [value, delay]);
//   return debounced;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function SearchInput() {
//   const { query: urlQuery, setQuery } = useInventoryFilters();

//   // Local input value — tracks keystrokes; only pushed to URL on commit
//   const [inputValue, setInputValue] = useState(urlQuery);
//   const [isFocused, setIsFocused] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [results, setResults] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(-1);

//   const inputRef = useRef(null);
//   const dropdownRef = useRef(null);
//   const abortRef = useRef(null);

//   const debouncedValue = useDebounce(inputValue, DEBOUNCE_MS);

//   // Keep local input in sync if URL query changes externally
//   // (e.g. user hits browser back)
//   useEffect(() => {
//     setInputValue(urlQuery);
//   }, [urlQuery]);

//   // ── Fetch autocomplete results ─────────────────────────────────────────────
//   useEffect(() => {
//     const q = debouncedValue.trim();

//     if (q.length < MIN_LENGTH) {
//       setResults([]);
//       setIsLoading(false);
//       return;
//     }

//     // Cancel the previous in-flight request
//     if (abortRef.current) abortRef.current.abort();
//     abortRef.current = new AbortController();

//     setIsLoading(true);

//     fetch(
//       `/api/search?q=${encodeURIComponent(q)}&limit=${MAX_RESULTS}&mode=autocomplete`,
//       { signal: abortRef.current.signal }
//     )
//       .then((res) => res.json())
//       .then((data) => {
//         setResults(data.results ?? []);
//         setIsLoading(false);
//         setActiveIndex(-1);
//       })
//       .catch((err) => {
//         if (err.name !== 'AbortError') {
//           setResults([]);
//           setIsLoading(false);
//         }
//       });
//   }, [debouncedValue]);

//   // ── Commit search → update URL ─────────────────────────────────────────────
//   const commitSearch = useCallback(
//     (value) => {
//       const q = value.trim();
//       setInputValue(q);
//       setIsOpen(false);
//       setActiveIndex(-1);
//       setQuery(q); // writes ?q= to URL via useInventoryFilters
//       inputRef.current?.blur();
//     },
//     [setQuery]
//   );

//   // ── Keyboard navigation ────────────────────────────────────────────────────
//   const handleKeyDown = useCallback(
//     (e) => {
//       switch (e.key) {
//         case 'ArrowDown':
//           e.preventDefault();
//           setActiveIndex((prev) =>
//             results.length === 0 ? -1 : (prev + 1) % results.length
//           );
//           break;

//         case 'ArrowUp':
//           e.preventDefault();
//           setActiveIndex((prev) =>
//             prev <= 0 ? results.length - 1 : prev - 1
//           );
//           break;

//         case 'Enter':
//           e.preventDefault();
//           if (activeIndex >= 0 && results[activeIndex]) {
//             commitSearch(results[activeIndex].name);
//           } else {
//             commitSearch(inputValue);
//           }
//           break;

//         case 'Escape':
//           setIsOpen(false);
//           setActiveIndex(-1);
//           inputRef.current?.blur();
//           break;

//         default:
//           break;
//       }
//     },
//     [results, activeIndex, inputValue, commitSearch]
//   );

//   // ── Open dropdown on focus ─────────────────────────────────────────────────
//   useEffect(() => {
//     if (isFocused) setIsOpen(true);
//   }, [isFocused]);

//   // ── Close on outside click ─────────────────────────────────────────────────
//   useEffect(() => {
//     const handler = (e) => {
//       if (
//         !dropdownRef.current?.contains(e.target) &&
//         !inputRef.current?.contains(e.target)
//       ) {
//         setIsOpen(false);
//         setActiveIndex(-1);
//       }
//     };
//     document.addEventListener('mousedown', handler);
//     return () => document.removeEventListener('mousedown', handler);
//   }, []);

//   // ── Scroll active item into view ───────────────────────────────────────────
//   useEffect(() => {
//     if (activeIndex >= 0 && dropdownRef.current) {
//       dropdownRef.current
//         .querySelector(`[data-index="${activeIndex}"]`)
//         ?.scrollIntoView({ block: 'nearest' });
//     }
//   }, [activeIndex]);

//   // ── Clear ──────────────────────────────────────────────────────────────────
//   const handleClear = () => {
//     setInputValue('');
//     setResults([]);
//     setActiveIndex(-1);
//     setQuery('');
//     inputRef.current?.focus();
//   };

//   // ── Derived display flags ──────────────────────────────────────────────────
//   const showDropdown = isOpen && isFocused;
//   const isTyping = inputValue.trim().length >= MIN_LENGTH;
//   const showSuggestions = showDropdown && !isTyping;
//   const showResults = showDropdown && isTyping;
//   const hasResults = results.length > 0;

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="relative w-96 max-w-md">

//       {/* Input wrapper */}
//       <div
//         className={[
//           'flex items-center gap-2 w-full rounded-xl border px-3 py-2',
//           'bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm',
//           'transition-all duration-200',
//           isFocused
//             ? 'border-teal-400 dark:border-teal-500 shadow-[0_0_0_3px_rgba(45,212,191,0.12)]'
//             : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600',
//         ].join(' ')}
//       >
//         {/* Search icon / spinner */}
//         <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
//           {isLoading ? (
//             <span className="block w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
//           ) : (
//             <span
//               className={[
//                 'material-symbols-outlined text-[18px] leading-none transition-colors',
//                 isFocused
//                   ? 'text-teal-500 dark:text-teal-400'
//                   : 'text-slate-400 dark:text-slate-500',
//               ].join(' ')}
//             >
//               search
//             </span>
//           )}
//         </div>

//         {/* Text input */}
//         <input
//           ref={inputRef}
//           type="text"
//           role="combobox"
//           aria-autocomplete="list"
//           aria-expanded={showDropdown}
//           aria-controls="search-listbox"
//           aria-activedescendant={
//             activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
//           }
//           value={inputValue}
//           onChange={(e) => setInputValue(e.target.value)}
//           onFocus={() => setIsFocused(true)}
//           onBlur={() => {
//             // Small delay so dropdown click events fire first
//             setTimeout(() => setIsFocused(false), 150);
//           }}
//           onKeyDown={handleKeyDown}
//           placeholder="Search ingredients, meals, suppliers..."
//           autoComplete="off"
//           spellCheck="false"
//           className={[
//             'flex-1 bg-transparent border-none outline-none p-0 focus:ring-0',
//             'text-sm font-medium text-slate-800 dark:text-slate-100',
//             'placeholder:text-slate-400 dark:placeholder:text-slate-500',
//           ].join(' ')}
//         />

//         {/* Clear button */}
//         {inputValue && (
//           <button
//             type="button"
//             onClick={handleClear}
//             aria-label="Clear search"
//             className={[
//               'flex-shrink-0 flex items-center justify-center w-5 h-5 rounded-full',
//               'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
//               'hover:bg-slate-100 dark:hover:bg-slate-700',
//               'transition-all duration-150 active:scale-90',
//             ].join(' ')}
//           >
//             <span className="material-symbols-outlined text-[15px] leading-none">
//               close
//             </span>
//           </button>
//         )}
//       </div>

//       {/* Dropdown */}
//       {showDropdown && (
//         <div
//           ref={dropdownRef}
//           id="search-listbox"
//           role="listbox"
//           className={[
//             'absolute top-full left-0 right-0 mt-2 z-50',
//             'bg-white dark:bg-slate-900',
//             'border border-slate-200 dark:border-slate-700',
//             'rounded-2xl shadow-xl shadow-slate-200/60 dark:shadow-black/40',
//             'overflow-hidden',
//           ].join(' ')}
//         >

//           {/* ── Empty state: suggestion chips ─────────────────────────────── */}
//           {showSuggestions && (
//             <div className="p-3">
//               <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2.5 px-1">
//                 Try searching for
//               </p>
//               <div className="flex flex-wrap gap-1.5">
//                 {SUGGESTIONS.map((s) => (
//                   <button
//                     key={s.query}
//                     type="button"
//                     onClick={() => {
//                       setInputValue(s.query);
//                       commitSearch(s.query);
//                     }}
//                     className={[
//                       'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
//                       'text-slate-600 dark:text-slate-300',
//                       'bg-slate-50 dark:bg-slate-800',
//                       'border border-slate-200 dark:border-slate-700',
//                       'hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50',
//                       'dark:hover:border-teal-500 dark:hover:text-teal-300 dark:hover:bg-teal-900/30',
//                       'transition-all duration-150 active:scale-95',
//                     ].join(' ')}
//                   >
//                     <span className="material-symbols-outlined text-[13px] leading-none">
//                       {s.icon}
//                     </span>
//                     {s.label}
//                   </button>
//                 ))}
//               </div>

//               <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
//                 <span className="material-symbols-outlined text-[14px] text-slate-300 dark:text-slate-600">
//                   info
//                 </span>
//                 <p className="text-[11px] text-slate-400 dark:text-slate-500">
//                   Searches across all ingredients, meals, and suppliers
//                 </p>
//               </div>
//             </div>
//           )}

//           {/* ── Results ───────────────────────────────────────────────────── */}
//           {showResults && (
//             <>
//               {/* Loading skeletons */}
//               {isLoading && !hasResults && (
//                 <div className="p-2 space-y-1">
//                   {[0, 1, 2].map((i) => (
//                     <div
//                       key={i}
//                       className="flex items-center gap-3 px-3 py-2.5 rounded-xl animate-pulse"
//                     >
//                       <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex-shrink-0" />
//                       <div className="flex-1 space-y-1.5">
//                         <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
//                         <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}

//               {/* Result rows */}
//               {!isLoading && hasResults && (
//                 <ul className="p-2" role="group">
//                   {results.map((result, idx) => {
//                     const config = TYPE_CONFIG[result.type];
//                     const isActive = idx === activeIndex;
//                     return (
//                       <li key={`${result.type}-${result.id}`} role="none">
//                         <button
//                           id={`search-option-${idx}`}
//                           role="option"
//                           data-index={idx}
//                           aria-selected={isActive}
//                           type="button"
//                           onClick={() => commitSearch(result.name)}
//                           onMouseEnter={() => setActiveIndex(idx)}
//                           className={[
//                             'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left',
//                             'transition-colors duration-100',
//                             isActive
//                               ? 'bg-teal-50 dark:bg-teal-900/30'
//                               : 'hover:bg-slate-50 dark:hover:bg-slate-800/60',
//                           ].join(' ')}
//                         >
//                           {/* Type icon badge */}
//                           <div
//                             className={[
//                               'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
//                               config.colorClass,
//                             ].join(' ')}
//                           >
//                             <span className="material-symbols-outlined text-[15px] leading-none">
//                               {config.icon}
//                             </span>
//                           </div>

//                           {/* Name + subtitle */}
//                           <div className="flex-1 min-w-0">
//                             {/*
//                               FTS5 highlight() wraps matches in <mark> tags.
//                               dangerouslySetInnerHTML is safe here because nameHl
//                               comes from your own SQLite DB, not from user input.
//                             */}
//                             <p
//                               className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate [&_mark]:bg-teal-100 [&_mark]:dark:bg-teal-900/60 [&_mark]:text-teal-800 [&_mark]:dark:text-teal-200 [&_mark]:rounded-sm [&_mark]:px-0.5 [&_mark]:font-semibold"
//                               dangerouslySetInnerHTML={{ __html: result.nameHl }}
//                             />
//                             <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
//                               {result.subtitle}
//                             </p>
//                           </div>

//                           {/* Type label */}
//                           <span
//                             className={[
//                               'flex-shrink-0 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full',
//                               config.colorClass,
//                             ].join(' ')}
//                           >
//                             {config.label}
//                           </span>
//                         </button>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               )}

//               {/* No results */}
//               {!isLoading && !hasResults && (
//                 <div className="px-4 py-8 text-center">
//                   <span className="material-symbols-outlined text-[32px] text-slate-300 dark:text-slate-600 block mb-2">
//                     search_off
//                   </span>
//                   <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
//                     No results for &ldquo;{inputValue}&rdquo;
//                   </p>
//                   <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
//                     Try a different keyword or check the spelling
//                   </p>
//                 </div>
//               )}

//               {/* Footer hints */}
//               {!isLoading && hasResults && (
//                 <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
//                   <p className="text-[11px] text-slate-400 dark:text-slate-500">
//                     {results.length === MAX_RESULTS
//                       ? `Top ${MAX_RESULTS} results`
//                       : `${results.length} result${results.length !== 1 ? 's' : ''}`}
//                   </p>
//                   <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
//                     <span className="flex items-center gap-1">
//                       <kbd className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[10px]">
//                         ↵
//                       </kbd>
//                       full results
//                     </span>
//                     <span className="flex items-center gap-1">
//                       <kbd className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[10px]">
//                         ↑↓
//                       </kbd>
//                       navigate
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }