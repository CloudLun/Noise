const monthSelection = document.querySelector("#month");
const boroSelection = document.querySelector("#boro");
const subtitleBoro = document.querySelector(".line_boro");
const subtitleMonth = document.querySelector(".line_month");
const highestNum = document.querySelector('#highest_num')
const lowestNum = document.querySelector('#lowest_num')
const averageNum = document.querySelector('#average_num')
const highestPlace = document.querySelector('.highest')
const lowestPlace = document.querySelector('.lowest')
const multiTitleMonth = document.querySelector('.title_month')

const lineChartMargin = {
  top: 10,
  right: 20,
  bottom: 10,
  left: 20,
};

const lineChart = document.querySelector("#lineChart");
const lineChartWidth =
  lineChart.clientWidth - lineChartMargin.right - lineChartMargin.left;
const lineChartHeight = lineChart.clientHeight / 1.5;
const lineChartSvg = d3
  .select("#lineChart")
  .append("svg")
  .attr("width", lineChartWidth)
  .attr("height", lineChartHeight);

const csvs = [
  "./Data/noise_hour_count_all.csv",
  "./Data/noise_hour_count_boro.csv",
];
const csvPromises = [];
csvs.forEach((csv) => csvPromises.push(d3.csv(csv)));

const monthList = [
  "January",
  "Febuary",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

let month = 0;
let boro = "All";
let filteredData;

let tooltip = d3.select("body").append("div").attr("class", "tooltip");

Promise.all(csvPromises).then((data) => {
  dataMonthFilter(data[0], month);
  lineChartGenerator(filteredData);
  monthSelection.addEventListener("change", (e) => {
    month = parseInt(e.target.value);
    if (boro === "All") {
      dataMonthFilter(data[0], month);
      lineChartGenerator(filteredData);
      subtitleMonth.innerText = monthList[month];
      multiTitleMonth.innerText = monthList[month]
    } else {
      dataMonthFilter(data[1], month);
      dataBoroFilter(filteredData, boro);
      lineChartGenerator(filteredData);
      subtitleMonth.innerText = monthList[month]
      multiTitleMonth.innerText = monthList[month]
    }
  });
  boroSelection.addEventListener("change", (e) => {
    boro = e.target.value;
    if (boro === "All") {
      dataMonthFilter(data[0], month);
      lineChartGenerator(filteredData);
      subtitleBoro.innerHTML = "All";
    } else {
      dataMonthFilter(data[1], month);
      dataBoroFilter(filteredData, boro);
      lineChartGenerator(filteredData);
      subtitleBoro.innerText = boro;
    }
  });
});

function lineChartGenerator(data) {
  lineChartSvg.selectAll("g").remove();
  let x = d3
    .scalePoint()
    .domain([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23,
    ])
    .range([lineChartMargin.left, lineChartWidth - lineChartMargin.right]);

  let y = d3
    .scaleLinear()
    .domain([500000000, 200000000000])
    .range([
      lineChartHeight - lineChartMargin.bottom - lineChartMargin.top,
      lineChartMargin.top,
    ]);

  let xAxis = d3.axisBottom(x).tickSize(-lineChartHeight);
  // .tickValues([0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22]);
  // .tickFormat((d) => d3.timeFormat("%H"));

  let yAxis = d3
    .axisLeft(y)
    .ticks(5)
    .tickSize(-lineChartWidth + lineChartMargin.right + lineChartMargin.left)
    .tickFormat((d) => d / 10000000000);

  lineChartSvg
    .append("g")
    .attr("class", "xAxis")
    .attr(
      "transform",
      `translate(0, ${
        lineChartHeight - lineChartMargin.bottom - lineChartMargin.top
      })`
    )
    .call(xAxis)
    .style("opacity", 0.35);

  lineChartSvg
    .append("g")
    .attr("class", "yAxis")
    .call(yAxis)
    .style("opacity", 0.35)
    .attr("transform", `translate(${lineChartMargin.left},0)`);

  let lineChartArea = lineChartSvg
    .append("g")
    .attr("class", "area")
    .append("path")
    .datum(data)
    .attr("fill", "#FFBA08")
    .attr("fill-opacity", 0.2)
    .attr("stroke", "none")
    .attr(
      "d",
      d3
        .area()
        // .curve(d3.curveBasis)
        .x((d) => x(+d.hour))
        .y0(y(0))
        .y1((d) => y(+d["noise_counts"]))
    );

  let lineChartPath = lineChartSvg
    .append("g")
    .attr("class", "path")
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#FFBA08")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        // .curve(d3.curveBasis)
        .x((d) => x(+d.hour))
        .y((d) => y(+d["noise_counts"]))
    );
}

function dataMonthFilter(data, month) {
  filteredData = data.filter((d) => parseInt(d.month) === month + 1);
}

function dataBoroFilter(data, boro) {
  filteredData = data.filter((d) => d.boro === boro);
}
