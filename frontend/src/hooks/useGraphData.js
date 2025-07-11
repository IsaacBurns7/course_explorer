import { useState, useEffect } from "react";
import axios from "axios";

export const useGraphData = ( comparedCards ) => {
    const [series, setSeries] = useState([]);
    const [categories, setCategories] = useState([]);
    const [existingNames, setExistingNames] = useState(new Set());
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
        //return cleanup function 
    }, [comparedCards]);
    return { series, categories, existingNames};
}