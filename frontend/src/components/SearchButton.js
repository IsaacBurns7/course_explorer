import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";

function SearchButton({courses}) {
    const [inputText, setInputText] = useState("");
    const [matches, setMatches] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [error, setError] = useState(false);
    const resultsRef = useRef(null);
    const navigate = useNavigate();

    // useEffect(() => {
    //     console.log('State changed:', inputText);
    // }, [inputText]);
    function findMatches(wordToMatch, array){
        return array.filter(element => {
            const regex = new RegExp(wordToMatch, "gi");
            return regex.test(element);
        })
    }
    function displayMatches(e){
        const value = e.target.value;

        const matchArray = findMatches(value, Array.from(courses)).slice(0,10);
        setMatches(matchArray);
    }

    function handleSubmit(selectedCourse){
        if(!selectedCourse | selectedCourse === ""){
            console.log("Cannot submit, no course listed.");
            return;
        }

        // console.log("Selected Course: ", selectedCourse);
        const dept = selectedCourse.split(" ")[0];
        const number = selectedCourse.split(" ")[1];

        if(!dept | !number){
            console.log("Department or Number invalid.")
            return;
        }

        setInputText("");
        setActiveIndex(-1);
        setMatches([]);
        navigate({
            pathname: "dashboard",
            search: `?dept=${dept}&courseNumber=${number}`
        });
    }

    function handleKeyDown(e){
        if(matches.length === 0){
            return;
        }

        if(e.key === "ArrowDown"){
            e.preventDefault();
            setActiveIndex(prev => (prev < matches.length - 1 ? prev + 1: 0));
        }
        if(e.key === "ArrowUp"){
            e.preventDefault();
            setActiveIndex(prev => (prev > 0 ? prev - 1 : matches.length - 1))
        }
        if(e.key === "Enter"){
            e.preventDefault();
            if(activeIndex >= 0){
                handleSubmit(matches[activeIndex]);
            }
            if(matches.includes(inputText)){
                handleSubmit(inputText);
            }else{
                setError(true);
            }
        }
        if(e.key === "Escape"){
            setActiveIndex(-1);
        }
    }

    useEffect(() => {
        if(activeIndex > 0 && resultsRef.current){
            const activeItem = resultsRef.current.children[activeIndex];
            if(activeItem){
                activeItem.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest"
                });
            }
        }
    }, [activeIndex]);

    return (
  <form
    className="flex items-center gap-3"
    onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(matches[0]);
    }}
  >
    <div className="relative">
      <input
        type="text"
        className="px-4 py-2 rounded-full text-sm bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        value={inputText}
        placeholder="DEPT 123"
        onChange={(e) => {
          setInputText(e.target.value.toUpperCase());
          setError(false);
          displayMatches(e);
        }}
        onKeyDown={handleKeyDown}
      />

      {/* Error message */}
      {error && (
        <p className="text-red-500 text-sm mt-1">⚠️ Please enter a valid course</p>
      )}

      {/* Dropdown results */}
      <ul
        ref={resultsRef}
        className="absolute z-40 mt-2 w-full bg-black rounded-md shadow-lg max-h-60 overflow-y-auto "
      >
        {matches.map((courseName, index) => {
          const regex = new RegExp(`(${inputText})`, "gi");
          const parts = courseName.split(regex).filter((element) => element !== "");

          return (
            <li
              key={index}
              className={`px-3 py-2 cursor-pointer text-white ${
                index === activeIndex ? "bg-blue-700" : "hover:bg-gray-800"
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => handleSubmit(courseName)}
            >
              {parts.map((string, i) => (
                <span
                  key={i}
                  className={regex.test(string) ? "font-extrabold text-yellow-400" : "font-normal"}
                >
                  {string}
                </span>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  </form>
);
}

export default SearchButton;