"use client"

export default function ClearConfirmModal({
  isOpen,
  onClose,
  onConfirm,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Confirm Clear</h3>

        <p className="text-gray-300 mb-4">
          Are you sure you want to clear your <b>entire degree planner?</b>
        </p>

        <p className="text-red-600 mb-4">This cannot be undone</p>
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
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}