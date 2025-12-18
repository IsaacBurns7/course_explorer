"use client"

import { useState, useEffect } from "react"
import { Award } from "lucide-react"
import SchedulerFilters from "./scheduler-filters"

export default function Scheduler({ selectedClasses, onBack }) {
  const [schedules, setSchedules] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filteredClasses, setFilteredClasses] = useState(selectedClasses)

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        setLoading(true)
        const res = await fetch(`/server/api/planner2/optimalSchedule`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courses: selectedClasses,
            semester: "Spring 2026",
          }),
        })
        if (!res.ok) throw new Error(`HTTP error ${res.status}`)
        const responseData = await res.json()
        setSchedules(responseData.schedules || [])
      } catch (err) {
        console.error("Failed to load schedule:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchScheduleData()
  }, [selectedClasses])

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setSelectedSchedule((prev) => Math.max(0, prev - 1))
      } else if (e.key === "ArrowRight") {
        setSelectedSchedule((prev) => Math.min(schedules.length - 1, prev + 1))
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [schedules.length])

  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const getCourseColors = (courseId, idx) => {
    const colors = [
      { bg: "bg-blue-500", text: "text-blue-900", light: "bg-blue-100" },
      { bg: "bg-green-500", text: "text-green-900", light: "bg-green-100" },
      { bg: "bg-purple-500", text: "text-purple-900", light: "bg-purple-100" },
      { bg: "bg-orange-500", text: "text-orange-900", light: "bg-orange-100" },
      { bg: "bg-pink-500", text: "text-pink-900", light: "bg-pink-100" },
      { bg: "bg-indigo-500", text: "text-indigo-900", light: "bg-indigo-100" },
    ]
    return colors[idx % colors.length]
  }

  const buildScheduleData = (schedule) => {
    const dayMap = {
      M: "Monday",
      T: "Tuesday",
      W: "Wednesday",
      R: "Thursday",
      F: "Friday",
    }
    const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

    let earliestTime = 24 * 60
    let latestTime = 0

    const daySchedules = {}
    dayOrder.forEach((day) => {
      daySchedules[day] = { name: day, events: [] }
    })

    schedule.forEach((course, idx) => {
      const colors = getCourseColors(course.course_id, idx)

      course.schedule.forEach((slot) => {
        const dayName = dayMap[slot.day]
        const startMin = timeToMinutes(slot.start)
        const endMin = timeToMinutes(slot.end)

        if (startMin < earliestTime) earliestTime = startMin
        if (endMin > latestTime) latestTime = endMin

        if (dayName) {
          daySchedules[dayName].events.push({
            startTime: startMin,
            endTime: endMin,
            startTimeStr: slot.start,
            endTimeStr: slot.end,
            title: course.course_id.replace("_", " "),
            section: course.section_id,
            professor: course.professor_id,
            colors: colors,
          })
        }
      })
    })

    const startHour = Math.max(7, Math.floor(earliestTime / 60) - 1)
    const endHour = Math.min(22, Math.ceil(latestTime / 60) + 1)

    return {
      days: dayOrder.map((day) => daySchedules[day]),
      startHour,
      endHour,
      courseList: schedule,
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedules...</p>
        </div>
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">No schedules found</p>
        </div>
      </div>
    )
  }

  const currentSchedule = schedules[selectedSchedule]
  const { days, startHour, endHour, courseList } = buildScheduleData(currentSchedule.schedule)

  const hours = []
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h)
  }

  const HOUR_HEIGHT = 48

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Course Schedules</h1>
            <p className="text-sm text-gray-600">Spring 2026 • {schedules.length} options available</p>
          </div>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Schedule Selector */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Award className="w-5 h-5 text-blue-600" />
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  Schedule Option {selectedSchedule + 1} of {schedules.length}
                </h2>
                <p className="text-sm text-gray-600">
                  Score: <span className="font-medium text-blue-600">{currentSchedule.total_score.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">Use ← → keys</span>
              <button
                onClick={() => setSelectedSchedule(Math.max(0, selectedSchedule - 1))}
                disabled={selectedSchedule === 0}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setSelectedSchedule(Math.min(schedules.length - 1, selectedSchedule + 1))}
                disabled={selectedSchedule === schedules.length - 1}
                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Schedule Grid */}
          <div className="flex-1 bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full">
                {/* Day Headers */}
                <div className="grid grid-cols-6 border-b-2 border-gray-300 bg-gray-50">
                  <div className="p-2 border-r border-gray-200"></div>
                  {days.map((day) => (
                    <div
                      key={day.name}
                      className="p-2 text-center text-sm font-semibold text-gray-900 border-r border-gray-200 last:border-r-0"
                    >
                      {day.name.substring(0, 3)}
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="relative">
                  <div className="grid grid-cols-6">
                    {/* Time Column */}
                    <div className="border-r border-gray-200">
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-b border-gray-100 text-right pr-2 py-1 text-xs text-gray-500"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        >
                          {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? "PM" : "AM"}
                        </div>
                      ))}
                    </div>

                    {/* Day Columns */}
                    {days.map((day) => (
                      <div key={day.name} className="relative border-r border-gray-200 last:border-r-0">
                        {hours.map((hour) => (
                          <div
                            key={hour}
                            className="border-b border-gray-100"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                          ></div>
                        ))}

                        {day.events
                          .filter((event) => filteredClasses.includes(event.title.replace(" ", "_")))
                          .map((event, idx) => {
                            const topOffset = ((event.startTime - startHour * 60) / 60) * HOUR_HEIGHT
                            const height = ((event.endTime - event.startTime) / 60) * HOUR_HEIGHT

                            return (
                              <div
                                key={idx}
                                className={`absolute left-0.5 right-0.5 ${event.colors.bg} text-white rounded p-1.5 shadow-md overflow-hidden`}
                                style={{
                                  top: `${topOffset}px`,
                                  height: `${height}px`,
                                }}
                              >
                                <div className="text-xs font-bold leading-tight">{event.title}</div>
                                <div className="text-xs opacity-90 mt-0.5">{event.startTimeStr}</div>
                                {height > 40 && <div className="text-xs opacity-75">Sec {event.section}</div>}
                              </div>
                            )
                          })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Course Legend */}
            <div className="bg-gray-50 border-t border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Courses</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {courseList.map((course, idx) => {
                  const colors = getCourseColors(course.course_id, idx)
                  return (
                    <div key={idx} className={`flex items-start gap-2 p-3 ${colors.light} rounded-lg`}>
                      <div className={`w-3 h-3 ${colors.bg} rounded mt-0.5`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {course.course_id.replace("_", " ")}
                        </h4>
                        <p className="text-xs text-gray-600">Section: {course.section_id}</p>
                        <p className = "text-xs text-gray-600">CRN: {course.crn}</p> 
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="w-80">
            <SchedulerFilters
              selectedClasses={selectedClasses}
              filteredClasses={filteredClasses}
              onFilterChange={setFilteredClasses}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
