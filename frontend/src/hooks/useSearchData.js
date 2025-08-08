import { useEffect, useContext } from "react";
import axios from "axios";
import { SearchContext } from "../context/search";

export function useSearchData(searchQuery){
    const { setGraphData, setCourses, setProfessors, setSemesters} = useContext(SearchContext);
    useEffect(() => {
        let isLatestRequest = true; 

        const fetchGraphData = async () => {
            try{
                const url = `/server/api/search/graphData?query=${searchQuery}`
                const response = await axios(url);
d               if(isLatestRequest){
                    setGraphData(response.data);
                }   
            } catch(error){
                // setError(error);
            }
            
        }

        return () => {
            isLatestRequest = false; //mark as outdated on unmount / new request.
        }

    }, [setGraphData]);
}