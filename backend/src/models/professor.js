const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const professorSchema = new Schema({
    _id: String,
    info: {
        name: String, 
        averageGPA: Number,
        totalSections: Number,
        totalStudents: Number,
        //yearsTaught: Number,
        averageRating: Number,
        totalRatings: Number,
        wouldTakeAgain: Number,
        tags: [String]    
    },
    courses: [String], //this is courseId,
    ratings: { type: Map,
        of: {
            ratings: Object,
            tags: Object,
            averageRating: Number
        }
    }
});

module.exports = mongoose.model("Professor", professorSchema);