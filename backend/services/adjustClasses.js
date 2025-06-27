// These functions serve to correct data that might not have been accounted for in the first pass


function normalizeToLastFirstInitial(name) {
    const clean = name.replace(/\(.*?\)/g, "").trim().toUpperCase();
    const parts = clean.split(/\s+/);

    if (parts.length < 2) return clean; 

    const last = parts[parts.length - 1]; 
    const firstInitial = parts[0][0];

    return `${last} ${firstInitial}`;
}

function matchProf(localProf, displayName) {
    const normalizedRemote = normalizeToLastFirstInitial(displayName);
    return localProf.toUpperCase() === normalizedRemote;
}

function semesterSortKey(semesterStr) {
    const [season, yearStr] = semesterStr.split(" ");
    const year = parseInt(yearStr);
    const seasonOrder = { "Spring": 1, "Summer": 2, "Fall": 3 };
    return year * 10 + seasonOrder[season]; // e.g. "Fall 2024" → 20243
}


async function addTitleAndDesc(data) {
    for (const key of Object.keys(data)) {
        if (data[key].info.title != "" && data[key].info.title != undefined) continue
        console.log(`Changing ${key}`)
        let crn = ""
        let search = ""
        for (const sem of Object.keys(data[key].sections)) {
            for (const sectKey of Object.keys(data[key].sections[sem])) {
                const sect = data[key].sections[sem][sectKey];
                if (sect.crn != null) {
                    crn = sect.crn
                    search = semesterSortKey(`${sect.semester} ${sect.year}`)
                    if (search.site == "College Station") search += "1"
                    else search += "2"
                    break
                }
            }

            if (crn != "") break;
        }
        if (crn == "") continue;

        console.log(crn + " " + search)
        const response = await fetch(`https://howdy.tamu.edu/api/course-section-details?term=${search}&subject=&course=&crn=` + crn, {
            "headers": {
            },
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": null,
            "method": "GET"
        })
        const json = await response.json();
        data[key].info.title = json.COURSE_TITLE
        data[key].info.description = json.COURSE_DESCRIPTION
    }
    return data
}

