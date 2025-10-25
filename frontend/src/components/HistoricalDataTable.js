import React from 'react';

const HistoricalDataTable = ({ teachers = [], timePeriods = [] }) => {
  const getGpaColor = (gpa) => {
    if (gpa == null || gpa === 0) return 'bg-dark-input text-beige-dark';
    if (gpa >= 3.5) return 'bg-emerald-dark text-emerald-light';
    if (gpa >= 3.0) return 'bg-yellow-dark text-yellow-light';
    if (gpa >= 2.5) return 'bg-purple-dark text-purple-light';
    return 'bg-red-dark text-red-light';
  };

  // Sort teachers: teachingNext first
  const sortedTeachers = [...teachers].sort((a, b) => {
    if (a.teachingNext && !b.teachingNext) return -1;
    if (!a.teachingNext && b.teachingNext) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  // Filter out semesters that haven't started / ended (all GPAs 0 or null)
  const validPeriods = timePeriods.filter((period) => {
    return sortedTeachers.some((teacher) => {
      let gpa = teacher.gpaHistory?.[period] ?? null;

      if (Array.isArray(gpa)) {
        const valid = gpa.filter((v) => v != null && !isNaN(v));
        gpa =
          valid.length > 0
            ? valid.reduce((a, b) => a + b, 0) / valid.length
            : null;
      }

      return gpa != null && gpa > 0;
    });
  });

  // Compute average GPA per teacher (across valid periods)
  const teacherAverages = sortedTeachers.map((teacher) => {
    const gpas = validPeriods
      .map((period) => {
        let gpa = teacher.gpaHistory?.[period] ?? null;
        if (Array.isArray(gpa)) {
          const valid = gpa.filter((v) => v != null && !isNaN(v));
          gpa =
            valid.length > 0
              ? valid.reduce((a, b) => a + b, 0) / valid.length
              : null;
        }
        return gpa != null && gpa > 0 ? gpa : null;
      })
      .filter((v) => v != null);

    if (gpas.length === 0) return null;
    const avg = gpas.reduce((a, b) => a + b, 0) / gpas.length;
    return avg;
  });

  return (
    <div className="bg-dark-card rounded-xl shadow-md border border-dark-border mb-8">
      {/* Header */}
      <div className="p-4 border-b border-dark-border">
        <h2 className="text-base font-semibold text-beige-light">
          Historical GPA Data
        </h2>
        <p className="text-md text-beige-dark mt-1">
          Average GPA by semester across teachers (completed semesters only)
        </p>
      </div>

      <div className="overflow-x-auto">
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
                    <span>{teacher.name || '?'}</span>
                    {teacher.teachingNext && (
                      <div
                        className="flex items-center gap-1 text-[10px] font-medium text-green-light mt-0.5"
                        title="Teaching Next Semester"
                      >
                        <span className="w-2 h-2 bg-green-dark rounded-full"></span>
                        Teaching
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
                  <tr
                    key={period}
                    className="hover:bg-dark-hover transition-colors"
                  >
                    <td className="px-3 py-2 font-medium text-beige-light whitespace-nowrap">
                      {period}
                    </td>

                    {sortedTeachers.map((teacher) => {
                      let gpa = teacher.gpaHistory?.[period] ?? null;

                      if (Array.isArray(gpa)) {
                        const valid = gpa.filter(
                          (v) => v != null && !isNaN(v)
                        );
                        gpa =
                          valid.length > 0
                            ? valid.reduce((a, b) => a + b, 0) / valid.length
                            : null;
                      }

                      return (
                        <td
                          key={teacher.id + period}
                          className="px-3 py-2 text-center whitespace-nowrap"
                        >
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-medium ${getGpaColor(
                              gpa
                            )}`}
                            title={
                              gpa != null ? `${gpa.toFixed(2)} GPA` : 'N/A'
                            }
                          >
                            {gpa != null && gpa > 0 ? gpa.toFixed(1) : '—'}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Average GPA Row */}
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
                        title={
                          avg != null ? `${avg.toFixed(2)} GPA` : 'No Data'
                        }
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
      </div>
    </div>
  );
};

export default HistoricalDataTable;
