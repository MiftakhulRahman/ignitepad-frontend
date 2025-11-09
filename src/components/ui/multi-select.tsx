import { useState, useRef, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';

interface MultiSelectProps {
  options: { id: number; name: string; slug: string }[];
  selected: number[];
  onChange: (selected: number[]) => void;
  placeholder?: string;
}

export function MultiSelect({ 
  options, 
  selected, 
  onChange, 
  placeholder = 'Pilih teknologi...' 
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Filter options based on search
  const filteredOptions = options.filter(option => 
    option.name.toLowerCase().includes(search.toLowerCase()) ||
    option.slug.toLowerCase().includes(search.toLowerCase())
  );
  
  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const toggleOption = (id: number) => {
    if (selected.includes(id)) {
      onChange(selected.filter(optId => optId !== id));
    } else {
      onChange([...selected, id]);
    }
  };
  
  const selectedOptions = options.filter(opt => selected.includes(opt.id));
  
  return (
    <div className="relative" ref={containerRef}>
      <div 
        className={`min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex flex-wrap gap-1 items-center cursor-text ${
          isOpen ? 'ring-2 ring-ring ring-offset-2' : ''
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedOptions.map(option => (
          <Badge 
            key={option.id} 
            variant="secondary"
            className="mr-1 mb-1"
          >
            {option.name}
            <button 
              type="button"
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              onClick={(e) => {
                e.stopPropagation();
                toggleOption(option.id);
              }}
            >
              ×
            </button>
          </Badge>
        ))}
        
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={selectedOptions.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 min-w-[100px]"
          onClick={(e) => e.stopPropagation()}
          onFocus={() => setIsOpen(true)}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredOptions.length === 0 ? (
            <div className="p-2 text-muted-foreground text-center">Tidak ada teknologi ditemukan</div>
          ) : (
            filteredOptions.map(option => (
              <div
                key={option.id}
                className={`px-3 py-2 cursor-pointer hover:bg-accent ${
                  selected.includes(option.id) ? 'bg-accent' : ''
                }`}
                onClick={() => toggleOption(option.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(option.id)}
                    readOnly
                    className="mr-2"
                  />
                  <span>{option.name}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}