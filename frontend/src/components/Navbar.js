import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import SearchButton from "./SearchButton";

//ELIMINATE USECOURSESCONTEXT
const Navbar = () => { 
    const [courses, setCourses] = useState(new Set());

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
                const allCourses = response.data.map((course) => {
                    return course.replace("_", " ");
                });
                setCourses(prev => {
                    const newSet = prev;
                    allCourses.forEach((courseKey) => {
                        newSet.add(courseKey);
                    })
                    return newSet;
                });
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

            <SearchButton courses = {courses}/>

            <Link to = "/planner">
                {"<planner>"}
            </Link>
        </div>
    )
}

export default Navbar;