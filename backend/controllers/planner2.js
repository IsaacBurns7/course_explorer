const pool = require("../db.js");
const fs = require('fs');
const path = require('path');
const {parseDegreePlanPDF, parseDegreePlanText} = require('../services/parseData');
const { KeyObject } = require("crypto");

const getBestClassesPDF = async(req, res) => {
  const parsed = await parseDegreePlanPDF(req.body);
  if (parsed.error) return res.status(500).json(parsed);
  return getBestClasses(parsed, req, res)
}

const getBestClassesText = async(req, res) => {
  const parsed = await parseDegreePlanText(req.body.content);
  if (parsed.error) return res.status(500).json(parsed);

  console.log(parsed)
  return getBestClasses(parsed, req, res)
}

const getBestClasses = async (parsed, req, res) => {
    const client = await pool.connect();
    try {
        const semesterIds = [];
        const courseIds = [];
        
        for (const [semester, courses] of Object.entries(parsed)) {
            for (const course of courses) {
                semesterIds.push(semester);
                courseIds.push(`${course.department}_${course.number}`);
            }
        }

        const sqlFilePath = path.join(__dirname, '/sql/getBestClasses.sql');;
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        const queryResult = await client.query(sql, [courseIds, semesterIds]);

        return res.status(200).json(queryResult.rows[0]?.result || {});
    } catch (error ) {
        console.log(error)
        return res.status(500).json({error: error});
    } finally {
        client.release();
    }
}

