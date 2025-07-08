//libraries
import { useEffect, useState } from "react";
import axios from "axios";

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
import { useCompareContext } from "../hooks/useCompareContext";

const SearchResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const {search_options, dispatch: searchDispatch} = useSearchContext();
    // const { professors } = useProfessorsContext(); //use professors to find ratings and such
    const { courses } = useCoursesContext(); //try to delete this as well
    const { addCourse } = useCourseActions(); //good god who thought this was a good idea.
    const { cards } = useCardsContext();

    //for compare
    const { cards: comparedCards } = useCompareContext();
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [existingNames, setExistingNames] = useState(new Set());
    const [comparedProfessorInfo, setComparedProfessorInfo] = useState([]);

    const dept = searchParams.get("dept");
    const courseNumber = searchParams.get("courseNumber");

    useEffect(() => {
        addCourse(dept, courseNumber);
    }, [dept, courseNumber]);

    //take this useeffect and place it into the compare 
        //thought process: searchresults page will pass down info from useeffect.
        //compare will be passed to searchresults based on config
    useEffect(() => {
        const populateGraphData = (comparedCards) => {
            for(const card of comparedCards){
                const course = card.split("_")[0];
                const dept = course.slice(0,4);
                const courseNumber = course.slice(4);
                const professorId = card.split("_")[1];
                const optionsUrl = `/server/api/courses/graph?department=${dept}&courseNumber=${courseNumber}&professorID=${professorId}`;
                const options = {
                    method: "GET",
                    url: optionsUrl
                };

                axios(options)
                    .then((response) => {
                        if(!response || !response.data){
                            throw new Error("Invalid response structure");
                        }
                        const data = response.data;
                        if (!Array.isArray(data) || data === null) {
                            throw new Error('Expected object data');
                        }
                        const categories = data.map((item => item[0]));
                        setCategories(categories);
                        const newSeriesData = data.map((item => item[1]));
                        if(!existingNames.has(professorId)){
                            setSeries([
                                ...series,
                                {
                                    name: professorId,
                                    data: newSeriesData,
                                    dept, 
                                    courseNumber
                                }
                            ]);
                            const newSet = new Set(existingNames);
                            newSet.add(professorId);
                            setExistingNames(newSet);
                        }
                    })
                    .catch((error) => {
                        console.error("error: ", error);
                    });
            }
        }
        populateGraphData(comparedCards);
    }, [comparedCards]);

    useEffect(() => {
        //get professor.info and pass this down to teh cards as well
        const populateProfessorInfoForComparedCards = (comparedCards) => {
            for(const card of comparedCards){
                console.log(card);
                const course = card.split("_")[0];
                const dept = course.slice(0,4);
                const courseNumber = course.slice(4);
                const professorId = card.split("_")[1];
                const optionsUrl = `/server/api/courses/professorInfo?department=${dept}&courseNumber=${courseNumber}&professorID=${professorId}`;
                console.log(optionsUrl);
                const options = {
                    method: "GET",
                    url: optionsUrl
                };
                axios(options)
                    .then((response) => {
                        if(!response || !response.data){
                            throw new Error("Invalid response structure");
                        }
                        const data = response.data;
                        if (typeof object !== "object" || data === null) {
                            throw new Error('Expected object data');
                        }
                        //check if duplicate info exists
                        //check if professor info does not match cards - by data.courseNumber, data.department, and data.professorId
                        setComparedProfessorInfo([
                            ...comparedProfessorInfo,
                            data
                        ]);
                    })
                    .catch((error) => {
                        //fallback by getting default - which will only have 
                        //can only check by data.professorId - but this should only delete at most one instance, as there could be
                        //GOVT 2306 prof1 and GOVT 2307 prof1, but if they both default to profId, then we cant delete them both
                        
                        console.error("error: ", error);

                    })
            }
        }
        populateProfessorInfoForComparedCards(comparedCards);
    }, [comparedCards])

    return (
        <div className = "search-results">
            <SearchOptions />
            <div className = "body grid grid-cols-12">
                <div className = "cards col-span-6">
                    <ActionsHeader />
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
                <div className = "compare col-span-6">
                    {/* need compared cards info ->
                        array of objects
                        {
                            dept, course, professorName, 
                            GPA, rating, wouldtakeagain,
                            difficulty, # of students / ratings (i.e. how often do people care)
                        }
                    */}
                    <Compare 
                        categories = {categories}
                        series = {series}
                        names = {existingNames}
                        professorInfo = {comparedProfessorInfo}
                    />
                </div>
            </div>
        </div>
    )
} 

export default SearchResults;