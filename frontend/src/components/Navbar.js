import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchButton from "./SearchButton";
import AutoCompleteSearch from "./Search";
import { getAllCourses } from "../hooks/useAllCourses";

//ELIMINATE USECOURSESCONTEXT
const Navbar = () => { 
    const [courses, setCourses] = useState(new Set());

    useEffect(() => {
        getAllCourses()
          .then(courseSet => {
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
<div className="right-0 width-[100vw] fixed top-0 left-0 w-full h-16 bg-maroon shadow-md z-40 flex items-center justify-between px-8">

    {/* Left section: Home + Input + Submit */}
    <div className="flex items-center gap-4">
      <Link to="/">
        <h1 className="text-white text-lg font-bold hover:text-yellow-300 transition">
          Home
        </h1>
      </Link>

      <AutoCompleteSearch navbarMode={true} />
    </div>

    {/* Right section: Compare + Planner */}
    <div className = "flex items-center gap-4">
      {/*this will not be published until compare isnt such a piece of shit*/}
      {/* <Link to="/compare" className="text-white font-mono hover:text-yellow-300 transition">
      {"<compare>"}
      </Link> */}
      <Link to="/planner" className="text-white font-mono hover:text-yellow-300 transition">
        {"<planner>"}
      </Link>
    </div>
  </div>
);
}

export default Navbar;