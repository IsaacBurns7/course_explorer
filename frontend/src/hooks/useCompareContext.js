import { useContext } from "react";
import { CompareContext } from "../context/compare";

export const useCompareContext = () => {
    const context = useContext(CompareContext);
    if(!context){
        throw Error("useCompareContext must be used inside a CompareContextProvider");
    }
    return context;
};