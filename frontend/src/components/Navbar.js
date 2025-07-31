import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchButton from "./SearchButton";
import { getAllCourses } from "../hooks/useAllCourses";
//ELIMINATE USECOURSESCONTEXT
const Navbar = () => { 
    const [courses, setCourses] = useState(new Set());

    useEffect(() => {
    getAllCourses()
        .then(courseSet => {
        // use the Set however you want
         setCourses(prev => {
                    const newSet = prev;
                    courseSet.forEach((courseKey) => {
                        newSet.add(courseKey);
                    })
                    return newSet;
                });
        })
        .catch(err => console.error("Failed to load courses", err));
    }, []);

    return (
<div className="fixed top-0 left-0 w-full h-16 bg-maroon shadow-md z-40 flex items-center justify-between px-8">

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