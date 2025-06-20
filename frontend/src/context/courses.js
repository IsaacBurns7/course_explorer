// COURSES:
//     Hashmap Courses ("${dept}${number}" -> COURSE OBJECT)
//     COURSE OBJECT:
//         {info}
//         //NOT {sections} -> for overall //note: will aggregator over professors instead of storing sections twice
//         [professorsId (internal ID from mongo?)]

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
            return action.payload
        case CoursesActions.ADD_COURSES: {
            const newState = {...state};
            Object.entries(action.payload).forEach(([key, course], index) => {
                if(newState[key]){
                    newState[key] = {
                        ...course,
                        professorsId: [...new Set([
                            ...newState[key].professorsId, 
                            ...course.professorsId
                        ])]
                    };
                } else {
                    newState[key] = course;
                }
            });
            return newState;
        }
        case CoursesActions.ADD_COURSE: {
            const course = action.payload;
            const key = `${course.info.dept}${course.info.number}`;

            if(state[key]) { //merge professorsId from both if course already in state
                return {
                    ...state,
                    [key]: {
                        ...course, 
                        professorsId: [...new Set([...state[key].professorsId, ...course.professorsId])]
                    }
                }
            }

            return {
                ...state,
                [key]: course //add new course
            };
        }
        default:
            return state;
    }
}

export const CoursesContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(CoursesReducer, {});

    const contextValue = useMemo(() => ({
        ...state,
        dispatch
    }), [state]);

    return <CoursesContext.Provider value = {contextValue}>
        {children}
    </CoursesContext.Provider>
}