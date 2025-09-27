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
        setCourses(prev => {
          const newSet = new Set(prev);
          courseSet.forEach((courseKey) => newSet.add(courseKey));
          return newSet;
        });
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
    const matchArray = findMatches(value, Array.from(courses)).slice(0, 10);
    setMatches(matchArray);
    setDropdownOpen(matchArray.length > 0);
  }

  function handleSelect(courseName) {
    setInputText(courseName);
    setDropdownOpen(false);
    setActiveIndex(-1);
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
      className= {`mx-auto flex items-center ${navbarMode ? "w-96" : ""} relative`}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(inputText);
      }}
    >
      {/* Search Input */}
      <input
        ref={inputRef}
        type="text"
        placeholder={`${navbarMode ? "DEPT 123" : "Input Class/Professor Name (Ex: CSCE 120)"}`}
        className={`pl-4 ${navbarMode ? "py-2" : "py-3 ml-5"} w-96 bg-gray-900 border border-gray-700 text-white rounded-full hover:bg-gray-800 transition duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400`}
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
        <p className="absolute -bottom-6 left-4 text-red-500 text-sm">
          ⚠️ Please enter a valid course
        </p>
      )}

      {/* Dropdown */}
      {dropdownOpen && matches.length > 0 && (
        <ul
          ref={resultsRef}
          className="absolute top-full left-0 z-10 w-full bg-background text-white rounded-md mt-2 shadow-lg max-h-60 overflow-y-auto"
        >
          {matches.map((courseName, index) => {
            const regex = new RegExp(`(${inputText})`, "gi");
            const parts = courseName.split(regex).filter((el) => el !== "");
            return (
              <li
                key={index}
                className={`px-4 py-2 cursor-pointer ${
                  index === activeIndex
                    ? "bg-blue-400"
                    : "hover:bg-gray-200 hover:text-black"
                }`}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(courseName)}
              >
                {parts.map((string, i) => (
                  <span
                    key={i}
                    className={
                      regex.test(string)
                        ? "font-extrabold text-yellow-400"
                        : "font-normal"
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

      {/* Search Button */}
      <button
        type="submit"
        className="ml-4 px-6 py-2 border border-purple-500 text-white rounded-full hover:bg-purple-600 transition duration-300"
      >
        Search
      </button>
    </form>
  );
}
