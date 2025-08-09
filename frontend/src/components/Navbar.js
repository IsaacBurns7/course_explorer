import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchButton from "./SearchButton";
//ELIMINATE USECOURSESCONTEXT
const Navbar = () => { 
    const [courses, setCourses] = useState(new Set());

    useEffect(() => {
      const abortController = new AbortController();
      const signal = abortController.signal;
      const fetchAllCourses = async () => {    
        try{
          const response = await axios.get(`/server/api/courses/getAll`, {signal});
          if(!response || !response.data){
                throw new Error("Invalid response structure");
          }
          const data = response.data;
          if (typeof data !== 'object' || data === null) {
              throw new Error('Expected object data');
          }
          const defaultCourses = data.map((course) => course.replace("_", " "));
          setCourses(defaultCourses);
        }catch(error){

        }
      }
      fetchAllCourses();
      return () => {
        abortController.abort();
      }
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