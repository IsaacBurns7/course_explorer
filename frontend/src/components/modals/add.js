"use client"

import { useState, useEffect, useRef } from "react"
import { getAllCourses } from "../../hooks/useAllCourses";
import axios from "axios"

export default function AddClassModal({ isOpen, onClose, onAdd, onAddSemester, semesters, showAlert }) {
   const [courses, setCourses] = useState(new Set());
  
      useEffect(() => {
      getAllCourses()
          .then(courseSet => {
          // use the Set however you want
           setCourses(prev => {
                      const newSet = prev;
                      courseSet.forEach((courseKey) => {
                          newSet.add(courseKey);
                      })
                      return newSet;
                  });
          })
          .catch(err => console.error("Failed to load courses", err));
      }, []);

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedSemester, setSelectedSemester] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [mode, setMode] = useState("class") // 'class' or 'semester'
  const [newSemesterTerm, setNewSemesterTerm] = useState("Spring")
  const [newSemesterYear, setNewSemesterYear] = useState(new Date().getFullYear())
  const courseCacheRef = useRef(new Map());
  if (!isOpen) return null

  const filteredCourses = Array.from(courses).filter(
    (course) =>

      course.toLowerCase().includes(searchTerm.toLowerCase()),
  ).slice(0, 50);

  // Generate years from current year to 10 years in the future
  const currentYear = new Date().getFullYear()
  const availableYears = Array.from({ length: 11 }, (_, i) => currentYear + i)

  const handleAddClass = () => {
    if (!selectedCourse) {
      showAlert("Please select a course to add.", "warning")
      return
    }

    if (!selectedSemester) {
      showAlert("Please select a semester to add the course to.", "warning")
      return
    }

    const courseAlreadyExists = semesters.some((semester) =>
    semester.courses.some(
      (course) =>
        course.department === selectedCourse.department &&
        course.number === selectedCourse.number
    )
  );

  if (courseAlreadyExists) {
    showAlert(
      `${selectedCourse.department} ${selectedCourse.number} has already been added to your planner.`,
      "error"
    );
    return;
  }
    onAdd(selectedCourse, selectedSemester)
    showAlert(
      `Successfully added ${selectedCourse.department} ${selectedCourse.number} to ${selectedSemester}!`,
      "success",
    )

    // Reset form but don't close modal
    setSelectedCourse(null)
    setSelectedSemester("")
    setSearchTerm("")
  }

  const handleAddSemester = () => {
    const newSemesterName = `${newSemesterTerm} ${newSemesterYear}`

    // Check if semester already exists
    const semesterExists = semesters.some((semester) => semester.name === newSemesterName)

    if (semesterExists) {
      showAlert(`${newSemesterName} already exists in your planner.`, "error")
      return
    }

    onAddSemester(newSemesterName)
    showAlert(`Successfully added ${newSemesterName} to your planner!`, "success")
  }

  const handleClose = () => {
    setSelectedCourse(null)
    setSelectedSemester("")
    setSearchTerm("")
    setMode("class")
    setNewSemesterTerm("Spring")
    setNewSemesterYear(currentYear)
    onClose()
  }


  
  const handleCourseSelect = async (courseString) => {
  try {
    const cache = courseCacheRef.current;
    if (cache.has(courseString)) {
      setSelectedCourse(cache.get(courseString));
    } else {
      console.log("NEW COURSE FOUND");
      const response = await axios.post("/server/api/planner/class", { class: courseString });
      setSelectedCourse(response.data);
      cache.set(courseString, response.data);
    }
  } catch (error) {
    console.error("Failed to fetch course info:", error);
    showAlert("Failed to load course information. Please try again.", "error");
  }
};
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 h-max">

      <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Add to Planner</h3>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-200 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex mb-6 bg-dark-input rounded-lg p-1">
          <button
            onClick={() => setMode("class")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              mode === "class" ? "bg-emerald-600 text-white" : "text-gray-300 hover:text-gray-100"
            }`}
          >
            Add Class
          </button>
          <button
            onClick={() => setMode("semester")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              mode === "semester" ? "bg-emerald-600 text-white" : "text-gray-300 hover:text-gray-100"
            }`}
          >
            Add Semester
          </button>
        </div>

        {mode === "class" ? (
          <>
            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 border border-dark-border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-dark-input text-gray-200"
              />
            </div>

            {/* Course Selection */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-200 mb-2">Select Course:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto border border-dark-border rounded p-2">
                {filteredCourses.map((course, index) => (
                  <button
                    key={index}
                    onClick={() => handleCourseSelect(course)}
                    className={`w-full text-left p-2 rounded transition ${
                      selectedCourse === course
                        ? "bg-dark-semester text-white border border-dark-border"
                        : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                    }`}
                  >
                    <div className="font-medium">
                      {course}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Semester Selection */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-200 mb-2">Select Semester:</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {semesters.map((semester) => (
                  <button
                    key={semester.name}
                    onClick={() => setSelectedSemester(semester.name)}
                    className={`w-full text-left p-2 rounded transition ${
                      selectedSemester === semester.name
                        ? "bg-emerald-600 text-white"
                        : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                    }`}
                  >
                    {semester.name}
                    <span className="text-sm text-gray-400 ml-2">({semester.courses.length} courses)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Course Preview */}
            {selectedCourse && (
              <div className="mb-4 p-3 bg-dark-input border border-dark-border rounded">
                <h5 className="font-medium text-gray-200 mb-2">Selected Course:</h5>
                <div className="text-sm text-gray-300">
                  <div>
                    <strong>
                      {selectedCourse.department} {selectedCourse.number}
                    </strong>{" "}
                    - {selectedCourse.title}
                  </div>
                  <div>{selectedCourse.hours} credit hours</div>
                  <div>Professors: {selectedCourse.professors.length}</div>
                </div>
              </div>
            )}

            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleAddClass}
                disabled={!selectedCourse || !selectedSemester}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Class
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Semester Creation */}
            <div className="space-y-4 mb-6">
              <div>
                <h4 className="text-md font-medium text-gray-200 mb-2">Select Term:</h4>
                <div className="grid grid-cols-3 gap-2">
                  {["Spring", "Summer", "Fall"].map((term) => (
                    <button
                      key={term}
                      onClick={() => setNewSemesterTerm(term)}
                      className={`p-2 rounded text-sm font-medium transition ${
                        newSemesterTerm === term
                          ? "bg-emerald-600 text-white"
                          : "bg-dark-input border border-dark-border hover:bg-dark-hover text-gray-200"
                      }`}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-200 mb-2">Select Year:</h4>
                <select
                  value={newSemesterYear}
                  onChange={(e) => setNewSemesterYear(Number.parseInt(e.target.value))}
                  className="w-full p-2 border border-dark-border rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-dark-input text-gray-200"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-dark-input border border-dark-border rounded">
                <h5 className="font-medium text-gray-200 mb-1">New Semester:</h5>
                <div className="text-lg text-emerald-400 font-medium">
                  {newSemesterTerm} {newSemesterYear}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={handleAddSemester}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition"
              >
                Add Semester
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
