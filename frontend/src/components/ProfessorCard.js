import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";
import BarGraph from "./BarGraph";
import ProfessorRatingCard from "./ProfessorRatingCard";
import Actions from "./Actions";

export default function ProfessorCard({ professorId, professor, dept, number, nameOfClass }){

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

    const hiddenRef = useRef(null);
    const arrowIconRef = useRef(null);
    const tags = [  
        { label: "Get ready to read", count: 14 },
        { label: "Lecture heavy", count: 9 },
        { label: "Beware of pop quizzes", count: 6 },
        { label: "Skip class? You won't pass.", count: 5 },
        { label: "Respected", count: 4 },
    ];
    const { name, averageRating: rating, totalRatings, averageGPA} = professor.info;
    console.log(professor);
    const difficulty = 3.7;
    const wouldTakeAgain = 74;


    return (
        <div className="professor-card bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <button onClick = {(e) => {toggleDetails(e);}} className="grid grid-cols-12 p-3 gap-6 border -b border-gray-200">
                <Actions arrowIconRef = {arrowIconRef}/>
                <div className="professor-name col-span-6 font-bold text-gray-200 text-left">{dept} {number} {name} {nameOfClass}</div>
                <div className="col-span-1 text-center text-white font-semibold text-xl px-6 py-2 rounded-full bg-green-400">{averageGPA}</div>
                <StarRating className = "col-span-3" rating = {rating}/>
            </button>


            <div id = {`${professor.info.name}${dept}${number}`} ref = {hiddenRef} hidden = {true}>
                <BarGraph professorId = {professorId} professorName = {professor.info.name} dept = {dept} number = {number}/>
                <ProfessorRatingCard props = {{rating, difficulty, wouldTakeAgain, totalRatings}}/>

                <div className = "flex flex-wrap gap-3 mb-6">
                    {tags.map((tag, index) => (
                        <span
                            key = {index}
                            className = "text-white bg-gray-800 px-4 py-2 rounded-full text-sm border border-gray-600"
                        >
                            {tag.label} ({tag.count})
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
                
                {/* have to remake this */}
                {/* {professor.courses.map((courseId) => (
                    //maybe make this a link
                    <span key={courseId} className="course-tag text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded">
                    {courseId}
                    </span>
                ))} */}
                </div>
            </div>
        </div>
    );
}