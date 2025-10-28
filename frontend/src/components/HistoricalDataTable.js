import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HistoricalDataTable = ({ teachers = [], timePeriods = [] }) => {
  const [showByProfessor, setShowByProfessor] = useState(false); // checkbox state
  const [isAnimating, setIsAnimating] = useState(false);
  const scrollRef = useRef(null);
  const mode = showByProfessor ? 'aggregated' : 'raw';

  const getGpaColor = (gpa) => {
    if (gpa == null || gpa === 0) return 'bg-dark-input text-beige-dark';
    if (gpa >= 3.5) return 'bg-emerald-dark text-emerald-light';
    if (gpa >= 3.0) return 'bg-yellow-dark text-yellow-light';
    if (gpa >= 2.5) return 'bg-purple-dark text-purple-light';
    return 'bg-red-dark text-red-light';
  };

  // Filter out semesters where all GPAs are 0/null
  const validPeriods = timePeriods.filter((period) =>
    teachers.some((teacher) => {
      let gpa = teacher.gpaHistory?.[period] ?? null;
      if (Array.isArray(gpa)) {
        const valid = gpa.filter((v) => v != null && !isNaN(v));
        gpa = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
      }
      return gpa != null && gpa > 0;
    })
  );

  // Aggregated mode calculations
  const sortedTeachers = [...teachers].sort((a, b) => {
    if (a.teachingNext && !b.teachingNext) return -1;
    if (!a.teachingNext && b.teachingNext) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  const teacherAverages = sortedTeachers.map((teacher) => {
    const gpas = validPeriods
      .map((period) => {
        let gpa = teacher.gpaHistory?.[period] ?? null;
        if (Array.isArray(gpa)) {
          const valid = gpa.filter((v) => v != null && !isNaN(v));
          gpa = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
        }
        return gpa != null && gpa > 0 ? gpa : null;
      })
      .filter((v) => v != null);

    return gpas.length ? gpas.reduce((a, b) => a + b, 0) / gpas.length : null;
  });

  const tableVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: 10, transition: { duration: 0.3 } },
  };

  return (
    <div className="bg-dark-card rounded-xl shadow-md border border-dark-border mb-8">
      {/* Header with checkbox */}
      <div className="p-6 border-b border-dark-border flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-beige-light">
            Historical GPA Data
          </h2>
          <p className="text-sm text-beige-dark mt-1">
            {mode === 'aggregated'
              ? 'Average GPA by Semester across Professors (completed semesters only)'
              : 'Average GPA by Professor across Semesters (completed semesters only)'}
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-beige-light">
          <input
            type="checkbox"
            checked={showByProfessor}
            onChange={(e) => setShowByProfessor(e.target.checked)}
            className="w-4 h-4 text-beige-light bg-dark-input border-dark-border rounded"
          />
          Reverse Axes
        </label>
      </div>

      <div className="overflow-x-auto">
        <div
        ref={scrollRef}
        className={`overflow-x-auto ${isAnimating ? 'overflow-hidden' : ''}`}
        >
        <AnimatePresence mode="wait">
        {mode === 'aggregated' ? (
          // --- Aggregated mode ---
           <motion.div
              key="aggregated"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tableVariants}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
          <table className="w-full text-xs">
            <thead className="bg-dark-header">
              <tr>
                <th className="px-3 py-2 text-left font-medium text-beige-dark uppercase tracking-wider">
                  Semester
                </th>
                {sortedTeachers.map((teacher) => (
                  <th
                    key={teacher.id}
                    className="px-3 py-2 text-center font-medium text-beige-dark uppercase tracking-wider whitespace-nowrap"
                  >
                    <div className="flex flex-col items-center justify-center">
                       <a
                        href={teacher.rmpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={teacher.rmpLink ? " hover:text-blue-400 hover:underline cursor-pointer": ""}
                      >
                        <span>{teacher.name || '?'}</span>
                      </a>
                      {teacher.teachingNext && (
                        <div
                          className="flex items-center gap-1 text-[10px] font-medium text-green-light mt-0.5"
                          title="Teaching Next Semester"
                        >
                          <span className="w-2 h-2 bg-green-dark rounded-full"></span>
                          Teaching
                        </div>
                      )}

                      {teacher.students == 0 && (
                          <div
                            className="flex items-center gap-1 text-[10px] font-medium text-yellow-light"
                            title="New Professor"
                          >
                            <span className="w-2 h-2 bg-yellow-dark rounded-full"></span>
                            New
                          </div>
                        )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-border">
              {validPeriods.length === 0 ? (
                <tr>
                  <td
                    colSpan={sortedTeachers.length + 1}
                    className="px-6 py-6 text-center text-beige-dark text-sm"
                  >
                    No completed semester data available.
                  </td>
                </tr>
              ) : (
                <>
                  {validPeriods.map((period) => (
                    <tr key={period} className="hover:bg-dark-hover transition-colors">
                      <td className="px-3 py-2 font-medium text-beige-light whitespace-nowrap">
                        {period}
                      </td>
                      {sortedTeachers.map((teacher) => {
                        let gpa = teacher.gpaHistory?.[period] ?? null;
                        if (Array.isArray(gpa)) {
                          const valid = gpa.filter((v) => v != null && !isNaN(v));
                          gpa = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
                        }
                        return (
                          <td key={teacher.id + period} className="px-3 py-2 text-center whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${getGpaColor(
                                gpa
                              )}`}
                              title={gpa != null ? `${gpa.toFixed(2)} GPA` : 'N/A'}
                            >
                              {gpa != null && gpa > 0 ? gpa.toFixed(1) : '—'}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr className="bg-dark-header/50 border-t border-dark-border">
                    <td className="px-3 py-2 font-semibold text-beige-light">
                      Average GPA
                    </td>
                    {teacherAverages.map((avg, i) => (
                      <td key={i} className="px-3 py-2 text-center">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${getGpaColor(
                            avg
                          )}`}
                          title={avg != null ? `${avg.toFixed(2)} GPA` : 'No Data'}
                        >
                          {avg != null ? avg.toFixed(2) : '—'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </>
              )}
            </tbody>
          </table>
          </motion.div>
        ) : (
          // --- Raw mode (Show by Professor) ---

          <motion.div
              key="raw"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tableVariants}
              onAnimationStart={() => setIsAnimating(true)}
              onAnimationComplete={() => setIsAnimating(false)}
            >
          <table className="w-full">
            <thead className="bg-dark-header">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-beige-dark uppercase tracking-wider">
                  Teacher
                </th>
                {validPeriods.map((period) => (
                  <th
                    key={period}
                    className="px-4 py-3 text-center text-xs font-medium text-beige-dark uppercase tracking-wider"
                  >
                    {period}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-beige-dark uppercase tracking-wider">
                  Current GPA
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-dark-border">
              {teachers.length === 0 ? (
                <tr>
                  <td
                    colSpan={validPeriods.length + 2}
                    className="px-6 py-6 text-center text-beige-dark text-sm"
                  >
                    No teacher data available.
                  </td>
                </tr>
              ) : (
                sortedTeachers.map((teacher) => (
                   <tr key={teacher.id} className="hover:bg-dark-hover transition-colors text-beige-light text-sm font-medium">
                    <td className="px-6 py-4 whitespace-nowrap">
                       <a
                        href={teacher.rmpLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={teacher.rmpLink ? " hover:text-blue-400 hover:underline cursor-pointer": ""}
                      >
                        <span>{teacher.name || '?'}</span>
                      </a>
                      {teacher.teachingNext && (
                        <div className="flex items-center gap-1 text-xs font-medium text-green-light mt-1">
                          <span className="w-2 h-2 bg-green-dark rounded-full"></span>
                          Teaching Next Semester
                        </div>
                      )}
                      {teacher.students == 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-yellow-light mt-1">
                          <span className="w-2 h-2 bg-yellow-dark rounded-full"></span>
                          New Professor
                        </div>
                      )}
                    </td>

                    {validPeriods.map((period, index) => {
                      let gpa = teacher.gpaHistory?.[period] ?? null;
                      if (Array.isArray(gpa)) {
                        const valid = gpa.filter((v) => v != null && !isNaN(v));
                        gpa = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
                      }
                      return (
                        <td key={index} className="px-4 py-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(
                              gpa
                            )}`}
                            title={gpa != null ? `${gpa.toFixed(2)} GPA` : 'N/A'}
                          >
                            {gpa != null ? gpa.toFixed(1) : '—'}
                          </span>
                        </td>
                      );
                    })}

                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(
                          teacher.avgGpa
                        )}`}
                        title={teacher.avgGpa != null ? `${teacher.avgGpa.toFixed(2)} GPA` : 'N/A'}
                      >
                        {teacher.avgGpa != null ? teacher.avgGpa.toFixed(1) : '—'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HistoricalDataTable;
