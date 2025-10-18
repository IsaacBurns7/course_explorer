import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import TeacherTable from '../components/TeacherTable';
import GPATrendsChart from '../components/GPATrendsChart';
import HistoricalDataTable from '../components/HistoricalDataTable';

const CourseDetails = () => {
    const { courseId } = useParams();
    
    // Sample course data - in real app this would come from API
    const [courseData, setCourseData] = useState({
        id: courseId || 'CS101',
        name: 'CS 101 - Introduction to Computer Science',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        location: 'College Station',
        department: 'KUCD',
        avgGpa: '3.47',
        standardDeviation: '0.47',
        dropRate: '3.2%'
    });

    // Sample teacher data with historical GPA trends
    const [teachers] = useState([
        { id: 1, name: "Dr. Sarah Johnson", avgGpa: 3.2, classGpa: 3.1, rating: 4.5, wouldTakeAgain: 78, difficulty: 3.2, teachingNext: true, grades: { A: 25, B: 35, C: 25, D: 10, F: 5 }, gpaHistory: [3.0, 3.1, 3.0, 3.2, 3.1, 3.2] },
        { id: 2, name: "Prof. Michael Chen", avgGpa: 2.8, classGpa: 2.9, rating: 3.8, wouldTakeAgain: 65, difficulty: 3.8, teachingNext: true, grades: { A: 15, B: 30, C: 35, D: 15, F: 5 }, gpaHistory: [2.6, 2.7, 2.8, 2.9, 2.8, 2.9] },
        { id: 3, name: "Dr. Emily Rodriguez", avgGpa: 3.6, classGpa: 3.5, rating: 4.8, wouldTakeAgain: 92, difficulty: 2.9, teachingNext: false, grades: { A: 40, B: 30, C: 20, D: 8, F: 2 }, gpaHistory: [3.4, 3.5, 3.6, 3.7, 3.5, 3.5] },
        { id: 4, name: "Prof. David Kim", avgGpa: 3.0, classGpa: 3.2, rating: 4.2, wouldTakeAgain: 81, difficulty: 3.1, teachingNext: true, grades: { A: 20, B: 40, C: 25, D: 12, F: 3 }, gpaHistory: [2.9, 3.0, 3.1, 3.2, 3.1, 3.2] },
        { id: 5, name: "Dr. Lisa Thompson", avgGpa: 2.5, classGpa: 2.4, rating: 3.2, wouldTakeAgain: 52, difficulty: 4.1, teachingNext: true, grades: { A: 10, B: 25, C: 40, D: 20, F: 5 }, gpaHistory: [2.3, 2.4, 2.5, 2.6, 2.4, 2.4] },
        { id: 6, name: "Prof. James Wilson", avgGpa: 3.4, classGpa: 3.3, rating: 4.6, wouldTakeAgain: 87, difficulty: 3.0, teachingNext: false, grades: { A: 30, B: 35, C: 25, D: 8, F: 2 }, gpaHistory: [3.2, 3.3, 3.4, 3.5, 3.3, 3.3] },
        { id: 7, name: "Dr. Amanda Foster", avgGpa: 3.8, classGpa: 3.7, rating: 4.9, wouldTakeAgain: 95, difficulty: 2.7, teachingNext: true, grades: { A: 45, B: 30, C: 18, D: 5, F: 2 }, gpaHistory: [3.6, 3.7, 3.8, 3.9, 3.7, 3.7] },
        { id: 8, name: "Prof. Robert Martinez", avgGpa: 2.3, classGpa: 2.2, rating: 2.8, wouldTakeAgain: 38, difficulty: 4.3, teachingNext: false, grades: { A: 8, B: 20, C: 35, D: 25, F: 12 }, gpaHistory: [2.1, 2.2, 2.3, 2.4, 2.2, 2.2] },
        { id: 9, name: "Dr. Jennifer Lee", avgGpa: 3.1, classGpa: 3.0, rating: 4.1, wouldTakeAgain: 76, difficulty: 3.3, teachingNext: true, grades: { A: 22, B: 38, C: 28, D: 10, F: 2 }, gpaHistory: [2.9, 3.0, 3.1, 3.2, 3.0, 3.0] },
        { id: 10, name: "Prof. Thomas Brown", avgGpa: 2.9, classGpa: 2.8, rating: 3.6, wouldTakeAgain: 61, difficulty: 3.7, teachingNext: false, grades: { A: 18, B: 32, C: 30, D: 15, F: 5 }, gpaHistory: [2.7, 2.8, 2.9, 3.0, 2.8, 2.8] }
    ]);

    const timePeriods = ['Fall 2022', 'Spring 2023', 'Fall 2023', 'Spring 2024', 'Fall 2024', 'Spring 2025'];

    // In a real app, this would fetch from API based on courseId
    useEffect(() => {
        // fetchCourseData(courseId);
        console.log('Loading course data for:', courseId);
    }, [courseId]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Course Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold mb-3 text-maroon">
                        {courseData.name}
                    </h1>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                        {courseData.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium">
                            {courseData.location}
                        </div>
                        <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg font-medium">
                            {courseData.department}
                        </div>
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-medium">
                            {courseData.avgGpa}
                        </div>
                        <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg font-medium">
                            SD: {courseData.standardDeviation}
                        </div>
                        <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg font-medium">
                            DR: {courseData.dropRate}
                        </div>
                    </div>
                </div>

                {/* Teachers Table Component */}
                <TeacherTable teachers={teachers} />

                {/* GPA Trends Chart */}
                <GPATrendsChart teachers={teachers} timePeriods={timePeriods} />

                {/* Historical Data Table */}
                <HistoricalDataTable teachers={teachers} timePeriods={timePeriods} />
            </div>
        </div>
    );
};

export default CourseDetails;
