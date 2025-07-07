import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts"; 

import BarGraph from "./BarGraph";


const Compare = ({categories, series, }) => {
    const [cardsToColor, setCardsToColor] = useState({
        //exampleCard: exampleColor
    });
    
    const total = useMemo(() => {
        const newTotal = series.map((stream) => {
            return stream.data.reduce((acc, value) => acc + value, 0);
        })
        return newTotal;
    }, [series]);

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
            custom: function({series: seriesInput, seriesIndex, dataPointIndex}){
                const {name, data, dept, courseNumber} = series[seriesIndex];
                const value = data[dataPointIndex];
                const percentage = ((value / total[seriesIndex]) * 100).toFixed(2);
                return `
                    <div class = "apexcharts-tooltip-custom">
                        <h1><strong>${categories[dataPointIndex]}</strong></h1>
                        <div>${dept} ${courseNumber} ${name !== "info" ? name: ""} ${percentage}(${value}%)</div>
                    </div>
                `;
            }
        }
    };

    return (
        <>
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
            <div className = "header">
                header options
            </div>
            <div className = "graph bg-black">
                <Chart 
                    options = {options}
                    series = {series}
                    type = "bar"
                    height = {350}
                    className = "text-white"
                />
            </div>
            <div className = "info">
                info on comparison
                {/* map of comparison cards that are dependant on CARDS -> COURSE_PROFESORID */}
            </div>
        </>
    )
}

export default Compare;