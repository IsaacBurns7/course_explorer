import { useContext } from "react";
import { CardsContext } from "../context/cards";

export const useCardsContext = () => {
    const context = useContext(CardsContext);
    if(!context){
        throw Error("useCardsContext must be used inside a CardsContextProvider");
    }
    return context;
};