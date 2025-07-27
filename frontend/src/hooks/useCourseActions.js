const axios = require("axios");

import { CoursesActions } from "../context/courses";
import { ProfessorsActions } from "../context/professors";

import { useProfessorsContext } from "./useProfessorsContext";
import { useCardsContext } from "./useCardsContext";
import { useCoursesContext } from "./useCoursesContext";
import { useSearchContext } from "./useSearchContext";

export const useCourseActions = () => {
    const { dispatch: professorsDispatch } = useProfessorsContext();
    const { dispatch: cardsDispatch } = useCardsContext();
    const { dispatch: coursesDispatch } = useCoursesContext();
    const { state: searchState } = useSearchContext();

    const addCourse = async (courseDept, courseNumber) => {
        const options = {
            method: "GET",
            url: `/server/api/courses/?department=${courseDept}&courseNumber=${courseNumber}`
        }
        axios(options)
            .then(function (response){
                if(!response || !response.data){
                    throw new Error("Invalid response structure");
                }
                const data = response.data;
                if (typeof data !== 'object' || data === null) {
                    throw new Error('Expected object data');
                }
                coursesDispatch({type: CoursesActions.ADD_COURSES, payload: data});
                const newProfessors = new Map(Object.entries(data[`${courseDept} ${courseNumber}`]));
                const newCards = [];
                for(const [professorId, professor] of newProfessors){
                    newCards.push(`${courseDept}${courseNumber}_${professorId}`);
                    if(professorId === "info"){
                        continue;
                    }
                    professorsDispatch({type: ProfessorsActions.ADD_PROFESSOR, payload: {
                        professorId,
                        professor
                    }});
                }
                cardsDispatch({type: "ADD_CARDS", payload: newCards});


            })
            .catch(function (error){
                console.error("error: ", error);
            })
            .finally(function (){
            })
        // const newProfessors = {}; //hypothetical backend API call
        // const newCards = {}; //just do this yourself from provided arguments, and professorsState
    
        //do I want an additional context for graphs? 
    };



    return { addCourse };
}