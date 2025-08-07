import { useState, useEffect } from "react";
import axios from "axios";

//note: Compare gets its comparedProfessorsInfo from this hook, but the cards are from CompareContext

export const useProfessorsInfo = (comparedCards) => {
    const [comparedProfessorsInfo, setComparedProfessorsInfo] = useState([]);
    useEffect(() => {
        //get professor.info and pass this down to teh cards as well
        const updateProfessorInfo = async (comparedCards) => {
            const processedCards = new Set();
            
            const newCards = comparedCards.filter(card => {
                const [course, professorId] = card.split("_");
                const dept = course.slice(0,4);
                const courseNumber = course.slice(4);
                // console.log({ course, professorId, dept, courseNumber });
                
                return !comparedProfessorsInfo.some(info => {
                    // console.log("Comparing with:", info);
                    //problem, the professorId is present in the objects of comparedProfessorInfo, but department and courseNumber are not.
                    return info.professorId === professorId
                    // info.department === dept && 
                    // info.courseNumber === courseNumber);
                });
            });
            console.log(newCards);
            for(const card of newCards){
                if(processedCards.has(card)) continue;
                processedCards.add(card);

                try {
                    const [course, professorId] = card.split("_");
                    const dept = course.slice(0,4);
                    const courseNumber = course.slice(4);
                    const optionsUrl = `/server/api/courses/professorInfo?department=${dept}&courseNumber=${courseNumber}&professorID=${professorId}`;
                    const response = await axios.get(optionsUrl);
                    if(response?.data){
                        setComparedProfessorsInfo(prev => [
                            ...prev,
                            {
                                ...response.data,
                                department: dept,
                                courseNumber,
                                professorId
                            }
                        ])
                        continue;
                    }
                }catch (error){
                    try { 
                        const professorId = card.split("_")[1];
                        const options2Url = `/server/api/professors/professorInfo?professorID=${professorId}`;
                        const response2 = await axios.get(options2Url); 
                        if(response2?.data){
                            setComparedProfessorsInfo(prev => [
                                ...prev,
                                {
                                    ...response2.data,
                                    professorId
                                }
                            ])
                        }
                    } catch (error) {
                        console.error("Error fetching professor data: ", error);
                    }
                }
            }
        }
        updateProfessorInfo(comparedCards);
    }, [comparedCards]);
    return comparedProfessorsInfo;
}