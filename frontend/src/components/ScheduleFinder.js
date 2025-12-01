"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Search,
  Clock,
  Calendar,
  Settings,
  Star,
  TrendingUp,
  Filter,
  ChevronLeft,
  ChevronRight,
  Award,
} from "lucide-react"

export default function ScheduleFinder({ selectedClasses, planner, onBack }) {
  const [preferences, setPreferences] = useState({
    ratingWeight: 0.5,
    gpaWeight: 0.5,
    classPriority: 50,
  })

  const [filters, setFilters] = useState({
    noClassesBefore: false,
    noClassesAfter: false,
    preferMWF: false,
    minimizeGaps: false,
  })

  const [schedules, setSchedules] = useState([])
  const [selectedSchedule, setSelectedSchedule] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filteredClasses, setFilteredClasses] = useState(selectedClasses)
  const [scheduleStats, setScheduleStats] = useState(null)

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const HOUR_HEIGHT = 60

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") setSelectedSchedule((p) => Math.max(0, p - 1))
      else if (e.key === "ArrowRight")
        setSelectedSchedule((p) => Math.min(schedules.length - 1, p + 1))
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [schedules.length])

  const handlePreferenceChange = (key, value) =>
    setPreferences((p) => ({ ...p, [key]: parseFloat(value) }))

  const handleFilterToggle = (key) =>
    setFilters((p) => ({ ...p, [key]: !p[key] }))

  const getCourseColors = (idx) => {
    const colors = [
      { bg: "bg-blue-600", light: "bg-blue-900/20" },
      { bg: "bg-green-600", light: "bg-green-900/20" },
      { bg: "bg-purple-600", light: "bg-purple-900/20" },
      { bg: "bg-orange-600", light: "bg-orange-900/20" },
      { bg: "bg-pink-600", light: "bg-pink-900/20" },
      { bg: "bg-indigo-600", light: "bg-indigo-900/20" },
    ]
    return colors[idx % colors.length]
  }

  const timeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(" ")
    let [hours, minutes] = time.split(":").map(Number)
    if (period === "PM" && hours !== 12) hours += 12
    if (period === "AM" && hours === 12) hours = 0
    return hours * 60 + minutes
  }

  const buildScheduleData = (schedule) => {
    const dayMap = { M: "Monday", T: "Tuesday", W: "Wednesday", R: "Thursday", F: "Friday" }
    const dayOrder = days
    let earliestTime = 24 * 60
    let latestTime = 0
    const daySchedules = {}
    dayOrder.forEach((d) => (daySchedules[d] = []))

    schedule.forEach((course, idx) => {
      const colors = getCourseColors(idx)
      course.schedule.forEach((slot) => {
        const dayName = dayMap[slot.day]
        const startMin = timeToMinutes(slot.start)
        const endMin = timeToMinutes(slot.end)
        if (startMin < earliestTime) earliestTime = startMin
        if (endMin > latestTime) latestTime = endMin
        if (dayName) {
          daySchedules[dayName].push({
            startTime: startMin,
            endTime: endMin,
            startTimeStr: slot.start,
            endTimeStr: slot.end,
            title: course.course_id.replace("_", " "),
            section: course.section_id,
            professor: course.professor_id,
            colors,
          })
        }
      })
    })
    const startHour = Math.max(7, Math.floor(earliestTime / 60) - 1)
    const endHour = Math.min(22, Math.ceil(latestTime / 60) + 1)
    return { daySchedules, startHour, endHour }
  }

  const generateSchedule = async () => {
    setLoading(true)
    try {

      const storedItem = localStorage.getItem('academicPlanner');
      console.log(typeof storedItem)
      console.log(storedItem["Spring 2026"])
      let coursesList = []; 
      
      if (storedItem && JSON.parse(storedItem) && JSON.parse(storedItem)["Spring 2026"]) {
        coursesList = JSON.parse(storedItem)["Spring 2026"].map(x => `${x.department}_${x.number}`)
        console.log(coursesList)
      }

      const payload = {
        courses: coursesList,
        semester: "Spring 2026",
      }

      if (coursesList.length == 0) {
        throw new ValueError("No Courses Selected")
      }

      const response = await fetch(`/server/api/planner2/optimalSchedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error(`HTTP error! ${response.status}`)
      const data = await response.json()
      setSchedules(data.schedules || [])
      setSelectedSchedule(0)
      setScheduleStats({
        avgGPA: 3.5,
        avgRating: 4.1,
        totalCredits: data.schedules?.[0]?.schedule?.length * 3 || 0,
      })
    } catch (err) {
      console.error("Schedule generation failed:", err)
      alert("Error generating schedule.")
    } finally {
      setLoading(false)
    }
  }

  const currentSchedule =
    schedules.length > 0 ? schedules[selectedSchedule] : null
  const { daySchedules, startHour, endHour } = currentSchedule
    ? buildScheduleData(currentSchedule.schedule)
    : { daySchedules: {}, startHour: 8, endHour: 17 }

  const hours = []
  for (let h = startHour; h <= endHour; h++) hours.push(h)

  return (
    <div className="text-beige-light">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-maroon" />
          Schedule Finder
        </h2>
        <button
          onClick={generateSchedule}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-maroon hover:bg-maroon/80 text-beige-light rounded transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="h-4 w-4" />
              </motion.div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Find Optimal Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="grid lg:grid-cols-10 gap-6">
        {/* Left Panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* Preferences */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-card border border-dark-border rounded-xl p-4"
          >
            <h3 className="text-base font-semibold mb-3 border-b border-dark-border pb-2 flex items-center gap-2">
              <Settings className="h-4 w-4 text-maroon" />
              Preference Weights
            </h3>

            {[
              {
                key: "ratingWeight",
                icon: <Star className="h-4 w-4 text-yellow-400" />,
                label: "Professor Rating Weight",
                min: 0,
                max: 1,
                step: 0.01,
                display: preferences.ratingWeight.toFixed(2),
              },
              {
                key: "gpaWeight",
                icon: <TrendingUp className="h-4 w-4 text-green-400" />,
                label: "Average GPA Weight",
                min: 0,
                max: 1,
                step: 0.01,
                display: preferences.gpaWeight.toFixed(2),
              },
              {
                key: "classPriority",
                icon: <Star className="h-4 w-4 text-maroon" />,
                label: "Class Priority",
                min: 1,
                max: 100,
                step: 1,
                display: Math.round(preferences.classPriority),
              },
            ].map((slider) => (
              <div key={slider.key} className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {slider.icon}
                    {slider.label}
                  </label>
                  <span className="font-bold text-sm bg-dark-input px-2 py-1 rounded">
                    {slider.display}
                  </span>
                </div>
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={preferences[slider.key]}
                  onChange={(e) =>
                    handlePreferenceChange(slider.key, e.target.value)
                  }
                  className="w-full h-2 rounded-lg cursor-pointer bg-dark-input accent-maroon"
                />
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-dark-card border border-dark-border rounded-xl p-4"
          >
            <h3 className="text-base font-semibold mb-3 border-b border-dark-border pb-2 flex items-center gap-2">
              <Filter className="h-4 w-4 text-maroon" />
              Advanced Filters
            </h3>
            {[
              { key: "noClassesBefore", label: "No classes before 9 AM" },
              { key: "noClassesAfter", label: "No classes after 5 PM" },
              { key: "preferMWF", label: "Prefer MWF over TR" },
              { key: "minimizeGaps", label: "Minimize gaps between classes" },
            ].map((f) => (
              <label
                key={f.key}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={filters[f.key]}
                  onChange={() => handleFilterToggle(f.key)}
                  className="w-4 h-4 accent-maroon rounded"
                />
                <span className="text-sm group-hover:text-beige-dark transition-colors">
                  {f.label}
                </span>
              </label>
            ))}
          </motion.div>
        </div>

        {/* Right Panel - Schedule */}
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-maroon" />
                Generated Schedules
              </h3>

              {schedules.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setSelectedSchedule(Math.max(0, selectedSchedule - 1))
                    }
                    disabled={selectedSchedule === 0}
                    className="p-2 rounded-lg bg-dark-input hover:bg-dark-hover disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-beige-light">
                    {selectedSchedule + 1} / {schedules.length}
                  </span>
                  <button
                    onClick={() =>
                      setSelectedSchedule(
                        Math.min(schedules.length - 1, selectedSchedule + 1)
                      )
                    }
                    disabled={selectedSchedule === schedules.length - 1}
                    className="p-2 rounded-lg bg-dark-input hover:bg-dark-hover disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Calendar */}
            {!currentSchedule ? (
              <div className="flex flex-col items-center justify-center py-20 text-center text-beige-dark">
                <Calendar className="h-16 w-16 mb-4 opacity-50" />
                <p>Click “Find Optimal Schedule” to generate your schedule.</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-dark-border rounded-lg">
                <div className="grid grid-cols-6">
                  <div className="text-center text-beige-dark font-medium text-sm py-2 border-r border-b border-dark-border bg-dark-card">
                    Time
                  </div>
                  {days.map((d) => (
                    <div
                      key={d}
                      className="text-center text-beige-light font-semibold py-2 bg-dark-semester border-b border-dark-border"
                    >
                      {d.slice(0, 3)}
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <div className="grid grid-cols-6">
                    {/* Time Column */}
                    <div className="border-r border-dark-border bg-dark-card">
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="border-b border-dark-border text-right pr-2 py-2 text-xs text-beige-dark"
                          style={{ height: `${HOUR_HEIGHT}px` }}
                        >
                          {h > 12 ? h - 12 : h}:00 {h >= 12 ? "PM" : "AM"}
                        </div>
                      ))}
                    </div>

                    {/* Day Columns */}
                    {days.map((day) => (
                      <div
                        key={day}
                        className="relative border-r border-dark-border last:border-r-0"
                      >
                        {hours.map((h) => (
                          <div
                            key={h}
                            className="border-b border-dark-border"
                            style={{ height: `${HOUR_HEIGHT}px` }}
                          />
                        ))}
                        {(daySchedules[day] || []).map((event, idx) => {
                          const topOffset =
                            ((event.startTime - startHour * 60) / 60) *
                            HOUR_HEIGHT
                          const height =
                            ((event.endTime - event.startTime) / 60) *
                            HOUR_HEIGHT
                          return (
                            <div
                              key={idx}
                              className={`absolute left-1 right-1 ${event.colors.bg} rounded p-1 text-xs text-white shadow-lg overflow-hidden`}
                              style={{
                                top: `${topOffset}px`,
                                height: `${height}px`,
                              }}
                            >
                              <div className="font-bold truncate">
                                {event.title}
                              </div>
                              <div>{event.startTimeStr}</div>
                              {height > 40 && (
                                <div className="opacity-80">
                                  Sec {event.section}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            {scheduleStats && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t border-dark-border"
              >
                <h3 className="text-beige-light text-base font-semibold mb-3">
                  Schedule Statistics
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-input rounded-lg p-3 text-center">
                    <div className="text-maroon font-bold text-xl">
                      {scheduleStats.avgGPA.toFixed(2)}
                    </div>
                    <div className="text-beige-dark text-xs mt-1">Avg GPA</div>
                  </div>
                  <div className="bg-dark-input rounded-lg p-3 text-center">
                    <div className="text-maroon font-bold text-xl">
                      {scheduleStats.avgRating.toFixed(1)}
                    </div>
                    <div className="text-beige-dark text-xs mt-1">
                      Avg Rating
                    </div>
                  </div>
                  <div className="bg-dark-input rounded-lg p-3 text-center">
                    <div className="text-maroon font-bold text-xl">
                      {scheduleStats.totalCredits}
                    </div>
                    <div className="text-beige-dark text-xs mt-1">
                      Credit Hours
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
