"use client"
import { AnimatePresence, motion } from "framer-motion"
export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  courseName,
  semesterCourses = [], // optional list of courses for semester deletion
}) {
  if (!isOpen) return null

  const isSemester = semesterCourses.length > 0

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
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Confirm Delete</h3>

        <p className="text-gray-300 mb-4">
          {isSemester ? (
            <>
              Are you sure you want to delete <span className="font-semibold text-white">"{courseName}"</span>? <br />
              This will remove the following classes:
            </>
          ) : (
            <>
              Are you sure you want to delete {courseName ? `"${courseName}"` : "this class"}?
            </>
          )}
        </p>

        {isSemester && (
          <ul className="mb-6 max-h-40 overflow-y-auto list-disc pl-5 text-gray-300 text-sm">
            {semesterCourses.map((course, index) => (
              <li key={index}>{course}</li>
            ))}
          </ul>
        )}

        <p className="text-gray-600 mb-4">This cannot be undone</p>
        <div className="flex space-x-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-gray-200 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-500 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}