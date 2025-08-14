import { useState, useContext, useMemo} from "react";
import ReactApexChart from "react-apexcharts";
import { SearchContext } from "../context/search";

const LineGraph = ({lineGraphKey, semesters}) => {
    const { lineGraphData } = useContext(SearchContext);
    const lineGraphInfo = lineGraphData[lineGraphKey] || {};

    const { 
        data = [],
        meta = {},
        name = "DEPT 123 Name"
    } = lineGraphInfo;
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
        name: "Desktops",
        data: [10, 41, 35, 51, 49, 62, 69, 91, 148]
    }];

    const options = {
        chart: {
            height: 350,
            type: 'line',
            zoom: {
                enabled: false
            }
        },
        dataLabels: {
            enabled: false
        },
        stroke: {
            curve: 'straight'
        },
        title: {
            text: 'Product Trends by Month',
            align: 'left'
        },
        grid: {
            row: {
                colors: ['#000000ff', 'transparent'], // takes an array which will be repeated on columns
                opacity: 0.5
            },
        },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
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