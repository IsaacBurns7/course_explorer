import { useEffect } from "react";
import { Link } from "react-router-dom";

import SearchButton from "./SearchButton";

import { CoursesActions } from "../context/courses";

import { useCoursesContext } from "../hooks/useCoursesContext";

const Navbar = () => { 
    const {courses, dispatch} = useCoursesContext();

    useEffect(() => {
        //this should be an API call
        const defaultCourses = [
            "CSCE 120",
            "CSCE 221"
        ];
        function addDefaultCourses(){
            const newCourses = defaultCourses.reduce((acc, curr) => {
                if(!acc[curr]){
                    acc[curr] = {
                        info: {

                        }
                    }
                }
                return acc;
            }, {});
            // console.log(newCourses);

            dispatch({type: CoursesActions.SET_COURSES, payload: newCourses});
        }
        addDefaultCourses();
    }, []);

    return (
        <div className = "flex p-4 gap-6 fixed h-16 z-50 bg-maroon w-full opacity-100">
            <Link to = "/">
                <h1>Home</h1>
            </Link>

            <SearchButton />

            <Link to = "/planner">
                {"<planner>"}
            </Link>
        </div>
    )
}

export default Navbar;