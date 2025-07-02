const axios = require("axios");

import { ProfessorsActions } from "../context/professors";

import { useProfessorsContext } from "./useProfessorsContext";

export const useProfessorActions = () => {
    const { professors, dispatch }  = useProfessorsContext();

    //for each professor, add the courses from the backend
    const addCoursesToProfessors = async () => {
        
    }   
    return { addCoursesToProfessors }; 
}