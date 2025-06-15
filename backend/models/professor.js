const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const professorSchema = new Schema({
    info: {
        name: String, 
        averageGPA: Number,
        totalSections: Number,
        totalStudents: Number,
        //yearsTaught: Number,
        averageRating: Number,
        totalRatings: Number,    
    },
    courses: [String] //this is courseId,
});

module.exports = mongoose.model("Professor", professorSchema);