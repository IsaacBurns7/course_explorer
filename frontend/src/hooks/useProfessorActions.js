const axios = require("axios");

import { ProfessorsActions } from "../context/professors";

import { useProfessorsContext } from "./useProfessorsContext";

export const useProfessorActions = () => {
    const { professors, dispatch }  = useProfessorsContext();

    //for each professor, add the courses from the backend
    const addCoursesToProfessor = async (professorId) => {
        const url = `/server/api/professors/coursesTaught/?professorID=${professorId}`;
        const options = {
            method: "GET",
            url
        };

        axios(options)
            .then((response) => {
                if(!response | !response.data){
                    throw new Error("Invalid response structure");
                }
                const data = response.data;
                if(data === null | !Array.isArray(data)){
                    throw new Error("Expected array data");
                }
                const newProfessor = {
                    ...professors[professorId],
                    courses: data
                };
                dispatch({type: ProfessorsActions.ADD_PROFESSOR, payload: {
                    professorId,
                    professor: newProfessor
                }});
            })
            .catch((error) => {
                console.error("error: ", error)
            })
    }   
    return { addCoursesToProfessor }; 
}