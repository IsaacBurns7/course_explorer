//libraries
import { useEffect, useState } from "react";
import React from "react";

//components
import Navbar from "./components/Navbar";

//hooks
import { BrowserRouter, Routes, Route, Navigate } from "react-router";

//pages
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";

const App = () => {

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


export default App;