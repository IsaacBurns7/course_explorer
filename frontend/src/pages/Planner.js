// src/app/Planner.js

"use client"

import { useState, useEffect } from "react"
import PlannerDisplay from "../components/Planner"
import UploadPlannerModal from "../components/modals/upload"

export default function Planner() {
  // Use a function to initialize state from local storage
  const [currentView, setCurrentView] = useState("landing")
  const [planner, setPlanner] = useState({})
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [loading, setLoading] = useState(true) // Add a new loading state

  // Use a single useEffect to handle initial loading from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPlanner = localStorage.getItem("academicPlanner")
      if (savedPlanner && savedPlanner !== "{}") {
        const parsedPlanner = JSON.parse(savedPlanner)
        setPlanner(parsedPlanner)
        setCurrentView("planner")
      }
    }
    setLoading(false) // Set loading to false after checking local storage
  }, []) // Empty dependency array ensures this runs only once on mount

  // Use another useEffect to save the planner to local storage whenever it changes
  useEffect(() => {
    if (!loading && typeof window !== "undefined") {
      localStorage.setItem("academicPlanner", JSON.stringify(planner))
    }
  }, [planner, loading])

  // Conditional rendering for the loading state
  if (loading) {
    // You can return null for a blank page or a loading spinner
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
      </div>
    )
  }

  const updatePlanner = (newPlanner) => {
    setPlanner(newPlanner)
  }

  const handleStartFromScratch = () => {
    setPlanner({}) // This will trigger the save effect
    setCurrentView("planner")
  }

  const handlePlannerUploaded = (plannerData) => {
    setPlanner(plannerData) // This will trigger the save effect
    setCurrentView("planner")
  }

  const handleBackToLanding = () => {
    // Optionally clear the planner when going back to landing
    setPlanner({})
    setCurrentView("landing")
  }

  if (currentView === "planner") {
    return (
      <div className="min-h-screen bg-background-900 p-4 pt-24">

        <PlannerDisplay planner={planner} onUpdatePlanner={updatePlanner} handleBackToLanding = {handleBackToLanding} />
      </div>
    )
  }

  // Landing view
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Academic Planner</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Plan your academic journey with ease. Create a new planner from scratch or upload your existing academic
            plan to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-dark-card border border-gray-700 rounded-xl p-8 hover:border-emerald-500 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M12 5v14" />
                  <path d="M5 12h14" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Start from Scratch</h2>
              <p className="text-gray-400 mb-6">
                Create a brand new academic plan. Perfect for new students or those wanting to completely redesign their
                course schedule.
              </p>
              <button
                onClick={handleStartFromScratch}
                className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium"
              >
                Create New Planner
              </button>
            </div>
          </div>

          <div className="bg-dark-card border border-gray-700 rounded-xl p-8 hover:border-blue-500 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7,10 12,15 17,10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-white mb-4">Upload Existing Planner</h2>
              <p className="text-gray-400 mb-6">
                Already have an academic plan? Upload your existing planner from a PDF document or paste the text
                directly.
              </p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors font-medium"
              >
                Upload Planner
              </button>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-2xl font-semibold text-white mb-6">Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Semester Management</h4>
              <p className="text-gray-400 text-sm">Add, remove, and organize courses across multiple semesters</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Professor Selection</h4>
              <p className="text-gray-400 text-sm">Choose professors and view ratings, GPA data, and availability</p>
            </div>

            <div className="bg-gray-800/50 rounded-lg p-6">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">Credit Tracking</h4>
              <p className="text-gray-400 text-sm">Automatically calculate credit hours per semester and total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadPlannerModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onPlannerUploaded={handlePlannerUploaded}
      />
    </div>
  )
}