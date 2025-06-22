import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// import "./index.css";
import "./styles/tailwind.css";
import { ProfessorsContextProvider } from "./context/professors";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
    <React.StrictMode>
        <ProfessorsContextProvider>
            <App />
        </ProfessorsContextProvider>
    </React.StrictMode>
)