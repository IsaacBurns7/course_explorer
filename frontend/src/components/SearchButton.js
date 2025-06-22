import { useState, useEffect } from "react";

import { CardsContext } from "../context/cards";
import { ProfessorsContext } from "../context/professors";
import { CoursesContext } from "../context/courses";

function handleSearch(inputText){
    //<verify inputText is of correct form> 

    const courseDept = inputText.slice(0,4);
    const courseNumber = inputText.slice(5);
    addCourse(courseDept, courseNumber);
}

function addCourse(courseDept, courseNumber){
    // const professorsState = {}; //hypothetical backend API call
    // const courseState = {}; //hypothetical backend API call

    const courseState = {
    // Key format: "${dept}${number}" (e.g., "CS101")
        "CSCE120": {
            info: {
                dept: "CSCE",
                number: "120",
                title: "Introduction to Computer Science",
                description: "Fundamentals of programming and computer science principles."

            },
            professors: ["prof123", "prof456"] // Array of professor IDs who teach this course
        },
    };
    const professorsState = {
    // Key: professorID
        "prof123": [
            // Array of course hashmaps this professor teaches
            {
                "CSCE120": [
                    // Array of section objects
                ]
            }
        ],
        "prof456": [
            {
                "CSCE120": [
                    
                ]
            },
        ]
    };
}

function SearchButton() {
    const [inputText, setInputText] = useState("");

    // useEffect(() => {
    //     console.log('State changed:', inputText);
    // }, [inputText]);
    return (
        <form className = "container" onSubmit = {() => handleSearch(inputText)}>
            <input 
                className = "mr-4 text-black" 
                type = "text" 
                onChange = {(e) =>  {
                    setInputText(e.target.value);
                }}
                value = {inputText}
                placeholder = "DEPT 123"
            />
            <button type = "submit">Search</button>
        </form>
    )
}

export default SearchButton;