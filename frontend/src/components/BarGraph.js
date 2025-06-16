//this will probably use a courses context, 
//and then use the specific professor name to find matching sections
//then, total all the sections to find relevant data

//in courses, find course with courseId
//for that course, find professors with professorId
import { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";

function BarGraph({professorId, courseId}){

    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        const ctx = chartRef.current.getContext("2d");

        //destroy old chart instance if it exists
        if(chartInstanceRef.current){
            chartInstanceRef.current.destroy();
        }
        //const data = callBackendForInfoByCourse(dept, number)andProfessorID(name?)
        const data = {
            labels: ["A", "B", "C", "D", "F", "Q"],
            datasets: [{
                label: '# of Students',
                data: [2500, 6700, 4300, 2200, 1900, 1700],
                backgroundColor: [
                '#7CFC00', '#7FFF00', '#ADFF2F', '#C0FF3E', '#FFFF66', '#FFE066', 
                '#FFD700', '#FFCC00', '#FFB400', '#FF9933', '#FF6600', '#FF4500', 
                '#FF0000', '#C0C0C0'
                ],
                borderRadius: 5,
                barPercentage: 0.9
            }]
        };
        const options = {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context){
                            // console.log(context); 
                            //may have to modify based on actual form of datasets
                            const value = context.raw;
                            const total = context.chart._metasets[0].total ?? context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0)
                            const percentage = ((value / total) * 100).toFixed(2);
                            return `Students: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: "#e5e7eb"
                    }
                },
                x: {
                    ticks: {
                        color: "#e5e7eb"
                    }
                }
            }
        };

        chartInstanceRef.current = new Chart(ctx, {
            type: "bar",
            data,
            options
        })

        return () => {
            chartInstanceRef.current?.destroy();
        };

    }, [])

    return (
        <canvas ref = {chartRef} className = "bg-gray-800 p-4 rounded-lg">

        </canvas>
    )
}

export default BarGraph;