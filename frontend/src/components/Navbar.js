import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Notebook, Menu, X } from 'lucide-react';
import AutoCompleteSearch from './Search';
import axios from "axios";
import SearchButton from "./SearchButton";
import { getAllCourses } from "../hooks/useAllCourses";
import LoginButton from './LoginButton';
const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);


    const API = "http://localhost:4000";
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState(new Set());

    const refreshMe = async () => {
    try{
      console.log("Attempting to refresh user info...");
      const r = await fetch(`${API}/auth/me`, { credentials: "include" });
      const d = await r.json();
      console.log(d)
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
    <>
      <nav className="bg-maroon border-b border-dark-border shadow-lg fixed top-0 left-0 right-0 z-30 backdrop-blur-sm bg-opacity-95">
        <div className="mx-auto px-3 sm:px-6 lg:px-8" style={{ maxWidth: '100rem' }}>
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Brand */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 sm:space-x-3 group transition-transform duration-200 hover:scale-105 flex-shrink-0"
            >
              <svg className="h-8 w-8 sm:h-12 sm:w-12 transition-colors duration-200 group-hover:[&_g]:fill-maroon" viewBox="0 0 540 662" fill="none" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                <defs>
                  <g id="g21597">
                    <symbol overflow="visible" id="glyph0-0">
                      <path style={{ stroke: "none" }} d="" />
                    </symbol>
                    <symbol overflow="visible" id="glyph0-1">
                      <path style={{ stroke: "none" }} d="" />
                    </symbol>
                    <symbol overflow="visible" id="glyph1-0">
                      <path
                        style={{ stroke: "none" }}
                        d="M 82.078125,0 V -616.89062 H 436.3125 V 0 Z M 126.14063,-44.0625 H 393.125 V -572.82812 H 126.14063 Z m 0,0"
                      />
                    </symbol>
                    <symbol overflow="visible" id="glyph1-1">
                      <path
                        style={{ stroke: "none" }}
                        d="M 73.4375,0 C 61.34375,0 53.417969,-1.867188 49.671875,-5.609375 45.929688,-9.355469 44.0625,-17.28125 44.0625,-29.375 v -603.07812 c 0,-12.08985 1.867188,-20.00782 5.609375,-23.75 3.746094,-3.7461 11.671875,-5.625 23.765625,-5.625 H 510.625 c 12.08984,0 20.00781,1.8789 23.75,5.625 3.74609,3.74218 5.625,11.66015 5.625,23.75 V -29.375 c 0,12.09375 -1.87891,20.019531 -5.625,23.765625 C 530.63281,-1.867188 522.71484,0 510.625,0 Z m 5.1875,-12.09375 h 426.8125 c 9.78906,0 15.98437,-1.296875 18.57812,-3.890625 2.58985,-2.589844 3.89063,-8.785156 3.89063,-18.578125 v -592.70312 c 0,-10.36329 -1.30078,-16.69532 -3.89063,-19 -2.59375,-2.3086 -8.78906,-3.46875 -18.57812,-3.46875 H 78.625 c -10.367187,0 -16.707031,1.16015 -19.015625,3.46875 -2.304687,2.30468 -3.453125,8.63671 -3.453125,19 V -34.5625 c 0,9.792969 1.148438,15.988281 3.453125,18.578125 2.308594,2.59375 8.648438,3.890625 19.015625,3.890625 z m -9.5,-555.54687 22.453125,-60.48438 h 13.828125 l 22.46875,60.48438 h -13.82812 l -4.3125,-13.82813 H 87.265625 l -5.1875,13.82813 z m 21.59375,-23.32813 h 15.54688 L 98.5,-613.4375 Z m 4.328125,95.89063 2.578125,-12.95313 v -3.45312 h -0.859375 c -1.730469,5.76171 -5.183594,8.64062 -10.359375,8.64062 -6.917969,0 -10.375,-3.74219 -10.375,-11.23437 0,-5.75782 3.164063,-11.80469 9.5,-18.14063 4.613281,-4.61328 8.9375,-10.375 12.96875,-17.28125 1.144531,2.875 3.01563,5.75781 5.60938,8.64063 2.58984,2.875 5.32812,5.75781 8.20312,8.64062 5.75781,5.76172 8.64063,11.80859 8.64063,18.14063 0,7.49218 -3.45704,11.23437 -10.35938,11.23437 -5.1875,0 -8.64844,-2.87891 -10.375,-8.64062 h -0.859375 v 3.45312 l 2.593755,12.95313 z m 185.749995,247.10937 c 5.75782,-10.94531 8.64063,-24.76953 8.64063,-41.46875 v -9.5 h -1.71875 c -0.58594,4.60547 -4.19141,10.22266 -10.8125,16.84375 -6.625,6.625 -13.97266,9.9375 -22.03125,9.9375 -7.49219,0 -14.40234,-3.01953 -20.73438,-9.0625 -6.33593,-6.05078 -9.5,-14.55078 -9.5,-25.5 0,-14.39453 10.07813,-33.40625 30.23438,-57.03125 21.30859,-25.33984 33.69531,-42.33203 37.15625,-50.96875 2.30078,4.60547 6.61719,11.23047 12.95312,19.875 6.33985,8.63672 14.41016,19.00391 24.20313,31.09375 20.15234,24.77344 30.23437,43.78516 30.23437,57.03125 0,10.94922 -3.16796,19.44922 -9.5,25.5 -6.33593,6.04297 -13.24609,9.0625 -20.73437,9.0625 -8.0625,0 -15.26953,-3.3125 -21.60938,-9.9375 -6.33593,-6.62109 -10.07421,-12.23828 -11.21875,-16.84375 H 294.625 v 9.5 c 0,16.69922 2.87891,30.52344 8.64062,41.46875 z M 485.5625,-112.3125 c -3.44922,-7.48828 -7.76953,-13.53906 -12.95313,-18.15625 -6.33593,-5.17578 -9.5,-10.9375 -9.5,-17.28125 0,-7.47656 3.45313,-11.21875 10.35938,-11.21875 5.18359,0 8.64453,2.87891 10.375,8.625 h 0.85937 v -3.45312 L 482.10937,-166.75 h 6.92188 l -2.59375,12.95313 v 3.45312 h 0.85937 c 1.72657,-5.74609 5.17969,-8.625 10.35938,-8.625 6.91406,0 10.375,3.74219 10.375,11.21875 0,7.49219 -2.88281,13.25391 -8.64063,17.28125 -3.46093,2.30469 -6.33984,5.18359 -8.64062,8.64062 -2.30469,3.46094 -4.03516,6.63282 -5.1875,9.51563 z m -6.90625,78.609375 -22.46875,-60.46875 h 13.82812 l 4.32813,13.8125 h 22.45312 l 5.1875,-13.8125 h 12.95313 l -22.45313,60.46875 z m 6.90625,-14.6875 7.78125,-22.453125 h -15.54688 z m 0,0"
                      />
                    </symbol>
                  </g>
                </defs>
                <g style={{ fill: "#F5F1E8", fillOpacity: 1 }} className="transition-colors duration-200">
                  <use xlinkHref="#glyph1-1" x="33.788898" y="661.82811" width="100%" height="100%" />
                </g>
              </svg>
              <div className="flex flex-col whitespace-nowrap">
                <span className="text-sm sm:text-lg md:text-xl font-bold text-beige-light group-hover:text-yellow-400 transition-colors">
                  Aggie Course Explorer
                </span>
                <span className="text-xs text-beige-dark hidden sm:block">
                  ACE your future
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center flex-grow justify-center pr-32 w-[70%]">
              <Link
                to="/"
                className="lm-bright flex items-center space-x-2 px-3 py-2 rounded-full text-beige-light hover:bg-dark-select hover:text-beige-light transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                <span className="hidden xl:inline font-medium">Home</span>
              </Link>
              
              <div className="flex-1 max-w-md">
                <AutoCompleteSearch navbarMode={true} />
              </div>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center space-x-2">
              <Link
                to="/planner"
                className="lm-bright flex items-center space-x-2 px-3 py-2 rounded-full text-beige-light hover:bg-dark-select hover:text-beige-light transition-all duration-200"
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden xl:inline font-medium">Planner</span>
              </Link>

              <Link
                to="/scheduler"
                className="lm-bright flex items-center space-x-2 px-3 py-2 rounded-full text-beige-light hover:bg-dark-select hover:text-beige-light transition-all duration-200"
              >
                <Notebook className="h-4 w-4" />
                <span className="hidden xl:inline font-medium">Scheduler</span>
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

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-beige-light hover:bg-dark-select transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-14 sm:top-16 left-0 right-0 z-20 bg-maroon border-b border-dark-border shadow-lg backdrop-blur-sm bg-opacity-95">
          <div className="px-3 py-4 space-y-3">
            {/* Mobile Search */}
            <div className="w-full">
              <AutoCompleteSearch navbarMode={true} />
            </div>

            {/* Mobile Navigation Links */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-beige-light hover:bg-dark-select transition-all duration-200 w-full"
            >
              <Home className="h-5 w-5" />
              <span className="font-medium">Home</span>
            </Link>

            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-beige-light hover:bg-dark-select transition-all duration-200 w-full"
            >
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Planner</span>
            </Link>

            <Link
              to="/scheduler"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-beige-light hover:bg-dark-select transition-all duration-200 w-full"
            >
              <Notebook className="h-5 w-5" />
              <span className="font-medium">Scheduler</span>
            </Link>
              {user ? (
              <div className="flex items-center gap-3 px-4">
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
      )}
    </>
  );
};

export default Navbar;
