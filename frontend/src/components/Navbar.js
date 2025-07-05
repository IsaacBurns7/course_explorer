import { useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import SearchButton from "./SearchButton";

import { CoursesActions } from "../context/courses";

import { useCoursesContext } from "../hooks/useCoursesContext";

const Navbar = () => { 
    const {courses, dispatch} = useCoursesContext();

    useEffect(() => {
        //this should be an API call
        const url = `/server/api/courses/getAll`;
        const options = {
            method: "GET",
            url
        }
        axios(options)
            .then((response) => {
                if(!response || !response.data){
                    throw new Error("Invalid response structure");
                }
                const data = response.data;
                if (typeof data !== 'object' || data === null) {
                    throw new Error('Expected object data');
                }
                const defaultCourses = response.data.map((course) => {
                    return course.replace("_", " ");
                });
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
                    console.log(newCourses["AGCJ 105"]);

                    dispatch({type: CoursesActions.ADD_COURSES_NO_OVERRIDE, payload: newCourses});
                }
                addDefaultCourses();
            })
            .catch((error) => {
                console.error("error: ", error);
            })
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