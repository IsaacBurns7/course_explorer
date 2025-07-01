//this will probably use a courses context, 
//and then use the specific professor name to find matching sections
//then, total all the sections to find relevant data

//in courses, find course with courseId
//for that course, find professors with professorId
import { useEffect, useState, useMemo } from "react";
import Chart from "react-apexcharts"; 
import axios from "axios";

function BarGraph({professorId, professorName, dept, number}){
    const [data, setData] = useState([]);

    useEffect(() => {
        const optionsUrl = `/server/api/courses/graph?department=${dept}&courseNumber=${number}&professorID=${professorId}`;
        // console.log(optionsUrl);
        const options = {
            method: "GET",
            url: optionsUrl
        };

        axios(options)
            .then((response) => {
                // console.log(response.data);
                setData(response.data);
            })
            .catch((error) => {
                console.error("error: ", error);
            });
    }, []);

    const categories = data.map((item => item[0]));
    const seriesData = data.map((item => item[1]));
    const total = useMemo(() => {
        return seriesData.reduce((sum, value) => sum + value, 0);
    }, [seriesData]);
    const options = {
        chart: {
            id: 'basic-bar',
            toolbar: {
                show: true
            }
        },
        xaxis: {
            categories: categories,
            labels: {
                style: {
                    colors: "#ffffff",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serf"

                }
            }
        },
        yaxis: {
            labels: {
                formatter: function(val){
                    return val.toFixed(2);
                },
                style: { 
                    colors: "#000000"
                }
            }
        },
        colors: ['#3B82F6'],
        plotOptions: {
            bar: {
            borderRadius: 4,
            columnWidth: '70%'
            }
        },
        tooltip: {
            style: {
                
            },
            custom: function({series, seriesIndex, dataPointIndex, w}){
                const value = series[seriesIndex][dataPointIndex];
                const percentage = ((value / total) * 100).toFixed(2);
                return `
                    <div class = "apexcharts-tooltip-custom">
                        <h1><strong>${data[seriesIndex][0]}</strong></h1>
                        <div>${dept} ${number} ${professorName !== "info" ? professorName: ""} ${value}(${percentage}%)</div>
                    </div>
                `;
            }
        }
    };


    const series = [
        {
            name: "Grades",
            data: seriesData
        }
    ];

    return (
        <div className = "chart-wrapper">
            <Chart 
                options = {options}
                series = {series}
                type = "bar"
                height = {350}
                className = "text-white"
            />
            <style jsx global>
            {`
                .apexcharts-tooltip-custom {
                    color: #000000;
                }
                .apexcharts-tooltip-custom div:first-child {
                    font-weight: bold;
                    margin-bottom: 4px;
                }
            `}
            </style>
        </div>

    )
}

export default BarGraph;