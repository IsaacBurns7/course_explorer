"use client"

import { ChevronDown } from "lucide-react"
import { useState } from "react"

export default function SchedulerFilters({ selectedClasses, filteredClasses, onFilterChange }) {
  const [expanded, setExpanded] = useState(true)

  const toggleClass = (className) => {
    if (filteredClasses.includes(className)) {
      onFilterChange(filteredClasses.filter((c) => c !== className))
    } else {
      onFilterChange([...filteredClasses, className])
    }
  }

  const toggleAll = () => {
    if (filteredClasses.length === selectedClasses.length) {
      onFilterChange([])
    } else {
      onFilterChange([...selectedClasses])
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900">Filters</h3>
        <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-gray-100 rounded transition-colors">
          <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${expanded ? "" : "-rotate-90"}`} />
        </button>
      </div>

      {expanded && (
        <>
          {/* Classes Filter Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Courses</h4>
              <button onClick={toggleAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                {filteredClasses.length === selectedClasses.length ? "None" : "All"}
              </button>
            </div>

            <div className="space-y-2">
              {selectedClasses.map((className) => (
                <label
                  key={className}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filteredClasses.includes(className)}
                    onChange={() => toggleClass(className)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{className.replace("_", " ")}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Placeholder for future filters */}
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 italic">More filters coming soon...</p>
          </div>
        </>
      )}
    </div>
  )
}
