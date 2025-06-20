// PROFESSORS:
//     Hashmap Professors (ProfessorID -> PROFESSOR OBJECT)
//     PROFESSOR OBJECT: 
//         COURSE Hashmap ("${dept}${number}" -> SECTIONSARRAY: [{sectionObjects}])
//             sectionObjects:
//                 {same as in DB}

import { createContext, useReducer, useMemo } from "react";

export const ProfessorsContext = createContext();

export const ProfessorsActions = {
    SET_PROFESSORS: "SET_PROFESSORS",
    ADD_PROFESSORS: "ADD_PROFESSORS"
}

export const ProfessorsReducer = (state, action) => {
    switch(action.type){
        case ProfessorsActions.SET_PROFESSORS:
            return action.payload
        case ProfessorsActions.ADD_PROFESSORS: {
            return Object.entries(action.payload).reduce((acc, [professorId, professor]) => {
                489 
            }, {...state});
        }
        default:
            return state;
    }
}

export const ProfessorsContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(ProfessorsReducer, {
        
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