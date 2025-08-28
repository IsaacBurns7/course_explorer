import { useState, useEffect, useRef, useContext} from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import StarRating from "./StarRating";
import BarGraph from "./BarGraph";
import ProfessorRatingCard from "./ProfessorRatingCard";
import Actions from "./Actions";
import { SearchContext } from "../context/search";
import LineGraph from "./LineGraph";

export default function ProfessorCard({ professorId, courseId }){
    // console.log(professorId);
    const { professors } = useContext(SearchContext); //subscribe to only professors[professorId]
    const hiddenRef = useRef(null);
    const arrowIconRef = useRef(null);

    const professor = professors[professorId] || {};
    // console.log(professor);
    // console.log(professors, professors[professorId]);
    const graphKey = courseId.replace(" ", "") + "_" + professorId;
    // console.log(courseId + professorId, graphData, graphData[graphKey]);
    const info = professor.info || {}; 
    const department = courseId.split(" ")[0] || "DEPT";
    const courseNumber = courseId.split(" ")[1] || "123";
    const {
        name = "name",
        averageRating: rating = 0.0,
        title: courseTitle = "title",
        averageGPA: GPA = 0.0,
        totalRatings = 0,
        wouldTakeAgain = 0,
        rmpLink = "https://ratemyprofessors.com"
    } = info;
    const tags = professor.tags || {};
    const courses = professor.courses || [];

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

    const [barGraph, setBarGraph] = useState(true);
    const [lineGraph, setLineGraph] = useState(false);
  


    return (
        <div className="professor-card bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <button onClick = {(e) => {toggleDetails(e);}} className="grid grid-cols-12 p-3 gap-6 border -b border-gray-200">
                <Actions 
                    arrowIconRef = {arrowIconRef}
                    department = {department}
                    courseNumber = {courseNumber}
                    professorId = {professorId}
                    className = "col-span-2"
                />
                <div className="professor-name col-span-6 font-bold text-gray-200 text-left">{courseId} {name} </div>
                <div className="col-span-2 bg-green-400 rounded-full">
                    <p
                        className = "text-base text-black py-2 w-16 block mx-auto"
                        aria-label="Median GPA: 4.00 | Mean GPA: 3.70"
                    >{GPA}</p>
                </div>
                <StarRating className = "col-span-2" rating = {rating}/>
            </button>


            <div id = {`${name}${department}${courseNumber}`} ref = {hiddenRef} hidden = {true}>
                <div className = "chart-wrapper flex items-center gap-1">
                    <div className = "chart-container flex-1">
                        {barGraph && <BarGraph graphKey = {graphKey}/>}
                        {lineGraph && <LineGraph lineGraphKey = {graphKey}/>}
                    </div>
                    <div className = "chart-toggle flex flex-col gap-1">
                        <button onClick = {() => {
                            setBarGraph(true);
                            setLineGraph(false);
                        }}
                            className = "px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded border border-gray-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
                                <rect x="4" y="10" width="3" height="10"/>
                                <rect x="10" y="6" width="3" height="14"/>
                                <rect x="16" y="13" width="3" height="7"/>
                            </svg>
                        </button>
                        <button onClick = {() => {
                            setBarGraph(false);
                            setLineGraph(true);
                        }}
                            className = "px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded border border-gray-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                                <polyline points="4 14 8 10 13 15 20 8"/>
                                <circle cx="4" cy="14" r="1.5"/>
                                <circle cx="8" cy="10" r="1.5"/>
                                <circle cx="13" cy="15" r="1.5"/>
                                <circle cx="20" cy="8" r="1.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
               <ProfessorRatingCard props = {{rating, totalRatings, wouldTakeAgain, GPA}}/>

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
                    href = {rmpLink}
                    target = "_blank"
                    rel = "noopener noreferrer"
                    className = "text-blue-400 underline"
                >
                    Visit Rate My Professors
                </a>

                <div className="courses-title font-semibold text-blue-200 mb-2">Courses Taught</div>
                <div className="courses-list flex flex-wrap gap-2">
                
                {/* MAKE THIS CLICKABLE :)) */}
                {courses && courses.map((courseId) => (
                    <Link key={courseId} 
                        className="course-tag text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded"
                        to = {`/dashboard?dept=${courseId.split("_")[0]}&courseNumber=${courseId.split("_")[1]}`}
                    >
                        {courseId.replace("_", " ")}
                    </Link>
                ))}
                </div>
            </div>
        </div>
    );
}

/*
rsync -avz --exclude 'node_modules' --exclude '.git' --exclude '.env' \
    -e "ssh -i ~/.ssh/public.pem" \
    . ubuntu@ec2-13-59-245-176.us-east-2.compute.amazonaws.com:~/app
*/