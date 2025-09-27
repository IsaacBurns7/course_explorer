import '../../styles/squares.css'
import { useEffect, useState, memo } from "react"
import { getAllCourses } from '../../hooks/useAllCourses'

function getRandomCourses(arr, n) {
  const arrayCopy = [...arr]; // copy so we don't mutate original
  for (let i = arrayCopy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }
  return arrayCopy.slice(0, n);
}

const FloatingCourses = ({ courseCodes, colors }) => {
  const [randomCourses, setRandomCourses] = useState([]);

  useEffect(() => {
    getAllCourses()
      .then(courseSet => {
        const courseArray = Array.from(courseSet);
        if (courseArray.length > 0 && randomCourses.length == 0) {
          setRandomCourses(getRandomCourses(courseArray, 9));
        }
      })
      .catch(err => console.error("Failed to load courses", err));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {randomCourses.map((code, index) => (
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
  );
};

export default memo(FloatingCourses);