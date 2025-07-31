import { useState } from "react"
import axios from "axios"
import PlannerDisplay from "../hooks/usePlanner"

export default function PlannerPage() {
  const [plannerData, setPlannerData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPlannerData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post("/server/api/planner", {
  "Fall 2024": [
    {
      "department": "CHEM",
      "number": "107",
      "title": "GEN CHEM FOR ENGINEERS",
      "hours": 3,
      "grade": "A"
    },
    {
      "department": "CHEM",
      "number": "117",
      "title": "GEN CHEM FOR ENGR LAB",
      "hours": 1,
      "grade": "B"
    },
    {
      "department": "ENGR",
      "number": "102",
      "title": "ENGR LAB I COMPUTATION",
      "hours": 2,
      "grade": "A"
    },
    {
      "department": "MATH",
      "number": "251",
      "title": "ENGINEERING MATH III",
      "hours": 3,
      "grade": "A"
    },
    {
      "department": "STAT",
      "number": "211",
      "title": "PRIN OF STATISTICS I",
      "hours": 3,
      "grade": "A"
    }
  ],
  "Spring 2025": [
    {
      "department": "COMM",
      "number": "203",
      "title": "PUBLIC SPEAKING",
      "hours": 3,
      "grade": "B"
    },
    {
      "department": "CSCE",
      "number": "120",
      "title": "PROGRAM DESIGN & CONCEPTS",
      "hours": 3,
      "grade": "A"
    },
    {
      "department": "CSCE",
      "number": "222",
      "title": "DISCRETE STRUC COMPUTING",
      "hours": 3,
      "grade": "A"
    },
    {
      "department": "ENGR",
      "number": "216",
      "title": "EX PHYS ENGR LAB II MECHANICS",
      "hours": 2,
      "grade": "A"
    },
    {
      "department": "PHYS",
      "number": "207",
      "title": "ELEC & MAGNETISM ENGR & SCI",
      "hours": 3,
      "grade": "A"
    },
    {
      "department": "THEA",
      "number": "281",
      "title": "THEATRE HISTORY II",
      "hours": 3,
      "grade": "A"
    }
  ],
  "Summer 2025": [
    {
      "department": "CHEM",
      "number": "120",
      "title": "FUND OF CHEMISTRY II",
      "hours": 4,
      "grade": null
    },
    {
      "department": "PHIL",
      "number": "111",
      "title": "CONTEMP MORAL ISSUES",
      "hours": 3,
      "grade": null
    },
    {
      "department": "POLS",
      "number": "207",
      "title": "STATE & LOCAL GOVT",
      "hours": 3,
      "grade": null
    }
  ],
  "Fall 2025": [
    {
      "department": "CSCE",
      "number": "181",
      "title": "INTRO TO COMPUTING\n\n                        \n                        [close]\n\n                              View CSCE 181 Course History",
      "hours": 1,
      "grade": "Registered"
    },
    {
      "department": "CSCE",
      "number": "221",
      "title": "DATA STRUC & ALGORITHMS\n\n                        \n                        [close]\n\n                              View CSCE 221 Course History",
      "hours": 4,
      "grade": "Registered"
    },
    {
      "department": "CSCE",
      "number": "312",
      "title": "COMPUTER ORGANIZATION\n\n                        \n                        [close]\n\n                              View CSCE 312 Course History",
      "hours": 4,
      "grade": null
    },
    {
      "department": "CSCE",
      "number": "314",
      "title": "PROGRAMMING LANGUAGES\n\n                        \n                        [close]\n\n                              View CSCE 314 Course History",
      "hours": 3,
      "grade": null
    },
    {
      "department": "CSCE",
      "number": "481",
      "title": "SEMINAR\n\n                        \n                        [close]\n\n                              View CSCE 481 Course History",
      "hours": 1,
      "grade": null
    },
    {
      "department": "MATH",
      "number": "304",
      "title": "LINEAR ALGEBRA\n\n                        \n                        [close]\n\n                              View MATH 304 Course History",
      "hours": 3,
      "grade": "Registered"
    }
  ],
  "Spring 2026": [
    {
      "department": "CSCE",
      "number": "310",
      "title": "DATABASE SYSTEMS\n\n                        \n                        [close]\n\n                              View CSCE 310 Course History",
      "hours": 3,
      "grade": null
    },
    {
      "department": "CSCE",
      "number": "313",
      "title": "INTRO TO COMPUTER SYSTEM\n\n                        \n                        [close]\n\n                              View CSCE 313 Course History",
      "hours": 4,
      "grade": null
    },
    {
      "department": "CSCE",
      "number": "331",
      "title": "FOUNDATIONS SOFTWARE ENGINEER\n\n                        \n                        [close]\n\n                              View CSCE 331 Course History",
      "hours": 4,
      "grade": null
    },
    {
      "department": "CSCE",
      "number": "411",
      "title": "DESIGN ANALY ALGORITHMS\n\n                        \n                        [close]\n\n                              View CSCE 411 Course History",
      "hours": 3,
      "grade": null
    }
  ]
})
      console.log(response.data)
      setPlannerData(response.data)
    } catch (err) {
      console.error("Failed to fetch planner data:", err)
      setError("Failed to load planner data.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full px-4 sm:px-6 lg:px-8 py-6 bg-background-900">
      <div className="w-full">
        <h1 className="text-3xl font-semibold mb-6 text-gray-100">Planner Viewer</h1>
        <button
          onClick={fetchPlannerData}
          className="mb-6 px-6 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Plan"}
        </button>
        {loading && (
          <div className="flex justify-center my-8">
            <p className="text-gray-300">Loading your academic plan...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-800 rounded-md">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {plannerData && (
          <div className="w-full bg-background-800 p-6 rounded-md border border-gray-700">
            <PlannerDisplay planner={plannerData} />
          </div>
        )}
      </div>
    </div>
  )
}
