const eventKey = "demo5007";
const apiKey = "";
const apiUrl = `https://frc.nexus/api/v1/event/${eventKey}`;
let manualInput = false;
let teams = [];
let nexusData;
function getNexusMatches() {
  //get nexus api
  fetch(apiUrl, {
    method: "GET", // GET request to fetch data
    headers: {
      "Nexus-Api-Key": apiKey, // Include the Bearer token if required
      "Content-Type": "application/json", // Typically used to specify data type
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok." + response.status);
      }

      return response.json(); // Parse the response as JSON
    })
    .then((data) => {
      setAutomaticInput(data);
      loadStoredData();
      localStorage.clear();
      nexusData = data;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error); // Handle any errors
      filter.checked = true;
      filter.setAttribute("disabled", true);

      setManualInput();
      loadStoredData();
      localStorage.clear();
    });
}
function setManualInput() {
  manualInput = true;
  //create typable input for team
  let oldteamSelector = document.getElementById("teamNumberInput");
  oldteamSelector ? oldteamSelector.remove() : "";
  const teamSelector = document.createElement("input");
  const teamcontainer = document.getElementById("teamInputContainer");
  teamSelector.placeholder = "Team Number";
  teamSelector.id = "teamNumberInput";
  teamcontainer.appendChild(teamSelector);

  //create typable input for match
  let oldMatchSelector = document.getElementById("matchNumberInput");
  oldMatchSelector ? oldMatchSelector.remove() : "";
  const matchSelector = document.createElement("input");
  const container = document.getElementById("matchInputContainer");
  matchSelector.placeholder = "Match Number";
  matchSelector.id = "matchNumberInput";
  container.appendChild(matchSelector);
}
function setAutomaticInput(data) {
  manualInput = false;
  //create typable input for team
  if (data.matches.length < 1) {
    throw new Error("No matches");
  }
  //create typable input for match
  let oldMatchSelector = document.getElementById("matchNumberInput");
  oldMatchSelector.remove();
  const matchSelector = document.createElement("select");
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
        if (data.matches[i + 1].status == "On deck") {
          match.selected = "selected";
        }
        matchSelector.appendChild(match);
      }
    } catch (error) {
      console.warn(error);
    }
  }
  matchNumberInput.addEventListener("change", () => updateTeams(data));
  updateTeams(data);
}
function updateTeams(data) {
  let oldteamSelector = document.getElementById("teamNumberInput");
  oldteamSelector.remove();
  const teamSelector = document.createElement("select");
  teamSelector.id = "teamNumberInput";
  const bots = [
    "Blue 1 - ",
    "Blue 2 - ",
    "Blue 3 - ",
    "Red 1 - ",
    "Red 2 - ",
    "Red 3 - ",
  ];
  let match;
  for (let i = 0; i < data.matches.length; i++) {
    if (data.matches[i].label == matchNumberInput.value) {
      match = data.matches[i];
    }
  }
  for (i = 0; i < 6; i++) {
    let teamOption = document.createElement("option");
    teams = match.blueTeams.concat(match.redTeams);
    teamOption.innerHTML = bots[i] + teams[i];
    teamOption.value = i;
    teamSelector.appendChild(teamOption);
  }
  const teamcontainer = document.getElementById("teamInputContainer");
  teamcontainer.appendChild(teamSelector);
}
async function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
    teamNumberInput.value = localStorage.getItem("team");
  }
}

function saveData() {
  let teamNumberInput = document.getElementById("teamNumberInput");
  let matchNumberInput = document.getElementById("matchNumberInput");
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
    metaData.teamNumber = teams[teamNumberInput.value];
    localStorage.setItem("team", teamNumberInput.value);
  } else {
    metaData.teamNumber = teamNumberInput.value;
    localStorage.setItem("team", 0);
  }

  metaData.matchNumber = matchNumberInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}
function saveDataAnalysis() {
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  teamNumberInput = document.getElementById("teamNumberInput");
  metaData.teamNumber = teamNumberInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}
const filter = document.getElementById("filter");

getNexusMatches();
filter.addEventListener("change", () => {
  if (!manualInput) {
    setManualInput();
  } else {
    setAutomaticInput(nexusData);
  }
});
let scoutNameInput = document.getElementById("scoutNameInput");

// Auto-set team color based on team selection
