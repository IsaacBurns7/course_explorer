import { createContext, useMemo, useReducer } from "react";

export const CompareContext = createContext();

export const CompareReducer = (state, action) => {
    switch(action.type){
        case "SET_CARDS":
            return {
                cards: [
                    ...action.payload
                ]
            }
        default:
            return state
    }
}

export const CompareContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(CompareReducer, {
        cards: []
    }); 

    const contextValue = useMemo(() => {
        return { 
            ...state,
            dispatch
        }
    });

    return <CompareContext.Provider>
        {children}
    </CompareContext.Provider>;
}