import { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import Chart from "react-apexcharts"; 

import BarGraph from "./BarGraph";
import { SearchContext } from "../context/search";


const Compare = () => {
    const { graphData, professors, categories, comparedCards } = useContext(SearchContext); //do I need professors
    
    const comparedCardsSet = new Set(comparedCards);
    const filteredGraphEntries = Object.entries(graphData).filter(([graphKey]) => {
        return comparedCardsSet.has(graphKey);
    });
    const filteredGraphArray = filteredGraphEntries.map(([, graphObj]) => graphObj);
    // console.log("Original graph data keys: ", Object.keys(graphData));
    // console.log("Filtered graph entries: ", filteredGraphEntries);
    // console.log("Filtered graph Array: ", filteredGraphArray);


    const total = filteredGraphArray.map((stream) => {
        const totalGradesIndex = 1;
        return stream.data.reduce((acc, grades) => acc + grades[totalGradesIndex], 0); 
    });
    console.log(total);

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
            custom: function({series: seriesInput, seriesIndex, dataPointIndex, w}){
                //find a way to give this tooltip the courseNumber and dept
                // const cardKey = w.config.series[seriesIndex].name;
                // // console.log(series, cardKey, series[cardKey]);
                // const seriesData = series.get(cardKey);
                // if (!seriesData) {
                //     console.error("No data found for key:", cardKey);
                //     console.log("Available keys:", Array.from(series.keys())); // Debug: show all keys
                //     return "Data not available";
                // }
                // const {data} = seriesData; 
                // const courseId = cardKey.split("_")[0];
                // const dept = courseId.slice(0,4);
                // const courseNumber = courseId.slice(4);
                // const professorId = cardKey.split("_")[1];
                // const name = professorsInfo[seriesIndex] ? professorsInfo[seriesIndex].name : professorId;
                // const value = data[dataPointIndex];
                // const percentage = ((value / total[seriesIndex]) * 100).toFixed(2);
                // return `
                //     <div class = "apexcharts-tooltip-custom">
                //         <h1><strong>${categories[dataPointIndex]}</strong></h1>
                //         <div>${dept} ${courseNumber} ${name !== "info" ? name : ""} ${percentage}(${value}%)</div>
                //     </div>
                // `;
            }
        }
    };
    // const num_cards = professorsInfo.length + 1;

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
                    series = {Array.from(filteredGraphArray)}
                    type = "bar"
                    height = {350}
                    className = "text-white"
                />
            </div>
            <div className = "info grid grid-cols-12">
                {/* <div className = {`grid grid-rows-7 gap-1 justify-start col-span-${12 / num_cards}`}>
                    <div className = "text-left text-base">Compare</div>
                    <button className = "text-left text-base">^ Rating</button>
                    <button className = "text-left text-base">^ GPA</button>
                    <button className = "text-left text-base">^ Would Take Again</button>
                    <button className = "text-left text-base">^ Difficulty</button>
                    <button className = "text-left text-base">^ # of Grades / Ratings</button>
                    <button className = "text-left text-base">^ Color</button>
                </div> */}
                {/* {professors.map((infoObject) => {
                        const {averageGPA, averageRating, name, totalRatings, totalSections, totalStudents, department, courseNumber, professorId} = infoObject;
                        return <div 
                            className = {`comparison_card_container gap-1 grid grid-rows-7 col-span-${12 / num_cards}`}
                            key = {`${department} ${courseNumber} ${professorId}`}
                        >
                            <div className = "text-base">{name}</div>
                            <div className = "text-base">{averageRating}</div>
                            <div className = "text-base">{averageGPA}</div>
                            <div className = "text-base">{totalSections}</div>
                            <div className = "text-base">{totalStudents} / {totalRatings}</div>
                            <div className = "text-base">color!</div>
                        </div>;
                    })} */}
            </div>
        </>
    )
}

export default Compare;