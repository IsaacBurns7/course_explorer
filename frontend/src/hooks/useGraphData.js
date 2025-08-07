import { useState, useEffect } from "react";
import axios from "axios";

export const useGraphData = ( comparedCards ) => {
    const [series, setSeries] = useState(new Map()); //professor id -> series data
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        const updateGraphData = (comparedCards, cardToProfessorInfo) => {
            // console.log(series);
            const addedCards = comparedCards.filter((card) => {    
                return !series.has(card);
            });
            // console.log(addedCards);
            const deletedCards = Array.from(series.keys()).filter((card) => {
                return !comparedCards.includes(card);
            })

            for(const card of addedCards){
                const professorId = card.split("_")[1];
                const course = card.split("_")[0];
                const department = course.slice(0,4);
                const courseNumber = course.slice(4);
                const optionsUrl = `/server/api/courses/graph?department=${department}&courseNumber=${courseNumber}&professorID=${professorId}`;
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

                        // console.log(cardToProfessorInfo.get(professorId)); -- this is the problem
                        if(!series.has(professorId)){
                            setSeries(prev => {
                                const newSeries = new Map(prev);
                                newSeries.set(card, {
                                    name: department + courseNumber + "_" + cardToProfessorInfo?.get(professorId)?.name ?? professorId,
                                    data: newSeriesData,
                                    meta: {
                                        professorId, 
                                        department,
                                        courseNumber
                                    }
                                })
                                return newSeries;
                            });
                        }
                    })
                    .catch((error) => {
                        console.error("error: ", error);
                    });
            }
            for(const card of deletedCards){
                setSeries(prev => {
                    const newSeries = new Map(prev);
                    newSeries.delete(card);
                    return newSeries;
                }) 
            }
        }
        updateGraphData(comparedCards); //need to create cardToProfessorInfo with a name attribute
        console.log(series);
        //return cleanup function 
    }, [comparedCards]);
    return { series, categories };
}


//object : {other object: {other object: { var1: [array], var2: date, var3: int, var3: string} } }