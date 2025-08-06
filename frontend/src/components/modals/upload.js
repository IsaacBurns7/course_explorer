"use client"

import { useState } from "react"
import axios from "axios"
import Alert from "../ui/alert"

export default function UploadPlannerModal({ isOpen, onClose, onPlannerUploaded }) {
  const [uploadMethod, setUploadMethod] = useState("text") // 'text' or 'file'
  const [textInput, setTextInput] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ message: "", type: "info", isVisible: false })

  if (!isOpen) return null

  const showAlert = (message, type = "info") => {
    setAlert({ message, type, isVisible: true })
  }

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, isVisible: false }))
  }

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.type === "application/pdf") {
        setSelectedFile(file)
      } else {
        showAlert("Please select a PDF file.", "error")
        event.target.value = ""
      }
    }
  }

  const handleTextUpload = async () => {
    if (!textInput.trim()) {
      showAlert("Please enter your planner text.", "warning")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("/server/api/planner", {
        type: "text",
        content: textInput,
      })

      if (response.data) {
        onPlannerUploaded(response.data)
        showAlert("Planner uploaded successfully!", "success")
        setTimeout(() => {
          onClose()
        }, 1500)
      }
    } catch (error) {
      console.error("Failed to upload planner:", error)
      showAlert("Failed to process planner. Please check your input and try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) {
      showAlert("Please select a PDF file.", "warning")
      return
    }

    setLoading(true)
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
const buffer = new Uint8Array(arrayBuffer);

const response = await axios.post("/server/api/planner", buffer, {
  headers: {
    "Content-Type": "application/pdf", // or application/octet-stream
  },
});

      if (response.data && response.data != {}) {
        onPlannerUploaded(response.data)
        showAlert("Planner uploaded successfully!", "success")
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        throw error;
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
      showAlert("Failed to process PDF file. Please try again.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setTextInput("")
    setSelectedFile(null)
    setUploadMethod("text")
    setLoading(false)
    closeAlert()
    onClose()
  }

  return (
    <>
      <Alert message={alert.message} type={alert.type} isVisible={alert.isVisible} onClose={closeAlert} />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-white">Upload Existing Planner</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-200 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Method Toggle */}
          <div className="flex mb-6 bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setUploadMethod("text")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                uploadMethod === "text" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-gray-100"
              }`}
            >
              Copy/Paste Text
            </button>
            <button
              onClick={() => setUploadMethod("file")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                uploadMethod === "file" ? "bg-blue-600 text-white" : "text-gray-300 hover:text-gray-100"
              }`}
            >
              Upload PDF File
            </button>
          </div>

          {uploadMethod === "text" ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Copy/Paste Your Planner</h4>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-200 mb-2">Instructions:</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Copy your academic plan from your student portal or degree audit</li>
                    <li>• Include semester names (e.g., "Fall 2024", "Spring 2025")</li>
                    <li>• Include course codes, titles, and credit hours</li>
                    <li>• The system will automatically parse and organize your courses</li>
                  </ul>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your academic planner text here...

Example format:
Fall 2024
CSCE 221 - Data Structures & Algorithms (4 hrs)
MATH 308 - Differential Equations (3 hrs)

Spring 2025
CSCE 313 - Computer Systems (4 hrs)
ECEN 214 - Circuit Theory (4 hrs)"
                  className="w-full h-64 p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
              <button
                onClick={handleTextUpload}
                disabled={loading || !textInput.trim()}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Upload Planner"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-white mb-2">Upload PDF File</h4>
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-200 mb-2">Where to find your PDF:</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>
                      • <strong>Student Portal:</strong> Look for "Degree Audit" or "Academic Plan"
                    </li>
                    <li>
                      • <strong>Advisor:</strong> Request a copy of your degree plan
                    </li>
                    <li>
                      • <strong>Registrar:</strong> Download from your student records
                    </li>
                    <li>
                      • <strong>Department:</strong> Get your major's curriculum sheet
                    </li>
                  </ul>
                </div>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                  <input type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-gray-300"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7,10 12,15 17,10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                    <p className="text-gray-300 mb-2">
                      {selectedFile ? selectedFile.name : "Click to select PDF file"}
                    </p>
                    <p className="text-sm text-gray-400">PDF files only</p>
                  </label>
                </div>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={loading || !selectedFile}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Upload PDF"}
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Your data is processed securely and not stored permanently on our servers.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
