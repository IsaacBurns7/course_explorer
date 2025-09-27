//this will probably use a courses context, 
//and then use the specific professor name to find matching sections
//then, total all the sections to find relevant data

//in courses, find course with courseId
//for that course, find professors with professorId
import { useEffect, useState, useMemo, useContext } from "react";
import Chart from "react-apexcharts"; 
import axios from "axios";
import { SearchContext } from "../context/search";

function BarGraph({graphKey}){
    const { graphData } = useContext(SearchContext);
    const graphInfo = graphData[graphKey] || {};
    // console.log(graphKey, graphData);
    /*
    data = {graphData[graphKey]} professorName = {name} department = {department} courseNumber = {courseNumber}
    */
    const { 
        data = [],
        meta = {},
        name = "DEPT 123 Name"
    } = graphInfo;
    const {
        professorId = "123456",
        department = "DEPT",
        courseNumber = "123"
    } = meta;

    const colorGradient = [
        '#2ecc71', // A - Green
        '#3498db', // B - Blue
        '#9b59b6', // C - Purple
        '#f1c40f', // D - Yellow
        '#e74c3c', // F - Red
        '#95a5a6', // I - Gray
        '#34495e', // S - Dark blue
        '#7f8c8d', // U - Dark gray
        '#d35400', // Q - Orange
        '#1abc9c'  // X - Teal
    ];
    const categories = data.map((item => item[0]));
    const seriesData = data.map((item => item[1]));
    const total = useMemo(() => {
        return seriesData.reduce((sum, value) => sum + value, 0);
    }, [seriesData]);
    const options = {
        chart: {
            type: 'bar',
            toolbar: {
                show: true
            }
        },
        dataLabels: {
            enabled: true,
            formatter: function(val) {
                return val;
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: ["#628baaff"]
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
            },
            axisBorder: {
                show: true
            },
            axisTicks: {
                show: true
            }
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            title: {
                text: "Frequency",
                style: {
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "bold"
                }
            },
            labels: {
                formatter: function(val){
                    return val;
                },
                style: { 
                    colors: "#ffffff"
                }
            }
        },
        colors: colorGradient,
        plotOptions: {
            bar: {
                distributed: true,
                borderRadius: 4,
                columnWidth: '70%',
                dataLabels: {
                    position: "top"
                }
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
                        <h1><strong>${categories[dataPointIndex]}</strong></h1>
                        <div>${name} ${value}(${percentage}%)</div>
                    </div>
                `;
            }
        },
        grid: {
            row: {
                colors: ['#030303', 'transparent'],
                opacity: 0.5
            }
        },
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