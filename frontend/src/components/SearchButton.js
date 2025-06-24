import { useState, useRef, useEffect } from "react";
import { Link } from "react-router";

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
    const searchInput = useRef(null);
    const {courses} = useCoursesContext();
    const [searchInputInnerHTML, setSearchInputInnerHTML] = useState("");

    // useEffect(() => {
    //     console.log('State changed:', inputText);
    // }, [inputText]);
    function findMatches(wordToMatch, array){
        return array.filter(element => {
            const regex = new RegExp(wordToMatch, 'gi');
            return element.match(regex);
        })
    }
    function displayMatches(e){
        const courseArray = Object.keys(courses);
        const matchArray = findMatches(e.target.value, courseArray);
        const html = matchArray.map(element => {
            const regex = new RegExp(e.target.value, "gi");
            const courseName = element.replace(regex, `<span class = "hl>${e.target.value}</span>`);
            return `
                <li>
                    <span class = "courseName">${courseName}</span>
                </li>
            `;
        }).join('');
        setSearchInputInnerHTML(html);
    }

    return (
        <form className = "container" onSubmit = {() => handleSearch(inputText)}>
            <div className = "search-input">
                <input 
                className = "mr-4 text-black" 
                type = "text" 
                onChange = {(e) =>  {
                    setInputText(e.target.value);
                    displayMatches(e);
                }}
                value = {inputText}
                placeholder = "DEPT 123"
                ref = {searchInput}
                />
                <div
                    className = "autofill"
                    ref = {autofillRef}
                >

                </div>
                <Link to = "/dashboard">
                <button type = "submit">Search</button>
            </Link>
            </div>
        </form>
    )
}

export default SearchButton;