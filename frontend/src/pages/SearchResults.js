//libraries
import { useEffect, useState } from "react";

//components
import ProfessorCard from "../components/ProfessorCard";
import ActionsHeader from "../components/ActionsHeader";
import SearchOptions from "../components/SearchOptions";
import Compare from "../components/Compare";

//hooks
import { useProfessorsContext } from "../hooks/useProfessorsContext";
import { useProfessorActions } from "../hooks/useProfessorActions";
import { useSearchParams } from "react-router";
import { useSearchContext } from "../hooks/useSearchContext";
import { useCourseActions } from "../hooks/useCourseActions";
import { useCoursesContext } from "../hooks/useCoursesContext";
import { useCardsContext } from "../hooks/useCardsContext";

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {search_options, dispatch: searchDispatch} = useSearchContext();
    const { professors } = useProfessorsContext(); //use professors to find ratings and such
    const { courses } = useCoursesContext();
    const { addCourse } = useCourseActions();
    const { cards } = useCardsContext();

    const dept = searchParams.get("dept");
    const courseNumber = searchParams.get("courseNumber");

    useEffect(() => {
        addCourse(dept, courseNumber);
    }, [dept, courseNumber]);

    // useEffect(() => {
    //     if(courses){
    //         console.log(courses);
    //     }
    // }, [courses]);
    const comparedCards = ["100615_CSCE120", "193825_CSCE120"];

    return (
        <div className = "search-results">
            <SearchOptions />
            <ActionsHeader />
            <div className = "cards">
                {cards && cards.map((card) => {
                    const dept = card.slice(0,4);
                    const number = card.slice(4,7);
                    const professorId = card.split("_")[1];
                    if(professorId === "info"){
                        return;
                    }
                    const professor = courses[`${dept} ${number}`][professorId];
                    //verify professor matches search results
                    if(search_options){
                        const { minGPA, minRating } = search_options;
                        if(minGPA && professor.info.averageGPA < minGPA){
                            return;
                        }
                        if(minRating && professor.info.averageRating < minRating){
                            return;
                        }
                    }
                    // console.log(courses[`${dept} ${number}`]);
                    return <ProfessorCard 
                        key = {`${professorId}-${dept}-${number}`}
                        professorId = {professorId}
                        professor = {professor}
                        dept = {dept}
                        number = {number}
                    />
                })}
            </div>
            <div className = "compare">
                <Compare comparedCards = {comparedCards}/>
            </div>
        </div>
    )
} 

export default SearchResults;