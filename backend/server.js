require('dotenv').config()

const express = require('express');
const fetch = require('node-fetch');
const mongoose = require("mongoose");
const cookieParser = require('cookie-parser');

const professorRoutes = require('./routes/professor');
const courseRoutes = require("./routes/course");
const searchRoutes2 = require("./routes/search2");
const healthRoutes = require('./routes/health');
const plannerRoutes2 = require('./routes/planner2');
const authRoutes = require('./routes/auth');
const prereqsRoutes = require('./routes/prereqs');
// const { populateProfessors, 
//     populateCourses, 
//     populateDepartments, 
//     populateSectionsForCourse} = require("./services/parseData");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  credentials: true
}));

app.use(cookieParser());
app.use(express.json());


app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/api/professors", professorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/search2", searchRoutes2);
app.use("/api/health", healthRoutes);
app.use("/api/planner2", plannerRoutes2);
app.use("/auth", authRoutes);
app.use("/api/prereqs", prereqsRoutes);

//this is for running the database locally, or for running neon in mocha(testing framework)

app.listen(process.env.PORT, () => {
  console.log("Global setup: Server listening on port", process.env.PORT);
});

module.exports = app;
