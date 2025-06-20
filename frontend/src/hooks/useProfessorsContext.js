import { useContext } from "react";
import { ProfessorsContext } from "../context/professors";

export const useProfessorsContext = () => {
    const context = useContext(ProfessorsContext);
    if(!context){
        throw Error("useProfessorsContext must be used inside a ProfessorsContextProvider");
    }
    return context;
};