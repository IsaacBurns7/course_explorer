import { useEffect, useContext } from "react";
import axios from "axios";
import { SearchContext } from "../context/search";

export function useSearchData(searchQuery){
    const { setGraphData, setCourses, setProfessors, setSemesters, setCards} = useContext(SearchContext);
    useEffect(() => {
        const abortController = new AbortController();
        const signal = abortController.signal;

        const fetchAllData = async () => {
            try{
                const urls = [
                    `/server/api/search/graphData?query=${searchQuery}`,
                    `/server/api/search/courses?query=${searchQuery}`,
                    `/server/api/search/professors?query=${searchQuery}`,
                ];
                const [graphData, courses, professors] = await Promise.all(
                    urls.map(url => axios.get(url, {signal}))
                ); 

                setGraphData(graphData);
                setCourses(courses);
                setProfessors(professors);
                for(const [courseId, course] of courses){
                    for(const professorId of course.professors){
                        addedCards.push(courseId + " " + professorId);
                    }
                }
                setCards(oldCards => [...oldCards, ...addedCards]);
            } catch(error){
                // setError(error);
            }   
        }

        fetchAllData();
        
        return () => {
            abortController.abort();
        }

    }, [setGraphData, setCourses, setProfessors, searchQuery]);
}