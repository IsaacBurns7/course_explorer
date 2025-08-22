import { useState, useContext, useMemo} from "react";
import ReactApexChart from "react-apexcharts";
import { SearchContext } from "../context/search";

const LineGraph = ({lineGraphKey}) => {
    const { lineGraphData, semesters } = useContext(SearchContext);
    const lineGraphInfo = lineGraphData[lineGraphKey] || {};



    const { 
        data = [],
        meta = {},
        name = "DEPT 123 Name"
    } = lineGraphInfo;

    const processedData = data.map((GPA) => GPA === 0 ? null : GPA)

    const {
        professorId = "123456",
        department = "DEPT",
        courseNumber = "123"
    } = meta;

    const categories = semesters;
    const seriesData = data.map((item => item[1]));
    const total = useMemo(() => {
        return seriesData.reduce((sum, value) => sum + value, 0);
    }, [seriesData]);
    const series = [{
        name: "GPABySemester",
        data: processedData,
    }];
    // console.log(processedData);
    

    const options = {
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
                        <div>${name}: ${value}</div>
                    </div>
                `;
            }
        }
    };

    

    return (
        <div>
        <div id="chart">
            <ReactApexChart options={options} series={series} type="line" height={350} />
            </div>
        <div id="html-dist"></div>
        </div>
    );
}

export default LineGraph;