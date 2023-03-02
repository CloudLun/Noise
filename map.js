mapboxgl.accessToken =
  "pk.eyJ1IjoiY2xvdWRsdW4iLCJhIjoiY2xlOXBrdGQ5MHJ1bTN1bHVsdnpscGdybSJ9.yr6N9ahFlFll3rdrJZGHeA";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/cloudlun/clejmnw40000f01qjc77mmmwn",
  center: [-73.94, 40.782],
  zoom: 11.25,
});

const geojsons = [
  "./Data/Jan.geojson",
  "./Data/Feb.geojson",
  "./Data/Mar.geojson",
  "./Data/Apr.geojson",
  "./Data/May.geojson",
  "./Data/Jun.geojson",
  "./Data/Jul.geojson",
  "./Data/Aug.geojson",
  "./Data/Sep.geojson",
  "./Data/Oct.geojson",
  "./Data/Nov.geojson",
  "./Data/Dec.geojson",
];
const promises = [];
geojsons.forEach((url) => promises.push(d3.json(url)));

let transform = d3.geoTransform({ point: projectPoint });
let path = d3.geoPath().projection(transform);
let container = map.getCanvasContainer();
let mapSvg = d3
  .select(container)
  .append("svg")
  .attr("width", "100%")
  .attr("height", "100%")
  .style("position", "absolute")
  .style("z-index", 2);

let boroData;
let highestValue;
let lowestValue;
let averageValue;
let highestNTA = "Gravesend (East)-Homecrest";
let lowestNTA = "East Flushing";

Promise.all(promises).then((data) => {
  dataFilter(data[month]);
  mapGenerator(data[month]);
  monthSelection.addEventListener("change", (e) => {
    month = parseInt(e.target.value);
    if (boro === "All") {
      dataFilter(data[month]);
      mapGenerator(data[month]);
    } else {
      boroData = {
        ...data[month],
        features: data[month].features.filter(
          (d) => d.properties.BoroName === boro
        ),
      };
      dataFilter(boroData);
      mapGenerator(boroData);
    }
  });
  boroSelection.addEventListener("change", (e) => {
    boro = e.target.value;
    if (boro === "All") {
      dataFilter(data[month]);
      mapGenerator(data[month]);
    } else {
      boroData = {
        ...data[month],
        features: data[month].features.filter(
          (d) => d.properties.BoroName === boro
        ),
      };
      dataFilter(boroData);
      mapGenerator(boroData);
    }
  });
});

function projectPoint(lon, lat) {
  var point = map.project(new mapboxgl.LngLat(lon, lat));
  this.stream.point(point.x, point.y);
}

function mapGenerator(data) {
  mapSvg.selectAll("g").remove();
  let polygons = mapSvg
    .append("g")
    .attr("class", "polygons")
    .selectAll("censusTracts")
    .data(data.features)
    .enter()
    .append("path")
    .attr("fill", (d) => tractsColor(d.properties.noise_count))
    .attr("stroke", "#ffe9c1")
    // .attr("stroke-width", (d) =>
    //   d.properties["NTAName"] === highestNTA
    //     ? "3px"
    //     : d.properties["NTAName"] === lowestNTA
    //     ? "3px"
    //     : "0.5px"
    // )
    .attr("class", "polygon")
    .attr("opacity", "0.5")
    .on("mouseover", (e, d) => {
      content = `${d.properties.NTAName}<br/>${d.properties.noise_count} cases`;
      tooltip.html(content).style("visibility", "visible");
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("top", e.pageY - (tooltip.node().clientHeight + 5) + "px")
        .style("left", e.pageX - tooltip.node().clientWidth / 2.0 + "px");
    })
    .on("mouseout", (e, d) => {
      tooltip.style("visibility", "hidden");
    });

  function render() {
    polygons.attr("d", path);
  }
  render();
  map.on("viewreset", render);
  map.on("move", render);
  map.on("moveend", render);
}

function tractsColor(d) {
  return d > 20000000000
    ? "#D00000"
    : d > 10000000000
    ? "#DC2F02"
    : d > 5000000000
    ? "#E85D04"
    : d > 2500000000
    ? "#F48C06"
    : "#FFBA08";
}

function dataFilter(data) {
  let valueList = [];
  data.features.map((d) => valueList.push(d.properties.noise_count));
  highestValue = Math.max(...valueList);
  data.features.map((d) => valueList.push(d.properties.noise_count));
  lowestValue = Math.min(...valueList);
  data.features.map((d) => valueList.push(d.properties.noise_count));

  for (let i = 0; i < data.features.length; i++) {
    if (data.features[i].properties.noise_count === highestValue)
      highestNTA = data.features[i].properties["NTAName"];
    if (data.features[i].properties.noise_count === lowestValue)
      lowestNTA = data.features[i].properties["NTAName"];
  }

  let valueSum = valueList.reduce((a, b) => {
    return a + b;
  });
  averageValue = parseInt(valueSum / valueList.length);
  highestNum.innerHTML = highestValue;
  highestPlace.innerHTML = highestNTA;
  lowestNum.innerHTML = lowestValue;
  lowestPlace.innerHTML = lowestNTA;
  averageNum.innerHTML = averageValue;
}
