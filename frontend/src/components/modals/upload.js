"use client"

import { useState } from "react"
import axios from "axios"
import Alert from "../ui/alert"

export default function UploadPlannerModal({ isOpen, onClose, onPlannerUploaded }) {
  const [uploadMethod, setUploadMethod] = useState("text")
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
      const response = await axios.post("/server/api/planner/text", {
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

      if (response.error) {
        showAlert(response.error, "error")
      }
    } catch (error) {
      console.error("Failed to upload planner:", error)
      showAlert(error.response?.data?.error || "Failed to upload", "error")
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
      const arrayBuffer = await selectedFile.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)

      const response = await axios.post("/server/api/planner/pdf", buffer, {
        headers: {
          "Content-Type": "application/pdf",
        },
      })

      if (response.data && Object.keys(response.data).length > 0) {
        onPlannerUploaded(response.data)
        showAlert("Planner uploaded successfully!", "success")
        setTimeout(() => {
          onClose()
        }, 1500)
      } else {
        showAlert("Invalid PDF. Please try another file.", "error")
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
      <div className="fixed inset-0 bg-background bg-opacity-50 flex items-center justify-center z-40 p-4">
        <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-100">Upload Existing Planner</h3>
            <button onClick={handleClose} className="text-gray-400 hover:text-gray-200 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Method Toggle */}
          <div className="flex mb-6 bg-dark-input rounded-lg p-1">
            <button
              onClick={() => setUploadMethod("text")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                uploadMethod === "text" ? "bg-dark-select text-white" : "text-gray-300 hover:text-gray-100"
              }`}
            >
              Copy/Paste Text
            </button>
            <button
              onClick={() => setUploadMethod("file")}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
                uploadMethod === "file" ? "bg-dark-select text-white" : "text-gray-300 hover:text-gray-100"
              }`}
            >
              Upload PDF File
            </button>
          </div>

          {uploadMethod === "text" ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-200 mb-2">Copy/Paste Your Planner</h4>
                <div className="bg-dark-input border border-dark-border rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-200 mb-2">Instructions:</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Go to your Degree Planner and generate your plan</li>
                    <li>• Select "View Plan" on the navigation bar</li>
                    <li>• Select the entire page (CTRL + A, CTRL + C)</li>
                    <li>• Paste the contents into the text box (CTRL + V)</li>
                  </ul>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste your academic planner text here..."
                  className="w-full h-64 p-3 bg-dark-input border border-dark-border rounded-lg text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-dark-select focus:border-dark-select resize-none"
                />
              </div>
              <button
                onClick={handleTextUpload}
                disabled={loading || !textInput.trim()}
                className="w-full px-6 py-3 bg-dark-select text-white rounded-lg hover:bg-dark-select transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Upload Planner"}
              </button>
            </div>
          ) : (
           <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium text-gray-200 mb-2">Upload PDF File</h4>
                <div className="bg-dark-input border border-dark-border rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-200 mb-2">Instructions:</h5>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Go to your Degree Planner and generate your plan</li>
                    <li>• Click on the "Print" button next to Add/Edit plan</li>
                    <li>• Save the document as a PDF</li>
                    <li>• Upload the PDF below</li>
                  </ul>
                </div>
                <div
                  className="border-2 border-dashed border-dark-border rounded-lg w-full h-64 flex flex-col items-center justify-center text-center p-4 cursor-pointer"
                  onClick={() => document.getElementById("file-upload").click()}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <div className="w-16 h-16 bg-dark-input rounded-full flex items-center justify-center mb-4">
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
                  <p className="text-gray-300 mb-2 break-words max-w-full">
                    {selectedFile ? selectedFile.name : "Click to select PDF file"}
                  </p>
                  <p className="text-sm text-gray-400">PDF files only</p>
                </div>
              </div>
              <button
                onClick={handleFileUpload}
                disabled={loading || !selectedFile}
                className="w-full px-6 py-3 bg-dark-select text-white rounded-lg hover:bg-dark-select transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Upload PDF"}
              </button>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-dark-border">
            <p className="text-sm text-gray-400 text-center">
              We do not collect any personal information. Only course data is processed and stored.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}