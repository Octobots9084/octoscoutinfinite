import { getGraphJSONConfig, getJSONOutput } from "/util.js";

document.addEventListener("DOMContentLoaded", async function () {
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabSelect = document.getElementById("tabSelect");

  // Store references to rendered charts
  window.renderedCharts = [];

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

  // --- URL Parameter Handling ---
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  // Get team number - Default to null or a specific value if not present
  let teamNumberParam = urlParams.get("team");
  let teamNumber = teamNumberParam ? teamNumberParam : null; // Use null if not provided

  let robotImageContainer = document.getElementById("robotImageDiv");
  function loadImage(i) {
    let extensions = ["jpg", "jpeg", "png"];

    if (i > extensions.length - 1) {
      console.log("Image not found");
      console.clear();
      return;
    }

    let robotImage = document.createElement("img");
    robotImage.id = "robotImage";
    robotImageContainer.appendChild(robotImage);
    robotImage.src =
      "../images/robotImages/" + teamNumber + "." + extensions[i];

    robotImage.onerror = function () {
      robotImage.remove();
      loadImage(i + 1);
    };
    console.clear();
  }

  loadImage(0);

  // --- Event Listeners ---
  // Handle tab button clicks
  if (tabButtons && tabButtons.length > 0) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", () => {
        switchTab(button.getAttribute("data-tab"));
      });
    });
  }

  // Handle dropdown selection
  if (tabSelect) {
    // Check if dropdown exists
    tabSelect.addEventListener("change", function () {
      switchTab(this.value);
    });
  }

  // --- Function Definitions ---

  // Function to switch tabs
  function switchTab(tabId) {
    if (!tabId) return; // Prevent switching if tabId is invalid

    // Update button states
    if (tabButtons && tabButtons.length > 0) {
      tabButtons.forEach((btn) => {
        if (btn.getAttribute("data-tab") === tabId) {
          btn.classList.add("active");
        } else {
          btn.classList.remove("active");
        }
      });
    }

    // Update dropdown selection (if exists)
    if (tabSelect && tabSelect.value !== tabId) {
      tabSelect.value = tabId;
    }

    // Update tab panes
    let paneFound = false;
    document.querySelectorAll(".tab-pane, .wordsContainer").forEach((pane) => {
      // Include .wordsContainer
      // Check if the pane's ID matches the target tabId
      if (pane.id === tabId) {
        pane.classList.add("active");
        // Ensure display style is set correctly (flex for graph, block/flex for words)
        // The CSS already handles display:flex for .tab-pane.active
        // We might need to ensure .wordsContainer.active is also displayed
        if (pane.classList.contains("wordsContainer")) {
          pane.style.display = "flex"; // Or 'block', depending on desired layout
        }
        paneFound = true;
      } else {
        pane.classList.remove("active");
        if (pane.classList.contains("wordsContainer")) {
          pane.style.display = "none"; // Hide inactive word containers
        }
      }
    });

    // Redraw charts in the active tab only if the pane exists and is a graph container
    if (
      paneFound &&
      window.renderedCharts &&
      window.renderedCharts.length > 0
    ) {
      const tabPane = document.getElementById(tabId);
      // Only redraw if the active tab is actually a graph container
      if (tabPane && tabPane.classList.contains("graphContainer")) {
        const chartDivs = tabPane.querySelectorAll(".chart");
        chartDivs.forEach((div) => {
          if (!div.id) return; // Skip divs without an ID

          // Find chart, ensuring c and c.container exist
          const chart = window.renderedCharts.find(
            (c) => c && c.container && c.container.id === div.id
          );
          if (chart) {
            // Use setTimeout to ensure the container is visible
            setTimeout(() => {
              try {
                chart.render();
              } catch (renderError) {
                // Silently fail or add minimal error indication
                // console.error("Error re-rendering chart:", div.id, renderError);
              }
            }, 10);
          }
        });
      }
    }
  }

  // Function to draw a graph to the screen
  function drawGraph(dataPoints, chartName, yLabel, graphContainer) {
    if (!graphContainer) return; // Don't proceed if container is invalid

    let chartDiv = document.createElement("div");
    chartDiv.id = chartName;
    chartDiv.classList.add("chart");
    graphContainer.appendChild(chartDiv);

    // Defining the parameters for the graph
    let chartParameters = {
      animationEnabled: false, // Consider disabling animation
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
          type: "spline",
          markerColor: "black",
          markerSize: 5,
          dataPoints: dataPoints,
        },
      ],
      axisX: {
        interval: 1,
        labelAutoFit: true,
        labelAngle: -30,
      },
    };

    try {
      var chart = new CanvasJS.Chart(chartName, chartParameters);
      chart.render();

      // Store reference only if render succeeds
      if (!window.renderedCharts) {
        window.renderedCharts = [];
      }
      window.renderedCharts.push(chart);
    } catch (error) {
      // Optionally add an error message in the div
      chartDiv.innerHTML = `<p style="color:red; text-align:center;">Chart Load Error</p>`;
    }
  }

  // Function to draw all graphs
  function drawGraphs() {
    if (!graphConfig) return; // Don't run if config failed to load

    // Clear existing charts from containers and the renderedCharts array
    document.querySelectorAll(".graphContainer").forEach((container) => {
      container
        .querySelectorAll(".chart")
        .forEach((chartDiv) => chartDiv.remove());
    });
    window.renderedCharts = [];

    // Defining which graphs to create based on which configs
    const overallContainer = document.getElementById("overallGraphContainer");
    if (graphConfig.Overall && overallContainer) {
      getDataAndCreateGraph(graphConfig.Overall, overallContainer, "Overall");
    }

    const teleopContainer = document.getElementById("teleopGraphContainer");
    if (graphConfig.Teleop && teleopContainer) {
      getDataAndCreateGraph(graphConfig.Teleop, teleopContainer, "Teleop");
    }

    const autoContainer = document.getElementById("autoGraphContainer");
    if (graphConfig.Auto && autoContainer) {
      getDataAndCreateGraph(graphConfig.Auto, autoContainer, "Auto");
    }

    const endgameContainer = document.getElementById("endgameGraphContainer");
    if (graphConfig.Endgame && endgameContainer) {
      getDataAndCreateGraph(graphConfig.Endgame, endgameContainer, "Endgame");
    }

    const driverQualityContainer = document.getElementById(
      "driverQualityGraphContainer"
    );
    if (graphConfig.Driver && driverQualityContainer) {
      getDataAndCreateGraph(
        graphConfig.Driver,
        driverQualityContainer,
        "Driver"
      );
    }
  }

  // Update the average defense quality
  function addDefenseData() {
    if (teamNumber === null) return; // Don't run if no team number
    const defenseDisplay = document.getElementById("defense");
    if (!defenseDisplay) return; // Don't run if element doesn't exist

    let defenseQualities = [];
    let defenses = 0;
    let totalDefenseQuality = 0;

    // Filter matches safely
    parsedJSONOutput.forEach((obj) => {
      // Check existence of nested properties before access
      if (
        obj &&
        obj["01metaData"] &&
        obj["06extra"] &&
        String(obj["01metaData"].teamNumber) === String(teamNumber) &&
        !obj.deleted
      ) {
        const defenseRating = obj["06extra"]["Defense"];
        if (defenseRating === "Poor") {
          totalDefenseQuality++; // Value of 1
          defenses++;
        } else if (defenseRating === "Average") {
          // Assuming "Average" maps to 2
          totalDefenseQuality += 2;
          defenses++;
        } else if (defenseRating === "Good") {
          totalDefenseQuality += 3; // Value of 3
          defenses++;
        }
        // Ignore other values or add handling if needed
      }
    });

    // Calculate and display average
    if (defenses === 0) {
      defenseDisplay.innerHTML = "Did Not Defend / No Data";
    } else {
      let avgDefenseQuality = totalDefenseQuality / defenses;
      defenseDisplay.innerHTML =
        Math.round(avgDefenseQuality * 100) / 100 + " / 3";
    }
  }

  // Function to add comments
  function addComments() {
    if (teamNumber === null) return; // Don't run if no team number
    const commentsWrapper = document.getElementById("commentContainer");
    if (!commentsWrapper) return; // Don't run if container doesn't exist

    commentsWrapper
      .querySelectorAll(':scope > div[id="comment"]')
      .forEach((commentDiv) => commentDiv.remove());

    let commentsData = [];
    // Filter matches safely
    parsedJSONOutput.forEach((obj) => {
      // Check existence of nested properties
      if (
        obj &&
        obj["01metaData"] &&
        obj["06extra"] &&
        String(obj["01metaData"].teamNumber) === String(teamNumber) &&
        !obj.deleted
      ) {
        const commentText = obj["06extra"]["Comments"];
        if (commentText && String(commentText).trim()) {
          commentsData.push({
            comment: String(commentText).trim(),
            scoutName: obj["01metaData"]["scoutName"] || "N/A",
            matchNumber: obj["01metaData"]["matchNumber"] || "N/A",
            died: obj["06extra"]["Died"] || "N/A",
          });
        }
      }
    });

    // Add comments to the DOM
    if (commentsData.length === 0) {
      let noCommentDiv = document.createElement("div");
      noCommentDiv.id = "comment";
      noCommentDiv.innerHTML = `<h3 id="commentPreface" style="color: white;">No comments recorded for this team.</h3>`;
      commentsWrapper.appendChild(noCommentDiv);
    } else {
      commentsData.forEach((data) => {
        let commentDiv = document.createElement("div");
        commentDiv.id = "comment"; // Use the same ID

        let commentPreface = document.createElement("h3");
        commentPreface.id = "commentPreface";
        commentPreface.style.color = "white";
        commentPreface.innerHTML = `Scout: ${data.scoutName} | Match #: ${data.matchNumber} | Died: ${data.died}`;

        let commentTextElem = document.createElement("h2");
        commentTextElem.id = "commentText";
        commentTextElem.style.color = "white";
        commentTextElem.textContent = data.comment;

        let bar = document.createElement("hr");
        bar.classList.add("commentSeperator");

        commentDiv.appendChild(commentPreface);
        commentDiv.appendChild(commentTextElem);
        commentDiv.appendChild(bar);
        commentsWrapper.appendChild(commentDiv);
      });
    }
  }

  // Function to get data and create graph for a single team
  function getDataAndCreateGraph(
    graphCategory,
    graphContainer,
    graphCategoryName
  ) {
    if (
      teamNumber === null ||
      !graphCategory ||
      !Array.isArray(graphCategory) ||
      !graphContainer
    ) {
      return; // Don't run if no team number or invalid config/container
    }

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

      let values = [];
      // Getting matches of the team safely
      let matchesOfTeam = parsedJSONOutput.filter((obj) => {
        // Check existence and compare team number (as strings for safety)
        return (
          obj &&
          obj["01metaData"] &&
          String(obj["01metaData"].teamNumber) === String(teamNumber) &&
          !obj.deleted
        );
      });

      // Sort matches by match number if available
      matchesOfTeam.sort((a, b) => {
        const matchNumA = parseInt(a["01metaData"]?.matchNumber.replace(/\D/g, ""), 10) || 0;
        const matchNumB = parseInt(b["01metaData"]?.matchNumber.replace(/\D/g, ""), 10) || 0;
        return matchNumA - matchNumB;
      });

      // Computing the values for the metric for each match
      matchesOfTeam.forEach((matchData, i) => {
        let totalForMatch = 0;
        let calculationSuccess = true;
        try {
          // Wrap metric calculation per match
          categoryConfig.metrics.forEach((metric) => {
            if (metric && metric.path && typeof metric.weight === "number") {
              totalForMatch +=
                getValues(matchData, metric.path) * metric.weight; // Use safer getValues
            }
          });
          if (isNaN(totalForMatch)) {
            // Check for NaN result
            calculationSuccess = false;
          }
        } catch (e) {
          calculationSuccess = false;
        }

        if (calculationSuccess) {
          const matchNumberLabel =
            matchData["01metaData"]?.matchNumber || i + 1; // Fallback to index if no match number
          values.push({ label: "Match " + matchNumberLabel, y: totalForMatch });
        } else {
          // Optionally push a point with y=0 or null if calculation failed
          const matchNumberLabel =
            matchData["01metaData"]?.matchNumber || i + 1;
          // values.push({ label: "Match " + matchNumberLabel, y: 0 }); // Or null
        }
      });

      // Only draw graph if there are values
      if (values.length > 0) {
        // Construct graph name safely
        const graphFullName =
          graphCategoryName +
          " " +
          (categoryConfig.graphName || `Graph ${k + 1}`);
        drawGraph(
          values,
          graphFullName,
          categoryConfig.units || "", // Use empty string if units undefined
          graphContainer
        );
      } else {
        // Optionally display a message in the container if no data
        graphContainer.innerHTML += `<p style="color:yellow;">No data for ${categoryConfig.graphName}</p>`;
      }
    });
  }

  // Function to retrieve value by JSON path - Made Safer
  function getValues(JSONData, path) {
    try {
      // Ensure jsonpath is loaded and JSONData/path are valid
      if (typeof jsonpath === "undefined" || !JSONData || !path) {
        return 0;
      }
      const result = jsonpath.query(JSONData, path);
      // Check if the result is an array before accessing length
      if (Array.isArray(result)) {
        return result.length;
      } else {
        // If jsonpath returns something else return 0 for length
        return 0;
      }
    } catch (error) {
      // Error during query (e.g., invalid path syntax)
      return 0;
    }
  }

  window.updateTeamNumber = updateTeamNumber; // Avoid if possible

  // Function to update team number via URL reload
  function updateTeamNumber(newTeamNumber) {
    // Get the current URL
    var url = new URL(window.location.href);
    // Set or update the 'team' parameter
    if (newTeamNumber && String(newTeamNumber).trim()) {
      url.searchParams.set("team", String(newTeamNumber).trim());
    } else {
      url.searchParams.delete("team"); // Remove if input is empty
    }
    window.location.href = url.toString();
  }

  // Team Number Input Handling
  const teamNumberInput = document.getElementById("teamNumberInput");
  if (teamNumberInput) {
    teamNumberInput.value = teamNumber !== null ? teamNumber : ""; // Set initial value from URL param
    // teamNumberInput.focus(); // Auto-focus might not be desired

    teamNumberInput.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent potential form submission
        updateTeamNumber(teamNumberInput.value);
      }
    });
  }

  // --- Initial Execution ---
  if (teamNumber !== null) {
    // Only draw graphs etc. if a team number is present
    drawGraphs();
    addDefenseData();
    addComments();
  } else {
    // Optionally display a message asking user to enter a team number
    const overallContainer = document.getElementById("overallGraphContainer");
    if (overallContainer) {
      overallContainer.innerHTML = `<h2 style="color:white; padding:20px;">Please enter a Team Number above.</h2>`;
    }
    // Also hide/clear defense and comment sections
    const defenseDisplay = document.getElementById("defense");
    if (defenseDisplay) defenseDisplay.innerHTML = "Enter Team Number";
    const commentsWrapper = document.getElementById("commentContainer");
    if (commentsWrapper)
      commentsWrapper.innerHTML = `<h1 id="header"> Comments:</h1><h3 style="color:white;">Enter Team Number</h3>`;
  }

  // --- Initial Tab Activation ---
  // Ensure the correct initial tab is shown
  const initialActiveTab = document.querySelector(".tab-button.active");
  if (initialActiveTab) {
    switchTab(initialActiveTab.getAttribute("data-tab"));
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
});
