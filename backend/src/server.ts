import type { Express, NextFunction, Request, Response, Router } from "express";

const dotenv = require("dotenv") as typeof import("dotenv");
dotenv.config();

const express = require("express") as typeof import("express");
// const fetch = require('node-fetch');
const mongoose = require("mongoose") as typeof import("mongoose");


const professorRoutes: Router = require("./routes/professor");
const courseRoutes: Router = require("./routes/course");
const searchRoutes2: Router = require("./routes/search2");
const healthRoutes: Router = require("./routes/health");
const plannerRoutes2: Router = require("./routes/planner2");
const authRoutes: Router = require("./routes/auth");
// const { populateProfessors, 
//     populateCourses, 
//     populateDepartments, 
//     populateSectionsForCourse} = require("./services/parseData");
const cors = require("cors") as typeof import("cors");

const app: Express = express();

app.use(express.json());
app.use(cors());

app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(req.path, req.method);
    next();
});

app.use("/api/professors", professorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/search2", searchRoutes2);
app.use("/api/health", healthRoutes);
app.use("/api/planner2", plannerRoutes2);
app.use("/auth", authRoutes);

//this is for running the database locally, or for running neon in mocha(testing framework)

const portEnv:string|undefined = process.env.PORT;
const port:Number = portEnv ? Number.parseInt(portEnv, 10) : 3000;

app.listen(Number.isFinite(port) ? port : 3000, () => {
    console.log("Global setup: Server listening on port", Number.isFinite(port) ? port : 3000);
});

module.exports = app;