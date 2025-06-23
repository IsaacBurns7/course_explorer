import { useContext } from "react";
import { SearchContext } from "../context/search";

export const useSearchContext = () => {
    const context = useContext(SearchContext);
    if(!context){
        throw Error("useSearchContext must be used inside a SearchContextProvider");
    }
    return context;
}