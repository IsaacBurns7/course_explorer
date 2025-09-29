require('dotenv').config()

const express = require('express');
const fetch = require('node-fetch');

const professorRoutes = require('./routes/professor');
const courseRoutes = require("./routes/course");
const plannerRoutes = require('./routes/planner');
const searchRoutes = require("./routes/search");
const searchRoutes2 = require("./routes/search2");
const healthRoutes = require('./routes/health');
const plannerRoutes2 = require('./routes/planner2');
// const { populateProfessors, 
//     populateCourses, 
//     populateDepartments, 
//     populateSectionsForCourse} = require("./services/parseData");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use("/api/professors", professorRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/planner", plannerRoutes);
app.use("/api/search", searchRoutes);
// app.use("/api/professorTEST", professorTESTRoutes);
app.use("/api/search2", searchRoutes2);
app.use("/api/health", healthRoutes);
app.use("/api/planner2", plannerRoutes2);

//this is for running the database locally, or for running neon in mocha(testing framework)

app.listen(process.env.PORT, () => {
    console.log("Global setup: Server listening on port", process.env.PORT);
});


module.exports = app;