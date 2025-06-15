/*
    COURSE SCHEMA

    {
        info: {courseId, averageGPA, totalSections, totalStudents, averageRating, totalRatings}
        professors: [
            "professorName1",
            "professorName2",
            "professorName3"
        ]
    }
    
    OR 
    
    {
        info: {infoObj},
        professors: [
            "professorID1",
            "professorID2"
        ]
    }

    note: may need to extend to preqrequisite classes and postrequisite classes (what classes need this class)
*/

const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const courseSchema = new Schema({
    info: {
        department: String,
        number: Number,
        title: String,
        description: String,

        averageGPA: Number,
        totalSections: Number,
        totalStudents: Number,
        averageRating: Number,
        totalRatings: Number,
    },
    professors: [String], //professorId
    sections: [
        {   
            section: Number,
            A: Number,
            B: Number,
            C: Number,
            D: Number,
            F: Number,
            I: Number,
            S: Number,
            U: Number,
            Q: Number,
            X: Number,
            prof: String,
            year: Number,
            semester: String,
            gpa: Number
        }
    ]
});

module.exports = mongoose.model("Course", courseSchema);