// this will populate all classes for a specified semester

const rl = require('readline-sync');
const populateClasses = require('./populateClasses')
const adjustData = require('./adjustClasses')


const sem = rl.question("What semester would you like to parse? Format it in YYYYS format, where YYYY is year (2025) and S is semester (1 = Spring, 2 = Summer, 3 = Fall)")
const semRegex = /^\d{4}[123]$/;

if (!sem.match(semRegex)) {
    console.log("Invalid Semester")
    process.exit(0)
}

function changeSem(data) {
    for (const key of Object.keys(data)) {
        for (const keySem of Object.keys(data[key].sections)) {
            let year = keySem.substring(0, 4)
            let semMap = {"1": "Spring", "2": "Summer", "3": "Fall"}
            let semname = semMap[keySem.substring(4,5)]
            if (semname == undefined) continue;
            if (keySem == `${semname} ${year}`) continue;

            //console.log(`${semname}${year}`)
            data[key].sections[`${semname} ${year}`] = data[key].sections[keySem]
            delete data[key].sections[keySem]
        }
    }

    return data
}

async function main() {
    let year = sem.substring(0, 4)
    let semMap = {"1": "Spring", "2": "Summer", "3": "Fall"}
    let semName = semMap[sem.substring(4, 5)]

    console.log("Populating Classes in CSTAT")
    let data = await populateClasses.gatherData({}, semName, "College Station", year)
    //data = changeSem(data)

    console.log(data)

    console.log("----------------------------------------------------------")
    rl.question("Populating Classes in Galveston, Press Enter to Continue:")
    data = await populateClasses.gatherData(data, semName, "Galveston", year)
    //data = changeSem(data)
    console.log(data)

    console.log("----------------------------------------------------------")
    rl.question("Finding missing professors in CSTAT, Press Enter to Continue:")
    data = await adjustData.findMissingProfessors(data, "College Station")

    console.log(data)
    console.log("----------------------------------------------------------")
    rl.question("Finding missing professors in Galveston, Press Enter to Continue:")
    data = await adjustData.findMissingProfessors(data, "Galveston")

    console.log(data)
    console.log("----------------------------------------------------------")
    rl.question("Populating Titles, Press Enter to Continue:")
    data = await adjustData.addTitleAndDesc(data)


    console.log(data)
    console.log("----------------------------------------------------------")
    rl.question("Adding Students, Press Enter to Continue:")
    data =  await adjustData.addStudents(data)


    console.log("----------------------------------------------------------")
    rl.question("Save File, Press Enter to Continue:")

    data = await changeSem(data)
    const jsonString = JSON.stringify(data, null, 2);
    require('fs').writeFile(`data_${semName}${year}.json`, jsonString, 'utf8', (err) => {
            if (err) {
                console.error('Error writing file:', err);
                return;
            }
            console.log(`data_${semName}${year}.json written successfully!`);
        });
}

main()