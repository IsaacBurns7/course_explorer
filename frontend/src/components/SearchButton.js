import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router";

import { addCourse } from "../services/addCourse";
import { useCoursesContext } from "../hooks/useCoursesContext";

function handleSearch(inputText){
    //<verify inputText is of correct form> 

    const courseDept = inputText.slice(0,4);
    const courseNumber = inputText.slice(5);
    addCourse(courseDept, courseNumber);
}

function SearchButton() {
    const [inputText, setInputText] = useState("");
    const {courses} = useCoursesContext();
    const [matches, setMatches] = useState([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const resultsRef = useRef(null);
    const navigate = useNavigate();

    // useEffect(() => {
    //     console.log('State changed:', inputText);
    // }, [inputText]);
    function findMatches(wordToMatch, array){
        return array.filter(element => {
            const regex = new RegExp(wordToMatch, "gi");
            return element.match(regex);
        })
    }
    function displayMatches(e){
        const value = e.target.value;

        const courseArray = Object.keys(courses);
        const matchArray = findMatches(value, courseArray);
        setMatches(matchArray);
    }

    function handleSubmit(selectedCourse){
        console.log("Selected Course: ", selectedCourse);
        navigate(`/dashboard/${encodeURIComponent(selectedCourse)}`);
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
        <form className = "container flex" onSubmit = {() => handleSubmit(matches[0])}>
            <div className = "search-input">
                <input 
                className = "mr-4 text-black" 
                type = "text" 
                value = {inputText}
                placeholder = "DEPT 123"
                onChange = {(e) =>  {
                    setInputText(e.target.value);
                    displayMatches(e);
                }}
                onKeyDown = {handleKeyDown}
                />
                <ul ref = {resultsRef}>
                    {matches.map((element, index) => {
                        const regex = new RegExp(`(${inputText})`, "gi");
                        const courseName = element.split(regex).filter(element => element !== "");

                        return (
                            <li 
                                key = {index} 
                                className = {`bg-black text-white ${index === activeIndex ? "border border-blue-600": ""}`}
                                onMouseEnter={() => setActiveIndex(index)}
                            >
                                <span className = "courseName">
                                    {courseName.map((string, index) => {
                                        return (
                                            <span 
                                                key = {index} 
                                                className = {string.toLowerCase() == inputText.toLowerCase() ? "font-extrabold" : ""}
                                            >{string}</span>
                                        );
                                    })}
                                </span>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <button type = "submit">Submit</button>
        </form>
    )
}

export default SearchButton;