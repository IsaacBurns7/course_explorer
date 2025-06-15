require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const professorRoutes = require('./routes/professor');
const { populateProfessors, 
    populateCourses, 
    populateDepartments, 
    populateSectionsForCourse} = require("./services/parseData");
const { populate } = require('./models/course');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use("/api/professors", professorRoutes);

mongoose.connect(process.env.MONGO_ATLAS_URI)
    .then(() => {
        console.log("Connected to database!");
        app.listen(process.env.PORT, () => {
            console.log("Listening for requests on PORT ", process.env.PORT);
        })
        // populateCourses("CSCE");
        populateSectionsForCourse("CSCE",120);

    })
    .catch((error) => {
        console.log(error);
    });