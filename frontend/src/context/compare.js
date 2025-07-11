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
        case "ADD_CARD":
            return {
                ...state,
                cards: [
                    action.payload,
                    ...state.cards
                ]
            }
        case "DELETE_CARD":
            const newCards = state.cards.filter((card) => card !== action.payload);
            // console.log(state.cards, newCards, action.payload);
            return {
                ...state,
                cards: newCards
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

    return <CompareContext.Provider value = {contextValue}>
        {children}
    </CompareContext.Provider>;
}