async function findMissingProfessors(data, site) {
    if (site == "College Station")
        site = 1
    else
        site = 2
    const semesters = {}
    const sem_list = ["Spring 2025", "Fall 2024", "Summer 2024", "Spring 2024", "Fall 2023", "Summer 2023", "Spring 2023", "Fall 2022"]
    try {
        for (const sem of sem_list) {
            const response = await fetch("https://howdyportal.tamu.edu/api/course-sections", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/json; charset=UTF-8"
                },
                "body": `{\"startRow\":0,\"endRow\":0,\"termCode\":\"${semesterSortKey(sem)}${site}\",\"publicSearch\":\"Y\"}`, //{Year}{Semester}1 (1 = College Station)
                "method": "POST"
            })
            const json = await response.json()
            semesters[sem] = json;
        }

        for (const key of keys) {
            //if (ignore.filter(x => key.startsWith(x)).length > 0) continue;
            const sections = data[key].sections
            const section_keys = Object.keys(sections)
            for (const skey of section_keys) {
                for (const section of sections[skey]) {
                    if (section.crn == undefined) {
                        const semesterKey = section.semester + " " + section.year;
                        const current_sem_sections = semesters[semesterKey];
                        //console.log(semesterKey)

                        if (!current_sem_sections) continue;
                        const [dept, courseNum] = key.split("_"); // "CSCE_120" → ["CSCE", "120"]

                        for (const pubCourse of current_sem_sections) {
                            if (pubCourse.SWV_CLASS_SEARCH_SUBJECT != dept || pubCourse.SWV_CLASS_SEARCH_COURSE != courseNum) continue;
                            const profName = section.prof;
                            const instructors = JSON.parse(pubCourse.SWV_CLASS_SEARCH_INSTRCTR_JSON);
                            const match = instructors.find(inst => matchProf(section.prof, inst.NAME || ""));
                            if (match) {
                                console.log("Match!")
                                const alreadyExists = sections[skey].some(sec => sec.section === pubCourse.SWV_CLASS_SEARCH_SECTION);

                                if (!alreadyExists) {
                                    console.log(`MISSING SECTION FOUND for ${key} in ${semesterKey}:`);
                                    console.log({
                                    localSection: section.section,
                                    foundSection: pubCourse.SWV_CLASS_SEARCH_SECTION,
                                    prof: match.NAME,
                                    crn: pubCourse.SWV_CLASS_SEARCH_CRN
                                });
                                let prof = null
                                let profName = "";
                                if (Array.isArray(instructors) && instructors.length > 0) {
                                    const primary = instructors.find(inst => inst.NAME.includes("(P)"));
                                    prof = primary
                                    profName = (primary || instructors[0]).NAME.split(" (")[0].trim();
                                }
                                const meetings = JSON.parse(pubCourse.SWV_CLASS_SEARCH_JSON_CLOB);
                                const times = {};

                                meetings.forEach(meet => {
                                    const days = {
                                        M: meet.SSRMEET_MON_DAY,
                                        T: meet.SSRMEET_TUE_DAY,
                                        W: meet.SSRMEET_WED_DAY,
                                        R: meet.SSRMEET_THU_DAY,
                                        F: meet.SSRMEET_FRI_DAY
                                    };

                                    for (const [day, val] of Object.entries(days)) {
                                        if (val) {
                                            if (!times[day]) {
                                                times[day] = [meet.SSRMEET_BEGIN_TIME, meet.SSRMEET_END_TIME];
                                            } else {
                                                times[day].push(...[meet.SSRMEET_BEGIN_TIME, meet.SSRMEET_END_TIME])
                                            }
                                        }
                                    }
                                });

                                // --- Parse hours
                                const low = pubCourse.SWV_CLASS_SEARCH_HOURS_LOW;
                                const high = pubCourse.SWV_CLASS_SEARCH_HOURS_HIGH;
                                const med = pubCourse.SWV_CLASS_SEARCH_SSBSECT_HOURS;

                                let hours = "";
                                if (low && high && low !== high) hours = `${low}-${high}`;
                                else if (med) hours = `${med}`;
                                else if (low) hours = `${low}`;
                                else hours = "N/A";

                                // --- Set extra fields
                                section.crn = pubCourse.SWV_CLASS_SEARCH_CRN;
                                section.hours = hours;
                                section.site = pubCourse.SWV_CLASS_SEARCH_SITE || '';
                                section.times = times;


                                // --- Optionally override prof if needed

                                if (prof && !data[key].professors.includes(prof?.MORE)) {
                                    data[key].professors.push(prof?.MORE || "");
                                }

                                if (prof) {
                                    section.prof_id = prof?.MORE || ""
                                }

                                if (profName) section.prof = profName;
                                    // Optional: push it into data[key].sections
                                }
                            }
                        }
                    }
                }
            }
        }
    } catch (err) {
        console.log(err)
    }
}

async function adjustGPA(data) {
    for (const key of Object.keys(data)) {
        let total = 0
        let sections = 0
        const sems = Object.keys(data[key].sections)
        for (const sem of sems) {
            const sections = data[key].sections[sem]
            for (const sect of sections) {
                total += sect.gpa
                sections++;
            }
        }
        data[key].info.averageGPA = parseFloat((total / sections).toFixed(3))
    }
}
function extractCourses(pdfData) {
    const pages = pdfData.Pages;
    const courses = []
    pages.forEach(p => {
        const texts = p.Texts
        let fields = 0
        let onCourse = false
        let info = []
        texts.forEach(t => {
           //console.log(t.R)
           const line = decodeURIComponent(t.R[0].T);
          // console.log(line)

           const regex = /\b[A-Z]{4}-\d{3}-\d{3}\b/;
           const match = line.match(regex);
           if (match || onCourse) { // found the start of a new course line, or in the middle of one
                if (match)
                    info.push(...line.split("-"))
                else
                    info.push(line.trim())
                onCourse = true
                fields++
                if (fields == 20) { // 20 fields total
                    courses.push(info) // push the course info to the array
                    info = [] // reset values
                    onCourse = false
                    fields = 0
                }
           }
        })
    })

    return courses
}


function addStudents(data) {
     for (const key of Object.keys(data)) {
        for (const sem of Object.keys(data[key].sections)) {
            for (const sectKey of Object.keys(data[key].sections[sem])) {
                const sect =  data[key].sections[sem][sectKey]
                data[key].sections[sem][sectKey].students = sect.A + sect.B + sect.C + sect.D + sect.F + sect.I + sect.S + sect.Q + sect.U + sect.X
            }
        }
    }

    return data
}
