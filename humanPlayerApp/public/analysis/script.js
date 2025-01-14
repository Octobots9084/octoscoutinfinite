import {
  getGraphJSONConfig,
  getJSONOutput,
  quartiles,
  calculateMean,
} from "/util.js";
let graphConfig = await getGraphJSONConfig();
let JSONOutput = await getJSONOutput();
// Parse JSON strings in data
const parsedJSONOutput = JSONOutput.map((item) => {
  const parsedItem = { ...item };
  Object.keys(item).forEach((key) => {
    try {
      parsedItem[key] = JSON.parse(item[key]);
    } catch (error) {
      // Ignore if it's not a JSON string
    }
  });
  return parsedItem;
});

// Function to draw a graph to the screen
function drawGraph(dataPoints, meanPoints, chartName, yLabel, graphContainer) {
  let chartDiv = document.createElement("div");
  chartDiv.id = chartName;
  chartDiv.classList.add("chart");
  graphContainer.appendChild(chartDiv);

  // Defining the parameters for the graph
  let chartParameters = {
    title: {
      text: chartName,
    },
    axisY: {
      title: yLabel,
    },
    dataPointMaxWidth: 5,
    data: [
      {
        type: "boxAndWhisker",
        upperBoxColor: "#7BCE69",
        lowerBoxColor: "#FF5A4D",
        color: "black",
        yValueFormatString: "##.## " + yLabel,
        dataPoints: dataPoints,
      },
      {
        type: "scatter",
        markerColor: "black",
        markerSize: 5,
        toolTipContent: "Mean: {y}",
        dataPoints: meanPoints,
      },
    ],
    axisX: {
      interval: 1,
      labelAutoFit: false,
    },
  };

  // Drawing graph
  var chart = new CanvasJS.Chart(chartName, chartParameters);
  chart.render();
}

// Defining which graphs to create based on which configs

// Creating graphs under the overall category
let overallGraphs = graphConfig.Overall;
getDataAndCreateGraph(
  overallGraphs,
  document.getElementById("overallGraphContainer"),
  "Overall"
);

// Creating graphs under the teleop category
let teleopGraphs = graphConfig.Teleop;
getDataAndCreateGraph(
  teleopGraphs,
  document.getElementById("teleopGraphContainer"),
  "Teleop"
);

// Creating graphs under the auto category
let autoGraphs = graphConfig.Auto;
getDataAndCreateGraph(
  autoGraphs,
  document.getElementById("autoGraphContainer"),
  "Auto"
);

// Creating graphs under the endgame category
let endgameGraphs = graphConfig.Endgame;
getDataAndCreateGraph(
  endgameGraphs,
  document.getElementById("endgameGraphContainer"),
  "Endgame"
);

// Function to get data from the json file, and
function getDataAndCreateGraph(
  graphCategory,
  graphContainer,
  graphCategoryName
) {
  // Getting all teams in matches scouted
  let teams = [];
  parsedJSONOutput.filter((obj) => {
    const metaData = obj["01metaData"];
    if (!teams.includes(metaData.teamNumber)) {
      teams.push(metaData.teamNumber);
    }
  });

  // Creating a graph for each section under the category
  for (let k = 0; k < graphCategory.length; k++) {
    let dataPoints = [];
    let means = [];

    // Looping through each team
    for (let l = 0; l < teams.length; l++) {
      let values = [];
      // Getting matches of the team
      let matchesOfTeam = parsedJSONOutput.filter((obj) => {
        const metaData = obj["01metaData"];
        return metaData.teamNumber === teams[l];
      });

      // Computing the values for the metric for each match
      for (let i = 0; i < matchesOfTeam.length; i++) {
        let totalForMatch = 0;
        for (let j = 0; j < graphCategory[k].metrics.length; j++) {
          totalForMatch +=
            getValues(matchesOfTeam[i], graphCategory[k].metrics[j].path) *
            graphCategory[k].metrics[j].weight;
        }
        values.push(totalForMatch);
      }

      // Calculating quartiles and mean
      let quartilesValues = quartiles(values);
      let mean = calculateMean(values);
      means.push({ label: teams[l], y: mean });

      dataPoints.push({
        label: teams[l],
        y: [
          Math.min(...values),
          quartilesValues.Q1,
          quartilesValues.Q3,
          Math.max(...values),
          quartilesValues.Q2,
        ],
      });
    }

    // Combine dataPoints and means into one array of objects
    let combinedArray = dataPoints.map((dataPoint, index) => ({
      dataPoint,
      mean: means[index],
    }));

    // Sort the combined array by Q3 value (index 4) in dataPoint's y array
    combinedArray.sort((a, b) => {
      let q2A = a.dataPoint.y[2]; // Q3 value of a
      let q2B = b.dataPoint.y[2]; // Q3 value of b

      // If Q2 value is not present, fall back on mean
      if (isNaN(q2A)) {
        q2A = a.mean.y;
      }
      if (isNaN(q2B)) {
        q2B = b.mean.y;
      }

      return q2B - q2A;
    });

    // Extract sorted dataPoints and means arrays
    let sortedDataPoints = combinedArray.map((item) => item.dataPoint);
    let sortedMeans = combinedArray.map((item) => item.mean);

    // Drawing graph
    drawGraph(
      sortedDataPoints,
      sortedMeans,
      graphCategoryName + " " + graphConfig[graphCategoryName][k].graphName,
      graphCategory[k].units,
      graphContainer
    );
  }
}

// Function to retrieve value by JSON path
function getValues(JSON, path) {
  return jsonpath.query(JSON, path).length;
}
