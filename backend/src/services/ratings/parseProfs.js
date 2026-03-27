const fs = require('fs');
const cheerio = require('cheerio');

const html = fs.readFileSync('output.html', 'utf8');
const $ = cheerio.load(html);

const professors = [];


$('a.TeacherCard__StyledTeacherCard-syjs0d-0').each((_, el) => {
    const $el = $(el);

    const name = $el.find('.CardName__StyledCardName-sc-1gyrgim-0').text().trim();
    const department = $el.find('.CardSchool__Department-sc-19lmz2k-0').text().trim();
    const school = $el.find('.CardSchool__School-sc-19lmz2k-1').text().trim();
    const rating = parseFloat($el.find('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2').text().trim()) || null;

    const numRatingsRaw = $el.find('.CardNumRating__CardNumRatingCount-sc-17t4b9u-3').text().trim();
    const numRatings = parseInt(numRatingsRaw.replace(/\D/g, '')) || null;

    const feedbackNumbers = $el.find('.CardFeedback__CardFeedbackNumber-lq6nix-2');
    const wouldTakeAgain = feedbackNumbers.eq(0).text().replace('%', '').trim();
    const difficulty = feedbackNumbers.eq(1).text().trim();

    const profileLink = 'https://www.ratemyprofessors.com' + $el.attr('href');

    professors.push({
        name,
        department,
        school,
        rating,
        numRatings,
        wouldTakeAgain: wouldTakeAgain ? parseFloat(wouldTakeAgain) : null,
        difficulty: difficulty ? parseFloat(difficulty) : null,
        profileLink
    });
});

fs.writeFileSync('professors.json', JSON.stringify(professors, null, 2));
console.log(`✅ Parsed ${professors.length} professors to professors.json`);