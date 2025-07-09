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
import department from "../../../backend/models/department";

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
    const [comparedProfessorsInfo, setComparedProfessorsInfo] = useState([]);

    const dept = searchParams.get("dept");
    const courseNumber = searchParams.get("courseNumber");

    //this uses professors and courses context, which I would like to eliminate. 
    //Modify addCourse call to return courses & professors info, which then can be resolved into searchResults' state.
    //Then, delete courses and professors context, as it will be redundant. 
    //This will get rid of a lot of rerenders that only occur because 
    //  many child components access both courses and professors context.
    useEffect(() => {
        addCourse(dept, courseNumber);
    }, [dept, courseNumber]);

    //this useeffect populates the graph data of compared cards
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

    //this useefffect is to populate professor info for compared cards
    useEffect(() => {
        //get professor.info and pass this down to teh cards as well
        const populateProfessorsInfoForComparedCards = (comparedCards) => {
            for(const card of comparedCards){
                console.log(card);
                const course = card.split("_")[0];
                const dept = course.slice(0,4);
                const courseNumber = course.slice(4);
                const professorId = card.split("_")[1];
                const optionsUrl = `/server/api/courses/professorInfo?department=${dept}&courseNumber=${courseNumber}&professorID=${professorId}`;
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
                        if (typeof data !== "object" || data === null) {
                            throw new Error('Expected object data');
                        }
                        //check if duplicate info exists
                        //check if professor info does not match cards - by data.courseNumber, data.department, and data.professorId
                        setComparedProfessorsInfo([
                            ...comparedProfessorsInfo,
                            data
                        ]);
                    })
                    .catch((error) => {
                        //fallback by getting default - which will only have 
                        //can only check by data.professorId - but this should only delete at most one instance, as there could be
                        //GOVT 2306 prof1 and GOVT 2307 prof1, but if they both default to profId, then we cant delete them both
                        const options2Url = `/server/api/professors/professorInfo?professorID=${professorId}`;
                        const options2 = {
                            method: "GET",
                            url: options2Url
                        };
                        axios(options2)
                            .then((response) => {
                                if(!response || !response.data){
                                    throw new Error("Invalid response structure");
                                }
                                const data = response.data;
                                console.log(typeof data, data);
                                if (typeof data !== "object" || data === null) {
                                    throw new Error('Expected object data');
                                }
                                setComparedProfessorsInfo([
                                    ...comparedProfessorsInfo,
                                    data
                                ])
                            })
                            .catch((error) => {
                                console.error("error: ", error);
                            });
                        //actually catch the error
                        if(error.response?.status === 404){
                            console.error(`Data for professor ${professorId} in course ${dept}_${courseNumber} not found. Usually a lack of specific ratings.`)
                            //this is expected to happen when ratings arent found for specific professor
                            return;
                        }
                        if (error.response) {
                            // The request was made and the server responded with a status code
                            // that falls out of the range of 2xx
                            console.log(error.response.data);
                            console.log(error.response.status);
                            console.log(error.response.headers);
                        } else if (error.request) {
                            // The request was made but no response was received
                            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
                            // http.ClientRequest in node.js
                            console.log(error.request);
                        } else {
                            // Something happened in setting up the request that triggered an Error
                            console.log('Error', error.message);
                        }
                        console.log(error.config);
                    });
            }
        }
        populateProfessorsInfoForComparedCards(comparedCards);
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
                    <Compare 
                        categories = {categories}
                        series = {series}
                        names = {existingNames}
                        professorsInfo = {comparedProfessorsInfo}
                    />
                </div>
            </div>
        </div>
    )
} 

export default SearchResults;