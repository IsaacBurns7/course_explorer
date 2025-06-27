//libraries
import { useEffect, useState } from "react";

//components
import ProfessorCard from "../components/ProfessorCard";
import ActionsHeader from "../components/ActionsHeader";
import SearchOptions from "../components/SearchOptions";

//hooks
import { useProfessorsContext } from "../hooks/useProfessorsContext";
import { useSearchParams } from "react-router";
import { useSearchContext } from "../hooks/useSearchContext";
import { useCourseActions } from "../hooks/useCourseActions";
import { useCoursesContext } from "../hooks/useCoursesContext";
import { useCardsContext } from "../hooks/useCardsContext";

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {search_options, dispatch: searchDispatch} = useSearchContext();
    const { professors } = useProfessorsContext();
    const { courses } = useCoursesContext();
    const { addCourse } = useCourseActions();
    const { cards } = useCardsContext();
    const [professorList, setProfessorList] = useState([]);

    const dept = searchParams.get("dept");
    const courseNumber = searchParams.get("courseNumber");
    

    useEffect(() => {
        addCourse(dept, courseNumber);
    }, [dept, courseNumber]);

    useEffect(() => {
        if(courses){
            const list = Object.entries(courses).flatMap(([courseKey, courseObject]) => {
                if(courseKey === "info"){
                    return;
                }
                const [dept, number] = courseKey.split(" ");
                const professorsOfCourse =  Object.entries(courseObject).map(([professorId, professor]) => {
                        if(professorId === "info"){
                            return {
                                professorId
                            };
                        }
                        return {
                            professorId,
                            professor,
                            dept,
                            number
                        }
                    });
                // console.log(professorsOfCourse);
                return professorsOfCourse;
            });
            setProfessorList(list);
            // console.log(list);
        }
    }, [courses]);

    return (
        <div className = "search-results">
            <SearchOptions />
            <ActionsHeader />
            <div className = "cards">
                {/* {console.log(professorList)} */}
                {professorList.map(({professorId, professor, dept, number}) => {
                    if(professorId === "info"){
                        return;
                    }
                    return <ProfessorCard 
                        key = {`${professorId}-${dept}-${number}`}
                        professor = {professor}
                        dept = {dept}
                        number = {number}
                    />
                })}
            </div>
        </div>
    )
} 

export default SearchResults;