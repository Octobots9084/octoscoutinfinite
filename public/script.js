const eventKey = "demo5007";
const apiKey = "";
const apiUrl = `https://frc.nexus/api/v1/event/${eventKey}`;
let manualInput = false;
let teamNumbers = [];
let nexusData;
function getNexusMatches() {
  //get nexus api
  fetch(apiUrl, {
    method: "GET",
    headers: {
      "Nexus-Api-Key": apiKey,
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok." + response.status);
      }

      return response.json();
    })
    .then((data) => {
      setAutomaticInput(data);
      loadStoredData();
      localStorage.clear();
      nexusData = data;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
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
  if (oldteamSelector) {
    localStorage.setItem("autoTeam", oldteamSelector.value);
    oldteamSelector.remove();
  }

  const teamSelector = document.createElement("input");
  const teamcontainer = document.getElementById("teamInputContainer");
  teamSelector.placeholder = "Team Number";
  teamSelector.id = "teamNumberInput";
  teamSelector.value = localStorage.getItem("manualTeam");
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
  if (data.matches.length < 1) {
    throw new Error("No matches");
  }
  manualInput = false;
  //create typable input for team

  //create typable input for match
  let oldteamSelector = document.getElementById("teamNumberInput");
  localStorage.setItem("manualTeam", oldteamSelector.value);
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
  matchNumberInput.addEventListener("change", () => updateTeams(data, false));
  updateTeams(data, true);
}
function updateTeams(data, fromManual) {
  if (!fromManual) {
    localStorage.setItem("autoTeam", oldteamSelector.value);
  }

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
    teamNumbers = match.blueTeams.concat(match.redTeams);
    teamOption.innerHTML = bots[i] + teamNumbers[i];
    teamOption.value = i;
    teamOption.setAttribute("data-name", bots[i].slice(0, -3));
    teamSelector.appendChild(teamOption);
  }
  teamSelector.value = localStorage.getItem("autoTeam");
  const teamcontainer = document.getElementById("teamInputContainer");
  teamcontainer.appendChild(teamSelector);
}
async function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  let teamNumberInput = document.getElementById("teamNumberInput");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
    if (manualInput) {
      teamNumberInput.value = localStorage.getItem("manualTeam");
    } else {
      teamNumberInput.value = localStorage.getItem("autoTeam");
    }

    console.log(teamNumberInput.options);
    console.log(
      teamNumberInput.options[teamNumberInput.selectedIndex].getAttribute(
        "data-name"
      )
    );
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
    teamNumbers = match.blueTeams.concat(match.redTeams);
    metaData.teamNumber = teamNumbers[teamNumberInput.value];
    metaData.teamPosition =
      teamNumberInput.options[teamNumberInput.selectedIndex].getAttribute(
        "data-name"
      );
    localStorage.setItem("team", teamNumberInput.value);
  } else {
    metaData.teamNumber = teamNumberInput.value;
    localStorage.setItem("team", teamNumberInput.value);
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
