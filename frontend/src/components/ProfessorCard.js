import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import BarGraph from "./BarGraph";
import ProfessorRatingCard from "./ProfessorRatingCard";

export default function ProfessorCard({ professor, dept, number, nameOfClass }){

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

    }
    function addToCompare(){

    }
    function addToPlanner(){

    }

    return (
        <div className="professor-card bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="grid grid-cols-12 gap-4 p-4 border -b border-gray-200">
                <div class = "col-span-2">
                    <button onClick = {toggleDetails} className = "text-gray-200">ARROW</button>
                    <button onClick = {addToCompare} className = "text-gray-200">BOX</button>
                    <button onClick = {addToPlanner} className = "text-gray-200">PLANNER</button>
                </div>
                <div className="professor-name col-span-4 font-bold text-gray-200">{dept} {number} {professor.info.name}</div>
                <div className="overview-grades col-span-3 bg-green-500 text-black text-center">A-</div>
                <StarRating className = "col-span-3" rating = {professor.info.averageRating}/>
            </div>

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
    );
}