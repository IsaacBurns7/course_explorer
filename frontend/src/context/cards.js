/*
CARDS: 
    ARRAY of [String w/ format: "${dept}${number}${professorId}"]
EXAMPLE
const newCards = [
        "DEPT123_professorId1",
        "DEPT123_professorId2",
    ];   
*/
import { createContext, useMemo, useReducer } from "react";

export const CardsContext = createContext();

export const CardsReducer = (state, action) => {
    switch(action.type){
        case 'SET_CARDS':
            return {
                cards: action.payload
            }
        case "ADD_CARDS": {
            return {
                cards: [
                    ...state,
                    ...action.payload
                ]
            }
        }
        case "ADD_CARD": {
            return {
                cards: [
                    ...state,
                    action.payload
                ]
            }
        }
        default:
            return state;
    }
}

export const CardsContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(CardsReducer, {cards: null});

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