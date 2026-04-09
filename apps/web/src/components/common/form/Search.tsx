import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
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
}

export function Search({
  onSelect,
  className,
  label = 'item',
  placeholder,
  onSearch,
  options,
}: SearchProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchOption[]>(options ?? []);
  const [loading, setLoading] = useState(false);

  // Static filtering when options are provided locally
  useEffect(() => {
    if (options) {
      const filtered = options.filter(o => {
        if (!query || !o.label) return true;
        return o.label.toLowerCase().includes(query.toLowerCase());
      });
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
        const data = await onSearch(query);
        setResults(data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, options, onSearch]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className={cn('w-75', className)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-[#161618] border-white/10 text-white hover:bg-white/5"
          >
            {value || `Search ${label}...`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0 border-white/10 bg-[#161618]">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={placeholder ?? `Search ${label}...`}
              onValueChange={setQuery}
              className="text-white"
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                </div>
              )}
              {!loading && results.length === 0 && (
                <CommandEmpty>No {label} found.</CommandEmpty>
              )}
              <CommandGroup>
                {results.map(option => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={currentValue => {
                      setValue(option.label);
                      onSelect(currentValue);
                      setOpen(false);
                    }}
                    className="text-white hover:bg-white/10 cursor-pointer"
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === option.label ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </div>
    </Popover>
  );
}
