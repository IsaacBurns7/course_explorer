import { useState, useEffect, useRef } from "react";
import axios from "axios";

import { useProfessorActions } from "../hooks/useProfessorActions";

import StarRating from "./StarRating";
import BarGraph from "./BarGraph";
import ProfessorRatingCard from "./ProfessorRatingCard";
import Actions from "./Actions";

export default function ProfessorCard({ professorId, professor, dept, number, nameOfClass }){
    // console.log(professorId);
    const [ratingObject, setRatingObject] = useState(null);
    const [tags, setTags] = useState(null);
    const [ratingCount, setRatingCount] = useState(0);
    const [rating, setRating] = useState(0.00);
    const [courses, setCourses] = useState([]);
    const [graphData, setGraphData] = useState([]);

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

    useEffect(() => {
        const optionsUrl = `/server/api/courses/graph?department=${dept}&courseNumber=${number}&professorID=${professorId}`;
        // console.log(optionsUrl);
        const options = {
            method: "GET",
            url: optionsUrl
        };

        axios(options)
            .then((response) => {
                // console.log(response.data);
                setGraphData(response.data);
            })
            .catch((error) => {
                console.error("error: ", error);
            });
    }, []);

    useEffect(() => {
        const url = `/server/api/professors/ratings/?professorID=${professorId}&department=${dept}&courseNumber=${number}`;
        const options = {
            method: "GET",
            url
        }
        axios(options)
            .then((response) => {
                if(!response | !response.data){
                    throw new Error("Invalid response structure");
                }
                const data = response.data;
                if(data === null | typeof data !== "object"){
                    throw new Error("Expected object data");
                }
                setRating(data.averageRating.toFixed(2) | 0.0);
                setRatingObject(data);
                setTags(data.tags);
                const totalRatings = ratingObject ? Object.values(ratingObject.ratings).reduce((acc,value) => {
                    acc + value
                }, 0) : 0;
                setRatingCount(totalRatings);
            })
            .catch((error) => {
                // console.error("Error: ", error);
            })
            .finally(() => {

            })
    }, [professorId, dept, number]);
    
    useEffect(() => {
        const url = `/server/api/professors/coursesTaught/?professorID=${professorId}`;
        const options = {
            method: "GET",
            url
        };

        axios(options)
            .then((response) => {
                if(!response | !response.data){
                    throw new Error("Invalid response structure");
                }
                const data = response.data;
                if(data === null | !Array.isArray(data)){
                    throw new Error("Expected array data");
                }
                // const newProfessor = {
                //     ...professors[professorId],
                //     courses: data
                // };
                // dispatch({type: ProfessorsActions.ADD_PROFESSOR, payload: {
                //     professorId,
                //     professor: newProfessor
                // }});
                setCourses(data);
            })
            .catch((error) => {
                console.error("error: ", error)
            })
    }, [professorId]);

    const { name, averageGPA, wouldTakeAgain} = professor.info;

    const difficulty = 3.7;


    return (
        <div className="professor-card bg-black rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <button onClick = {(e) => {toggleDetails(e);}} className="grid grid-cols-12 p-3 gap-6 border -b border-gray-200">
                <Actions arrowIconRef = {arrowIconRef}/>
                <div className="professor-name col-span-6 font-bold text-gray-200 text-left">{dept} {number} {name} {nameOfClass}</div>
                <div className="col-span-1 text-center text-white font-semibold text-xl px-6 py-2 rounded-full bg-green-400">{averageGPA}</div>
                {ratingObject && <StarRating className = "col-span-3" rating = {rating}/>}
            </button>


            <div id = {`${professor.info.name}${dept}${number}`} ref = {hiddenRef} hidden = {true}>
                <BarGraph data = {graphData} professorName = {professor.info.name} dept = {dept} number = {number}/>
                <ProfessorRatingCard props = {{rating, difficulty, wouldTakeAgain, ratingCount}}/>

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
                
                {courses && courses.map((courseId) => (
                    <span key={courseId} className="course-tag text-yellow-200 text-xs font-medium px-2.5 py-0.5 rounded">
                        {courseId.replace("_", " ")}
                    </span>
                ))}
                </div>
            </div>
        </div>
    );
}