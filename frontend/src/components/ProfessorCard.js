import { useState, useEffect, useRef, useContext} from "react";
import axios from "axios";

import StarRating from "./StarRating";
import BarGraph from "./BarGraph";
import ProfessorRatingCard from "./ProfessorRatingCard";
import Actions from "./Actions";
import { SearchContext } from "../context/search";

export default function ProfessorCard({ professorId, courseId }){
    // console.log(professorId);
    const { professors, graphData } = useContext(SearchContext); //subscribe to only professors[professorId]
    const hiddenRef = useRef(null);
    const arrowIconRef = useRef(null);

    const professor = professors[professorId] || {};
    // console.log(professors, professors[professorId]);
    const graphKey = courseId.replace(" ", "") + "_" + professorId;
    // console.log(courseId + professorId, graphData, graphData[graphKey]);
    const info = professor.info || {}; 
    const {
        department = "DEPT",
        courseNumber = "123",
        name = "name",
        averageRating: rating = 0.0,
        title: courseTitle = "title",
        averageGPA: GPA = 0.0,
    } = info;
    const tags = professor.tags || {};

    function toggleDetails(e){
        if(e.target.type === "checkbox") return;
        hiddenRef.current.hidden = ! hiddenRef.current.hidden;
        if(hiddenRef.current.hidden){
            arrowIconRef.current.classList.remove("fa-chevron-down");
            arrowIconRef.current.classList.add("fa-chevron-right");
        }else{
            arrowIconRef.current.classList.remove("fa-chevron-right");
            arrowIconRef.current.classList.add("fa-chevron-down");
        }
    }

  


    return (
        <div className="professor-card bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <button onClick = {(e) => {toggleDetails(e);}} className="grid grid-cols-12 p-3 gap-6 border -b border-gray-200">
                <Actions 
                    arrowIconRef = {arrowIconRef}
                    department = {department}
                    courseNumber = {courseNumber}
                    professorId = {professorId}
                />
                <div className="professor-name col-span-6 font-bold text-gray-200 text-left">{department} {courseNumber} {name} {courseTitle}</div>
                <div className="col-span-1 text-center text-white font-semibold text-xl px-6 py-2 rounded-full bg-green-400">{GPA}</div>
                {<StarRating className = "col-span-3" rating = {rating}/>}
            </button>


            <div id = {`${name}${department}${courseNumber}`} ref = {hiddenRef} hidden = {true}>
                <BarGraph graphKey = {graphKey}/>
                {/* <ProfessorRatingCard props = {{rating, difficulty, wouldTakeAgain, ratingCount}}/> */}

                <div className = "flex flex-wrap gap-3 mb-6">
                    {tags && Object.entries(tags).map(([key, value]) => (
                        <span
                            key = {key}
                            className = "text-white bg-gray-800 px-4 py-2 rounded-full text-sm border border-gray-600"
                        >
                            {key} ({value})
                        </span>
                    ))}
                </div>

                <a
                    href = "https://www.ratemyprofessors.com"
                    target = "_blank"
                    rel = "noopener noreferrer"
                    className = "text-blue-400 underline"
                >
                    Visit Rate My Professors
                </a>

                <div className="courses-title font-semibold text-blue-200 mb-2">Courses Taught</div>
                <div className="courses-list flex flex-wrap gap-2">
                
                {/* {courses && courses.map((courseId) => (
                    <span key={courseId} className="course-tag text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded">
                        {courseId.replace("_", " ")}
                    </span>
                ))} */}
                </div>
            </div>
        </div>
    );
}