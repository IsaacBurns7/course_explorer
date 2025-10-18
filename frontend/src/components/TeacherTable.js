import React, { useState, useEffect } from 'react';

const TeacherTable = ({ teachers }) => {
    const [filteredTeachers, setFilteredTeachers] = useState(teachers);
    const [filters, setFilters] = useState({
        minGpa: 0,
        minRating: 1,
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
                        <input 
                            type="number" 
                            id="minGpa" 
                            min="0" 
                            max="4" 
                            step="0.1" 
                            value={filters.minGpa}
                            className="w-16 px-1.5 py-1 border border-gray-300 rounded text-sm focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-opacity-20"
                            onChange={(e) => handleFilterChange('minGpa', parseFloat(e.target.value) || 0)}
                        />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <label htmlFor="minRating" className="text-sm font-medium text-gray-700">Min Rating:</label>
                        <input 
                            type="number" 
                            id="minRating" 
                            min="1" 
                            max="5" 
                            step="0.1" 
                            value={filters.minRating}
                            className="w-16 px-1.5 py-1 border border-gray-300 rounded text-sm focus:border-maroon focus:outline-none focus:ring-2 focus:ring-maroon focus:ring-opacity-20"
                            onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value) || 1)}
                        />
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
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Avg GPA</th>
                                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Class GPA</th>
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
                                        <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                                        {!teacher.teachingNext && (
                                            <div className="text-sm text-red-600">Not teaching next semester</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(teacher.avgGpa)}`}>
                                            {teacher.avgGpa.toFixed(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(teacher.classGpa)}`}>
                                            {teacher.classGpa.toFixed(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center">
                                            <span className="text-sm font-medium text-gray-900">{teacher.rating.toFixed(1)}</span>
                                            <span className="ml-1 text-yellow-400">
                                                {'★'.repeat(Math.round(teacher.rating))}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getWouldTakeAgainColor(teacher.wouldTakeAgain)}`}>
                                            {teacher.wouldTakeAgain}%
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(teacher.difficulty)}`}>
                                            {teacher.difficulty.toFixed(1)}
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
