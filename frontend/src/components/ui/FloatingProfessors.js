const FloatingProfessors = ({ professors, colors }) => {
  return (
    
    <div className="absolute inset-0 pointer-events-none">
      {professors.slice(0, 9).map((professor, index) => (
        <div
          key={index}
          className="absolute text-white font-bold text-sm transition-all duration-1000 ease-in-out"
          style={{
            left: `${20 + (index % 3) * 30}%`,
            top: `${20 + Math.floor(index / 3) * 20}%`,
            color: colors[index % colors.length],
            textShadow: "1px 1px 3px rgba(0,0,0,0.6)",
            transform: `translate(-50%, -50%)`,
            animation: `float-sync 3s ease-in-out infinite`,
            animationDelay: `${index * 0.1}s`,
            zIndex: 5,

          }}
        >
          {professor}
        </div>
      ))}
    </div>
  )
}

export default FloatingProfessors