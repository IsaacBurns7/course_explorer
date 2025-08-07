/* 
PROFESSORS:
    Hashmap Professors (ProfessorID -> PROFESSOR OBJECT)
    PROFESSOR OBJECT: 
        //metadata such as other classes taught, overall ratings, overall gpa, etc
        //section info will be held in courses context
EXAMPLE
const newProfessors = {
    "professorId1": {
        //metadata such as other classes taught, overall ratings, overall gpa, etc
        courses: [array of courses keys(e.g "DEPT_123")]
    },
}

*/

import { createContext, useReducer, useMemo } from "react";

export const ProfessorsContext = createContext();

export const ProfessorsActions = {
    SET_PROFESSORS: "SET_PROFESSORS",
    ADD_PROFESSORS: "ADD_PROFESSORS",
    ADD_PROFESSOR: "ADD_PROFESSOR"
}

export const ProfessorsReducer = (state, action) => {
    console.log(state);
    switch(action.type){
        case ProfessorsActions.SET_PROFESSORS:
            return {
                professors: action.payload
            }
        case ProfessorsActions.ADD_PROFESSORS: {
            // console.log("action payload add professors: ", action.payload);
            const newProfessors = Object.entries(action.payload).reduce((acc, [professorId, professor]) => {
                    // console.log("ADDING PROFESSOR w/ PROFESSOR ID: ", professorId);
                    // console.log("ADDING PROFESSOR OBJECT: ", professor);
                    acc[professorId] = professor; //overwrite no matter what
                    return acc;
                }, {...state.professors || {}});
            // console.log("add professors setting new professors: ", newProfessors);
            return {
                ...state,
                professors: newProfessors
            };
        }
        case ProfessorsActions.ADD_PROFESSOR: {
            const newState = {
                professors: {
                    ...state.professors,
                    [action.payload.professorId]: action.payload.professor
                }
            }
            return newState;
        }
        default:
            return state;
    }
}

export const ProfessorsContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(ProfessorsReducer, {
        professors: null
    });

    //useMemo on context so if provider re-renders, children using state only re-render if state actually changed
    const contextValue = useMemo(() => {
        return {
            ...state,
            dispatch
        }
    }, [state])

    return <ProfessorsContext.Provider value = {contextValue}>
        {children}
    </ProfessorsContext.Provider>
}