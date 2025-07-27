"use client"

import React from "react"

import { useState } from "react"

export default function PlannerDisplay({ planner }) {
  const [viewMode, setViewMode] = useState("table") // 'table' or 'detailed'
  const [selectedYear, setSelectedYear] = useState(null)
  const [openSemesters, setOpenSemesters] = useState({})
  const [openCourses, setOpenCourses] = useState({})
  const [selectedProfessors, setSelectedProfessors] = useState({}) // Track selected professors 

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

  // Handle professor selection
  const handleProfessorSelect = (semesterName, courseIndex, professorIndex) => {
    const courseKey = `${semesterName}_${courseIndex}`
    setSelectedProfessors((prev) => ({
      ...prev,
      [courseKey]: professorIndex,
    }))
  }

  // Get selected professor for a course
  const getSelectedProfessor = (semesterName, courseIndex, course) => {
    const courseKey = `${semesterName}_${courseIndex}`
    const selectedIndex = selectedProfessors[courseKey]
    if (selectedIndex !== undefined && course.professors && course.professors[selectedIndex]) {
      return course.professors[selectedIndex]
    }
    return null
  }

  // Toggle functions for detailed view
  const toggleSemester = (semesterName) => {
    setOpenSemesters((prev) => ({
      ...prev,
      [semesterName]: !prev[semesterName],
    }))
  }

  const toggleCourse = (semesterName, index) => {
    const courseKey = `${semesterName}_${index}`
    setOpenCourses((prev) => ({
      ...prev,
      [courseKey]: !prev[courseKey],
    }))
  }

  const getGridCols = (semesterCount) => {
    if (semesterCount === 1) return "grid-cols-1"
    if (semesterCount === 2) return "grid-cols-1 lg:grid-cols-2"
    return "grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
  }

  const hasSemesterPassed = (name) => {
    const split = name.split(" ")
    const term = split[0]
    const year = split[1]
    const semesterOrder = { "Spring": 1, "Summer": 2, "Fall": 3 };
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 0-based: Jan = 0, Dec = 11

    let currentSemester;
    if (currentMonth < 5) currentSemester = "Spring";
    else if (currentMonth < 8) currentSemester = "Summer";
    else currentSemester = "Fall";

    if (year < currentYear) return true;
    if (year > currentYear) return false;

    return semesterOrder[term] < semesterOrder[currentSemester];
  }

  console.log(sortedSemesters)
  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-100">Academic Plan</h2>
        
      </div>

        {/* Table View - Compact layout with professor dropdowns */}
        <div className="bg-white rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="text-left p-3 font-semibold text-gray-800">Course</th>
                  <th className="text-left p-3 font-semibold text-gray-800">Title</th>
                  <th className="text-center p-3 font-semibold text-gray-800">Hr</th>
                  <th className="text-left p-3 font-semibold text-gray-800 min-w-[300px]">Professor</th>
                </tr>
              </thead>
              <tbody>
                {sortedSemesters.map((semester, semesterIndex) => (
                  <React.Fragment key={semester.name}>
                    {/* Semester Header Row */}
                    <tr className="bg-gray-50 border-t-2 border-gray-400">
                      <td colSpan={5} className="p-3 font-bold text-gray-800 text-base">
                        {semester.name}
                      </td>
                    </tr>
                    {/* Course Rows */}
                    {semester.courses.map((course, courseIndex) => {
                      const courseKey = `${semester.name}_${courseIndex}`
                      const selectedProf = getSelectedProfessor(semester.name, courseIndex, course)

                      return (
                        <tr key={courseIndex} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="p-3">
                            <span className="font-medium text-gray-800">
                              <a href = {`/dashboard?dept=${course.department}&courseNumber=${course.number}`} target="_blank" className = "hover:underline">{course.department} {course.number}</a>
                            </span>
                          </td>
                          <td className="p-3 text-gray-700">
                            <a href = {`/dashboard?dept=${course.department}&courseNumber=${course.number}`} target="_blank" className = "hover:underline">{course.title}</a>
                          </td>
                          <td className="p-3 text-center text-gray-700">{course.hours}</td>
                          <td className="p-3">
                            
                            {hasSemesterPassed(semester.name) ? (
    <span className="text-gray-500">Already Taken</span>
  ) : course.professors && course.professors.length > 0 ? (
                              <div className="space-y-2">
                                <select
                                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                  value={selectedProfessors[courseKey] ?? ""}
                                  onChange={(e) =>
                                    handleProfessorSelect(semester.name, courseIndex, Number.parseInt(e.target.value))
                                  }
                                >
                                  <option value="">Select Professor</option>
                                  {course.professors.map((prof, profIndex) => (
                                    <option key={profIndex} value={profIndex}>
                                      {prof.info.name} - GPA: {prof.info.averageGPA.toFixed(2)}, Rating:{" "}
                                      {prof.info.averageRating.toFixed(1)}
                                    </option>
                                  ))}
                                </select>
                                {selectedProf && (
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex space-x-3">
                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                        GPA: {selectedProf.info.averageGPA.toFixed(2)}
                                      </span>
                                      <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                        Rating: {selectedProf.info.averageRating.toFixed(1)}
                                      </span>
                                    </div>
                                    <a
                                      href="/"
                                      className="text-gray-600 hover:text-gray-800 underline"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      View Profile
                                    </a>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500">No professors available</span>
                            )}
                          </td>
                    
                        </tr>
                      )
                    })}
                    {/* Semester Total Row */}
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <td className="p-3 font-semibold text-gray-800" colSpan={2}>
                        Total Credit Hours:
                      </td>
                      <td className="p-3 text-center font-semibold text-gray-800">
                        {semester.courses.reduce((sum, course) => sum + course.hours, 0)}
                      </td>
                      <td colSpan={2}></td>
                    </tr>
                  </React.Fragment>
                ))}
                {/* Grand Total Row */}
                <tr className="bg-emerald-100 border-t-4 border-emerald-500">
                  <td className="p-4 font-bold text-emerald-800 text-lg" colSpan={2}>
                    Total Program Credit Hours:
                  </td>
                  <td className="p-4 text-center font-bold text-emerald-800 text-lg">
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
      </div>
  )
}
