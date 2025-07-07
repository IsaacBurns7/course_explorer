//libraries
import React from "react";
import { useState, useEffect } from "react";
import Landing from "./components/Landing";
import Navbar from "./components/Navbar";

//hooks
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

//pages
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";

const App = () => {
   //const [professors, setProfessors] = useState([]);
   const [professors, setProfessors] = useState([]);

    useEffect(() => {
        const fetchProfessors = async () => {
            const response = await fetch ("/server/api/professors/CSCE/120", {
                method: "GET"
            });
            const profJson = await response.json();
            console.log("profJson: ", profJson);


            if(response.ok){
                setProfessors(profJson);
            }
        }
        fetchProfessors();

        const professorObj1 = {
             info: {
                name: "professor1Name", 
                averageGPA: 3.58,
                totalSections: 12,
                totalStudents: 144,
                averageRating: 4.23,
                totalRatings: 15, 
                yearsTaught: 12,   
            },
            courses: ["courseId1","courseId2"]
        };
        const professorObj2 = {
             info: {
                name: "professor2Name", 
                averageGPA: 3.59,
                totalSections: 13,
                totalStudents: 124,
                averageRating: 4.13,
                totalRatings: 1123, 
                yearsTaught: 1212,
            },
            courses: ["courseId1", "courseId2"]
        };
        const professorData = [professorObj1, professorObj2];
        setProfessors(professorData);
    }, []);

    return (
        <div className = "App bg-black text-white h-screen relative ">
            <BrowserRouter>
                <Navbar />
                <div className = "pages pt-16 min-h-screen">
                    <Routes>
                        <Route 
                            path = "/dashboard"
                            element = {<SearchResults />}
                        />
                        <Route 
                            path = "/"
                            element = {<Home />}
                        />
                    </Routes>
                </div>
            </BrowserRouter>
        </div>
    );
}
    //   return <Landing />;
// };

export default App;