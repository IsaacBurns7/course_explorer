import { useState, useEffect, useRef } from "react";
import StarRating from "./StarRating";
import BarGraph from "./BarGraph";
import ProfessorRatingCard from "./ProfessorRatingCard";

export default function ProfessorCard({ professor, dept, number, nameOfClass }){

    const hiddenRef = useRef(null);
    const arrowIconRef = useRef(null);
    const tags = [  
        { label: "Get ready to read", count: 14 },
        { label: "Lecture heavy", count: 9 },
        { label: "Beware of pop quizzes", count: 6 },
        { label: "Skip class? You won't pass.", count: 5 },
        { label: "Respected", count: 4 },
    ];
    const rating = 4.2;
    const difficulty = 3.7;
    const wouldTakeAgain = 74;
    const totalRatings = 42;

    function toggleDetails(){
        hiddenRef.current.hidden = ! hiddenRef.current.hidden;
        if(hiddenRef.current.hidden){
            arrowIconRef.current.classList.remove("fa-chevron-down");
            arrowIconRef.current.classList.add("fa-chevron-right");
        }else{
            arrowIconRef.current.classList.remove("fa-chevron-right");
            arrowIconRef.current.classList.add("fa-chevron-down");
        }
    }
    function addToCompare(){

    }
    function addToPlanner(){

    }

    return (
        <div className="professor-card bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <button onClick = {toggleDetails} className="grid grid-cols-12 p-3 gap-6 border -b border-gray-200">
                <div className = "col-span-2 items-center justify-left gap-4 flex bg-zinc-900">
                    <div><i className = "fas fa-chevron-right text-white rounded" ref = {arrowIconRef}></i></div>
                    <div className="relative inline-block w-10 h-10">
                        {/* <span>
                            <input type="checkbox" id="myCheckbox" className="hidden" />
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"></path>
                                <path d="M17 3v8l-4-2-4 2V3"></path>
                            </svg>
                        </span> */}
                        <label className = "relative inline-block cursor-pointer">
                            <input type="checkbox" className = "absolute w-full h-full opacity-0 m-0 cursor-pointer"/>        
                            <svg className = "pointer-events-none" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="grey" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect className = "stroke-gray-500" x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
                                <polyline className = "hidden stroke-green-600" points="9 12 12 15 22 6"></polyline>
                            </svg>
                        </label>
                    </div>
                </div>
                <div className="professor-name col-span-4 font-bold text-gray-200 text-left">{dept} {number} {professor.info.name}</div>
                <div className="overview-grades col-span-3 bg-green-500 text-black text-center">A-</div>
                <StarRating className = "col-span-3" rating = {professor.info.averageRating}/>
            </button>

            <div id = {`${professor.info.name}${dept}${number}`} ref = {hiddenRef} hidden = {true}>
                <BarGraph professorId = {professor._id} dept = {dept} number = {number}/>
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
                {professor.courses.map((courseId) => (
                    //maybe make this a link
                    <span key={courseId} className="course-tag text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded">
                    {courseId}
                    </span>
                ))}
                </div>
            </div>
        </div>
    );
}