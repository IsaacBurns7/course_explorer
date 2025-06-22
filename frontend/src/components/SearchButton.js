import { useState, useEffect } from "react";


import { addCourse } from "../services/addCourse";

function handleSearch(inputText){
    //<verify inputText is of correct form> 

    const courseDept = inputText.slice(0,4);
    const courseNumber = inputText.slice(5);
    addCourse(courseDept, courseNumber);
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