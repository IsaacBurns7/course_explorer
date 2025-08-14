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
    const allSeries = filteredGraphArray.map(series => ({
        ...series,
        data: series.data.map(([x,y]) => y)
    }));
    // console.log("Original graph data keys: ", Object.keys(graphData));
    // console.log("Filtered graph entries: ", filteredGraphEntries);
    // console.log("Filtered graph Array: ", filteredGraphArray);
    // console.log(allSeries);

    const total = filteredGraphArray.map((stream) => {
        const totalGradesIndex = 1;
        return stream.data.reduce((acc, grades) => acc + grades[totalGradesIndex], 0); 
    });

    const numCards = comparedCards.length+1;

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
                // const cardKey = w.config.series[seriesIndex].name;
                // console.log(series, cardKey, series[cardKey]);
                const seriesData = allSeries[seriesIndex];
                if (!seriesData) {
                    return "Data not available";
                }
                const {data} = seriesData; 
                const name = seriesData.name;
                const value = data[dataPointIndex];
                const percentage = ((value / total[seriesIndex]) * 100).toFixed(2);
                return `
                    <div class = "apexcharts-tooltip-custom">
                        <h1><strong>${categories[dataPointIndex]}</strong></h1>
                        <div>${name !== "info" ? name : ""} ${value}(${percentage}%)</div>
                    </div>
                `;
            }
        }
    };
    console.log(professors);

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
                {/* {allSeries && allSeries.length > 0 && allSeries[0].data && allSeries[0].data.length > 0 &&  */}
                <Chart 
                    options = {options}
                    series = {allSeries}
                    type = "bar"
                    height = {350}
                    className = "text-white"
                />
            </div>
            {/* <div className = "info grid grid-cols-12 grid-rows-[repeat(7,minmax(3em,auto))] gap-1">
                <div className = {`grid grid-rows-7 gap-1 justify-start col-span-${12 / numCards}`}>
                    <div className = "text-left text-base">Compare</div>
                    <button className = "text-left text-base">^ Rating</button>
                    <button className = "text-left text-base">^ GPA</button>
                    <button className = "text-left text-base">^ Would Take Again</button>
                    <button className = "text-left text-base">^ Difficulty</button>
                    <button className = "text-left text-base">^ # of Grades / Ratings</button>
                    <button className = "text-left text-base">^ Color</button>
                </div>
                {comparedCards.map((card) => {
                        const comparedProfessorId = card.split("_")[1];
                        const comparedProfessor = professors[comparedProfessorId] || {};
                        const infoObj = comparedProfessor.info || {};
                        // console.log(professors, card, comparedProfessorId, comparedProfessor, infoObj)
                        const {averageGPA, averageRating, name, totalRatings, totalSections, totalStudents} = infoObj;
                        return <div 
                            className = {`comparison_card_container gap-1 grid grid-rows-7 col-span-${12 / numCards}`}
                            key = {`${comparedProfessorId}`} //mayhaps add dept and coursenumber later for supporting multiple courses
                        >
                            <div className = "text-base">{name}</div>
                            <div className = "text-base">{averageRating}</div>
                            <div className = "text-base">{averageGPA}</div>
                            <div className = "text-base">{totalSections}</div>
                            <div className = "text-base">{totalStudents} / {totalRatings}</div>
                            <div className = "text-base">color!</div>
                        </div>;
                    })}
            </div> */}
            <table className = "text-base text-white w-full border-collapse text-left">
                <thead className = "p-3">
                    <tr>
                        <th>Compare</th>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const name = comparedProfessor.info?.name || "placeholder";
                            return (<th key = {comparedProfessorId} className = "">
                                {name}
                            </th>);
                        })}
                    </tr>
                </thead>
                <tbody>
                    <tr className = "p-3">
                        <td>GPA</td>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const GPA = comparedProfessor.info?.averageGPA || "placeholder";
                            return (<td key = {comparedProfessorId} className = "">
                                {GPA}
                            </td>);
                        })}
                    </tr>
                    <tr>
                        <td>Rating</td>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const rating = comparedProfessor.info?.averageRating || "placeholder";
                            return (<td key = {comparedProfessorId} className = "">
                                {rating}
                            </td>);
                        })}
                    </tr>
                    <tr>
                        <td>WouldTakeAgain</td>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const WouldTakeAgain = comparedProfessor.info?.wouldTakeAgain || "placeholder";
                            return (<td key = {comparedProfessorId} className = "">
                                {WouldTakeAgain}%
                            </td>);
                        })}
                    </tr>
                    <tr>
                        <td>Difficulty</td>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const difficulty = comparedProfessor.info?.difficulty || "placeholder";
                            return (<td key = {comparedProfessorId} className = "">
                                {difficulty}
                            </td>);
                        })}
                    </tr>
                    <tr>
                        <td># of grades / ratings</td>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const numStudents = comparedProfessor.info?.totalStudents || "placeholder";
                            const numRatings = comparedProfessor.info?.totalRatings || "placeholder";
                            return (<td key = {comparedProfessorId} className = "">
                                {numStudents} / {numRatings}
                            </td>);
                        })}
                    </tr>
                    <tr>
                        <td>Color</td>
                        {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            // const color = professorIdToColor ? professorIdToColor[comparedProfessorId] : "placeholder";
                            return (<td key = {comparedProfessorId} className = "">
                                {/* {color}*/}
                                placeholder
                            </td>);
                        })}
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default Compare;