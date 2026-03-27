import { useEffect, useContext } from "react";
import axios from "axios";
import { SearchContext } from "../context/search";

interface lineGraphData {
    
}

export function useSearchData(searchQuery: string){
    const { setGraphData, setCourses, setProfessors, setSemesters, setCards, courses, setLineGraphData} = useContext(SearchContext);
    useEffect(() => {
        const abortController: AbortController = new AbortController();
        const signal = abortController.signal;

        const fetchAllData = async () => {
            try{
                const urls = [
                    `/server/api/search2/graphData?${searchQuery}`,
                    `/server/api/search2/courses?${searchQuery}`,
                    `/server/api/search2/professors?${searchQuery}`,
                    `/server/api/search2/lineGraphData?${searchQuery}`
                    //could also do query=${searchQuery}, where searchQuery looks like 
                    //{ department: "CSCE", courseNumber: 120 }
                ];
                const [graphData, courses, professors, lineGraph] = await Promise.all(
                    urls.map(url => axios.get(url, {signal}))
                ); 
                const lineGraphData: lineGraphData = lineGraph.data;
                setLineGraphData(lineGraphData.lineGraphData);
                setGraphData(graphData.data);
                setCourses(courses.data);
                setProfessors(professors.data);
                setSemesters(lineGraphData.semesters); //this is for alignment
                console.log(lineGraphData);
               
            } catch(error){
                // setError(error);
                console.error(error);
            }   
        }

        fetchAllData();
        
        return () => {
            abortController.abort();
        }

    }, [setGraphData, setCourses, setProfessors, setCards, searchQuery]);

    useEffect(() => {
        const newCards = [];
        if(Object.entries(courses).length === 0) return;
        for(const [courseId, course] of Object.entries(courses)){
            if(!course.professors || course.professors.length === 0) break;
            for(const professorId of course.professors){
                newCards.push(courseId + "_" + professorId);
            }
        }
        setCards(newCards);
    }, [courses]);
}