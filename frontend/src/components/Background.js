"use client"
import { useEffect, useMemo, useState } from "react"

const ParticlesBackground = () => {
  const [courses, setCourses] = useState(new Set())

  // Predefined professors list
  const professors = [
    "Dr. Smith",
    "Prof. Johnson",
    "Dr. Williams",
    "Prof. Brown",
    "Dr. Davis",
    "Prof. Miller",
    "Dr. Wilson",
    "Prof. Moore",
    "Dr. Taylor",
    "Prof. Anderson",
    "Dr. Thomas",
    "Prof. Jackson",
    "Dr. White",
    "Prof. Harris",
    "Dr. Martin",
    "Prof. Thompson",
    "Dr. Garcia",
    "Prof. Martinez",
    "Dr. Robinson",
    "Prof. Clark",
  ]

  useEffect(() => {
    getAllCourses()
      .then((courseSet) => {
        setCourses((prev) => {
          const newSet = new Set(prev)
          courseSet.forEach((courseKey) => {
            newSet.add(courseKey)
          })
          return newSet
        })
      })
      .catch((err) => console.error("Failed to load courses", err))
  }, [])

  // Predefined color palette
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#FF8A80",
    "#80CBC4",
    "#90CAF9",
    "#C8E6C9",
  ]

  // Professor colors (softer, more muted)
  const professorColors = [
    "#FFB3BA",
    "#BAFFC9",
    "#BAE1FF",
    "#FFFFBA",
    "#FFD1DC",
    "#E0BBE4",
    "#C7CEEA",
    "#FFDAB9",
    "#B5EAD7",
    "#C9C9FF",
    "#FFE5CC",
    "#D4F1F4",
  ]


    const courseCodes = Array.from(courses)

    return (
      <div className="absolute inset-0 w-full h-full"  style={{ left: "4rem", top: "-7rem" }}>
        {/* Courses Section */}
        <div className="absolute top-0 left-0 w-full h-1/3 pointer-events-none">
  {/* Courses Label */}
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
    <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
      <p className="text-white font-bold text-lg text-center">500+ Courses</p>
    </div>
  </div>

  {/* Floating course codes */}
  <div className="absolute inset-0 pointer-events-none" style={{ top: "4rem" }}>
    {courseCodes.slice(0, 15).map((code, index) => (
      <div
        key={index}
        className="absolute text-white font-bold text-sm transition-all duration-1000 ease-in-out"
        style={{
          left: `${20 + (index % 3) * 30}%`, // spread horizontally across width
          top: `${60 + Math.floor(index / 3) * 60}%`, // spread vertically within top half
          color: colors[index % colors.length],
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          transform: `translate(-50%, -50%)`,
          animation: `float-sync 3s ease-in-out infinite`,
          zIndex: 5,
        }}
      >
        {code}
      </div>
    ))}
  </div>
</div>

{/* Professors Section at the bottom */}
<div className="absolute bottom-0 left-0 w-full h-1/3 pointer-events-none" style={{ top: "20rem" }}>
  {/* Professors Label */}
  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
    <div className="bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/10">
      <p className="text-white font-bold text-lg text-center">500+ Professors</p>
    </div>
  </div>

  {/* Floating professor names */}
  <div className="absolute inset-0 pointer-events-none" style={{ top: "4rem" }}>
    {professors.slice(0, 15).map((professor, index) => (
      <div
        key={index}
        className="absolute text-white font-medium text-xs transition-all duration-1000 ease-in-out"
        style={{
          left: `${20 + (index % 3) * 30}%`, // spread horizontally across width
          top: `${60 + Math.floor(index / 3) * 60}%`, // spread vertically within bottom half
          color: professorColors[index % professorColors.length],
          textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
          transform: `translate(-50%, -50%)`,
          animation: `float-sync 3s ease-in-out infinite`,
          zIndex: 5,
        }}
      >
        {professor}
      </div>
    ))}
  </div>
</div>

        <style jsx>{`
          @keyframes float-sync {
            0%, 100% {
              transform: translate(-50%, -50%) translateY(0px);
            }
            25% {
              transform: translate(-50%, -50%) translateY(-5px);
            }
            50% {
              transform: translate(-50%, -50%) translateY(2.5px);
            }
            75% {
              transform: translate(-50%, -50%) translateY(-5px);
            }
          }
          
          @keyframes sway {
            0%, 100% {
              transform: translate(-50%, -50%) translateX(0px) rotate(0deg);
            }
            25% {
              transform: translate(-50%, -50%) translateX(-8px) rotate(-2deg);
            }
            50% {
              transform: translate(-50%, -50%) translateX(0px) rotate(0deg);
            }
            75% {
              transform: translate(-50%, -50%) translateX(8px) rotate(2deg);
            }
          }
        `}</style>
      </div>
    )
}

export default ParticlesBackground
