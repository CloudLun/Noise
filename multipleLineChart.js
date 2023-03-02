const multiLineChart = document.querySelector(".multi_chart");

const multiLineChartWidth = multiLineChart.clientWidth;
const multiLineChartHeight = multiLineChart.clientHeight * 0.8;

const multiLineChartManhattan = d3
  .select("#ManhattanType")
  .append("svg")
  .attr("width", multiLineChartWidth)
  .attr("height", multiLineChartHeight);
const multiLineChartBrooklyn = d3
  .select("#Brooklyn")
  .append("svg")
  .attr("width", multiLineChartWidth)
  .attr("height", multiLineChartHeight);
const multiLineChartQueens = d3
  .select("#Queens")
  .append("svg")
  .attr("width", multiLineChartWidth)
  .attr("height", multiLineChartHeight);
const multiLineChartBronx = d3
  .select("#Bronx")
  .append("svg")
  .attr("width", multiLineChartWidth)
  .attr("height", multiLineChartHeight);

const typeCsvs = [
  "./Data/type/top_noise_type_manhattan.csv",
  "./Data/type/top_noise_type_brooklyn.csv",
  "./Data/type/top_noise_type_queens.csv",
  "./Data/type/top_noise_type_bronx.csv",
];

const typePromises = [];
typeCsvs.forEach((csv) => typePromises.push(d3.csv(csv)));

let mData;
let bData;
let qData;
let xData;

Promise.all(typePromises).then((data) => {
  mData = data[0].filter((d) => parseInt(d.month) === month + 1);
  bData = data[1].filter((d) => parseInt(d.month) === month + 1);
  qData = data[2].filter((d) => parseInt(d.month) === month + 1);
  xData = data[3].filter((d) => parseInt(d.month) === month + 1);
  multiLineChartCreator(multiLineChartManhattan, mData);
  multiLineChartCreator(multiLineChartBrooklyn, bData);
  multiLineChartCreator(multiLineChartQueens, qData);
  multiLineChartCreator(multiLineChartBronx, xData);
  monthSelection.addEventListener("change", (e) => {
    month = parseInt(e.target.value);
    mData = data[0].filter((d) => parseInt(d.month) === month + 1);
    bData = data[1].filter((d) => parseInt(d.month) === month + 1);
    qData = data[2].filter((d) => parseInt(d.month) === month + 1);
    xData = data[3].filter((d) => parseInt(d.month) === month + 1);
    multiLineChartCreator(multiLineChartManhattan, mData);
    multiLineChartCreator(multiLineChartBrooklyn, bData);
    multiLineChartCreator(multiLineChartQueens, qData);
    multiLineChartCreator(multiLineChartBronx, xData);
  });
});

function multiLineChartCreator(svg, data) {
  svg.selectAll("g").remove();
  let nestType = d3.group(data, (d) => d["complaint_type"]);

  let x = d3
    .scalePoint()
    .domain(data.map((d) => +d.hour))
    .range([40, multiLineChartWidth - 40]);
  let y = d3
    .scaleLinear()
    .domain([0, 1000])
    .range([multiLineChartHeight - 24, 80]);

  let xAxis = d3.axisBottom(x);
  let yAxis = d3.axisLeft(y).ticks(5);

  svg
    .append("g")
    .attr("class", "xAxis")
    .attr("transform", `translate(0, ${multiLineChartHeight - 24})`)
    .call(xAxis)
    .style("opacity", 1);

  svg
    .append("g")
    .attr("class", "yAxis")
    .call(yAxis)
    .style("opacity", 1)
    .attr("transform", `translate(${40},0)`);

  let noiseTypeColor = d3
    .scaleOrdinal()
    .range(["#f45b69", "#06a77d", "#00a8e8" , "#FFEA00"]);

  svg
    .append('g')
    .selectAll("line")
    .data(nestType)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", (d) => noiseTypeColor(d[0]))
    .attr("stroke-width", 1.5)
    .attr("d", function (d) {
      return d3
        .line()
        .x(function (d) {
          return x(+d.hour);
        })
        .y(function (d) {
          return y(+d["noise_count"]);
        })(d[1]);
    });
}
