import '../../styles/squares.css'
const FloatingCourses = ({ courseCodes, colors }) => {
    console.log(courseCodes)
  return (
    <div className="absolute inset-0 pointer-events-none">
      {courseCodes.slice(0, 9).map((code, index) => (
        <div
          key={index}
          className="absolute text-white font-bold text-sm transition-all duration-1000 ease-in-out"
          style={{
            left: `${20 + (index % 3) * 30}%`,
            top: `${20 + Math.floor(index / 3) * 20}%`,
            color: colors[index % colors.length],
            textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
            transform: `translate(-50%, -50%)`,
            animation: `float-sync 3s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`,
            zIndex: 5,
          }}
        >
          {code}
        </div>
      ))}
    </div>
  )
}

export default FloatingCourses