/*
course -> semesters -> find hours -> if can't find, give up, 
find professors from course -> sort by criteria 
return 
{
    department: courseData[0], 
    number: courseData[1], 
    title: course.info.title, 
    hours: hours, 
    info: course, 
    professors: professors
}
*/
const getClassInfo = async (req, res) => {
    const client = await pool.connect();
    try {
        const parsed = req.body.class;
        //console.log("Parsed class:", parsed);
        if (!parsed || typeof parsed !== 'string' || !parsed.includes(" ")) {
            return res.status(400).json({ error: "Invalid class format. Expected format: 'DEPT NUMBER'" });
        }
        const courseData = parsed.split(" ");
        const department = courseData[0];
        const courseNumber = courseData[1];
        const courseId = `${department}_${courseNumber}`;

        const sqlFilePath = path.join(__dirname, './sql/getClassInfo.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        //console.log("Executing SQL:" + sql.replace(/\s+/g, ' ').trim() + ` with courseId=${courseId}`);
        const queryResult = await client.query(sql, [courseId]); 
        //console.log("Query result:", queryResult.rows);
        if (queryResult.rows.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }       

        return res.status(200).json(queryResult.rows[0].result);
        // return res.status(200).json({result:" exists "});
    
        // professors.sort((a, b) => (b.info.averageGPA + b.info.averageRating) - (a.info.averageGPA + a.info.averageRating));
    
        // return res.status(200).json({department: courseData[0], number: courseData[1], title: course.info.title, hours: hours, info: course, professors: professors})
    } catch (err) {
        console.error("Planner error:", err);
        return res.status(500).json({ error: "Internal server error" });
    } finally {
        client.release();
    }
}

//time -> key
//1-1 mapping 
const timeToMaskBit = new Map();
const maskBitToTime = new Map();
let counter = 0;

//note: since hm in js can store objects, probably change this key...
function getMaskBitForTime(day, start, end){
    const key = `${day}-${start}-${end}`;
    if(!timeToMaskBit.has(key)){
        timeToMaskBit.set(key, counter);
        maskBitToTime.set(counter, key);
        counter++;
    }
    return timeToMaskBit.get(key);
}

/*
interface: {
    day: string
    start: string (11:30 AM, or 02:20 PM)
    end: string same as start
}
*/
function getTimeForMaskBit(bitNumber){
    const key = bitNumber;
    if(!maskBitToTime.has(key)){
        throw new Error("Key not found");
    }
    const value = maskBitToTime.get(key);
    const schedule = value.split("-");
    const time = {
        day: schedule[0],
        start: schedule[1],
        end: schedule[2]
    }
    return time;
}
//key -> time 

function generateMask(sectionTimes){
    let mask = 0n;
    for(const {day, start, end} of sectionTimes){
        const bit = BigInt(getMaskBitForTime(day, start, end));
        mask |= (1n << bit);
    }
    return mask;
}

/*
interface: {
    schedule: {
        day: string,
        start: string,
        end: string
    }
}
*/
function generateSchedule(timeMask){
    const schedule = [];
    for(let i = 0;i<counter;i++){
        let mask = (1n << BigInt(i));
        // console.log(mask, timeMask);
        if(BigInt(mask & timeMask) == mask){
            schedule.push(getTimeForMaskBit(i));
        }
    }
    // console.log(`Using mask ${timeMask}, generated schedule, ${schedule}`, schedule);
    return schedule;
}

function parseTime(str) {
    const [time, meridian] = str.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
}

/*
interface: {
    currentSchedule: {
        day: any;
        start: any;
        end: any;
    }[],
    scheduleOfAddedClass: {
        day: string,
        start: string,
        end: string
    }
}
*/
function checkMinSpread(currentSchedule, scheduleOfAddedClass, min_spread){
    
}

/*
interface: {
    currentSchedule: {
        day: any;
        start: any;
        end: any;
    }[],
    scheduleOfAddedClass: {
        day: string,
        start: string,
        end: string
    }
}
*/
function checkMaxSpread(currentSchedule, scheduleOfAddedClass, max_spread){
    
}

/*
interface: {
    currentSchedule: {
        day: any;
        start: any;
        end: any;
    }[]
    scheduleOfAddedClass: {
        day: string,
        start: string,
        end: string
    }
}
*/
function checkOverlap(currentSchedule, scheduleOfAddedClass){
    for(const {day, start, end} of scheduleOfAddedClass){
        const startMinutes = parseTime(start);
        const endMinutes = parseTime(end);
        for(const {day: day2, start: start2, end: end2} of currentSchedule){
            if(day != day2){
                continue;
            }
            const start2Minutes = parseTime(start2);
            const end2Minutes = parseTime(end2);
            if(startMinutes < end2Minutes && endMinutes > start2Minutes){
                return true;
            }   
        }
    }
    return false;
}

/*
if we merge intervals, we can check overlap in O(n log n) for n intervals

req.body: { 
    courses: String[],
    semester: String,
    min_rating: Number,
    min_gpa: Number,

    BELOW WILL BE SUPPORTED AFTER scheduler page is made 
    course_weights: {
        "CSCE_120": {
            total_weight: Number,
            rating_weight: Number,
            gpa_weight: Number -- total weight must equal rating + gpa weights
        } 
    }
    fixed_professors: [
        "CSCE_120": Number[] -> professor ids 
    ],
    spread: {
        min: Number,
        max: Number   
    },
    breaks: [
        {
            day: String, ('M' | 'T' | 'W' | 'R' | 'F')
            start: String,
            end: String
        }
    ]
}

Design
- Canva / Figma / Notebook diagram for design of page so it looks nice :) 
Functionality
- Weekly calendar component that displays returned schedule 
- Logical connection to planner (up to design)
- Search settings similiar to search page, which support the following
    - Attaching an arbitrary weight to a class' rating, between 0 and 1
    - Attaching an arbitrary weight to a class' gpa, between 0 and 1
    - Attaching an arbitrary weight to a class, between 1 and 100 
*/
const getOptimalSchedule = async (req, res) => {
    const client = await pool.connect();
    try { 
        // console.log(req.body);

        const courses = req.body.courses;
        const semester = req.body.semester;
        const sqlFilePath = path.join(__dirname, "./sql/getOptimalSchedule.sql");
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        // console.log(sql);
        // console.log("Params: ", [courses, semester]);
        const queryResult = await client.query(sql, [courses, semester]);
        console.log(queryResult.rows)
        const courseProfessorSectionPairs = queryResult.rows.map((pair) => {
            let raw = pair.schedule;
            // console.log("Raw: ", raw);
            raw = raw.replace(/[()]/g, '[').replace(/[()]/g, ']'); // optional, depends on your DB output
            raw = raw.replace(/^\{|\}$/g, ''); // remove outer braces
            raw = '[' + raw + ']'; // wrap into array brackets

            // Step 2: parse items manually
            let items = raw
            .split('","')
            .map(s => s.replace(/["{}]/g, '').trim())
            .map(s => s.replace(/[()]/g, ''))
            // .map(s => s.replace(/\[/g), '')
            // .map(s => s.replace(/\\/g), '')
            .map(s => s.split(','))
            .map(([day, start, end]) => ({
                day: day.replace(/[\["]/g, '').trim(),
                start: start.replace(/[\\"]/g, '').trim(),
                end: end.replace(/[\\"\[\]]/g, '').trim()
            }));
            pair.schedule = items;
            console.log("Unraw: ", pair);
            return pair;
        });
        const coursesMap = {};

        for(const pair of courseProfessorSectionPairs){
            const courseId = pair.course_id;
            // console.log(`Inserting pair ${pair}`);
            if(!coursesMap[courseId]){
                coursesMap[courseId] = [];
            }
            coursesMap[courseId].push(pair);
        }

        //double check this courses map has at least one entry for each course

        for(const course of courses){
            const pairs = coursesMap[course] || [];
            if(pairs.length == 0){
                return res.status(400).json({error: `For course ${course}, no valid sections found`});
            }
        }

        // console.log(coursesMap);
        let dp = new Map();
        dp.set(0n, {score: 0.0, schedule: []});

        //take top 200 entries ?
        //mask -> schedule
        for(const course of courses){
            let new_dp = new Map();
            const pairs = coursesMap[course];
            console.log("Iterating through", course);
            for(const [mask, {score, schedule: currentSchedule}] of dp.entries()){
                const scheduleRaw = generateSchedule(mask); //not needed?
                console.log(pairs)
                for(const {professor_id, section_id, schedule, professor_score} of pairs){
                    const section_score = parseFloat(professor_score);
                    const section_mask = generateMask(scheduleOfAddedClass);
                    //schedule has sectionTimes 
                    // console.log("Must compare:", currentSchedule, schedule);
                    if(((section_mask & mask) === 0n) && !checkOverlap(scheduleOfAddedClass, scheduleRaw)){
                        if(spread?.min){
                            const pass = checkMinSpread(scheduleOfAddedClass, scheduleRaw, spread.min);
                            if(!pass) continue;
                         }
                        if(spread?.max){
                            const pass = checkMaxSpread(scheduleOfAddedClass, scheduleRaw, spread.max);
                            if(!pass) continue;
                        }
                        const new_mask = mask | section_mask; 
                        const new_score = score + section_score;

                        if(!new_dp.get(new_mask) || new_score > new_dp.get(new_mask)){
                            const new_entry = {
                                score: new_score,
                                schedule: [...currentSchedule, {
                                    course_id: course, professor_id, section_id, schedule: scheduleOfAddedClass
                                }]
                            };
                           new_dp.set(new_mask, new_entry);
                        }
                    }
                }
            } 
            dp = new Map(
                [...new_dp.entries()]
                .sort((a,b) => b[1].score - a[1].score)
                .slice(0,200)
            );
        }

        const topSchedules = [...dp.values()]
        .sort((a, b) => b.score - a.score)
        .slice(0,100)
        .map(entry => ({
            total_score: entry.score,
            schedule: entry.schedule
        }));

        // console.log(dp);
        /*
        interface: {
            schedules: [
                {
                    total_score: int,
                    schedule: [
                        {
                            course_id: string,
                            professor_id: string,
                            section_id: int,
                            schedule: [{ day: string, start: string, end: string}], start: "02:20 PM"
                        }
                    ]
                }   
            ]
        }
        */
        return res.status(200).json({ schedules: topSchedules});
    } catch (err) {
        console.error("Planner error:", err);
        return res.status(500).json({error: "Internal server error"});
    } finally {
        client.release();
    }
}

module.exports = { getBestClassesPDF, getBestClassesText, getClassInfo, getOptimalSchedule };