import { useRef, useState, useEffect } from "react";

//make this fancier in the future but for now I cannot be bothered
const defaultSemesters = [
    "FALL 2024",
    "SPRING 2025",
    "SUMMER 2025"
]

function SearchOptions (){
    const [options, setOptions] = useState(() => 
        defaultSemesters
    );

    function selectAllSemesters(){
        
    }

    return (
        <div className = "SearchOptions flex p-4 gap-6">
            <div className = "flex-col flex">
                <label className = "text-center">Min GPA</label>
                <select className = "bg-black text-white border" id="">
                    <option value="" hidden disabled>Minimum GPA</option>
                    <option value="None">None</option>
                    <option value="3.75">3.75</option>
                    <option value="3.5">3.5</option>
                    <option value="3.25">3.25</option>
                    <option value="3.0">3.0</option>
                    <option value="2.75">2.75</option>
                    <option value="2.5">2.5</option>
                    <option value="2.25">2.25</option>
                    <option value="2.0">2.0</option>
                </select>
            </div>

            <div className = "flex-col flex">
                <label className = "text-center">Min Rating</label>
                <select className = "bg-black text-white border" id="">
                    <option value="" hidden disabled>Minimum Rating</option>
                    <option value="None">None</option>
                    <option value="4.5">4.5</option>
                    <option value="4.0">4.0</option>
                    <option value="3.5">3.5</option>
                    <option value="3.0">3.0</option>
                    <option value="2.5">2.5</option>
                    <option value="2.0">2.0</option>
                </select>
            </div>

            <div className = "flex-col flex">
                <label className = "text-center">Semesters</label>
                <select 
                    className = "bg-black text-white border" 
                    id=""
                    multiple 
                >
                    <option value="" hidden disabled>Semesters</option>
                    <option value="ALL" onClick = {selectAllSemesters(this)}>Select all</option>
                    {options && options.map((opt) => (
                        <option key = {opt} value = {opt}>{opt}</option>
                    ))}
                </select>
            </div>
            <label>Teaching Next Semester</label>
            <input type = "checkbox">

            </input>
        </div>
    );
}

export default SearchOptions;
