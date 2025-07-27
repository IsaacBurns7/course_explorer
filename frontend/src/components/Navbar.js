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
<div className="fixed top-0 left-0 w-full h-16 bg-maroon shadow-md z-50 flex items-center justify-between px-8">

    {/* Left section: Home + Input + Submit */}
    <div className="flex items-center gap-4">
      <Link to="/">
        <h1 className="text-white text-lg font-bold hover:text-yellow-300 transition">
          Home
        </h1>
      </Link>

      <SearchButton courses = {courses}/>
    </div>

    {/* Right section: Planner */}
    <Link to="/planner" className="text-white font-mono hover:text-yellow-300 transition">
      {"<planner>"}
    </Link>
  </div>
);
}

export default Navbar;