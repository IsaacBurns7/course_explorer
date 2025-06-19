// PROFESSORS:
//     Hashmap Professors (ProfessorID -> PROFESSOR OBJECT)
//     PROFESSOR OBJECT: 
//         ARRAY of COURSE Hashmaps ("${dept}${number}" -> SECTIONSARRAY: [{sectionObjects}])
//             sectionObjects:
//                 {same as in DB}

import { createContext, useReducer } from "react";

export const ProfessorsContext = createContext();

export const ProfessorsReducer = (state, action) => {
    switch(action.type){
        case 'SET_PROFESSORS':
            return {
                professors: action.payload
            }
        case "ADD_PROFESSORS": {
            return {
                professors: [...state, action.payload]
            }
        }
        default:
            return state;
    }
}

export const ProfessorsContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(ProfessorsReducer, {
        professors: null
    });

    return <ProfessorsContext.Provider value = {{...state, dispatch}}>
        {children}
    </ProfessorsContext.Provider>
}