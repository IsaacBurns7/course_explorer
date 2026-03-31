//libraries
import React from "react";
import { useState, useEffect } from "react";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
//hooks
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

//pages
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import Planner from "./pages/Planner"
import ComparePage from "./pages/Compare";
import CourseDetails from "./pages/CourseDetails";
import DashboardRedirect from "./pages/DashboardRedirect";
import { SearchContextProvider } from "./context/search";
import Scheduler from "./pages/Scheduler";
import PrereqDiagram from "./components/Diagram/PrereqDiagram";

const App = () => {
   //const [professors, setProfessors] = useState([]);
   const [professors, setProfessors] = useState([]);

//    //what the hell is this even for ??? 
//     useEffect(() => {
//         const fetchProfessors = async () => {
//             const response = await fetch ("/server/api/professors/CSCE/120", {
//                 method: "GET"
//             });
//             const profJson = await response.json();
//             console.log("profJson: ", profJson);


//             if(response.ok){
//                 setProfessors(profJson);
//             }
//         }
//         fetchProfessors();

//         const professorObj1 = {
//              info: {
//                 name: "professor1Name", 
//                 averageGPA: 3.58,
//                 totalSections: 12,
//                 totalStudents: 144,
//                 averageRating: 4.23,
//                 totalRatings: 15, 
//                 yearsTaught: 12,   
//             },
//             courses: ["courseId1","courseId2"]
//         };
//         const professorObj2 = {
//              info: {
//                 name: "professor2Name", 
//                 averageGPA: 3.59,
//                 totalSections: 13,
//                 totalStudents: 124,
//                 averageRating: 4.13,
//                 totalRatings: 1123, 
//                 yearsTaught: 1212,
//             },
//             courses: ["courseId1", "courseId2"]
//         };
//         const professorData = [professorObj1, professorObj2];
//         setProfessors(professorData);
//     }, []);

    return (
        <div className = "App bg-background text-white h-screen relative ">
            <BrowserRouter>
            <Navbar />
                <div className = "pages min-h-screen">
                    <SearchContextProvider>
                        <Routes>
                            {/* Legacy /dashboard route - redirects to new course details page */}
                            <Route 
                                path = "/dashboard"
                                element = {<DashboardRedirect />}
                            />
                            <Route 
                                path = "/"
                                element = {<Landing />}
                            />
                            <Route 
                                path = "/planner"
                                element = {<Planner />}
                            />
                            <Route 
                                path = "/compare"
                                element = {<ComparePage />}
                            />
                            <Route 
                                path = "/course/:courseId"
                                element = {<CourseDetails />}
                            />
                            <Route
                                path = "/scheduler"
                                element = {<Scheduler />}
                            ></Route>
                            <Route
                                path = "/Diagram"
                                element={
                                    <div className="flex flex-col">
                                        <div style={{ height: "70px" }} />
                                        <PrereqDiagram course="CSCE_313" />
                                    </div>
                                }
                            ></Route>
                        </Routes>
                    </SearchContextProvider>
                </div>
            </BrowserRouter>
        </div>
    );
}
    //   return <Landing />;
// };

export default App;