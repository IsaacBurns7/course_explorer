import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import "./index.css";
import "./styles/tailwind.css";
import { ProfessorsContextProvider } from "./context/professors";
import { CoursesContextProvider } from "./context/courses";
import { CardsContextProvider } from "./context/cards";
import { SearchContextProvider } from "./context/search";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <CoursesContextProvider>
            <ProfessorsContextProvider>
                <SearchContextProvider>
                    <CardsContextProvider>
                        <App />
                    </CardsContextProvider>
                </SearchContextProvider>
            </ProfessorsContextProvider>
        </CoursesContextProvider>
    </React.StrictMode>
)

{
    courses:
        <old courses object></old>
}