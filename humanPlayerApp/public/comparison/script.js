import {
  getGraphJSONConfig,
  getJSONOutput,
  quartiles,
  calculateMean,
} from "/util.js";
let graphConfig = await getGraphJSONConfig();
graphConfig.Comparison.reverse();
let JSONOutput = await getJSONOutput();
let blueTeamInputContainer = document.getElementById("blueTeamInputContainer");
let redTeamInputContainer = document.getElementById("redTeamInputContainer");
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
function drawGraph(graphConfigs, chartName, graphContainer) {
  let chartDiv = document.createElement("div");
  chartDiv.id = chartName;
  chartDiv.classList.add("chart");
  graphContainer.appendChild(chartDiv);
  // Defining the parameters for the graph
  let chartParameters = {
    title: {
      text: chartName,
    },
    dataPointMaxWidth: 20,
    data: graphConfigs,
    axisX: {
      interval: 1,
      labelAutoFit: false,
    },
  };
  // Drawing graph
  var chart = new CanvasJS.Chart(chartName, chartParameters);
  chart.render();
}

function updateGraph() {
  let graphContainer = document.getElementById("graphContainer");
  graphContainer.innerHTML = "";
  // Creating graph
  let comparisonGraphs = graphConfig.Comparison;
  getDataAndCreateGraph(comparisonGraphs, graphContainer, "Comparison");
}

// Function to get data from the json file, and
function getDataAndCreateGraph(
  graphCategory,
  graphContainer,
  graphCategoryName
) {
  let blueTeams = getBlueTeams();
  let redTeams = getRedTeams();

  let graphConfigs = getGraphConfigForTeams(
    blueTeams,
    graphCategory,
    graphCategoryName,
    true
  );

  graphConfigs.push.apply(
    graphConfigs,
    getGraphConfigForTeams(redTeams, graphCategory, graphCategoryName, false)
  );

  // Drawing graph
  drawGraph(graphConfigs, graphCategoryName, graphContainer);
}

function getGraphConfigForTeams(
  teams,
  graphCategory,
  graphCategoryName,
  teamIsBlue
) {
  let graphConfigs = [];
  let maxColorIteratorValue = 255;
  let iteratorColorStartingValue = 100;
  let colorIterator = iteratorColorStartingValue;

  // Looping through each team
  for (let l = 0; l < teams.length; l++) {
    let dataPoints = [];
    // Creating a graph for each section under the category
    for (let k = 0; k < graphCategory.length; k++) {
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
      dataPoints.push({
        label: graphConfig[graphCategoryName][k].graphName,
        y: quartilesValues.Q3,
      });
    }
    let color;
    if (teamIsBlue) {
      colorIterator +=
        (maxColorIteratorValue - iteratorColorStartingValue) / teams.length;
      color =
        "rgb(" +
        [
          0,
          (colorIterator - iteratorColorStartingValue) / 2,
          colorIterator,
        ].join(",") +
        ")";
    } else {
      colorIterator +=
        (maxColorIteratorValue - iteratorColorStartingValue) / teams.length;
      color =
        "rgb(" +
        [
          colorIterator,
          (colorIterator - iteratorColorStartingValue) / 2,
          0,
        ].join(",") +
        ")";
    }
    graphConfigs.push({
      type: "stackedBar100",
      showInLegend: true,
      name: teams[l],
      color: color,
      dataPoints: dataPoints,
    });
  }
  return graphConfigs;
}

// Function to retrieve value by JSON path
function getValues(JSON, path) {
  return jsonpath.query(JSON, path).length;
}

document.addBlueTeam = addBlueTeam;
document.addRedTeam = addRedTeam;

function addBlueTeam() {
  let blueTeamInput = document.createElement("input");
  blueTeamInput.addEventListener("input", function () {
    updateGraph();
  });
  blueTeamInput.classList.add("addTeamInput");
  blueTeamInputContainer.appendChild(blueTeamInput);
}

function getBlueTeams() {
  let blueTeams = [];
  let children = blueTeamInputContainer.children;
  for (let i = 0; i < children.length; i++) {
    blueTeams.push(children[i].value);
  }

  return blueTeams;
}

function addRedTeam() {
  let redTeamInput = document.createElement("input");
  redTeamInput.addEventListener("input", function () {
    updateGraph();
  });
  redTeamInput.classList.add("addTeamInput");
  redTeamInputContainer.appendChild(redTeamInput);
}

function getRedTeams() {
  let redTeams = [];
  let children = redTeamInputContainer.children;
  for (let i = 0; i < children.length; i++) {
    redTeams.push(children[i].value);
  }

  return redTeams;
}

updateGraph();
