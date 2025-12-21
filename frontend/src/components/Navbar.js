import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchButton from "./SearchButton";
import AutoCompleteSearch from "./Search";
import { getAllCourses } from "../hooks/useAllCourses";
import LoginButton from "./LoginButton";

//ELIMINATE USECOURSESCONTEXT
const Navbar = () => { 
    const API = "http://localhost:4000";
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState(new Set());

    const refreshMe = async () => {
    try{
      const r = await fetch(`${API}/auth/me`, { credentials: "include" });
      const d = await r.json();
      setUser(d.user || null);
    } catch {
      setUser(null);
    }
    };

    useEffect(() =>{
      refreshMe();
    }, [location.key]);

    async function handleLogout() {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      setUser(null);
    }

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

    <div className="flex items-center gap-4">
      <Link to="/">
        <h1 className="text-white text-lg font-bold hover:text-yellow-300 transition">
          Home
        </h1>
      </Link>

      <AutoCompleteSearch navbarMode={true} />
    </div>

    <div className = "flex items-center gap-4">
      {/*this will not be published until compare isnt such a piece of shit*/}
      {/* <Link to="/compare" className="text-white font-mono hover:text-yellow-300 transition">
      {"<compare>"}
      </Link> */}
      <Link to="/planner" className="text-white font-mono hover:text-yellow-300 transition">
        {"<planner>"}
      </Link>

      {user ? (
    <div className="flex items-center gap-3">
      {user.picture && (
        <img
          src={user.picture}
          alt={user.name || "User"}
          className="w-8 h-8 rounded-full border border-gray-700"
        />
      )}
      <span className="text-sm text-gray-200">
        {user.name || user.email || "Signed in"}
      </span>
      <button
        onClick={handleLogout}
        className="ml-4 px-6 py-2 border border-purple-500 text-white rounded-full hover:bg-purple-600 transition duration-300"
      >
        Logout
      </button>
      </div>
    ) : (
      <LoginButton authUrl={`${API}/auth/google`} />
    )}
    </div>
  </div>
);
}

export default Navbar;