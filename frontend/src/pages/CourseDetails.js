import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeacherTable from '../components/TeacherTable';
import GPATrendsChart from '../components/GPATrendsChart';
import HistoricalDataTable from '../components/HistoricalDataTable';

import data from './TEMP_DATA'

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
        const res = await fetch(`http://localhost:4000/api/search2/courses?department=CSCE&courseNumber=221`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        //const data = await res.json();

        // The data is like { CSCE_221: {...}, MATH_151: {...}, ... }
        
        const course = data.data
        console.log(data)

        const profRes = await fetch(`http://localhost:4000/api/search2/professors?department=CSCE&courseNumber=221`);
        if (!profRes.ok) throw new Error(`HTTP error ${profRes.status}`);
        const profInfo = await profRes.json();

        const formattedProfData = await aggregateProfessorData(course, profInfo);
        console.log(formattedProfData)
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

  const info = courseData.info;
  const teachers = courseData.professors || [];
  const timePeriods = Object.keys(courseData.sections || {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Course Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-3 text-maroon">
            {`${info.department} ${info.number} - ${info.title}`}
          </h1>
          <p className="text-gray-600 mb-4 leading-relaxed">{info.description}</p>

          <div className="flex flex-wrap gap-3">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
              {info.department}
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
              Avg GPA: {info.averageGPA.toFixed(2)}
            </div>
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
              Sections: {info.totalSections}
            </div>
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
              Students: {info.totalStudents}
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
