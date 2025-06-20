/*
CARDS: 
    ARRAY of [String w/ format: "${dept}${number}${professorId}"]
*/
import { createContext, useMemo, useReducer } from "react";

export const CardsContext = createContext();

export const CardsReducer = (state, action) => {
    switch(action.type){
        case 'SET_CARDS':
            return action.payload
        case "ADD_CARDS": {
            return [
                ...state,
                ...action.payload
            ]
        }
        case "ADD_CARD": {
            return [
                ...state,
                action.payload
            ]
        }
        default:
            return state;
    }
}

export const CardsContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(CardsReducer, {});

    const contextValue = useMemo(() => {
        return { 
            ...state,
            dispatch
        };
    });

    return <CardsContext.Provider value = {contextValue}>
        {children}
    </CardsContext.Provider>
}