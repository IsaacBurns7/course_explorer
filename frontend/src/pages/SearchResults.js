//libraries
import { useEffect, useState } from "react";
import React from "react";

//components
import ProfessorCard from "../components/ProfessorCard";
import ActionsHeader from "../components/ActionsHeader";
import SearchOptions from "../components/SearchOptions";

//hooks
import { useProfessorsContext } from "../hooks/useProfessorsContext";

const SearchResults = () => {
    const {professors, dispatch} = useProfessorsContext();

    useEffect(() => {
        const professorObj1 = {
             info: {
                name: "professor1Name", 
                averageGPA: 3.58,
                totalSections: 12,
                totalStudents: 144,
                averageRating: 4.23,
                totalRatings: 15, 
                yearsTaught: 12,   
            },
            courses: ["courseId1","courseId2"]
        };
        const professorObj2 = {
             info: {
                name: "professor2Name", 
                averageGPA: 3.59,
                totalSections: 13,
                totalStudents: 124,
                averageRating: 4.13,
                totalRatings: 1123, 
                yearsTaught: 1212,
            },
            courses: ["courseId1", "courseId2"]
        };
        const professorData = [professorObj1, professorObj2];
        dispatch({
            type: "SET_PROFESSORS",
            payload: professorData
        });
    }, []);

    return (
        <div className = "search-results">
            <SearchOptions />
            <ActionsHeader />
            <div className = "app">
                {professors && professors.map((professor, index) => (
                    <ProfessorCard key = {index} professor = {professor} dept = "GOVT" number = {206}/>
                ))}
            </div>
        </div>
    )
} 

export default SearchResults;