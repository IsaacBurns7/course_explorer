require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const fetch = require('node-fetch')
const professorRoutes = require('./routes/professor');
const { populateProfessors, 
    populateCourses, 
    populateDepartments, 
    populateSectionsForCourse} = require("./services/parseData");
const Course = require('./models/course');
const Professor = require('./models/professor')

const app = express();

app.use(express.json());

app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});

app.use("/api/professors", professorRoutes);
function chunkArray(array, chunkSize) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

async function pushClasses(courseData) {
    const courses = Object.entries(courseData).map(([code, course]) => ({_id: code, ...course}));
    console.log("Going to Delete")
    await Course.deleteMany({});

    console.log("Now inserting")

    const chunks = chunkArray(courses, 500); 
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Inserting chunk ${i + 1}/${chunks.length}`);
      await Course.insertMany(chunks[i]);
    }

    console.log('Courses imported successfully!');
}

mongoose.connect(process.env.MONGO_ATLAS_URI)
    .then(async () => {
        console.log("Connected to database!");
        app.listen(process.env.PORT, () => {
            console.log("Listening for requests on PORT ", process.env.PORT);
        })
        //const courseData = require('./services/data_FINAL.json')
        //pushClasses(courseData)
    })
    .catch((error) => {
        require('fs').writeFileSync('bulkWriteError.txt', JSON.stringify(error, null, 2));
        console.log("Something Went Wrong...")
    });