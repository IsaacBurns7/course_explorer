// Helper functions for getInfo.js

const fs = require('fs');
const cheerio = require('cheerio');
const { parse } = require('path');


// Name is a little misleading, finds the ratings per class
function findCourses(html) {
    const $ = cheerio.load(html);

    const courseData = {};

    $('.Rating__StyledRating-sc-1rhvpxz-1').each((_, el) => {
    const $review = $(el);

    // Extract course name
    const courseName = $review
        .find('.RatingHeader__StyledClass-sc-1dlkqw1-3')
        .first()
        .text()
        .replace(/[^A-Z0-9 ]/gi, '')
        .trim();

    if (!courseName) return;

    // Extract quality rating
    const qualityText = $review
        .find('.CardNumRating__CardNumRatingHeader-sc-17t4b9u-1')
        .filter((_, r) => $(r).text().toLowerCase() === 'quality')
        .next()
        .text()
        .trim();

    const quality = parseFloat(qualityText);
    if (isNaN(quality)) return;

    // Extract tags
    const tagElements = $review.find('.RatingTags__StyledTags-sc-1boeqx2-0 span');
    const tags = tagElements.map((_, tagEl) => $(tagEl).text().trim().toUpperCase()).get();

    // Init course record if needed
    if (!courseData[courseName]) {
        courseData[courseName] = {
            ratings: {},
            tags: {}
        };
    }

    // Count the rating
    const ratingKey = quality.toString();
    courseData[courseName].ratings[ratingKey] = (courseData[courseName].ratings[ratingKey] || 0) + 1;

    // Count the tags
    for (const tag of tags) {
        courseData[courseName].tags[tag] = (courseData[courseName].tags[tag] || 0) + 1;
    }
});

console.log(courseData)
    // Optionally compute average rating per course
    for (const course in courseData) {
    const ratingMap = courseData[course].ratings;
    let total = 0;
    let count = 0;

    for (const [ratingStr, occurrences] of Object.entries(ratingMap)) {
        const rating = parseFloat(ratingStr);
        const n = parseInt(occurrences, 10);
        total += rating * n;
        count += n;
    }

    if (count > 0) {
        courseData[course].averageRating = parseFloat((total / count).toFixed(2));
    }
}

    return courseData
}

// Gets the ratings for 5/4/3/2/1 (top right of the screen) and parses it
function parseRatings(html) {
    const $ = cheerio.load(html);
    const distribution = {};
    // Parse rating distribution
    $('.RatingDistributionChart__MeterItem-o2y7ff-2').each((_, el) => {
        const labelText = $(el).find('.RatingDistributionChart__LabelText-o2y7ff-6').text().trim();
        const ratingValueText = $(el).find('.RatingDistributionChart__LabelValue-o2y7ff-7').text().trim();
        const countText = $(el).find('b').first().text().trim();

        const rating = parseInt(ratingValueText, 10);
        const count = parseInt(countText, 10);

        if (!isNaN(rating) && !isNaN(count)) {
            distribution[labelText] = {
                rating,
                count
            };
        }
    });

    return distribution
}

// Function that gets the 5 most common tags from the html
function parseTags(html) {
    const $ = cheerio.load(html);
    const profTags = $('.TeacherTags__TagsContainer-sc-16vmh1y-0 span')
    .map((_, el) => $(el).text().trim())
    .get();

    return profTags
}

module.exports = {findCourses, parseRatings, parseTags}