/*
    DEPTARTMENT SCHEMA
    {
        info: { name }
        courses: [
        {courseNumber, courseTitle, courseDescription, courseId}        
        ]
    }

    note: no need for department id b/c the name is guaranteed to be unique, and its automatically sorted alphabetically
*/

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    info: {
        name: String
    },
    courses: [
        {
            courseNumber: Number,
            courseTitle: String,
            courseDescription: String,
            courseId: String  
        }
    ]
});

module.exports = mongoose.model("Department", departmentSchema);