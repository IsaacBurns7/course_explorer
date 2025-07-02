The order for running the files is

getHTML.js (gets the initial professor information, that is listed on https://www.ratemyprofessors.com/search/professors/1003?q=*)
parseProfs.js (parses the html file produced by getHTML.js, produces professors.json)

moreProfInfo.js (goes through each prof link in professors.json to get all information listed in their page, produces professors-enriched.json)
(helper functions findProfs.js and getInfo.js)

normalizeClasses.js (makes all/most the course codes consistent so there isnt much confusion, listed in fixed.txt)

matchProfs.js (matches professor info from Public Class Search to RMP data)