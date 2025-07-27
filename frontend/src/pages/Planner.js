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
        "Fall 2025": [
          {
            department: "CSCE",
            number: "221",
            title: "DATA STRUC & ALGORITHMS",
            hours: 4,
          },
          {
            department: "CSCE",
            number: "222",
            title: "DISCRETE STRUC COMPUTING",
            hours: 3,
          },
          {
            department: "ECEN",
            number: "248",
            title: "INTRO TO DGTL SYM DSGN",
            hours: 4,
          },
          {
            department: "PHYS",
            number: "207",
            title: "ELEC & MAGNETISM ENGR & SCI",
            hours: 3,
          },
          {
            department: "PHYS",
            number: "217",
            title: "EX PHYS ENGR LAB III ELEC MAGN",
            hours: 2,
          },
        ],
        "Spring 2026": [
          {
            department: "CSCE",
            number: "313",
            title: "INTRO TO COMPUTER SYSTEM",
            hours: 4,
          },
          {
            department: "ECEN",
            number: "214",
            title: "ELEC CIRCUIT THEORY",
            hours: 4,
          },
          {
            department: "ECEN",
            number: "350",
            title: "COMPUTER ARCH & DESIGN",
            hours: 4,
          },
          {
            department: "MATH",
            number: "311",
            title: "TOP IN APPLIED MATH I",
            hours: 3,
          },
          {
            department: "PHYS",
            number: "221",
            title: "OPTICS&THERMAL PHYSICS",
            hours: 3,
          },
        ],
        "Summer 2026": [
          {
            department: "ENGL",
            number: "210",
            title: "TECHNICAL PROFESSIONAL WRITING",
            hours: 3,
          },
        ],
        "Fall 2026": [
          {
            department: "CSCE",
            number: "331",
            title: "FOUNDATIONS SOFTWARE ENGINEER",
            hours: 4,
          },
          {
            department: "CSCE",
            number: "462",
            title: "MICROCOMPUTER SYSTEMS",
            hours: 3,
          },
          {
            department: "CSCE",
            number: "481",
            title: "SEMINAR",
            hours: 1,
          },
          {
            department: "ECEN",
            number: "314",
            title: "SIGNALS AND SYSTEMS",
            hours: 3,
          },
        ],
        "Spring 2027": [
          {
            department: "CSCE",
            number: "441",
            title: "COMPUTER GRAPHICS",
            hours: 3,
          },
          {
            department: "ECEN",
            number: "325",
            title: "ELECTRONICS",
            hours: 4,
          },
          {
            department: "ECEN",
            number: "454",
            title: "DIG INTEGRATEDCKT DES",
            hours: 3,
          },
          {
            department: "OCNG",
            number: "310",
            title: "PHYSICAL OCEANOGRAPHY",
            hours: 4,
          },
          {
            department: "OCNG",
            number: "469",
            title: "PYTHON FOR GEOSCIENCES",
            hours: 3,
          },
        ],
        "Fall 2027": [
          {
            department: "CSCE",
            number: "399",
            title: "HIGH-IMPACT EXPERIENCE",
            hours: 0,
          },
          {
            department: "CSCE",
            number: "447",
            title: "DATA VISUALIZATION",
            hours: 3,
          },
          {
            department: "CSCE",
            number: "483",
            title: "COMPUTER SYS DESIGN",
            hours: 3,
          },
          {
            department: "ECEN",
            number: "449",
            title: "MICROPROCSR SYS DSGN",
            hours: 3,
          },
          {
            department: "OCNG",
            number: "330",
            title: "GEOLOGICAL OCEANOGRAPHY",
            hours: 4,
          },
        ],
        "Spring 2028": [
          {
            department: "CSCE",
            number: "443",
            title: "GAME DEVELOPMENT",
            hours: 3,
          },
          {
            department: "CSCE",
            number: "446",
            title: "VIRTUAL REALITY",
            hours: 3,
          },
          {
            department: "MATH",
            number: "411",
            title: "MATH PROBABILITY",
            hours: 3,
          },
          {
            department: "PERF",
            number: "301",
            title: "PERF IN WORLD CULTURES",
            hours: 3,
          },
        ],
        "Fall 2024": [
          {
            department: "CHEM",
            number: "107",
            title: "GEN CHEM FOR ENGINEERS",
            hours: 3,
          },
          {
            department: "CHEM",
            number: "117",
            title: "GEN CHEM FOR ENGR LAB",
            hours: 1,
          },
          {
            department: "CLEN",
            number: "181",
            title: "ENGR LC SUCCESS SEMINAR",
            hours: 0,
          },
          {
            department: "ENGR",
            number: "102",
            title: "ENGR LAB I COMPUTATION",
            hours: 2,
          },
          {
            department: "MATH",
            number: "251",
            title: "ENGINEERING MATH III",
            hours: 3,
          },
          {
            department: "POLS",
            number: "207",
            title: "STATE & LOCAL GOVT",
            hours: 3,
          },
        ],
        "Spring 2025": [
          {
            department: "CSCE",
            number: "120",
            title: "PROGRAM DESIGN & CONCEPTS",
            hours: 3,
          },
          {
            department: "ENGR",
            number: "216",
            title: "EX PHYS ENGR LAB II MECHANICS",
            hours: 2,
          },
          {
            department: "MATH",
            number: "308",
            title: "DIFFERENTIAL EQUATIONS",
            hours: 3,
          },
          {
            department: "OCNG",
            number: "251",
            title: "THE BLUE PLANET OUR OCEANS",
            hours: 3,
          },
          {
            department: "PHYS",
            number: "206",
            title: "NEWTONIAN MECHANICS ENGR & SCI",
            hours: 3,
          },
          {
            department: "STAT",
            number: "211",
            title: "PRIN OF STATISTICS I",
            hours: 3,
          },
        ],
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
