import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import SearchButton from "./SearchButton";
import AutoCompleteSearch from "./Search";
import { getAllCourses } from "../hooks/useAllCourses";

const Navbar = () => {
  const [courses, setCourses] = useState(new Set());
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    getAllCourses()
      .then(courseSet => {
        setCourses(prev => {
          const newSet = new Set(prev);
          courseSet.forEach(courseKey => newSet.add(courseKey));
          return newSet;
        });
      })
      .catch(err => console.error("Failed to load courses", err));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-maroon shadow-md z-40 flex items-center justify-between px-6 h-16">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <Link to="/" className="text-white text-lg font-bold hover:text-yellow-300 transition">
          Home
        </Link>
      </div>

      {/* Search Input — hidden on very small screens */}
      <div className="hidden sm:flex flex-1 justify-center max-w-md">
        <AutoCompleteSearch navbarMode={true} />
      </div>

      {/* Right Section */}
      <div className="hidden sm:flex items-center gap-4">
        <Link to="/planner" className="text-white font-mono hover:text-yellow-300 transition">
          {"<planner>"}
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden text-white focus:outline-none"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-maroon flex flex-col items-center gap-4 py-4 sm:hidden shadow-lg">
          <AutoCompleteSearch navbarMode={true} />
          <Link to="/planner" className="text-white font-mono hover:text-yellow-300 transition" onClick={() => setMenuOpen(false)}>
            {"<planner>"}
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
