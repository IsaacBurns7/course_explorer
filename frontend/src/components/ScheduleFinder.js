import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Calendar, Clock, Star, TrendingUp, Settings, Filter } from "lucide-react";

/**
 * ScheduleFinder Component
 *
 * This component allows users to generate optimal class schedules based on:
 * - Professor rating weights (0-1)
 * - GPA weights (0-1)
 * - Class priority (1-100)
 * - Advanced filters (time preferences, day preferences)
 *
 * Features:
 * - Interactive preference sliders
 * - Weekly calendar visualization
 * - Schedule statistics and export functionality
 */
export default function ScheduleFinder({ planner }) {
  // Preference weights for schedule optimization
  const [preferences, setPreferences] = useState({
    ratingWeight: 0.5,
    gpaWeight: 0.5,
    classPriority: 50
  });

  // Advanced filter options
  const [filters, setFilters] = useState({
    noClassesBefore: null,
    noClassesAfter: null,
    preferMWF: false,
    minimizeGaps: false
  });

  // Generated schedule data
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scheduleStats, setScheduleStats] = useState(null);

  // Time slots for calendar (8 AM - 6 PM)
  const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
    "4:00 PM", "5:00 PM", "6:00 PM"
  ];

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

  // Handle slider changes
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: parseFloat(value) }));
  };

  // Handle filter toggle
  const handleFilterToggle = (key) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Generate optimal schedule
  const generateSchedule = async () => {
    setLoading(true);

    try {
      // Get courses from planner - need to extract from all semesters
      const allCourses = [];
      Object.values(planner || {}).forEach(semesterCourses => {
        semesterCourses.forEach(course => {
          const courseId = `${course.department}_${course.number}`;
          if (!allCourses.includes(courseId)) {
            allCourses.push(courseId);
          }
        });
      });

      if (allCourses.length === 0) {
        alert("No courses found in planner to schedule");
        setLoading(false);
        return;
      }

      // Determine semester - use the first semester key
      const semester = Object.keys(planner || {})[0] || "Fall 2024";

      // Build request payload
      const payload = {
        courses: allCourses,
        semester: semester,
        min_rating: preferences.ratingWeight > 0 ? preferences.ratingWeight : null,
        min_gpa: preferences.gpaWeight > 0 ? preferences.gpaWeight : null,
        fixed_professors: null,
        spread: filters.minimizeGaps ? { min: 0, max: 180 } : null
      };

      console.log("Calling /server/api/planner2/optimalSchedule with:", payload);

      const response = await fetch("/server/api/planner2/optimalSchedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Transform the response to our calendar format
      if (data.schedules && data.schedules.length > 0) {
        const topSchedule = data.schedules[0];
        const calendarSchedule = transformToCalendar(topSchedule.schedule);
        const stats = calculateStats(topSchedule.schedule);

        setGeneratedSchedule(calendarSchedule);
        setScheduleStats(stats);
      } else {
        alert("No valid schedules found. Try adjusting your preferences.");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error generating schedule:", error);
      alert("Failed to generate schedule: " + error.message);
      setLoading(false);
    }
  };

  // Transform backend response to calendar format
  const transformToCalendar = (schedule) => {
    const calendar = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: []
    };

    const dayMap = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'R': 'Thursday',
      'F': 'Friday'
    };

    schedule.forEach(classItem => {
      classItem.schedule.forEach(time => {
        const dayName = dayMap[time.day];
        if (dayName) {
          calendar[dayName].push({
            course: classItem.course_id.replace('_', ' '),
            professor: `Prof. ${classItem.professor_id}`,
            section: classItem.section_id,
            start: time.start,
            end: time.end
          });
        }
      });
    });

    return calendar;
  };

  // Calculate statistics from schedule
  const calculateStats = (schedule) => {
    // TODO: Calculate actual GPA and rating from professor data
    return {
      avgGPA: 3.5,
      avgRating: 4.0,
      totalCredits: schedule.length * 3, // Estimate
      totalCourses: schedule.length
    };
  };

  // Calculate class position on calendar grid
  const getClassPosition = (startTime, duration) => {
    const startIndex = startTime - 8; // 8 AM is index 0
    const height = duration * 60; // 60px per hour
    return { top: startIndex * 60, height };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-100">Schedule Finder</h2>

        <button
          onClick={generateSchedule}
          disabled={loading}
          className="w-full sm:w-auto px-4 py-2 bg-maroon hover:bg-maroon/80 text-beige-light rounded
                    transition-all duration-300 flex items-center justify-center space-x-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Clock className="h-4 w-4" />
              </motion.div>
              <span className="text-sm sm:text-base">Generating Schedule...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span className="text-sm sm:text-base">Find Optimal Schedule</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto">
        <div className="grid lg:grid-cols-10 gap-6">

          {/* LEFT PANEL - Controls */}
          <div className="lg:col-span-3 space-y-4">

            {/* Preference Weights Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-dark-card border border-dark-border rounded-xl p-4"
            >
              <h3 className="text-base font-semibold text-beige-light mb-3 border-b border-dark-border pb-2 flex items-center gap-2">
                <Settings className="h-4 w-4 text-maroon" />
                Preference Weights
              </h3>

              {/* Rating Weight Slider */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-beige-light text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    Professor Rating Weight
                  </label>
                  <span className="text-beige-light font-bold text-sm bg-dark-input px-2 py-1 rounded">
                    {preferences.ratingWeight.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={preferences.ratingWeight}
                  onChange={(e) => handlePreferenceChange('ratingWeight', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-dark-input accent-maroon"
                />
                <div className="flex justify-between text-xs text-beige-dark mt-0.5">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>

              {/* GPA Weight Slider */}
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-beige-light text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    Average GPA Weight
                  </label>
                  <span className="text-beige-light font-bold text-sm bg-dark-input px-2 py-1 rounded">
                    {preferences.gpaWeight.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={preferences.gpaWeight}
                  onChange={(e) => handlePreferenceChange('gpaWeight', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-dark-input accent-maroon"
                />
                <div className="flex justify-between text-xs text-beige-dark mt-0.5">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>

              {/* Class Priority Slider */}
              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-beige-light text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-maroon" />
                    Class Priority
                  </label>
                  <span className="text-beige-light font-bold text-sm bg-dark-input px-2 py-1 rounded">
                    {Math.round(preferences.classPriority)}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="1"
                  value={preferences.classPriority}
                  onChange={(e) => handlePreferenceChange('classPriority', e.target.value)}
                  className="w-full h-2 rounded-lg cursor-pointer bg-dark-input accent-maroon"
                />
                <div className="flex justify-between text-xs text-beige-dark mt-0.5">
                  <span>1</span>
                  <span>50</span>
                  <span>100</span>
                </div>
              </div>
            </motion.div>

            {/* Advanced Filters Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-card border border-dark-border rounded-xl p-4"
            >
              <h3 className="text-base font-semibold text-beige-light mb-3 border-b border-dark-border pb-2 flex items-center gap-2">
                <Filter className="h-4 w-4 text-maroon" />
                Advanced Filters
              </h3>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.noClassesBefore}
                    onChange={() => handleFilterToggle('noClassesBefore')}
                    className="w-4 h-4 accent-maroon rounded cursor-pointer"
                  />
                  <span className="text-beige-light text-sm group-hover:text-beige-dark transition-colors">
                    No classes before 9 AM
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.noClassesAfter}
                    onChange={() => handleFilterToggle('noClassesAfter')}
                    className="w-4 h-4 accent-maroon rounded cursor-pointer"
                  />
                  <span className="text-beige-light text-sm group-hover:text-beige-dark transition-colors">
                    No classes after 5 PM
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.preferMWF}
                    onChange={() => handleFilterToggle('preferMWF')}
                    className="w-4 h-4 accent-maroon rounded cursor-pointer"
                  />
                  <span className="text-beige-light text-sm group-hover:text-beige-dark transition-colors">
                    Prefer MWF over TR
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.minimizeGaps}
                    onChange={() => handleFilterToggle('minimizeGaps')}
                    className="w-4 h-4 accent-maroon rounded cursor-pointer"
                  />
                  <span className="text-beige-light text-sm group-hover:text-beige-dark transition-colors">
                    Minimize gaps between classes
                  </span>
                </label>
              </div>
            </motion.div>
          </div>

          {/* RIGHT PANEL - Calendar */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-beige-light flex items-center gap-2">
                  <Calendar className="text-base font-semibold h-6 w-6 text-maroon" />
                  Generated Schedule
                </h3>
                {generatedSchedule && (
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-dark-input border border-dark-border text-beige-light text-sm rounded-lg
                                      hover:bg-dark-hover transition-colors flex items-center gap-2">
                      Export
                    </button>
                    <button
                      onClick={generateSchedule}
                      className="px-4 py-2 bg-maroon/20 border border-maroon text-maroon text-sm rounded-lg
                                hover:bg-maroon/30 transition-colors flex items-center gap-2"
                    >
                      Find New
                    </button>
                  </div>
                )}
              </div>

              {/* Calendar Grid */}
              {generatedSchedule ? (
                <div className="overflow-x-auto">
                  <div className="min-w-[600px] border border-dark-border">
                    {/* Header Row */}
                    <div className="grid grid-cols-6">
                      <div className="text-center text-beige-dark font-medium text-sm py-2 border-r border-b border-dark-border bg-dark-card">Time</div>
                      {days.map((day, idx) => (
                        <div key={day} className={`text-center text-beige-light font-semibold py-2 bg-dark-semester border-b border-dark-border ${idx < days.length - 1 ? 'border-r' : ''}`}>
                          {day.slice(0, 3)}
                        </div>
                      ))}
                    </div>

                    {/* Time Grid */}
                    <div className="relative">
                      {timeSlots.map((time, idx) => (
                        <div key={idx} className="grid grid-cols-6">
                          <div className={`text-right text-beige-dark text-sm py-3 pr-2 border-r border-dark-border bg-dark-card ${idx < timeSlots.length - 1 ? 'border-b' : ''}`}>{time}</div>
                          {days.map((day, dayIdx) => (
                            <div
                              key={day}
                              className={`bg-dark-input min-h-[60px] relative hover:bg-dark-hover/30 transition-colors
                                ${idx < timeSlots.length - 1 ? 'border-b border-dark-border' : ''}
                                ${dayIdx < days.length - 1 ? 'border-r border-dark-border' : ''}`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Calendar className="h-16 w-16 text-beige-dark/30 mb-4" />
                  <p className="text-beige-dark text-sm">
                    Click "Find Optimal Schedule" to generate your schedule
                  </p>
                </div>
              )}

              {/* Schedule Statistics */}
              {scheduleStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 pt-6 border-t border-dark-border"
                >
                  <h3 className="text-beige-light text-base font-semibold mb-3">Schedule Statistics</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-dark-input rounded-lg p-3 text-center">
                      <div className="text-maroon font-bold text-xl">{scheduleStats.avgGPA.toFixed(2)}</div>
                      <div className="text-beige-dark text-xs mt-1">Avg GPA</div>
                    </div>
                    <div className="bg-dark-input rounded-lg p-3 text-center">
                      <div className="text-maroon font-bold text-xl">{scheduleStats.avgRating.toFixed(1)}</div>
                      <div className="text-beige-dark text-xs mt-1">Avg Rating</div>
                    </div>
                    <div className="bg-dark-input rounded-lg p-3 text-center">
                      <div className="text-maroon font-bold text-xl">{scheduleStats.totalCredits}</div>
                      <div className="text-beige-dark text-xs mt-1">Credit Hours</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
