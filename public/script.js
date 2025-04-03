const eventKey = "2025cafr";
const apiUrl = `https://frc.nexus/api/v1/event/${eventKey}`;
let manualInput = false;
let teams = [];
let nexusData;
function getNexusMatches() {
  //get nexus api
  fetch(apiUrl, {
    method: "GET", // GET request to fetch data
    headers: {
      "Nexus-Api-Key": `GEd51Lz5hYot-fIhZM7P84-KPMM`, // Include the Bearer token if required
      "Content-Type": "application/json", // Typically used to specify data type
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      console.log(data);
      nexusData = data;
      //create dropdown menu for match number
      const matchSelector = document.getElementById("matchNumberInput");
      const container = document.getElementById("matchInputContainer");
      matchSelector.name = "matchNumber";
      matchSelector.id = "matchNumberInput";
      container.appendChild(matchSelector);
      for (let i = 0; i < data.matches.length; i++) {
        try {
          if (i < 2) {
            if (data.matches[i + 1].status != "On field") {
              let match = document.createElement("option");
              match.value = data.matches[i].label;
              match.innerHTML = data.matches[i].label;
              matchSelector.appendChild(match);
            }
          } else if (i > data.matches.length - 3) {
            if (data.matches[i].status != "Queuing soon") {
              let match = document.createElement("option");
              match.value = data.matches[i].label;
              match.innerHTML = data.matches[i].label;
              matchSelector.appendChild(match);
            }
          } else if (
            data.matches[i + 2].status != "On field" &&
            data.matches[i].status != "Queuing soon"
          ) {
            let match = document.createElement("option");
            match.value = data.matches[i].label;
            match.innerHTML = data.matches[i].label;
            matchSelector.appendChild(match);
          }
        } catch (error) {
          console.warn(error);
        }
      }
    })
    .catch((error) => {
      manualInput = true;
      console.error("There was a problem with the fetch operation:", error); // Handle any errors
      //create typable input for team
      let oldteamSelector = document.getElementById("teamNumberInput");
      oldteamSelector.remove();
      const teamSelector = document.createElement("input");
      const teamcontainer = document.getElementById("teamInputContainer");
      teamSelector.placeholder = "Team Number";
      teamSelector.id = "teamNumberInput";
      teamcontainer.appendChild(teamSelector);

      //create typable input for match
      let oldMatchSelector = document.getElementById("matchNumberInput");
      oldMatchSelector.remove();
      const matchSelector = document.createElement("input");
      const container = document.getElementById("matchInputContainer");
      matchSelector.placeholder = "Match Number";
      matchSelector.id = "matchNumberInput";
      container.appendChild(matchSelector);
    });
  let matchNumberInput = document.getElementById("matchNumberInput");
}
function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
    teamColorInput.value = metaData.teamColor;
  }
}

function saveData() {
  let match;
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  if (!manualInput) {
    for (let i = 0; i < nexusData.matches.length; i++) {
      if (nexusData.matches[i].label == matchNumberInput.value) {
        match = nexusData.matches[i];
      }
    }
    teams = match.blueTeams.concat(match.redTeams);
    console.log(teams);
    console.log(teamNumberInput.value);
    console.log(teams[teamNumberInput.value]);
    metaData.teamNumber = teams[teamNumberInput.value];
  } else {
    teamNumberInput = document.getElementById("teamNumberInput");
    metaData.teamNumber = teamNumberInput.value;
  }

  metaData.matchNumber = matchNumberInput.value;
  metaData.teamColor = teamColorInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}
function saveDataAnalysis() {
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  teamNumberInput = document.getElementById("teamNumberInput");
  metaData.teamNumber = teamNumberInput.value;
  metaData.teamColor = teamColorInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}
function setManual() {
  manualInput = true;
  //create typable input for team
  let oldteamSelector = document.getElementById("teamNumberInput");
  oldteamSelector.remove();
  const teamSelector = document.createElement("input");
  const teamcontainer = document.getElementById("teamInputContainer");
  teamSelector.placeholder = "Team Number";
  teamSelector.id = "teamNumberInput";
  teamSelector.name = "teamNumberInput";
  teamcontainer.appendChild(teamSelector);

  //create typable input for match
  let oldmatchSelectior = document.getElementById("matchNumberInput");
  oldmatchSelectior.remove();
  const matchSelector = document.createElement("input");
  const container = document.getElementById("matchInputContainer");
  matchSelector.placeholder = "Match Number";
  matchSelector.id = "matchNumberInput";
  container.appendChild(matchSelector);
}
getNexusMatches();
let scoutNameInput = document.getElementById("scoutNameInput");
let teamNumberInput = document.getElementById("teamNumberInput");
let teamColorInput = document.getElementById("teamColorInput");
localStorage.setItem("alerted", false);
loadStoredData();
localStorage.clear();

// Auto-set team color based on team selection
document
  .getElementById("teamNumberInput")
  .addEventListener("change", function () {
    const teamColorInput = document.getElementById("teamColorInput");
    const selectedValue = parseInt(this.value);

    // Blue teams are 0, 1, 2 (first three options)
    if (selectedValue <= 2) {
      teamColorInput.value = "Blue";
    }
    // Red teams are 3, 4, 5 (last three options)
    else if (selectedValue >= 3) {
      teamColorInput.value = "Red";
    }
  });
