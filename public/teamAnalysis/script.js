import { getGraphJSONConfig, getJSONOutput } from "/util.js";
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

let queryString = window.location.search;

let urlParams = new URLSearchParams(queryString);
let teamNumber = urlParams.get("team");
if (teamNumber == undefined) {
  teamNumber = 0;
}

// Function to draw a graph to the screen
function drawGraph(dataPoints, chartName, yLabel, graphContainer) {
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
        type: "spline",
        markerColor: "black",
        markerSize: 5,
        dataPoints: dataPoints,
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

function drawGraphs() {
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
  let driverQualityGraphs = graphConfig.Driver;

  getDataAndCreateGraph(
    driverQualityGraphs,
    document.getElementById("driverQualityGraphContainer"),
    "Driver"
  );
}
//upate the average quality of the drivers
function addDefenseData() {
  let defenseQualities = [];
  // Getting matches of the team
  let matchesOfTeam = parsedJSONOutput.filter((obj) => {
    const metaData = obj["01metaData"];
    const extra = obj["06extra"];
    if (metaData.teamNumber === teamNumber) {
      defenseQualities.push(extra["Defense"]);
      return true;
    }
    return false;
  });
  let defenses = 0;
  let totalDefenseQuality = 0;
  for (let i of defenseQualities) {
    if (i == "Poor") {
      totalDefenseQuality++;
      defenses++;
    }
    if (i == "Good") {
      totalDefenseQuality += 3;
      defenses++;
    }
  }
  //get average defense quality as a number (out of 3)
  let avgDefenseQuality;
  let defenseDisplay = document.getElementById("defense");
  if (avgDefenseQuality == 0 || defenses == 0) {
    defenseDisplay.innerHTML = "Did not Defense";
  } else {
    avgDefenseQuality = totalDefenseQuality / defenses;
    //gets number rounded to the hundredth
    defenseDisplay.innerHTML = Math.round(avgDefenseQuality * 100) / 100 + "/3";
  }
}
//Function to add comments
function addComments() {
  let comments = [];
  let scoutNames = [];
  let matchNumbers = [];
  // Getting matches of the team
  let matchesOfTeam = parsedJSONOutput.filter((obj) => {
    const metaData = obj["01metaData"];
    const extra = obj["06extra"];
    if (metaData.teamNumber === teamNumber) {
      comments.push(extra["Comments"]);
      scoutNames.push(metaData["scoutName"]);
      matchNumbers.push(metaData["matchNumber"]);
      return true;
    }
    return false;
  });
  console.log(comments);
  console.log(scoutNames);
  console.log(matchNumbers);
  let commentsWrapper = document.getElementById("commentContainer");
  for (let i = 0; i < comments.length; i++) {
    let comment = document.createElement("div");
    commentsWrapper.appendChild(comment);
    comment.id = "comment";

    let commentPreface = document.createElement("h3");
    comment.appendChild(commentPreface);
    commentPreface.innerHTML =
      "Scout: " + scoutNames[i] + " | Match #: " + matchNumbers[i];
    commentPreface.id = "commentPreface";

    let commentText = document.createElement("h2");
    comment.appendChild(commentText);
    commentText.innerHTML = comments[i];
    commentText.id = "commentText";

    let bar = document.createElement("hr");
    comment.appendChild(bar);
    bar.classList.add("commentSeperator");
  }
}
// Function to get data from the json file, and
function getDataAndCreateGraph(
  graphCategory,
  graphContainer,
  graphCategoryName
) {
  // Creating a graph for each section under the category
  for (let k = 0; k < graphCategory.length; k++) {
    let values = [];
    let matchNumbers = [];
    // Getting matches of the team
    let matchesOfTeam = parsedJSONOutput.filter((obj) => {
      const metaData = obj["01metaData"];
      if (metaData.teamNumber === teamNumber) {
        matchNumbers.push(obj["01metaData"].matchNumber);
        return true;
      }
      return false;
    });

    // Computing the values for the metric for each match
    for (let i = 0; i < matchesOfTeam.length; i++) {
      let totalForMatch = 0;
      for (let j = 0; j < graphCategory[k].metrics.length; j++) {
        totalForMatch +=
          getValues(matchesOfTeam[i], graphCategory[k].metrics[j].path) *
          graphCategory[k].metrics[j].weight;
      }
      values.push({ label: "Match " + matchNumbers[i], y: totalForMatch });
    }
    // Drawing graph
    drawGraph(
      values,
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

window.updateTeamNumber = updateTeamNumber;
function updateTeamNumber(input) {
  // Get the current URL
  var url = new URL(window.location.href);

  // Set or update URL parameters
  url.searchParams.set("team", input.value);

  // Replace the current URL with the modified one
  window.location.href = url.toString();
}

let teamNumberInput = document.getElementById("teamNumberInput");
teamNumberInput.value = teamNumber;
teamNumberInput.focus();
teamNumberInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    updateTeamNumber(teamNumberInput);
  }
});
drawGraphs();
addDefenseData();
addComments();
