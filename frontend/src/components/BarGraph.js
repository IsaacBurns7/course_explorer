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
            title: {
                text: "frequency",
                style: {
                    color: "#ffffff",
                    fontSize: "14px",
                    fontWeight: "bold"
                }
            },
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
                        <h1><strong>${categories[dataPointIndex]}</strong></h1>
                        <div>${name} ${value}(${percentage}%)</div>
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