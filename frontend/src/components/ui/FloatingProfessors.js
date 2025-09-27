import '../../styles/squares.css'
import { useEffect, useState, memo } from "react"
import { getAllProfs } from '../../hooks/useAllProfs'

function getRandomItems(arr, n) {
  const arrayCopy = [...arr]; // copy so we don't mutate original
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  return arrayCopy.slice(0, n);
}

const FloatingProfessors = ({ colors }) => {
  const [randomProfs, setRandomProfs] = useState([]);

  useEffect(() => {
    getAllProfs()
      .then(profSet => {
        const profArray = Array.from(profSet).map(fullName => {
          const parts = fullName.trim().split(" ");
          const lastName = parts.pop(); // remove last word
          const initials = parts.map(name => name[0].toUpperCase() + ".").join(""); // B.B.
          return `${initials} ${lastName}`;
        });

        if (profArray.length > 0 && randomProfs.length === 0) {
          setRandomProfs(getRandomItems(profArray, 9));
        }
      })
      .catch(err => console.error("Failed to load professors", err));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {randomProfs.map((name, index) => (
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
          {name}
        </div>
      ))}
    </div>
  );
};

export default memo(FloatingProfessors);
