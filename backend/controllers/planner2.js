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
        console.log("Parsed class:", parsed);
        if (!parsed || typeof parsed !== 'string' || !parsed.includes(" ")) {
            return res.status(400).json({ error: "Invalid class format. Expected format: 'DEPT NUMBER'" });
        }
        const courseData = parsed.split(" ");
        const department = courseData[0];
        const courseNumber = courseData[1];
        const courseId = `${department}_${courseNumber}`;

        const sqlFilePath = path.join(__dirname, './sql/getClassInfo.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        console.log("Executing SQL:" + sql.replace(/\s+/g, ' ').trim() + ` with courseId=${courseId}`);
        const queryResult = await client.query(sql, [courseId]); 
        console.log("Query result:", queryResult.rows);
        if (queryResult.rows.length === 0) {
            return res.status(404).json({ error: "Class not found" });
        }       
        console.log("Returning class info:", queryResult.rows[0].row_to_json, Object.keys(queryResult.rows[0].row_to_json));

        return res.status(200).json(queryResult.rows[0].row_to_json);
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

const timeIndex = new Map();
let counter = 0;
function getTimeIndex(day, start, end){
    const key = `${day}-${start}-${end}`;
    if(!timeIndex.has(key)){
        timeIndex.set(key, counter++);
    }
    return timeIndex.get(key);
}

function generateMask(sectionTimes){
    let mask = 0n;
    for(const {day, start, end} of sectionTimes){
        const bit = BigInt(getTimeIndex(day, start, end));
        mask |= (1n << bit);
    }
    return mask;
}

function parseTime(str) {
    const [time, meridian] = str.split(' ');
    let [hour, minute] = time.split(':').map(Number);
    if (meridian === 'PM' && hour !== 12) hour += 12;
    if (meridian === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
}

function checkOverlap(currentSchedule, scheduleOfAddedClass){
    for(const sectionTimes of currentSchedule){ 
        for(const {day, start, end} of sectionTimes){
            const startMinutes = parseTime(start);
            const endMinutes = parseTime(end);
            for(const {day: day2, start: start2, end: end2} of scheduleOfAddedClass){
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
    }
    return false;
}

/*
if we merge intervals, we can check overlap in O(n log n) for n intervals
*/
const getOptimalSchedule = async (req, res) => {
    const client = await pool.connect();
    try { 
        const courses = req.body.courses; //enforce type "CSCE_120" since thats what DB handles
        const semester = req.body.semester;
        const sqlFilePath = path.join(__dirname, "./sql/getOptimalSchedule.sql");
        const sql = fs.readFileSync(sqlFilePath, 'utf-8');
        const queryResult = await client.query(sql, [courses]);
        
        const courseProfessorSectionPairs = queryResult.rows.map((pair) => {
            let raw = pair.schedule;
            raw = raw.replace(/[()]/g, '[').replace(/[()]/g, ']'); // optional, depends on your DB output
            raw = raw.replace(/^\{|\}$/g, ''); // remove outer braces
            raw = '[' + raw + ']'; // wrap into array brackets

            // Step 2: parse items manually
            let items = raw
            .split('","')
            .map(s => s.replace(/["{}]/g, '').trim())
            .map(s => s.replace(/[()]/g, ''))
            .map(s => s.split(','))
            .map(([day, start, end]) => ({
                day: day.trim(),
                start: start.replace(/"/g, '').trim(),
                end: end.replace(/"/g, '').trim()
            }));
            pair.schedule = items;
            return pair;
        });
        const coursesMap = new Map();

        for(const pair of courseProfessorSectionPairs){
            const courseId = pair.course_id;
            if(!coursesMap.has(courseId)){
                coursesMap.set(courseId, []);
            }
            coursesMap.push(pair);
        }

        let dp = new Map();
        dp.set(0, 0);

        //NOTE: prof_score is not implemented yet
        //to implement, ratings is already a thing
        //need to create MV for GPA of (course_id, professor) pair
        for(const course of courses){
            let new_dp = new Map();
            console.log("Iterating through course: ", course);
            const pairs = coursesMap.get(course);
            for(const [mask, score] of dp.entries()){
                for(const {professor_id, section_id, schedule, prof_score} of pairs){
                    const section_score = prof_score;
                    const section_mask = generateMask(schedule);
                    // print("Checking section: ", section);
                    if((section_mask & mask == 0) && !checkOverlap(schedule, schedule)){
                        const new_mask = mask | section_mask; 
                        const new_score = score + section_score;

                        if(!new_dp.get(new_mask) || new_score > new_dp.get(new_mask)){
                           new_dp.set(new_mask, new_score);
                        }
                    }
                }
            } 
            dp = new_dp;
        }

        return res.status(200).json({message: "hehe"});
    } catch (err) {
        console.error("Planner error:", err);
        return res.status(500).json({error: "Internal server error"});
    } finally {
        client.release();
    }
}

module.exports = { getBestClassesPDF, getBestClassesText, getClassInfo, getOptimalSchedule };