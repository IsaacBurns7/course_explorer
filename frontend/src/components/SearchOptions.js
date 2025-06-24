import { useRef, useState, useEffect } from "react";

import { SearchActions } from "../context/search";

import { useSearchContext } from "../hooks/useSearchContext";

//make this fancier in the future but for now I cannot be bothered
const defaultSemesters = [
    "FALL 2024",
    "SPRING 2025",
    "SUMMER 2025"
]

function SearchOptions (){
    const {search_options, dispatch} = useSearchContext();
    const [semestersDropDownFocus, setSemestersDropdownFocus] = useState(false);

    useEffect(() => {
        const newSearchOptions = {
            ...search_options,
            semesters: defaultSemesters
        }
        dispatch({
            type: SearchActions.SET_SEARCH_OPTIONS, 
            payload: newSearchOptions
        });
    }, []);


    function selectAllSemesters(){
        console.log("Selecting all semesters");
    }
    
    const handleGPAChange = (e) => {
        const newSearchOptions = {
            ...search_options,
            minGPA: e.target.value
        };
        dispatch({
            type: SearchActions.SET_SEARCH_OPTIONS,
            payload: newSearchOptions
        });
    }

    const handleRatingChange = (e) => {
        const newSearchOptions = {
            ...search_options,
            minRating: e.target.value
        };
        dispatch({
            type: SearchActions.SET_SEARCH_OPTIONS,
            payload: newSearchOptions
        });
    }

    const handleTeachingNextSemesterChange = (e) => {
        const newSearchOptions = {
            ...search_options,
            teachingNextSemester: e.target.checked
        };
        dispatch({
            type: SearchActions.SET_SEARCH_OPTIONS,
            payload: newSearchOptions
        });
    }

    return (
        <div className = "SearchOptions flex p-4 gap-6">
            <div className = "flex-col flex">
                <label className = "text-center">Min GPA</label>
                <select 
                    className = "bg-black p-2 text-white border border-white transition-all duration-200 focus:border-2 focus:border-maroon focus:outline-non" 
                    id=""
                    onChange = {handleGPAChange}
                    // onFocus = {() => setGPAFocus(true)}
                    // onBlur = {handleGPABlur}
                >
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
                <select     
                    className = "bg-black p-2 text-white border border-white transition-all duration-200 focus:border-2 focus:border-maroon focus:outline-non hover:bg-maroon" 
                    id=""
                    onChange = {handleRatingChange}
                    // onFocus = {handleRatingFocus}
                    // onBlur = {handleRatingBlur}
                >
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
                    onFocus = {() => setSemestersDropdownFocus(true)}
                    onBlur = {() => setSemestersDropdownFocus(false)}
                >
                    <option value="" hidden disabled>Semesters</option>
                    <option value="ALL" onClick = {selectAllSemesters}>Select all</option>
                    {semestersDropDownFocus && 
                    <>
                        {search_options.semesters && search_options.semesters.map((opt) => (
                            <option key = {opt} value = {opt}>{opt}</option>
                        ))}
                    </>
                    }
                </select>
            </div>
            <div className = "flex flex-col items-center">
                <label>Teaching Next Semester</label>
                <input 
                    type = "checkbox"
                    className = "w-5 h-5 border border-maroon"
                    onChange = {handleTeachingNextSemesterChange}
                >
                </input>
            </div>
        </div>
    );
}

export default SearchOptions;
