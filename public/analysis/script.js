import {
  getGraphJSONConfig,
  getJSONOutput,
  quartiles,
  calculateMean,
} from "/util.js";

document.addEventListener("DOMContentLoaded", async function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabSelect = document.getElementById("tabSelect");

  window.renderedCharts = [];

  // Fetch data after DOM is loaded
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

  // --- Event Listeners ---
  // Handle tab button clicks
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.getAttribute("data-tab"));
    });
  });

  // Handle dropdown selection
  if (tabSelect) {
    // Check if dropdown exists
    tabSelect.addEventListener("change", function () {
      switchTab(this.value);
    });
  }

  // --- Function Definitions (Mostly Unchanged, but now within scope) ---

  // Function to switch tabs
  function switchTab(tabId) {
    if (!tabId) return; // Prevent switching if tabId is invalid

    // Update button states
    tabButtons.forEach((btn) => {
      if (btn.getAttribute("data-tab") === tabId) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update dropdown selection (if exists)
    if (tabSelect && tabSelect.value !== tabId) {
      tabSelect.value = tabId;
    }

    // Update tab panes
    let paneFound = false;
    document.querySelectorAll(".tab-pane").forEach((pane) => {
      if (pane.id === tabId) {
        pane.classList.add("active");
        paneFound = true;
      } else {
        pane.classList.remove("active");
      }
    });

    // Redraw charts in the active tab only if the pane exists
    if (
      paneFound &&
      window.renderedCharts &&
      window.renderedCharts.length > 0
    ) {
      const tabPane = document.getElementById(tabId);
      if (!tabPane) return; // Exit if pane not found (shouldn't happen due to paneFound check)

      const chartDivs = tabPane.querySelectorAll(".chart");
      chartDivs.forEach((div) => {
        if (!div.id) return;

        const chart = window.renderedCharts.find(
          (c) => c && c.container && c.container.id === div.id
        );
        if (chart) {
          setTimeout(() => {
            chart.render();
          }, 10);
        }
      });
    }
  }

  // Function to draw a graph to the screen
  function drawGraph(
    dataPoints,
    meanPoints,
    chartName,
    yLabel,
    graphContainer
  ) {
    if (!graphContainer) return; // Don't proceed if container is invalid

    let chartDiv = document.createElement("div");
    chartDiv.id = chartName;
    chartDiv.classList.add("chart");
    graphContainer.appendChild(chartDiv);

    let chartParameters = {
      animationEnabled: false, // Disable animation for potential performance gain/stability
      title: {
        text: chartName,
      },
      axisY: {
        title: yLabel,
        includeZero: true,
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
        labelAutoFit: true,
        labelAngle: -30,
      },
    };

    try {
      // Drawing graph
      var chart = new CanvasJS.Chart(chartName, chartParameters);
      chart.render();
      window.renderedCharts.push(chart);
    } catch (error) {
      chartDiv.innerHTML = `<p style="color:red; text-align:center;">Chart Load Error</p>`;
    }
  }

  // Function to get data from the json file
  function getDataAndCreateGraph(
    graphCategory,
    graphContainer,
    graphCategoryName
  ) {
    // Basic validation
    if (!graphCategory || !Array.isArray(graphCategory) || !graphContainer) {
      return;
    }

    // Getting all unique, non-deleted teams
    let teams = [];
    try {
      // Add try/catch around team processing as it accesses nested data
      const uniqueTeams = new Set();
      parsedJSONOutput.forEach((obj) => {
        // Add checks for obj and metaData existence
        if (
          obj &&
          obj["01metaData"] &&
          !obj.deleted &&
          obj["01metaData"].teamNumber
        ) {
          uniqueTeams.add(obj["01metaData"].teamNumber);
        }
      });
      teams = Array.from(uniqueTeams);
    } catch (e) {
      // console.error("Error processing teams", e);
      return; // Stop if team processing fails
    }

    if (teams.length === 0) return; // No teams, nothing to graph

    // Creating a graph for each section under the category
    graphCategory.forEach((categoryConfig, k) => {
      // Check if categoryConfig and its metrics are valid
      if (
        !categoryConfig ||
        !categoryConfig.graphName ||
        !Array.isArray(categoryConfig.metrics)
      ) {
        return; // Skip this config if invalid
      }

      let dataPoints = [];
      let means = [];

      // Looping through each team
      teams.forEach((teamNumber) => {
        let values = [];
        // Getting non-deleted matches of the team
        let matchesOfTeam = parsedJSONOutput.filter((obj) => {
          // Add checks
          return (
            obj &&
            !obj.deleted &&
            obj["01metaData"] &&
            obj["01metaData"].teamNumber === teamNumber
          );
        });

        // Computing the values for the metric for each match
        matchesOfTeam.forEach((matchData) => {
          let totalForMatch = 0;
          let calculationSuccess = true;

          categoryConfig.metrics.forEach((metric) => {
            if (metric && metric.path && typeof metric.weight === "number") {
              totalForMatch +=
                getValues(matchData, metric.path) * metric.weight;
            } else {
              // Skip invalid metric definition
            }
          });
          if (isNaN(totalForMatch)) {
            // Check if calculation resulted in NaN
            calculationSuccess = false;
          }
          if (calculationSuccess) {
            values.push(totalForMatch);
          }
        });

        // Calculate quartiles and mean only if values exist
        if (values.length > 0) {
          // Wrap stats calculation in try/catch
          let quartilesValues = quartiles(values); // Assume quartiles handles empty/single values
          let mean = calculateMean(values); // Assume calculateMean handles empty array
          means.push({ label: String(teamNumber), y: mean }); // Ensure label is string
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
        } else {
          // Handle case where team has no valid data - maybe push default points or skip
          means.push({ label: String(teamNumber), y: 0 });
          dataPoints.push({ label: String(teamNumber), y: [0, 0, 0, 0, 0] });
        }
      }); // End loop through teams

      if (dataPoints.length === 0) return; // Skip drawing if no data points generated

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
    });
  }

  // Function to retrieve value by JSON path - Made Safer
  function getValues(JSON, path) {
    return jsonpath.query(JSON, path).length;
  }

  // --- Initial Graph Generation ---
  // Check if config and container exist before calling
  const overallContainer = document.getElementById("overallGraphContainer");
  if (graphConfig && graphConfig.Overall && overallContainer) {
    getDataAndCreateGraph(graphConfig.Overall, overallContainer, "Overall");
  }

  const teleopContainer = document.getElementById("teleopGraphContainer");
  if (graphConfig && graphConfig.Teleop && teleopContainer) {
    getDataAndCreateGraph(graphConfig.Teleop, teleopContainer, "Teleop");
  }

  const autoContainer = document.getElementById("autoGraphContainer");
  if (graphConfig && graphConfig.Auto && autoContainer) {
    getDataAndCreateGraph(graphConfig.Auto, autoContainer, "Auto");
  }

  const endgameContainer = document.getElementById("endgameGraphContainer");
  if (graphConfig && graphConfig.Endgame && endgameContainer) {
    getDataAndCreateGraph(graphConfig.Endgame, endgameContainer, "Endgame");
  }

  const driverQualityContainer = document.getElementById(
    "driverQualityGraphContainer"
  );
  if (graphConfig && graphConfig.Driver && driverQualityContainer) {
    getDataAndCreateGraph(graphConfig.Driver, driverQualityContainer, "Driver");
  }

  // --- Initial Tab Activation ---
  // Ensure the correct initial tab is shown and attempt to render its charts
  const initialActiveTab = document.querySelector(".tab-pane.active");
  if (initialActiveTab) {
    switchTab(initialActiveTab.id); // Call switchTab to potentially trigger redraw
  } else {
    // If no tab is active by default, activate the first one
    const firstTabButton = document.querySelector(".tab-button");
    if (firstTabButton) {
      const firstTabId = firstTabButton.getAttribute("data-tab");
      if (firstTabId) {
        switchTab(firstTabId);
      }
    }
  }
}); // End DOMContentLoaded listener
