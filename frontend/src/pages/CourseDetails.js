import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeacherTable from '../components/TeacherTable';
import GPATrendsChart from '../components/GPATrendsChart';
import HistoricalDataTable from '../components/HistoricalDataTable';

import data from './TEMP_DATA'

const linkifyCourseCodes = (description) => {
  const regex = /\b([A-Z]{2,4})\s(\d{3})\b/g;

  const parts = [];
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(description)) !== null) {
    const [fullMatch, dept, courseNumber] = match;
    const matchStart = match.index;

    // Push the text before the match
    if (matchStart > lastIndex) {
      parts.push(description.slice(lastIndex, matchStart));
    }

    // Push the link
    parts.push(
      <a
        key={`${dept}-${courseNumber}-${matchStart}`}
        href={`/course/${dept}${courseNumber}`}
        target = "_blank"
        className="text-blue-600 hover:underline"
      >
        {fullMatch}
      </a>
    );

    lastIndex = match.index + fullMatch.length;
  }

  // Push any remaining text
  if (lastIndex < description.length) {
    parts.push(description.slice(lastIndex));
  }

  return parts;
}

const aggregateProfessorData = async (courseData, profInfo) => {
  const sections = courseData.sections || {};
  const professorMap = {};

  console.log(courseData)
  // Aggregate per-section data by professor
  for (const [semester, semSections] of Object.entries(sections)) {
    for (const sec of semSections) {
      const id = sec.prof_id;
      
      if (!professorMap[id]) {
        const info = profInfo[id]?.info || {};
        professorMap[id] = {
          id,
          name: sec.prof || info.name || "Unknown",
          totalStudents: 0,
          totalGpa: 0,
          gpas: [],
          totalSections: 0,
          gradeTotals: { A: 0, B: 0, C: 0, D: 0, F: 0 },
          avgGpa: 0,
          classGpa: 0,
          rating: Number(info.averageRating) || 0,
          wouldTakeAgain: Number(info.wouldTakeAgain) || 0,
          difficulty: Number(info.difficulty) || 0,
          teachingNext: false,
        };
      }

      // Aggregate GPA & grade data
      const prof = professorMap[id];
      prof.totalStudents += sec.students || 0;
      prof.totalGpa += (sec.gpa || 0) * (sec.students || 0);
      prof.gpas.push(sec.gpa || 0);
      prof.totalSections += 1;

      for (const grade of ["A", "B", "C", "D", "F"]) {
        prof.gradeTotals[grade] += sec[grade] || 0;
      }

      // Mark if teaching next
      if (semester === "Fall 2025") {
        prof.teachingNext = true;
      }
    }
  }

  // Finalize averages
  return Object.values(professorMap).map((p) => {
    const totalGrades = Object.values(p.gradeTotals).reduce((a, b) => a + b, 0);
    const grades = totalGrades
      ? Object.fromEntries(Object.entries(p.gradeTotals).map(([k, v]) => [k, Math.round((v / totalGrades) * 100)]))
      : p.gradeTotals;

    return {
      id: p.id,
      name: p.name,
      avgGpa: p.gpas.length ? Number((p.gpas.reduce((a, b) => a + b, 0) / p.gpas.length).toFixed(3)) : 0,
      classGpa: p.totalStudents ? Number((p.totalGpa / p.totalStudents).toFixed(3)) : 0,
      rating: p.rating,
      wouldTakeAgain: p.wouldTakeAgain,
      difficulty: p.difficulty || 3.0,
      teachingNext: p.teachingNext,
      grades,
      gpaHistory: p.gpas, // last 6 semesters
    };
  });
};



const CourseDetails = () => {
  const { courseId } = useParams();

  const [courseData, setCourseData] = useState(null);
  const [profData, setProfData] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // Parse courseId (e.g., "CSCE120" -> department="CSCE", courseNumber="120")
        const match = courseId.match(/^([A-Z]+)(\d+)$/);
        if (!match) {
          throw new Error('Invalid course ID format');
        }
        const department = match[1];
        const courseNumber = match[2];
        
        const res = await fetch(`http://localhost:4000/api/search2/courses?department=${department}&courseNumber=${courseNumber}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        const responseData = await res.json();

        // The data is like { CSCE_221: {...}, MATH_151: {...}, ... }
        // Find the course that matches our courseId
        const courseKey = `${department}_${courseNumber}`;
        const course = responseData[courseKey] || responseData.data || responseData;
        console.log('Loaded course:', course)

        const profRes = await fetch(`http://localhost:4000/api/search2/professors?department=${department}&courseNumber=${courseNumber}`);
        if (!profRes.ok) throw new Error(`HTTP error ${profRes.status}`);
        const profInfo = await profRes.json();

        const formattedProfData = await aggregateProfessorData(course, profInfo);
        console.log('Formatted professor data:', formattedProfData)
        // Set the state variables in sequence
        setProfData(formattedProfData);
        setCourseData(course);
        
      } catch (err) {
        console.error('Failed to load course:', err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) fetchCourseData();
  }, [courseId]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading...</div>;
  if (!courseData) return <div className="p-10 text-center text-red-500">Course not found</div>;

  const info = courseData.info || {};
  const teachers = courseData.professors || [];
  
  // Calculate actual average GPA from all sections
  const calculateAverageGPA = (sections) => {
    if (!sections || Object.keys(sections).length === 0) return 0;
    
    let totalGpaSum = 0;
    let totalStudents = 0;
    
    for (const semester in sections) {
      const semesterSections = sections[semester];
      for (const section of semesterSections) {
        if (section.gpa != null && section.students != null && section.students > 0) {
          totalGpaSum += section.gpa * section.students;
          totalStudents += section.students;
        }
      }
    }
    
    return totalStudents > 0 ? (totalGpaSum / totalStudents) : 0;
  };
  
  const calculatedAverageGPA = calculateAverageGPA(courseData.sections);
  
  // Sort time periods chronologically
  const sortTimePeriods = (periods) => {
    const seasonOrder = { 'Spring': 1, 'Summer': 2, 'Fall': 3 };
    return periods.sort((a, b) => {
      const [seasonA, yearA] = a.split(' ');
      const [seasonB, yearB] = b.split(' ');
      
      // Compare years first
      if (yearA !== yearB) {
        return parseInt(yearA) - parseInt(yearB);
      }
      
      // If same year, compare seasons
      return seasonOrder[seasonA] - seasonOrder[seasonB];
    });
  };
  
  const timePeriods = sortTimePeriods(Object.keys(courseData.sections || {}));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-maroon">
            {`${info.department || '?'} ${info.number || '?'} - ${info.title || '?'}`}
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">{info.description ? linkifyCourseCodes(info.description) : "?"}</p>

          <div className="flex flex-wrap gap-3">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
              {info.department || '?'}
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
              Avg GPA: {calculatedAverageGPA > 0 ? calculatedAverageGPA.toFixed(2) : '?'}
            </div>
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
              Sections: {info.totalSections != null ? info.totalSections : '?'}
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
              Students: {info.totalStudents != null ? info.totalStudents : '?'}
            </div>
          </div>
        </div>

         {/* Teachers Table Component */}
        <TeacherTable teachers={profData} />

        {/* GPA Trends Chart */}
        <GPATrendsChart teachers={profData} timePeriods={timePeriods} />

                {/* Historical Data Table */}
                <HistoricalDataTable teachers={profData} timePeriods={timePeriods} />
      </div>
    </div>
  );
};

export default CourseDetails;
