// COURSES:
//     Hashmap Courses ("${dept}${number}" -> COURSE OBJECT)
//     COURSE OBJECT:
//         {info}
//         //NOT {sections} -> for overall //note: will aggregator over professors instead of storing sections twice
//         [professorsId (internal ID from mongo?)]

import { createContext, useReducer } from "react";

type Course = {
    info: {
        dept: String;
    }
};

type CoursesState = {
    [key: String]: Course;
}

export const CoursesContext = createContext();

export const CoursesReducer = (state, action) => {
    switch(action.type){
        case 'SET_COURSES':
            return {
                courses: action.payload
            }
        case "ADD_COURSES": {
            return {
                courses: [...state, action.payload]
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

    return <CoursesContext.Provider value = {{...state, dispatch}}>
        {children}
    </CoursesContext.Provider>
}