import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Chart from "react-apexcharts"; 

import BarGraph from "./BarGraph";


const Compare = ({comparedCards}) => {
    const [cardsToColor, setCardsToColor] = useState({
        //exampleCard: exampleColor
    });
    const [categories, setCategories] = useState([]);
    const [series, setSeries] = useState([]);
    const [existingNames, setExistingNames] = useState(new Set());

    useEffect(() => {
        const populateGraphData = (comparedCards) => {
            for(const card of comparedCards){
                const course = card.split("_")[1];
                const dept = course.slice(0,4);
                const courseNumber = course.slice(4);
                const professorId = card.split("_")[0];
                const optionsUrl = `/server/api/courses/graph?department=${dept}&courseNumber=${courseNumber}&professorID=${professorId}`;
                // console.log(optionsUrl);
                const options = {
                    method: "GET",
                    url: optionsUrl
                };

                axios(options)
                    .then((response) => {
                        const data = response.data;
                        const categories = data.map((item => item[0]));
                        setCategories(categories);
                        const newSeriesData = data.map((item => item[1]));
                        if(!existingNames.has(professorId)){
                            setSeries([
                                ...series,
                                {
                                    name: professorId,
                                    data: newSeriesData
                                }
                            ]);
                            const newSet = new Set(existingNames);
                            newSet.add(professorId);
                            setExistingNames(newSet);
                        }
                    })
                    .catch((error) => {
                        console.error("error: ", error);
                    });
            }
            
        }
        populateGraphData(comparedCards);
    }, [comparedCards]);
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
            custom: function({series, seriesIndex, dataPointIndex}){
                const value = series[seriesIndex][dataPointIndex];
                const percentage = ((value / total[seriesIndex]) * 100).toFixed(2);
                return `
                    <div class = "apexcharts-tooltip-custom">
                        <h1><strong>${series[seriesIndex][0]}</strong></h1>
                        <div>${dept} ${number} ${professorName !== "info" ? professorName: ""} ${value}(${percentage}%)</div>
                    </div>
                `;
            }
        }
    };

    return (
        <>
            <div className = "header">
                header options
            </div>
            <div className = "graph">
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
            <div className = "info">
                info on comparison
            </div>
        </>
    )
}

export default Compare;