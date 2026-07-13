import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { Search, Loader2, X } from "lucide-react";

const SearchBox = ({
  suggestions = [],
  isLoading = false,
  placeholder = "Search or type a quiz topic...",
  onChange = () => {},
  onSelect = () => {},
  onSubmit = () => {},
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  // NEW: State to manage the Windows Taskbar/Cortana mobile slide-down toggle behavior
  const [isMobileSearchVisible, setIsMobileSearchVisible] = useState(false);

  const containerRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setActiveIndex(-1);

    if (value.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      onChange(value);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        // Collapse mobile sub-tier container if targeting outside sections
        setIsMobileSearchVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((prevIndex) => 
          prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((prevIndex) => 
          prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelection(suggestions[activeIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    onSubmit(query.trim());
  };

  const handleSelection = (item) => {
    const displayValue = typeof item === "string" ? item : item.title || "";
    setQuery(displayValue);
    setIsOpen(false);
    setActiveIndex(-1);
    onSelect(item);
  };

  const clearSearch = () => {
    setQuery("");
    setIsOpen(false);
    setActiveIndex(-1);
    onChange("");
  };

  const showDropdown = isOpen && query.trim().length > 0;

  return (
    <div ref={containerRef} className="search-component-wrapper">
      
      {/* 🌟 CORTANA MOBILE ICON: Appears strictly on small viewports */}
      <button 
        type="button"
        className="mobile-search-trigger-icon"
        onClick={() => setIsMobileSearchVisible(!isMobileSearchVisible)}
        aria-label="Toggle mobile search bar"
      >
        <Search size={22} />
      </button>

      {/* CORE CAPSULE: Handled responsively via media query definitions */}
      <div 
        className={`nav-search ${showDropdown ? "dropdown-open" : ""} ${isMobileSearchVisible ? "mobile-active" : ""}`}
      >
        <form role="search" onSubmit={handleSubmit} className="navSearchForm">
          <Search className="lucide-search" size={20} aria-hidden="true" />

          <input
            id="quiz-search-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            spellCheck="false"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls="search-results-dropdown"
          />

          <div className="icon-tray">
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-btn"
                aria-label="Clear search text"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </form>

        {/* AUTO-SUGGEST DROPDOWN */}
        {showDropdown && (
          <div id="search-results-dropdown" role="listbox" className="search-dropdown">
            <div className="dropdown-divider"></div>

            {isLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'center', padding: '16px', color: '#94a3b8' }}>
                <Loader2 className="animate-spin" size={18} style={{ marginRight: '8px', color: '#4285f4' }} />
                <span style={{ fontSize: '14px' }}>Loading...</span>
              </div>
            ) : (
              <div style={{ paddingTop: '8px' }}>
                {suggestions.length === 0 ? (
                  <div style={{ padding: '12px 16px', fontSize: '14px', color: '#94a3b8', fontStyle: 'italic' }}>
                    No results found.
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => {
                    const isSelected = index === activeIndex;
                    const displayTitle = typeof suggestion === "string" ? suggestion : suggestion.title || "";
                    
                    return (
                      <div
                        id={`suggestion-item-${index}`}
                        key={typeof suggestion === "object" && suggestion.id ? suggestion.id : index}
                        role="option"
                        aria-selected={isSelected}
                        onMouseDown={() => handleSelection(suggestion)}
                        className={`suggestion-item ${isSelected ? "active" : ""}`}
                      >
                        <Search className="lucide-search" />
                        <span>{displayTitle}</span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

SearchBox.propTypes = {
  suggestions: PropTypes.array,
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default SearchBox;
