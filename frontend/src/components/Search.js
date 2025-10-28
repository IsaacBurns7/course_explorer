import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from 'axios';
import { getAllCourses } from "../hooks/useAllCourses";

export default function AutoCompleteSearch({navbarMode}) {
  const [courses, setCourses] = useState(new Set());
  const [inputText, setInputText] = useState("");
  const [matches, setMatches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [error, setError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const resultsRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Fetch courses
  useEffect(() => {
    getAllCourses()
      .then(courseSet => {
        if (courseSet && courseSet.forEach) {
          setCourses(prev => {
            const newSet = new Set(prev);
            courseSet.forEach((courseKey) => newSet.add(courseKey));
            return newSet;
          });
        }
      })
      .catch(err => console.error("Failed to load courses", err));
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function findMatches(wordToMatch, array) {
    return array.filter((element) => {
      const regex = new RegExp(wordToMatch, "gi");
      return regex.test(element);
    });
  }

  function displayMatches(value) {
    if (!value.trim()) {
    setMatches([]);
    setDropdownOpen(false);
    return;
  }
    const matchArray = findMatches(value, Array.from(courses)).slice(0, 10);
    setMatches(matchArray);
    setDropdownOpen(matchArray.length > 0);
  }

  function handleSelect(courseName) {
    setInputText(courseName);
    setDropdownOpen(false);
    setActiveIndex(-1);
    navigateToCourse(courseName);
  }

  function navigateToCourse(courseName) {
    if (!courseName || courseName === "") {
      setError(true);
      return;
    }

    const [dept, number] = courseName.split(" ");
    if (!dept || !number) {
      setError(true);
      return;
    }

    navigate(`/dashboard?dept=${dept}&courseNumber=${number}`);
  }

  function handleSubmit(selectedCourse) {
    const courseToUse = selectedCourse || inputText;
    if (!courseToUse || courseToUse === "") {
      setError(true);
      return;
    }

    navigateToCourse(courseToUse);
  }

  function handleKeyDown(e) {
    if (matches.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0) {
        handleSubmit(matches[activeIndex]);
      } else {
        handleSubmit(inputText);
      }
    }
    if (e.key === "Escape") {
      setActiveIndex(-1);
      setDropdownOpen(false);
    }
  }

  // Scroll to active item
  useEffect(() => {
    if (activeIndex >= 0 && resultsRef.current) {
      const activeItem = resultsRef.current.children[activeIndex];
      if (activeItem) {
        activeItem.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [activeIndex]);

  return (
   <form
  className={`mx-auto flex items-center justify-center relative gap-2 ${
    navbarMode ? "w-full" : "w-full max-w-lg"
  }`}
  onSubmit={(e) => {
    e.preventDefault();
    handleSubmit(inputText);
  }}
>
  {/* Search Input */}
  <input
    ref={inputRef}
    type="text"
    placeholder={
      navbarMode
        ? "DEPT 123"
        : "Search for a course"
    }
    className={`
      flex-grow
      ${navbarMode ? "text-base" : "text-lg"}
      pr-3 pl-4 py-2
      rounded-full
      ${navbarMode 
        ? "bg-dark-input border-dark-border text-beige-light placeholder-beige-dark/50" 
        : "bg-white/5 backdrop-blur-md text-gray-200 placeholder-gray-500 border-white/20"
      }
      border
      focus:outline-none
      focus:ring-2 
      ${navbarMode 
        ? "focus:ring-maroon/50 focus:border-maroon" 
        : "focus:ring-white/30"
      }
      transition duration-300
      ${navbarMode 
        ? "" 
        : "shadow-[0_0_25px_rgba(255,255,255,0.05)]"
      }
    `}
    value={inputText}
    onChange={(e) => {
      const value = e.target.value.toUpperCase();
      setInputText(value);
      setError(false);
      displayMatches(value);
    }}
    onFocus={() => displayMatches(inputText)}
    onKeyDown={handleKeyDown}
  />

  {/* Submit Button - Only show in non-navbar mode */}
  {!navbarMode && (
    <button
      type="submit"
      className="
        px-6 py-3
        rounded-xl
        border border-white/50
        text-white
        font-medium
        bg-transparent
        hover:bg-white/10
        transition-all duration-300
        whitespace-nowrap
      "
    >
      Search
    </button>
  )}

  {/* Error Message */}
  {error && (
    <p className="absolute -bottom-6 left-4 text-red-400 text-sm">
      ⚠️ Please enter a valid course
    </p>
  )}

  {/* Dropdown */}
  {dropdownOpen && matches.length > 0 && (
    <ul
      ref={resultsRef}
      className={`
        absolute top-full left-0 z-50 w-full 
        bg-dark-card backdrop-blur-md 
        border border-dark-border 
        text-beige-light 
        rounded-xl mt-2 
        shadow-2xl 
        max-h-64 overflow-y-auto
        ${navbarMode ? "text-lg" : "text-lg"}
      `}
    >
      {matches.map((courseName, index) => {
        const regex = new RegExp(`(${inputText})`, "gi");
        const parts = courseName.split(regex).filter((el) => el !== "");
        return (
          <li
            key={index}
            className={`
              px-4 py-3 cursor-pointer transition-all
              ${index === activeIndex
                ? "bg-dark-hover text-beige-light"
                : "hover:bg-dark-hover hover:text-beige-light"
              }
            `}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => handleSelect(courseName)}
          >
            {parts.map((string, i) => (
              <span
                key={i}
                className={
                  regex.test(string)
                    ? "font-semibold text-yellow-400"
                    : index === activeIndex 
                    ? "text-beige-light" 
                    : "text-beige-dark"
                }
              >
                {string}
              </span>
            ))}
          </li>
        );
      })}
    </ul>
  )}
</form>


  );
}
