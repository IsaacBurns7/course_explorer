import React, { useState, useEffect } from 'react';
import { CheckCircle } from "lucide-react";

const TeacherTable = ({ teachers }) => {
  const [filteredTeachers, setFilteredTeachers] = useState(teachers);
  const [filters, setFilters] = useState({
    minGpa: 0,
    minRating: 0,
    teachingNext: true,
  });

  useEffect(() => {
    applyFilters();
  }, [teachers, filters]);

  const applyFilters = () => {
    const filtered = teachers.filter((teacher) => {
      return (
        teacher.avgGpa >= filters.minGpa &&
        teacher.rating >= filters.minRating &&
        (!filters.teachingNext || teacher.teachingNext)
      );
    });
    setFilteredTeachers(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Updated to use your dark palette
  const getGpaColor = (gpa) => {
    if (gpa >= 3.5) return 'bg-emerald-dark text-emerald-light';
    if (gpa >= 3.0) return 'bg-yellow-dark text-yellow-light';
    if (gpa >= 2.5) return 'bg-purple-dark text-purple-light';
    return 'bg-red-dark text-red-light';
  };

  const getWouldTakeAgainColor = (percentage) => {
    if (percentage >= 80) return 'bg-emerald-dark text-emerald-light';
    if (percentage >= 65) return 'bg-yellow-dark text-yellow-light';
    if (percentage >= 50) return 'bg-purple-dark text-purple-light';
    return 'bg-red-dark text-red-light';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty <= 2.5) return 'bg-emerald-dark text-emerald-light';
    if (difficulty <= 3.5) return 'bg-yellow-dark text-yellow-light';
    if (difficulty <= 4.0) return 'bg-purple-dark text-purple-light';
    return 'bg-red-dark text-red-light';
  };

  const renderGradeDistribution = (teacher) => {
    const totalStudents = Object.values(teacher.grades).reduce(
      (sum, count) => sum + count,
      0
    );
    const grades = ['A', 'B', 'C', 'D', 'F'];
    const gradeColors = {
      A: '#6EE7B7', // emerald-light
      B: '#93C5FD', // blue-light
      C: '#FDE68A', // yellow-light
      D: '#FCA5A5', // red-light
      F: '#5F1E2A', // red-dark
    };

    return (
      <div className="w-full">
        <div className="bg-dark-border rounded-full h-6 relative flex overflow-hidden">
          {grades.map((grade) => {
            const count = teacher.grades[grade];
            const percentage =
              totalStudents > 0 ? (count / totalStudents) * 100 : 0;

            if (count > 0) {
              return (
                <div
                  key={grade}
                  className="h-6 flex items-center justify-center text-xs font-medium text-blackX transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: gradeColors[grade],
                  }}
                  title={`${grade}: ${count} students (${percentage.toFixed(
                    1
                  )}%)`}
                >
                  {count > 3 ? count : ''}
                </div>
              );
            }
            return null;
          })}
        </div>
        <div className="text-xs text-beige-dark mt-1">
          {totalStudents} students
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Filters Section */}
      <div className="bg-dark-card rounded-xl shadow-md p-6 mb-8 border border-dark-border">
        <div className="flex flex-wrap items-center gap-6">
          <h2 className="text-lg font-semibold text-beige-light">
            Filter Teachers:
          </h2>

          {/* GPA filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="minGpa"
              className="text-sm font-medium text-beige-dark"
            >
              Min GPA:
            </label>
            <select
              id="minGpa"
              value={filters.minGpa}
              className="bg-dark-input text-beige-light px-3 py-1 border border-dark-border rounded text-sm focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon"
              onChange={(e) =>
                handleFilterChange('minGpa', parseFloat(e.target.value) || 0)
              }
            >
              <option value="0">All</option>
              <option value="2">2.0+</option>
              <option value="2.5">2.5+</option>
              <option value="3">3.0+</option>
              <option value="3.5">3.5+</option>
              <option value="4">4.0</option>
            </select>
          </div>

          {/* Rating filter */}
          <div className="flex items-center space-x-2">
            <label
              htmlFor="minRating"
              className="text-sm font-medium text-beige-dark"
            >
              Min Rating:
            </label>
            <select
              id="minRating"
              value={filters.minRating}
              className="bg-dark-input text-beige-light px-3 py-1 border border-dark-border rounded text-sm focus:border-maroon focus:outline-none focus:ring-1 focus:ring-maroon"
              onChange={(e) =>
                handleFilterChange('minRating', parseFloat(e.target.value) || 0)
              }
            >
              <option value="0">All</option>
              <option value="1">1.0+</option>
              <option value="2">2.0+</option>
              <option value="3">3.0+</option>
              <option value="4">4.0+</option>
              <option value="5">5.0</option>
            </select>
          </div>

          {/* Teaching Next checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="teachingNext"
              checked={filters.teachingNext}
              onChange={(e) =>
                handleFilterChange('teachingNext', e.target.checked)
              }
              className="w-4 h-4 rounded border-dark-border bg-dark-input text-maroon focus:ring-maroon focus:ring-2 cursor-pointer"
              style={{ accentColor: '#500000' }}
            />
            <label
              htmlFor="teachingNext"
              className="text-sm font-medium text-beige-dark cursor-pointer"
            >
              Teaching Next Semester
            </label>
          </div>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-dark-card rounded-xl shadow-md border border-dark-border mb-8">
        <div className="p-6 border-b border-dark-border">
          <h2 className="text-lg font-semibold text-beige-light">
            Available Teachers
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-header">
              <tr>
                {[
                  'Teacher',
                  'Class GPA',
                  'Avg GPA',
                  'Rating',
                  'Would Take Again',
                  'Difficulty',
                  'Grade Distribution',
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-xs font-medium text-beige-dark uppercase tracking-wider text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-border">
              {filteredTeachers.map((teacher) => (
                <tr
                  key={teacher.id}
                  className="hover:bg-dark-hover transition-colors"
                >
                  {/* Teacher name + teaching badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm font-medium text-beige-light">
                      <span>{teacher.name || '?'}</span>

                      {teacher.teachingNext && (
                        <div className="relative group inline-flex items-center">
                          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-dark text-green-light hover:bg-green-light hover:text-green-dark transition">
                            <CheckCircle className="w-3.5 h-3.5" />
                          </div>
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap rounded bg-dark-border px-2 py-1 text-xs text-beige-light opacity-0 group-hover:opacity-100 transition-opacity">
                            Teaching Next Semester
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Class GPA */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(
                        teacher.classGpa
                      )}`}
                    >
                      {teacher.classGpa != null
                        ? teacher.classGpa.toFixed(1)
                        : '?'}
                    </span>
                  </td>

                  {/* Avg GPA */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(
                        teacher.avgGpa
                      )}`}
                    >
                      {teacher.avgGpa != null
                        ? teacher.avgGpa.toFixed(1)
                        : '?'}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-sm font-medium text-beige-light">
                        {teacher.rating != null && teacher.rating > 0
                          ? teacher.rating.toFixed(1)
                          : '-'}
                      </span>
                      {teacher.rating > 0 && (
                        <span className="text-yellow-light text-xs leading-none">
                          {'★'.repeat(Math.round(teacher.rating))}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Would Take Again */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getWouldTakeAgainColor(
                        teacher.wouldTakeAgain
                      )}`}
                    >
                      {teacher.wouldTakeAgain != null
                        ? `${teacher.wouldTakeAgain.toFixed(1)}%`
                        : '?'}
                    </span>
                  </td>

                  {/* Difficulty */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(
                        teacher.difficulty
                      )}`}
                    >
                      {teacher.difficulty != null
                        ? teacher.difficulty.toFixed(1)
                        : '?'}
                    </span>
                  </td>

                  {/* Grade Distribution */}
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
