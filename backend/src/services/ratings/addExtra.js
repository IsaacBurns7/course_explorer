const professorsWithRatings = require("../output/professors-with-ratings.json");
const professors = require("./professors.json");
const third = require("../output/third.json");

for (const id in professorsWithRatings) {
  const prof = professorsWithRatings[id].info.name;

  // check if professor name is in third.json values
  for (const [key, value] of Object.entries(third)) {
    if (value === prof) {
      // find professor in professors.json with the key name
      const match = professors.find(p => p.name === key);
      if (match) {
        professorsWithRatings[id].info.rmpLink = match.profileLink
        professorsWithRatings[id].info.difficulty = match.difficulty
      }
    }
  }
}

require('fs').writeFileSync('professors-with-ratings-2.json', JSON.stringify(professorsWithRatings, null, 2), 'utf-8');

