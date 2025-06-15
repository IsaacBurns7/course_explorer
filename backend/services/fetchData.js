const cheerio = require("cheerio");

/*
returns map of professors
professorName: {
    info: {infoObj},
    sections; [{section1Obj}, {section2Obj}]
}
*/
async function getAnexData(department, number){
    const params = new URLSearchParams();
    params.append("dept", department);
    params.append("number", number);

    const response = await fetch("https://anex.us/grades/getData/?", {
        method: "POST",
        body: params,
        headers: {
            "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0"
        }
    })
    if(!response.ok){
        throw new Error(`Failed to fetch data for ${dept} ${number}`);
    }
    let anex_data;
    try {
        const rawText = await response.text();
        anex_data = JSON.parse(rawText);
    } catch (error) {
        throw new Error(`Failed to parse JSON for ${dept} ${number}: ${error.message}`);
        // console.log("Bad response text:", rawText);
    }

    if (!anex_data || !anex_data.classes || anex_data.classes.length === 0) {
        throw new Error(`No data found for ${dept} ${number}`);
    }

    const professors = new Map();

    for(const sectionObj of anex_data.classes){
        const name = sectionObj.prof;
        const obj = professors[name];
        const { number, section, ...rest} = sectionObj;
        
        let totalStudents = 0;
        const filters = ["A", "B", "C", "D", "F", "I", "Q", "S", "U", "X"];

        for(const filter of filters){
            totalStudents += Number(sectionObj[filter]);
        }

        // console.log(sectionObj);

        if(!obj){
            professors[name] = {
                info: {
                    name,
                    averageGPA: sectionObj.gpa,
                    totalSections: 1,
                    totalStudents,
                },
                sections: [
                    { ...rest,
                        courseNumber: number,
                        sectionNumber: section   
                    }
                ]
            };
            // console.log(professors[name]);
        }else{
            const { info, sections } = obj;
            // console.log(info);
            info.totalSections += 1;
            const totalGPA = info.averageGPA * info.totalStudents + sectionObj.gpa * totalStudents;
            info.totalStudents += totalStudents;
            info.averageGPA = totalGPA / info.totalStudents;
            sections.push({
                ...rest,
                courseNumber: number,
                sectionNumber: section
            });
            professors[name] = {
                info,
                sections
            }
        }
    }

    return professors;
}

// const rmpEndpoint = "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" + professorId + "&filter=&courseCode=&page=";
//tamu school id = 1003
async function getProfessorId(schoolId, firstName, lastName){
    const url = `https://www.ratemyprofessors.com/search/professors/${schoolId}?q=${lastName}%20${firstName}`;
    const response = await fetch(url, {
        method: "GET"
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const profCardLink = $('a.TeacherCard__StyledTeacherCard-syjs0d-0').first().attr("href"); //also account for some professors have two pages
    console.log(profCardLink);
    return profCardLink;
}

getProfessorId(1003, "P", "Ritchey");

/*
this follows dept schema
*/
async function getDepartmentCourses(department){
    const response = await fetch(`https://catalog.tamu.edu/undergraduate/course-descriptions/${department}`,
        {
            method: "GET"
        }
    );
    const html = await response.text();
    const $ = cheerio.load(html);
    const answer = [];

    const deptTitle = $('.page-title').text(); //not sure what to use this for 

    $('.courseblock').each((index, element) => {
        const title = $(element).find(".courseblocktitle");
        const description = $(element).find(".courseblockdesc");
        const number = title.text().slice(5,8);

        answer.push({
            title: title.text(),
            number,
            description: description.text() //includes prerequisities and cross listings
        });
    });
    console.log(answer);
    return answer;
}

// getDepartmentCourses("csce");

function getDegreePlan(){

}

module.exports = {
    getAnexData,
    getProfessorId,
    getDepartmentCourses,
    getDegreePlan
}