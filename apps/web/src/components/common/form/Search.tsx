import { Check, ChevronsUpDown, Loader2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface SearchOption {
  value: string;
  label: string;
}

interface SearchProps {
  onSelect: (value: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  onSearch?: (query: string) => Promise<SearchOption[]>;
  options?: SearchOption[];
  limit?: number;
}

export function Search({
  onSelect,
  className,
  label = 'item',
  placeholder,
  onSearch,
  options,
  limit = 5,
}: SearchProps) {
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedLabel, setSelectedLabel] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasTyped, setHasTyped] = useState(false);

  // Static filtering when options are provided locally
  useEffect(() => {
    if (!hasTyped) {
      setResults([]);
      return;
    }

    if (options) {
      let filtered = options.filter(o => {
        if (!query || !o.label) return true;
        return o.label.toLowerCase().includes(query.toLowerCase());
      });

      // Limit to specified number
      filtered = filtered.slice(0, limit);
      setResults(filtered);
      return;
    }

    // Async search
    if (!onSearch) return;

    const timer = setTimeout(async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        let data = await onSearch(query);
        // Limit results
        data = data.slice(0, limit);
        setResults(data);
      } catch (err) {
        console.error('Search error', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, options, onSearch, limit, hasTyped]);

  const handleSelect = (value: string, label: string) => {
    setSelectedValue(value);
    setSelectedLabel(label);
    setQuery('');
    setHasTyped(false);
    onSelect(label);
    setOpen(false);
  };

  const handleClear = () => {
    setSelectedValue('');
    setSelectedLabel('');
    setQuery('');
    setHasTyped(false);
    setResults([]);
    onSelect('');
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !selectedLabel) {
      setQuery('');
      setHasTyped(false);
      setResults([]);
    }
    setOpen(newOpen);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value && value.trim() !== '') {
      setHasTyped(true);
    } else {
      setHasTyped(false);
      setResults([]);
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <div className={cn('w-75', className)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#161618] border-white/10 text-white hover:bg-white/5"
          >
            <span className="truncate">
              {selectedLabel || `Search ${label}...`}
            </span>
            <div className="flex items-center gap-1">
              {selectedLabel && (
                <div
                  onClick={e => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X className="h-3 w-3 opacity-70 hover:opacity-100" />
                </div>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0 border-white/10 bg-[#161618] z-70">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder ?? `Search ${label}...`}
              value={query}
              onValueChange={handleInputChange}
              className="text-white"
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
              {!loading && hasTyped && results.length === 0 && (
                <CommandEmpty>No {label} found.</CommandEmpty>
              )}
              {!loading && !hasTyped && (
                <CommandEmpty className="text-slate-400 p-3 text-center">
                  Tapes pour rechercher...
                </CommandEmpty>
              )}
              {hasTyped && results.length > 0 && (
                <CommandGroup>
                  {results.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleSelect(option.value, option.label)}
                      className="text-white hover:bg-white/10 cursor-pointer"
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValue === option.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
