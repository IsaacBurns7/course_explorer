import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, CalendarDays, CheckCircle, School } from "lucide-react";


const TeacherTable = ({ teachers }) => {
    const [filteredTeachers, setFilteredTeachers] = useState(teachers);
    const [filters, setFilters] = useState({
        minGpa: 0,
        minRating: 0,
        teachingNext: true
    });

    useEffect(() => {
        applyFilters();
    }, [teachers, filters]);

    const applyFilters = () => {
        const filtered = teachers.filter(teacher => {
            return teacher.avgGpa >= filters.minGpa && 
                   teacher.rating >= filters.minRating && 
                   (!filters.teachingNext || teacher.teachingNext);
        });
        setFilteredTeachers(filtered);
    };

    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: value
        }));
    };

    const getGpaColor = (gpa) => {
        if (gpa >= 3.5) return 'bg-emerald-100 text-emerald-700';
        if (gpa >= 3.0) return 'bg-amber-100 text-amber-700';
        if (gpa >= 2.5) return 'bg-orange-100 text-orange-700';
        return 'bg-rose-100 text-rose-700';
    };

    const getWouldTakeAgainColor = (percentage) => {
        if (percentage >= 80) return 'bg-emerald-100 text-emerald-700';
        if (percentage >= 65) return 'bg-amber-100 text-amber-700';
        if (percentage >= 50) return 'bg-orange-100 text-orange-700';
        return 'bg-rose-100 text-rose-700';
    };

    const getDifficultyColor = (difficulty) => {
        if (difficulty <= 2.5) return 'bg-emerald-100 text-emerald-700';
        if (difficulty <= 3.5) return 'bg-amber-100 text-amber-700';
        if (difficulty <= 4.0) return 'bg-orange-100 text-orange-700';
        return 'bg-rose-100 text-rose-700';
    };

    const renderGradeDistribution = (teacher) => {
        const totalStudents = Object.values(teacher.grades).reduce((sum, count) => sum + count, 0);
        const grades = ['A', 'B', 'C', 'D', 'F'];
        const gradeColors = {
            A: '#10b981', // emerald-500
            B: '#0ea5e9', // sky-500
            C: '#f59e0b', // amber-500
            D: '#f97316', // orange-500
            F: '#ef4444'  // red-500
        };
        
        return (
            <div className="w-full">
                <div className="bg-gray-200 rounded-full h-6 relative flex overflow-hidden">
                    {grades.map(grade => {
                        const count = teacher.grades[grade];
                        const percentage = totalStudents > 0 ? (count / totalStudents * 100) : 0;
                        
                        if (count > 0) {
                            return (
                                <div 
                                    key={grade}
                                    className="h-6 flex items-center justify-center text-xs font-medium text-white transition-all duration-500" 
                                    style={{ 
                                        width: `${percentage}%`, 
                                        backgroundColor: gradeColors[grade] 
                                    }}
                                    title={`${grade}: ${count} students (${percentage.toFixed(1)}%)`}
                                >
                                    {count > 3 ? count : ''}
                                </div>
                            );
                        }
                        return null;
                    })}
                </div>
                <div className="text-xs text-gray-500 mt-1">{totalStudents} students</div>
            </div>
        );
    };

    return (
        <>
            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                <div className="flex flex-wrap items-center gap-6">
                    <h2 className="text-lg font-semibold text-gray-800">Filter Teachers:</h2>
                    
                    <div className="flex items-center space-x-2">
                        <label htmlFor="minGpa" className="text-sm font-medium text-gray-700">Min GPA:</label>
                        <select 
                            id="minGpa" 
                            value={filters.minGpa}
                            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-opacity-20"
                            onChange={(e) => handleFilterChange('minGpa', parseFloat(e.target.value) || 0)}
                        >
                            <option value="0">All</option>
                            <option value="2">2.0+</option>
                            <option value="2.5">2.5+</option>
                            <option value="3">3.0+</option>
                            <option value="3.5">3.5+</option>
                            <option value="4">4.0</option>
                        </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <label htmlFor="minRating" className="text-sm font-medium text-gray-700">Min Rating:</label>
                        <select 
                            id="minRating" 
                            value={filters.minRating}
                            className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-900 focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-opacity-20"
                            onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value) || 0)}
                        >
                            <option value="0">All</option>
                            <option value="1">1.0+</option>
                            <option value="2">2.0+</option>
                            <option value="3">3.0+</option>
                            <option value="4">4.0+</option>
                            <option value="5">5.0</option>
                        </select>
                    </div>
                    
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                        <input 
                            type="checkbox" 
                            checked={filters.teachingNext}
                            className="w-4 h-4 border-gray-300 rounded text-maroon focus:ring-maroon"
                            onChange={(e) => handleFilterChange('teachingNext', e.target.checked)}
                        />
                        <span>Teaching Next Semester</span>
                    </label>
                </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Available Teachers</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Class GPA</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg GPA</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Would Take Again</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-80">Grade Distribution</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredTeachers.map(teacher => (
                                <tr key={teacher.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
    <span>{teacher.name || '?'}</span>

    {teacher.teachingNext && (
      <div className="relative group inline-flex items-center">
        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-500 text-white hover:bg-green-600 transition">
          <CheckCircle className="w-3.5 h-3.5" />
        </div>

        {/* Tooltip */}
        <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
  Teaching Next Semester
</span>
      </div>
    )}
  </div>
</td>


                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(teacher.classGpa)}`}>
                                            {teacher.classGpa != null ? teacher.classGpa.toFixed(1) : '?'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(teacher.avgGpa)}`}>
                                            {teacher.avgGpa != null ? teacher.avgGpa.toFixed(1) : '?'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <span className="text-sm font-medium text-gray-900">{teacher.rating != null ? teacher.rating.toFixed(1) : '?'}</span>
                                            {teacher.rating > 0 && (
                                                <span className="text-yellow-400 text-xs leading-none">
                                                    {'★'.repeat(Math.round(teacher.rating))}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getWouldTakeAgainColor(teacher.wouldTakeAgain)}`}>
                                            {teacher.wouldTakeAgain != null ? `${teacher.wouldTakeAgain.toFixed(1)}%` : '?'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(teacher.difficulty)}`}>
                                            {teacher.difficulty != null ? teacher.difficulty.toFixed(1) : '?'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {renderGradeDistribution(teacher)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default TeacherTable;
