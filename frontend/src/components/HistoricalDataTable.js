import React from 'react';

const HistoricalDataTable = ({ teachers, timePeriods }) => {
    const getGpaColor = (gpa) => {
        if (gpa >= 3.5) return 'bg-emerald-100 text-emerald-700';
        if (gpa >= 3.0) return 'bg-amber-100 text-amber-700';
        if (gpa >= 2.5) return 'bg-orange-100 text-orange-700';
        return 'bg-rose-100 text-rose-700';
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Historical GPA Data</h2>
                <p className="text-sm text-gray-600 mt-1">Raw semester data for all teachers</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                            {timePeriods.map(period => (
                                <th key={period} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {period}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Current GPA</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teachers.map(teacher => (
                            <tr key={teacher.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{teacher.name || '?'}</div>
                                    {teacher.teachingNext && (
                                        <div className="text-sm text-green-600 font-medium">Teaching next semester</div>
                                    )}
                                </td>
                                {teacher.gpaHistory && teacher.gpaHistory.map((gpa, index) => (
                                    <td key={index} className="px-4 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(gpa)}`}>
                                            {gpa != null ? gpa.toFixed(1) : '?'}
                                        </span>
                                    </td>
                                ))}
                                <td className="px-4 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getGpaColor(teacher.avgGpa)}`}>
                                        {teacher.avgGpa != null ? teacher.avgGpa.toFixed(1) : '?'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default HistoricalDataTable;
