import React from 'react';

const HistoricalDataTable = ({ teachers = [], timePeriods = [] }) => {
  const getGpaColor = (gpa) => {
    if (gpa == null) return 'bg-gray-100 text-gray-500';
    if (gpa >= 3.5) return 'bg-emerald-100 text-emerald-700';
    if (gpa >= 3.0) return 'bg-amber-100 text-amber-700';
    if (gpa >= 2.5) return 'bg-orange-100 text-orange-700';
    if (gpa == 0) return 'bg-gray-100 text-gray-700'
    return 'bg-rose-100 text-rose-700';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Historical GPA Data</h2>
        <p className="text-sm text-gray-600 mt-1">
          Raw semester data for all teachers
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Teacher
              </th>
              {timePeriods.map((period) => (
                <th
                  key={period}
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {period}
                </th>
              ))}
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current GPA
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {teachers.length === 0 ? (
              <tr>
                <td
                  colSpan={timePeriods.length + 2}
                  className="px-6 py-6 text-center text-gray-500 text-sm"
                >
                  No teacher data available.
                </td>
              </tr>
            ) : (
              teachers.map((teacher) => {
                const gpaHistory = teacher.gpaHistory || [];
                return (
                  <tr key={teacher.id} className="hover:bg-gray-50 transition">
                    {/* Teacher name */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {teacher.name || '?'}
                      </div>
                      {teacher.teachingNext && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          Teaching next semester
                        </div>
                      )}
                    </td>

                    {/* GPA per time period */}
                   {timePeriods.map((period, index) => {
                        let gpa = teacher.gpaHistory[period] ?? null;

                        // Case 3: Aggregate if GPA data is an array of records (e.g. per section)
                        if (Array.isArray(gpa)) {
                            const valid = gpa.filter(v => v != null && !isNaN(v));
                            gpa = valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
                        }

                        return (
                            <td key={index} className="px-4 py-4 whitespace-nowrap text-center">
                            <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(gpa)}`}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoricalDataTable;
