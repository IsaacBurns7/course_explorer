"use client"

import { useEffect, useState, useRef } from "react"
import { Search, ChevronRight, X } from "lucide-react"
import { getAllCourses } from "../../hooks/useAllCourses"

export default function ClassSelector({ onClassesSelected }) {
  const [courses, setCourses] = useState(new Set())
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState([])
  const [selected, setSelected] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const inputRef = useRef(null)
  const resultsRef = useRef(null)

  // Fetch all courses once
  useEffect(() => {
    setLoading(true)
    getAllCourses()
      .then(courseSet => {
        if (courseSet && courseSet.forEach) setCourses(new Set(courseSet))
      })
      .catch(err => console.error("Failed to load courses", err))
      .finally(() => setLoading(false))
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Helper: find matches
  function findMatches(wordToMatch, array) {
    const regex = new RegExp(wordToMatch, "gi")
    return array.filter((element) => regex.test(element))
  }

  // Handle query typing
  function handleChange(e) {
    const value = e.target.value
    setQuery(value)

    if (!value.trim()) {
      setMatches([])
      setDropdownOpen(false)
      return
    }

    const matchArray = findMatches(value, Array.from(courses)).slice(0, 10)
    setMatches(matchArray)
    setDropdownOpen(matchArray.length > 0)
  }

  // Handle selecting a course
  function handleSelect(courseName) {
    const formatted = courseName.replace(" ", "_")
    if (!selected.includes(formatted)) {
      setSelected([...selected, formatted])
    }
    setQuery("")
    setMatches([])
    setDropdownOpen(false)
    setActiveIndex(-1)
  }

  // Keyboard navigation
  function handleKeyDown(e) {
    if (matches.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))
    }
    if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))
    }
    if (e.key === "Enter") {
      e.preventDefault()
      if (activeIndex >= 0) {
        handleSelect(matches[activeIndex])
      }
    }
    if (e.key === "Escape") {
      setActiveIndex(-1)
      setDropdownOpen(false)
    }
  }

  // Remove a selected course
  const removeCourse = (course) => {
    setSelected(selected.filter((c) => c !== course))
  }

  // Confirm selected classes
  const handleStart = () => {
    if (selected.length > 0) onClassesSelected(selected)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Schedule Builder</h1>
          <p className="text-lg text-gray-600">Search and select your courses for Spring 2026</p>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Add Courses</h2>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Search for a course (e.g. CSCE 221)..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />

            {/* Dropdown */}
            {dropdownOpen && matches.length > 0 && (
              <div
                ref={resultsRef}
                className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {matches.map((course, index) => (
                  <button
                    key={course}
                    onClick={() => handleSelect(course)}
                    className={`w-full text-left px-4 py-2 ${
                      index === activeIndex ? "bg-blue-100" : "hover:bg-blue-50"
                    } text-gray-800`}
                  >
                    {course.replace("_", " ")}
                  </button>
                ))}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="absolute right-3 top-3 text-gray-400 text-sm">...</div>
            )}
          </div>

          {/* Selected Courses */}
          {selected.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selected.map((course) => (
                <span
                  key={course}
                  className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {course.replace("_", " ")}
                  <button onClick={() => removeCourse(course)}>
                    <X className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={selected.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              selected.length > 0
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            View Schedules <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
