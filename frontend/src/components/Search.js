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
    handleSubmit(courseName);
  }

  function handleSubmit(selectedCourse) {
    if (!selectedCourse || selectedCourse === "") {
      setError(true);
      return;
    }

    const [dept, number] = selectedCourse.split(" ");
    if (!dept || !number) {
      setError(true);
      return;
    }

    navigate({
      pathname: "dashboard",
      search: `?dept=${dept}&courseNumber=${number}`,
    });
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
  className={`mx-auto flex items-center justify-center relative ${
    navbarMode ? "w-full max-w-xs sm:max-w-sm md:max-w-md" : "w-full max-w-lg"
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
      w-full
      text-md 
      pr-4 pl-4 py-${navbarMode ? "2" : "4"}
      rounded-xl
      bg-white/5
      backdrop-blur-md
      text-gray-200
      placeholder-gray-500
      border border-white/20
      focus:outline-none
      focus:ring-2 focus:ring-white/30
      transition duration-300
      shadow-[0_0_25px_rgba(255,255,255,0.05)]
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

  {/* Error Message */}
  {error && (
    <p className="absolute -bottom-6 left-4 text-red-light text-sm">
      ⚠️ Please enter a valid course
    </p>
  )}

  {/* Dropdown */}
  {dropdownOpen && matches.length > 0 && (
    <ul
      ref={resultsRef}
      className="absolute top-full left-1/2 transform -translate-x-1/2 z-20 w-full bg-background backdrop-blur-md border border-gray-800 text-gray-100 rounded-xl mt-2 shadow-xl max-h-64 overflow-y-auto"
    >
      {matches.map((courseName, index) => {
        const regex = new RegExp(`(${inputText})`, "gi");
        const parts = courseName.split(regex).filter((el) => el !== "");
        return (
          <li
  key={index}
  className={`
    px-4 py-2 cursor-pointer transition-all
    ${index === activeIndex
      ? "bg-maroon text-beige-light"
      : "hover:bg-maroon hover:text-beige-light"
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
                    ? "font-semibold text-maroon"
                    : index === activeIndex
                    ? "text-beige-light"
                    : "text-gray-200"
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
