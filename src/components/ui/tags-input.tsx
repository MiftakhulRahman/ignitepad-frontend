import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
}

export function TagsInput({ 
  value, 
  onChange, 
  placeholder = 'Tambahkan tags...',
  suggestions = []
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
        !value.includes(suggestion)
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setActiveSuggestion(0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value, suggestions]);
  
  const addTag = (tag: string) => {
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInputValue('');
    setShowSuggestions(false);
  };
  
  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      if (inputValue) {
        // Remove trailing comma or space
        const tag = inputValue.trim().replace(/,$/, '');
        if (tag && !value.includes(tag)) {
          addTag(tag);
        }
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last tag on backspace when input is empty
      const newTags = [...value];
      newTags.pop();
      onChange(newTags);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (showSuggestions && activeSuggestion < filteredSuggestions.length - 1) {
        setActiveSuggestion(activeSuggestion + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (showSuggestions && activeSuggestion > 0) {
        setActiveSuggestion(activeSuggestion - 1);
      }
    } else if (e.key === 'Tab' && showSuggestions) {
      e.preventDefault();
      addTag(filteredSuggestions[activeSuggestion]);
    }
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
  };
  
  return (
    <div className="space-y-2">
      <div className="min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex flex-wrap gap-1 items-center">
        {value.map(tag => (
          <Badge 
            key={tag} 
            variant="secondary"
            className="mr-1 mb-1"
          >
            {tag}
            <button 
              type="button"
              className="ml-1 rounded-full hover:bg-secondary-foreground/20"
              onClick={() => removeTag(tag)}
            >
              ×
            </button>
          </Badge>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-none focus:outline-none focus:ring-0 min-w-[100px]"
        />
      </div>
      
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer hover:bg-accent ${
                index === activeSuggestion ? 'bg-accent' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Pisahkan tags dengan koma atau tekan Enter
      </p>
    </div>
  );
}