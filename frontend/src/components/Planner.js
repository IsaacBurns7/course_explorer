"use client"
import React from "react"
import { useState, useEffect } from "react"
import DeleteConfirmModal from "./modals/delete"
import MoveClassModal from "./modals/move"
import AddClassModal from "./modals/add"
import ClearConfirmModal from './modals/clear'
import Alert from "./ui/alert"

export default function PlannerDisplay({ planner, onUpdatePlanner, handleBackToLanding }) {
  const [openSemesters, setOpenSemesters] = useState({})
  const [openCourses, setOpenCourses] = useState({})
  const [collapsedSemesters, setCollapsedSemesters] = useState({}) // Track collapsed semesters in table view
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null) // Track which course to delete
  const [showMoveModal, setShowMoveModal] = useState(null) // Track which course to move
  const [showAddModal, setShowAddModal] = useState(false) // Track add class modal
  const [showClearModal, setShowClearModal] = useState(false)
  const [alert, setAlert] = useState({ message: "", type: "info", isVisible: false })
  const [selectedSemester, setSelectedSemester] = useState(null)
  const [showDeleteSemesterConfirm, setShowDeleteSemesterConfirm] = useState(null)
  const [profSortOption, setProfSortOption] = useState("Name"); // NEW: sorting option

  
  // Group semesters by year and sort chronologically
  const plannerData = {}
  const sortedSemesters = []

  for (const key of Object.keys(planner)) {
    const year = key.split(" ")[1]
    if (!plannerData[year]) plannerData[year] = []
    plannerData[year].push({ name: key, courses: planner[key] })
    sortedSemesters.push({ name: key, courses: planner[key], year })
  }

  // Sort semesters chronologically
  sortedSemesters.sort((a, b) => {
    const yearA = Number.parseInt(a.year)
    const yearB = Number.parseInt(b.year)
    if (yearA !== yearB) return yearA - yearB
    const seasonOrder = { Fall: 3, Spring: 1, Summer: 2 }
    const seasonA = a.name.split(" ")[0]
    const seasonB = b.name.split(" ")[0]
    return seasonOrder[seasonA] - seasonOrder[seasonB]
  })

  // Initialize collapsed state based on whether semester has passed
  useEffect(() => {
    const initialCollapsedState = {}
    sortedSemesters.forEach((semester) => {
      initialCollapsedState[semester.name] = hasSemesterPassed(semester.name)
    })
    setCollapsedSemesters(initialCollapsedState)
  }, [planner])

  // Handle professor selection - Now updates the planner object directly
  const handleProfessorSelect = (semesterName, courseIndex, professorIndex) => {
    const updatedPlanner = { ...planner }
    const semesterCourses = updatedPlanner[semesterName]
    if (semesterCourses && semesterCourses[courseIndex]) {
      semesterCourses[courseIndex].selectedProf = professorIndex
    }
    onUpdatePlanner(updatedPlanner)
  }

  // Get selected professor for a course - Reads directly from the course object
  const getSelectedProfessor = (course) => {
    const selectedIndex = course.selectedProf
    if (selectedIndex !== undefined && course.professors && course.professors[selectedIndex]) {
      return course.professors[selectedIndex]
    }
    return null
  }

  const sortProfessors = (professors) => {
    if (!professors) return [];
    const sorted = [...professors];
    switch (profSortOption) {
      case "GPA":
        return sorted.sort((a, b) => (b.info.averageGPA ?? 0) - (a.info.averageGPA ?? 0));
      case "Rating":
        return sorted.sort((a, b) => (b.info.averageRating ?? 0) - (a.info.averageRating ?? 0));
      default: // Name
        return sorted.sort((a, b) => a.info.name.localeCompare(b.info.name));
    }
  };


  // Toggle semester collapse in table view
  const toggleSemesterCollapse = (semesterName) => {
    setCollapsedSemesters((prev) => ({
      ...prev,
      [semesterName]: !prev[semesterName],
    }))
  }

  // Handle delete class with confirmation
  const handleDeleteClass = (semesterName, courseIndex) => {
    const updatedPlanner = { ...planner }
    // Delete the course and its selected professor property
    updatedPlanner[semesterName].splice(courseIndex, 1)
    onUpdatePlanner(updatedPlanner)
    setShowDeleteConfirm(null)
  }

  // Handle move class to different semester
  const handleMoveClass = (fromSemester, courseIndex, toSemester) => {
    const updatedPlanner = { ...planner }
    const courseToMove = updatedPlanner[fromSemester][courseIndex]

    // Remove from original semester
    updatedPlanner[fromSemester].splice(courseIndex, 1)

    // Add to new semester
    if (!updatedPlanner[toSemester]) {
      updatedPlanner[toSemester] = []
    }
    updatedPlanner[toSemester].push(courseToMove)

    onUpdatePlanner(updatedPlanner)
    setShowMoveModal(null)
  }

  const handleDeleteSemester = (semesterName) => {
    const updatedPlanner = { ...planner }
    delete updatedPlanner[semesterName]
    onUpdatePlanner(updatedPlanner)
    setShowDeleteSemesterConfirm(null)
  }

  // Handle add class to semester
  const handleAddClass = (course, targetSemester) => {
    const updatedPlanner = { ...planner }

    if (!updatedPlanner[targetSemester]) {
      updatedPlanner[targetSemester] = []
    }

    updatedPlanner[targetSemester].push(course)
    onUpdatePlanner(updatedPlanner)
  }

  // Handle add semester
  const handleAddSemester = (semesterName) => {
    const updatedPlanner = { ...planner }
    if (!updatedPlanner[semesterName]) {
      updatedPlanner[semesterName] = []
    }
    onUpdatePlanner(updatedPlanner)
  }

  // Show alert function
  const showAlert = (message, type = "info") => {
    setAlert({ message, type, isVisible: true })
  }

  // Close alert function
  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }))
  }

  const hasSemesterPassed = (name) => {
    const split = name.split(" ")
    const term = split[0]
    const year = split[1]
    const semesterOrder = { Spring: 1, Summer: 2, Fall: 3 }
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() // 0-based: Jan = 0, Dec = 11
    let currentSemester
    if (currentMonth < 5) currentSemester = "Spring"
    else if (currentMonth < 8) currentSemester = "Summer"
    else currentSemester = "Fall"
    if (year < currentYear) return true
    if (year > currentYear) return false
    return semesterOrder[term] < semesterOrder[currentSemester]
  }

  // Get course name for modals
  const getCourseInfo = (courseKey) => {
    const [semesterName, courseIndex] = courseKey.split("_")
    const semester = sortedSemesters.find((s) => s.name === semesterName)
    if (semester && semester.courses[Number.parseInt(courseIndex)]) {
      const course = semester.courses[Number.parseInt(courseIndex)]
      return {
        name: `${course.department} ${course.number}`,
        semester: semesterName,
        index: Number.parseInt(courseIndex),
      }
    }
    return null
  }

  return (
    <div className="">
      {/* Alert Component */}
      <Alert message={alert.message} type={alert.type} isVisible={alert.isVisible} onClose={closeAlert} />
      {/* View Toggle and Add Button */}
      <div className="flex items-center justify-between pb-6">
  <h2 className="text-2xl font-bold text-gray-100">Academic Plan</h2>

  {/* Grouped buttons */}
  <div className="flex items-center space-x-3">
<select
      className="px-4 py-2 bg-dark-input border border-dark-border rounded text-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-200"
      value={profSortOption}
      onChange={(e) => setProfSortOption(e.target.value)}
    >
      <option value="Name">Sort Professors by Name</option>
      <option value="GPA">Sort Professors by GPA</option>
      <option value="Rating">Sort Professors by Rating</option>
    </select>
    <button
      onClick={() => { setSelectedSemester(null); setShowAddModal(true); }}
      className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition flex items-center space-x-2"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </svg>
      <span>Add Class/Semester</span>
    </button>

  
  </div>
</div>

      <div className="bg-dark-card rounded-lg overflow-hidden shadow-lg border border-dark-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <thead>
              <tr className="bg-dark-header border-b-2 border-dark-border">
                <th className="text-left p-3 font-semibold text-gray-100 w-1/12">Course</th>
                <th className="text-left p-3 font-semibold text-gray-100 w-3/12">Title</th>
                <th className="text-center p-3 font-semibold text-gray-100 w-1/12">Hr</th>
                <th className="text-left p-3 font-semibold text-gray-100 w-6/12">Professor</th>
                <th className="text-center p-3 font-semibold text-gray-100 w-1/12">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedSemesters.map((semester, semesterIndex) => (
                <React.Fragment key={semester.name}>
                  {/* Semester Header Row - Now clickable with arrow */}
                  <tr
                    className={`border-t-2 border-dark-accent ${collapsedSemesters[semester.name] ? "bg-dark-semester-closed" : "bg-dark-semester"}`}
                  >
                    <td colSpan={5} className="p-0">
                      <button
                        onClick={() => toggleSemesterCollapse(semester.name)}
                        className="w-full text-left p-3 font-bold text-gray-100 text-base hover:bg-dark-hover transition-colors duration-200 flex items-center justify-between"
                      >
                        <span className="flex justify-between w-full">
                          <span>{semester.name}</span>
                          {hasSemesterPassed(semester.name) && (
                            <span className="text-gray-400 mr-5">(Already Taken)</span>
                          )}
                        </span>

                        <span className="ml-auto flex gap-x-4">
                          <button
                            onClick={(e) => { e.stopPropagation();setShowDeleteSemesterConfirm(semester.name)}}
                            className="text-red-300 hover:text-red-100 transition text-lg"
                            title="Delete Semester"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                              <path d="M3 6h18" />
                              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>

                          <button
                            onClick={(e) => {e.stopPropagation(); setSelectedSemester(semester.name); setShowAddModal(true);}}
                            className="text-green-300 hover:text-green-100 transition text-lg"
                            title="Add Class"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 5v14" />
                              <path d="M5 12h14" />
                            </svg>
                          </button>
                        </span>
                        <svg
                          className={`w-5 h-5 transition-transform duration-200 ml-5 ${
                            collapsedSemesters[semester.name] ? "rotate-0" : "rotate-90"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  {/* Course Rows - Only show if not collapsed */}
                  {!collapsedSemesters[semester.name] &&
                    semester.courses.map((course, courseIndex) => {
                      const courseKey = `${semester.name}_${courseIndex}`
                      const selectedProf = getSelectedProfessor(course)
                      const profLabel = selectedProf?.info?.warning
                      return (
                        <tr key={courseIndex} className="border-b border-dark-border hover:bg-dark-hover">
                          <td className="p-3">
                            <span className="font-medium text-gray-200">
                              <a
                                href={`/dashboard?dept=${course.department}&courseNumber=${course.number}`}
                                target="_blank"
                                className="hover:underline hover:text-blue-400"
                                rel="noreferrer"
                              >
                                {course.department} {course.number}
                              </a>
                            </span>
                          </td>
                          <td className="p-3 text-gray-300">
                            <a
                              href={`/dashboard?dept=${course.department}&courseNumber=${course.number}`}
                              target="_blank"
                              className="hover:underline hover:text-blue-400"
                              rel="noreferrer"
                            >
                              {course.title}
                            </a>
                          </td>
                          <td className="p-3 text-center text-gray-300">{course.hours}</td>
                          <td className="p-3">
                            {hasSemesterPassed(semester.name) ? (
                              <span className="text-gray-400">Already Taken</span>
                            ) : course.professors && course.professors.length > 0 ? (
                              <div className="space-y-2">
                                {selectedProf ? (
                                  // Show selected professor with change button
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-200 mb-1">
                                        <a
                                          href="/"
                                          className="hover:underline hover:text-blue-400"
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          {selectedProf.info.name}
                                          {"   "}
                                        </a>
                                      </div>
                                      <div className="flex space-x-2">
                                        <span className="bg-blue-dark text-blue-light px-2 py-1 rounded text-xs">
                                          GPA: {selectedProf.info.averageGPA}
                                        </span>
                                        <span className="bg-yellow-dark text-yellow-light px-2 py-1 rounded text-xs">
                                          Overall Rating: {selectedProf.info.averageRating}
                                        </span>
                                        <span className="bg-green-dark text-green-light px-2 py-1 rounded text-xs">
                                          Class Rating:{" "}
                                          {selectedProf.info.courseRating ?? "N/A"}
                                        </span>
                                        <span className="bg-purple-dark text-purple-light px-2 py-1 rounded text-xs">
                                          {selectedProf.info.site ?? "Unknown"}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end space-y-1 mt-2">
                                      {typeof profLabel === "string" && profLabel.trim() !== "" && (
                                        <button
                                          onClick={() => handleProfessorSelect(semester.name, courseIndex, undefined)}
                                          className="bg-red-dark text-red-light px-2 py-1 rounded text-xs hover:brightness-110 transition text-right"
                                        >
                                          {profLabel}
                                        </button>
                                      )}
                                      <button
                                        onClick={() => handleProfessorSelect(semester.name, courseIndex, undefined)}
                                        className="text-blue-400 hover:text-blue-300 underline text-xs"
                                      >
                                        Change Professor
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  // Show dropdown for selection
                                  <select
                                  className="w-full p-2 border border-dark-border rounded-md text-sm focus:ring-1 focus:ring-gray-200 focus:border-gray-200 bg-dark-input text-gray-200"
                                  value={course.selectedProf ?? ""}
                                  onChange={(e) =>
                                    handleProfessorSelect(semester.name, courseIndex, Number.parseInt(e.target.value))
                                  }
                                >
                                  <option value="">Select Professor</option>
                                  {sortProfessors(course.professors).map((prof, profIndex) => (
                                    <option key={profIndex} value={course.professors.indexOf(prof)}>
                                      {prof.info.name} | GPA: {prof.info.averageGPA} | Rating: {prof.info.averageRating}
                                    </option>
                                  ))}
                                </select>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-400">No professors available</span>
                            )}
                          </td>
                          <td className="p-3 align-middle text-right">
                            <div className="flex justify-center items-center space-x-2 h-full">
                              {/* Move Button */}
                              <button
                                onClick={() => setShowMoveModal(courseKey)}
                                className="text-blue-300 hover:text-blue-100 transition text-lg"
                                title="Move Class"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 8L22 12L18 16" />
                                  <path d="M2 12H22" />
                                  <path d="M6 8L2 12L6 16" />
                                </svg>
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => setShowDeleteConfirm(courseKey)}
                                className="text-red-300 hover:text-red-100 transition text-lg"
                                title="Delete Class"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  {/* Semester Total Row - Only show if not collapsed */}
                  {!collapsedSemesters[semester.name] && (
  <>
   <tr className="bg-dark-header border-b-2 border-dark-accent">
  <td className="p-3 font-semibold text-gray-100" colSpan={2}>
    Total Credit Hours:
  </td>

  <td className="p-3 text-center font-semibold text-gray-100">
    {semester.courses.reduce((sum, course) => sum + course.hours, 0)}
  </td>

  <td className="p-3 text-left text-yellow-200 text-xs" colSpan={2}>
  {semester.courses.reduce((sum, course) => sum + course.hours, 0) > 19 && (
    <span className="bg-yellow-900 px-3 py-1 rounded">
      This semester exceeds the typical 19 credit hour limit. Advisor approval may be required.
    </span>
  )}
</td>

</tr>
    
  </>
)}
                </React.Fragment>
              ))}
              {/* Grand Total Row */}
              <tr className="bg-dark-header">
                <td className="p-4 font-bold text-gray-100 text-lg" colSpan={2}>
                  Total Program Credit Hours:
                </td>
                <td className="p-4 text-center font-bold text-gray-100 text-lg">
                  {sortedSemesters.reduce(
                    (total, semester) => total + semester.courses.reduce((sum, course) => sum + course.hours, 0),
                    0,
                  )}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end py-4">
  <button
    onClick={() => { setSelectedSemester(null); setShowClearModal(true); }}
    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition flex items-center space-x-2 shadow-md"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
    <span>Clear Planner</span>
  </button>
</div>
      {/* Modals */}
      <DeleteConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        onConfirm={() => {
          const courseInfo = getCourseInfo(showDeleteConfirm)
          if (courseInfo) {
            handleDeleteClass(courseInfo.semester, courseInfo.index)
          }
        }}
        courseName={showDeleteConfirm ? getCourseInfo(showDeleteConfirm)?.name : undefined}
      />

      <DeleteConfirmModal
  isOpen={showDeleteSemesterConfirm}
  onClose={() => setShowDeleteSemesterConfirm(null)}
  onConfirm={() => handleDeleteSemester(showDeleteSemesterConfirm)}
  courseName={showDeleteSemesterConfirm}
  semesterCourses={
    showDeleteSemesterConfirm
      ? planner[showDeleteSemesterConfirm]?.map(c => `${c.department} ${c.number}`) ?? []
      : []
  }
/>


      <MoveClassModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(null)}
        onMove={(targetSemester) => {
          const courseInfo = getCourseInfo(showMoveModal)
          if (courseInfo) {
            handleMoveClass(courseInfo.semester, courseInfo.index, targetSemester)
          }
        }}
        semesters={sortedSemesters}
        currentSemester={showMoveModal ? getCourseInfo(showMoveModal)?.semester : ""}
        courseName={showMoveModal ? getCourseInfo(showMoveModal)?.name : undefined}
      />

      <AddClassModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddClass}
        onAddSemester={handleAddSemester}
        semesters={sortedSemesters}
        showAlert={showAlert}
        currentSemester={selectedSemester}
      />
      <ClearConfirmModal
          isOpen={showClearModal}
          onClose={() => setShowClearModal(false)}
          onConfirm={() => handleBackToLanding()}
      />
    </div>
  )
}
