import React from 'react';

const HistoricalDataTable = ({ teachers = [], timePeriods = [] }) => {
  const getGpaColor = (gpa) => {
    if (gpa == null) return 'bg-dark-input text-beige-dark';
    if (gpa === 0) return 'bg-dark-input text-beige-dark';
    if (gpa >= 3.5) return 'bg-emerald-dark text-emerald-light';
    if (gpa >= 3.0) return 'bg-yellow-dark text-yellow-light';
    if (gpa >= 2.5) return 'bg-purple-dark text-purple-light';
    return 'bg-red-dark text-red-light';
  };

  return (
    <div className="bg-dark-card rounded-xl shadow-md border border-dark-border mb-8">
      {/* Header */}
      <div className="p-6 border-b border-dark-border">
        <h2 className="text-lg font-semibold text-beige-light">
          Historical GPA Data
        </h2>
        <p className="text-sm text-beige-dark mt-1">
          Raw semester GPA data for all teachers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dark-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-beige-dark uppercase tracking-wider">
                Teacher
              </th>
              {timePeriods.map((period) => (
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
                  colSpan={timePeriods.length + 2}
                  className="px-6 py-6 text-center text-beige-dark text-sm"
                >
                  No teacher data available.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => (
                <tr key={teacher.id} className="hover:bg-dark-hover transition-colors">
                  {/* Teacher name + optional teaching badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-beige-light">
                      {teacher.name || '?'}
                    </div>
                    {teacher.teachingNext && (
                      <div className="flex items-center gap-1 text-xs font-medium text-green-light mt-1">
                        <span className="w-2 h-2 bg-green-dark rounded-full"></span>
                        Teaching Next Semester
                      </div>
                    )}
                  </td>

                  {/* GPA per time period */}
                  {timePeriods.map((period, index) => {
                    let gpa = teacher.gpaHistory?.[period] ?? null;

                    if (Array.isArray(gpa)) {
                      const valid = gpa.filter((v) => v != null && !isNaN(v));
                      gpa =
                        valid.length > 0
                          ? valid.reduce((a, b) => a + b, 0) / valid.length
                          : null;
                    }

                    return (
                      <td
                        key={index}
                        className="px-4 py-4 whitespace-nowrap text-center"
                      >
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

                  {/* Current average GPA */}
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(
                        teacher.avgGpa
                      )}`}
                      title={
                        teacher.avgGpa != null
                          ? `${teacher.avgGpa.toFixed(2)} GPA`
                          : 'N/A'
                      }
                    >
                      {teacher.avgGpa != null
                        ? teacher.avgGpa.toFixed(1)
                        : '—'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalDataTable;
