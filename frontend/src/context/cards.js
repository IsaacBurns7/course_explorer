import { createContext, useReducer } from "react";

export const CardsContext = createContext();

export const CardsReducer = (state, action) => {
    switch(action.type){
        case 'SET_CARDS':
            return {
                cards: action.payload
            }
        case "ADD_CARDS": {
            return {
                cards: [...state, action.payload]
            }
        }
        default:
            return state;
    }
}

export const CardsContextProvider = ( {children} ) => {
    const [state, dispatch] = useReducer(CardsReducer, {
        cards: null
    });

    return <CardsContext.Provider value = {{...state, dispatch}}>
        {children}
    </CardsContext.Provider>
}