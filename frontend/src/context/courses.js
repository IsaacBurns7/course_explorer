// COURSES:
//     Hashmap Courses ("${dept}${number}" -> COURSE OBJECT)
//     COURSE OBJECT:
//         {info}
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
            return {
                courses: action.payload
            }
        case CoursesActions.ADD_COURSES: {
            const newCourses = {...state.courses};
            Object.entries(action.payload).forEach(([key, course], index) => {
                if(newCourses[key]){
                    newCourses[key] = {
                        ...course,
                        professorsId: [...new Set([
                            ...newCourses[key].professorsId, 
                            ...course.professorsId
                        ])]
                    };
                } else {
                    newCourses[key] = course;
                }
            });
            return {
                courses: newCourses
            };
        }
        case CoursesActions.ADD_COURSE: {
            const course = action.payload;
            const key = `${course.info.dept}${course.info.number}`;

            if(state.courses[key]) { //merge professorsId from both if course already in state
                return {
                    courses: {
                        ...state.courses,
                        [key]: {
                            ...course, 
                            professorsId: [...new Set([...state[key].professorsId, ...course.professorsId])]
                        }
                    }
                }
            }

            return {
                courses: {
                    ...state.courses,
                    [key]: course //add new course
                }
            };
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

