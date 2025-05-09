import React, { useState, useEffect, useRef } from "react";

const TermSelectionModal = ({ isOpen, onClose, onConfirm, committeeName, terms }) => {
  // Note: Parent component (e.g., EditModal) must set isOpen to true on every committee click,
  // even for the same committee, to allow changing the term.
  const [selectedTerm, setSelectedTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [focusedOptionIndex, setFocusedOptionIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTerm("");
      setIsDropdownOpen(false);
      setFocusedOptionIndex(-1);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setFocusedOptionIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sort terms in descending order by council number (e.g., "20th City Council" before "1st City Council")
  const sortedTerms = [...terms].sort((a, b) => {
    const getCouncilNumber = (term) => {
      const match = term.match(/^(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    };
    const numberA = getCouncilNumber(a);
    const numberB = getCouncilNumber(b);
    if (numberA && numberB) {
      return numberB - numberA;
    }
    return b.localeCompare(a);
  });

  // Handle term selection
  const handleTermChange = (term) => {
    setSelectedTerm(term);
    setIsDropdownOpen(false);
    setFocusedOptionIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input click to toggle dropdown
  const handleInputClick = (e) => {
    e.stopPropagation();
    setIsDropdownOpen((prev) => !prev);
    setFocusedOptionIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (isDropdownOpen && focusedOptionIndex >= 0) {
        handleTermChange(sortedTerms[focusedOptionIndex]);
      } else if (selectedTerm) {
        onConfirm(selectedTerm);
      } else {
        setIsDropdownOpen(true);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
      } else if (focusedOptionIndex < sortedTerms.length - 1) {
        setFocusedOptionIndex((prev) => prev + 1);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isDropdownOpen) {
        setIsDropdownOpen(true);
      } else if (focusedOptionIndex > 0) {
        setFocusedOptionIndex((prev) => prev - 1);
      }
    } else if (e.key === "Escape") {
      setIsDropdownOpen(false);
      setFocusedOptionIndex(-1);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle confirm button click
  const handleConfirm = () => {
    if (selectedTerm) {
      onConfirm(selectedTerm);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
        <h2 className="text-lg font-semibold mb-4 font-poppins text-gray-800">
          Select Term for {committeeName}
        </h2>
        <div className="space-y-4">
          {terms.length === 0 && (
            <p className="text-gray-500 text-sm">No terms available for this committee.</p>
          )}
          {terms.length > 0 && (
            <div ref={dropdownRef} className="relative">
              <label className="block text-gray-700 text-sm font-medium mb-1">Term</label>
              <div
                ref={inputRef}
                tabIndex={0}
                onClick={handleInputClick}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm text-gray-900 cursor-pointer focus:ring-2 focus:ring-[#408286] focus:border-[#408286] flex justify-between items-center"
              >
                <span>{selectedTerm || "Select Term"}</span>
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {isDropdownOpen && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-md max-h-80 font-poppins overflow-y-auto top-full left-0">
                  {sortedTerms.map((term, index) => (
                    <li
                      key={index}
                      onClick={() => handleTermChange(term)}
                      className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                        focusedOptionIndex === index ? "bg-gray-200" : ""
                      }`}
                    >
                      {term}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedTerm}
              className={`py-2 px-6 border border-transparent shadow-md text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#408286] transition-colors duration-200 ${
                selectedTerm
                  ? "bg-[#408286] hover:bg-[#306466]"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermSelectionModal;