/*
COURSES:
    Hashmap Courses ("${dept}${number}" -> COURSE OBJECT)
    COURSE OBJECT:
        {info} -> <ATTRIBUTES UNDECIDED>
        Hashmap Professors ["${professorId}" -> PROFESSOR OBJECT]
        PROFESSOR OBJECT:
            {info} -> <ATTRIBUTES UNDECIDED>
            Hashmap Semesters ["${timeOfYear} {year}" -> SEMESTER OBJECT]
            SEMESTER OBJECT:
                ?{info} -> not implemented yet... + <ATTRIBUTES UNDECIDED>
                [array of sections objects] -> could turn into object of sections, with CRN # or section # as key for faster queries...
                
EXAMPLE
const newCourses = {
    "CSCE120": {
        info: {
            //info about course
        },
        "professorId1": {
            info: {
                //info about the professor for this class specifically
            },
            "FALL 2024": [
                //Array of Sections Objects
                {
                    check DB for section object schema
                },
                {

                }
            ],
        },
        "professorId2": {
            "FALL 2024": [
                {

                },
                {

                }
            ]
        }
    }
};


*/

import { createContext, useReducer, useMemo } from "react";

export const CoursesContext = createContext();

export const CoursesActions = {
    SET_COURSES: "SET_COURSES",
    ADD_COURSES: "ADD_COURSES",
    ADD_COURSE: "ADD_COURSE"
}

export const CoursesReducer = (state, action) => {
    switch(action.type){
        case CoursesActions.SET_COURSES:
            return {
                courses: action.payload
            }
        case CoursesActions.ADD_COURSES: {
            const newCourses = {
                ...state.courses,
                ...action.payload //overwrite old data
            }
            return {
                ...state, 
                courses: newCourses
            }
        }
        default:
            return state;
    }
}

export const CoursesContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(CoursesReducer, {
        courses: null
    });

    const contextValue = useMemo(() => ({
        ...state,
        dispatch
    }), [state]);

    return <CoursesContext.Provider value = {contextValue}>
        {children}
    </CoursesContext.Provider>
}

