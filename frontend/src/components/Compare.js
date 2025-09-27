import { useState, useEffect, useMemo, useContext } from "react";
import axios from "axios";
import Chart from "react-apexcharts"; 

import BarGraph from "./BarGraph";
import { SearchContext } from "../context/search";
import { random } from "gsap";
import { color } from "framer-motion";


const Compare = () => {
    const { graphData, professors, categories, comparedCards, lineGraphData, semesters } = useContext(SearchContext); //do I need professors
    
    const [barGraph, setBarGraph] = useState(true);
    const [lineGraph, setLineGraph] = useState(false);
    const [colorMap, setColorMap] = useState(new Map());
    const [colors, setColors] = useState([]);

    const comparedCardsSet = new Set(comparedCards);
    const filteredGraphEntries = Object.entries(graphData).filter(([graphKey]) => {
        return comparedCardsSet.has(graphKey);
    });
    const filteredGraphArray = filteredGraphEntries.map(([, graphObj]) => graphObj);
    const totals = (filteredGraphArray ?? []).map(series => {
        return (series?.data).reduce((sum, [category,frequency]) => sum + frequency, 0);
    });

    let barGraphSeries = (filteredGraphArray ?? []).map((series, seriesIndex) => {
        // console.log("looping on series: ", series);
        return {
            ...series,
            meta: series?.meta ?? {},
            name: series?.name ?? "Unnamed",
            data: (series.data ?? []).map(([category,frequency]) => 100 * (frequency / totals[seriesIndex])) //if series.data is null, apexcharts will try to read length and error the program
        }
    });

    if(barGraphSeries.length === 0){
        barGraphSeries = [
            {
                name: "",
                data: [],
                meta: {}
            }
        ]
    }

    function randomHexColor() {
        return "#" + Math.floor(Math.random()*16777215).toString(16).padStart(6, "0");
    }

     /*
        maintain color map for comparedCard -> color.
        when add, add to color map and add directly to series.
        when delete, delete from color map and delete directly from related series
    */

    if(comparedCards.length > colorMap.keys().length){
        console.log(comparedCards, barGraphSeries);

        const newRandomColor = randomHexColor();
        const recentlyAddedComparedCard = comparedCards[comparedCards.length-1];
        const graphIndex = barGraphSeries.findIndex(series => {
            const meta = series.meta;
            const seriesKey = meta.department + meta.courseNumber + "_" + meta.professorId;
            return seriesKey === recentlyAddedComparedCard;
        });
        barGraphSeries[graphIndex].color = newRandomColor;
        setColorMap(prevMap => {
            const newMap = new Map(prevMap);
            newMap.set(recentlyAddedComparedCard, newRandomColor);
            return newMap;
        })  
    }else if(comparedCards.length < colorMap.keys().length){

    }

    // if(comparedCards.length > colors.length){
    //     //find new color
    //     const newRandomColor = randomHexColor();
    //     const recentlyAddedComparedCard = comparedCards[comparedCards.length-1];
    //     // console.log(comparedCards, recentlyAddedComparedCard, colorMap);
    //     setColors(colors => [...colors, newRandomColor]);
    //     setColorMap(prevMap => {
    //         const newMap = new Map(prevMap);
    //         newMap.set(recentlyAddedComparedCard, newRandomColor);
    //         return newMap;
    //     })   
    // }else if(comparedCards.length < colors.length){
    //    //find missing color
    //     const recentlyRemovedComparedCard = [...colorMap.keys()]
    //         .filter((key) => {
    //             return !comparedCards.includes(key);
    //         }
    //     ).join();
    //     console.log(colorMap, comparedCards, recentlyRemovedComparedCard);
    //     setColors(colors => {
    //         const recentlyRemovedColor = colorMap.get(recentlyRemovedComparedCard);
    //         // console.log(colorMap, recentlyRemovedComparedCard, colors, recentlyRemovedColor);
    //         const removedColorIndex = colors.indexOf(recentlyRemovedColor);
    //         // console.log(removedColorIndex);
    //         const newColors = [
    //             ...colors.slice(0,removedColorIndex-1),
    //             ...colors.slice(removedColorIndex)
    //         ];
    //         return newColors;
    //     });
    //     setColorMap(prevMap => {
    //         const newMap = new Map(prevMap);
    //         newMap.delete(recentlyRemovedComparedCard);
    //         return newMap;
    //     })
    // }
    // console.log(colors);
    
    
    // console.log("Original graph data keys: ", Object.keys(filteredGraphEntries));
    // console.log("Filtered graph entries: ", filteredGraphEntries);
    // console.log("Filtered graph Array: ", filteredGraphArray);
    // console.log(allSeries);

    const total = filteredGraphArray.map((stream) => {
        const totalGradesIndex = 1;
        return stream.data.reduce((acc, grades) => acc + grades[totalGradesIndex], 0); 
    });

    const barGraphOptions = {
        chart: {
            id: 'basic-bar',
            toolbar: {
                show: true
            }
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    position: "top"
                }
            }
        },
        dataLabels: {
            formatter: function(val){
                // return val.toFixed(2) + "%";
                return "";
            },
            enabled: true,
            style: {
                fontSize: "12px",
                colors: ["#fff"]
            },
            offsetY: -20,
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
            min: 0,
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
                    return val.toFixed(2) + "%";
                },
                style: { 
                    colors: "#ffffff"
                }
            }
        },
        colors: colors,
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
                const seriesData = barGraphSeries[seriesIndex];
                if (!seriesData) {
                    return "Data not available";
                }
                const {data} = seriesData; 
                const name = seriesData.name;
                const percentage = data[dataPointIndex];
                // const percentage = ((value / total[seriesIndex]) * 100).toFixed(2);
                return `
                    <div class = "apexcharts-tooltip-custom">
                        <h1><strong>${categories[dataPointIndex]}</strong></h1>
                        <div>${name !== "info" ? name : ""} ${percentage.toFixed(2)}%</div>
                    </div>
                `;
            }
        }
    };

    const filteredLineGraphEntries = Object.entries(lineGraphData).filter(([graphKey]) => {
        return comparedCardsSet.has(graphKey);
    });
    const filteredLineGraphSeries = filteredLineGraphEntries.map(([, graphObj]) => graphObj);
    // con    
    const lineGraphSeries = filteredLineGraphSeries.map((series) => {
        const filteredData = series.data.map((GPA) => GPA === 0 ? null : GPA) 
        return {
            ...series,
            data: filteredData,
        };
    });

    const lineGraphOptions = {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            },
            tooltip: {
                show: true
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 5,
            hover: { size: 7 },
            formatter: (val, { seriesIndex, dataPointIndex }) => {
                return series[seriesIndex].data[dataPointIndex] == 0 ? null : val;
            }
        },
        stroke: {
            curve: 'straight',
            width: 2,
            dashArray: (seriesIndex, dataPointIndex) => {
                return series[seriesIndex].data[dataPointIndex] == 0 ? [0,0] : undefined;
            }
        },
        // title: {
        //     text: 'Product Trends by Month',
        //     align: 'left'
        // },
        xaxis: {
            categories: semesters,
            labels: {
                style: {
                    colors: "#ffffff",
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serf"
                }
            }
        },
        yaxis: {
            min: 0,
            forceNiceScale: true,
            title: {
                text: "GPA",
                style: {
                    fontSize: "18px",
                    fontWeight: "bold",
                    color: "#ffffff"
                }
            },
            labels: {
                formatter: function(val){
                    return val === null ? "" : val.toFixed(2);
                },
                style: { 
                    colors: "#ffffff"
                }
            },
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
                if(!value || value === 0) return "";
                return `
                    <div class = "apexcharts-tooltip-custom">
                        <h1><strong>${semesters[dataPointIndex]}</strong></h1>
                        <div>${lineGraphSeries[seriesIndex].name}: ${value}</div>
                    </div>
                `;
            }
        }
    };

    // console.log(lineGraphSeries, barGraphSeries);

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
            <div className = "chart-wrapper bg-black flex items-center">
                <div className = "chart-container flex-1">
                    {barGraph && 
                    <Chart 
                        type = "bar"
                        options = {barGraphOptions}
                        series = {barGraphSeries}
                        height = {350}
                    />}
                    {lineGraph && <Chart 
                        type = "line"
                        options = {lineGraphOptions}
                        series = {lineGraphSeries}
                        height = {350}
                    />}
                </div>
                <div className = "chart-toggle flex flex-col gap-1">
                    <button onClick = {() => {
                        setBarGraph(true);
                        setLineGraph(false);
                    }}
                        className = "px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded border border-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="24" height="24">
                            <rect x="4" y="10" width="3" height="10"/>
                            <rect x="10" y="6" width="3" height="14"/>
                            <rect x="16" y="13" width="3" height="7"/>
                        </svg>
                    </button>
                    <button onClick = {() => {
                        setBarGraph(false);
                        setLineGraph(true);
                    }}
                        className = "px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded border border-gray-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="24" height="24">
                            <polyline points="4 14 8 10 13 15 20 8"/>
                            <circle cx="4" cy="14" r="1.5"/>
                            <circle cx="8" cy="10" r="1.5"/>
                            <circle cx="13" cy="15" r="1.5"/>
                            <circle cx="20" cy="8" r="1.5"/>
                        </svg>
                    </button>
                </div>
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
                        <th>GPA</th>
                        <th>Rating</th>
                        <th>WouldTakeAgain</th>
                        <th>Difficulty</th>
                        <th>ratings / students</th>
                        <th>Color</th>
                    </tr>
                </thead>
                <tbody>
                    {comparedCards.map((card) => {
                            const comparedProfessorId = card.split("_")[1];
                            const comparedProfessor = professors[comparedProfessorId] || {}; 
                            const name = comparedProfessor.info?.name || "placeholder";
                            const GPA = comparedProfessor.info?.averageGPA || "placeholder";
                            const Rating = comparedProfessor.info?.averageRating || "placeholder";
                            const WouldTakeAgain = comparedProfessor.info?.wouldTakeAgain || "placeholder";
                            const difficulty = comparedProfessor.info?.difficulty || "placeholder";
                            const numStudents = comparedProfessor.info?.totalStudents || "placeholder";
                            const numRatings = comparedProfessor.info?.totalRatings || "placeholder";
                            
                            return (<tr key = {comparedProfessorId} className = "">
                                <td>{name}</td>
                                <td>{GPA}</td>
                                <td>{Rating}</td>
                                <td>{WouldTakeAgain}</td>
                                <td>{difficulty}</td>
                                <td>{numRatings} / {numStudents}</td>
                            </tr>);
                        })}
                </tbody>
            </table>
        </>
    )
}

export default Compare;