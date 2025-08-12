"use client"
import { AnimatePresence, motion } from "framer-motion"
export default function MoveClassModal({ isOpen, onClose, onMove, semesters, currentSemester, courseName }) {
  if (!isOpen) return null

  const availableSemesters = semesters.filter((semester) => semester.name !== currentSemester)

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full mx-4"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.25 }}
          ></motion.div>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Move Class</h3>
        <p className="text-gray-300 mb-4">
          Select the semester to move {courseName ? `"${courseName}"` : "this class"} to:
        </p>
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
          {availableSemesters.map((semester) => (
            <button
              key={semester.name}
              onClick={() => onMove(semester.name)}
              className="w-full text-left p-3 bg-dark-input border border-dark-border rounded hover:bg-dark-hover transition text-gray-200"
            >
              {semester.name}
              <span className="text-sm text-gray-400 ml-2">({semester.courses.length} courses)</span>
            </button>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
