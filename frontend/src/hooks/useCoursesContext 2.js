import { useContext } from "react";
import { CoursesContext } from "../context/courses";

export const useCoursesContext = () => {
    const context = useContext(CoursesContext);
    if(!context){
        throw Error("useCoursesContext must be used inside a CoursesContextProvider");
    }
    return context;
};