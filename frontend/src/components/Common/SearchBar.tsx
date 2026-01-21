import React, { useState, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  value?: string;
  debounceMs?: number;
  className?: string;
}

/**
 * שורת חיפוש עם debounce
 * מאפשרת חיפוש מהיר וחלק ללא עומס על השרת
 */
const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'חיפוש...',
  onSearch,
  value = '',
  debounceMs = 300,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState(value);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch, debounceMs]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  const searchBarClasses = [
    'search-bar',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={searchBarClasses}>
      <div className="search-input-container">
        <input
          type="text"
          className="search-input form-input"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleChange}
          dir="auto"
        />
        
        {searchTerm && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            title="נקה חיפוש"
          >
            ✕
          </button>
        )}
        
        <div className="search-icon">
          🔍
        </div>
      </div>
    </div>
  );
};

export default SearchBar;