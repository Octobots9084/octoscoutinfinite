//starting page
const eventKey = "2026cascmp";
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
  let oldteamSelector = document.getElementById("teamNumberInput");
  if (!fromManual) {
    localStorage.setItem("autoTeam", oldteamSelector.value);
  }
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
  for (let i = 0; i < 6; i++) {
    let teamOption = document.createElement("option");
    teamNumbers = match.blueTeams.concat(match.redTeams);
    teamOption.innerHTML = bots[i] + teamNumbers[i];
    teamOption.value = i;
    teamOption.setAttribute("data-name", bots[i].slice(0, -3));
    teamSelector.appendChild(teamOption);
  }
  teamSelector.value = !localStorage.getItem("autoTeam")
    ? "0"
    : localStorage.getItem("autoTeam");
  const teamcontainer = document.getElementById("teamInputContainer");
  teamcontainer.appendChild(teamSelector);
}
async function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  let teamNumberInput = document.getElementById("teamNumberInput");
  let scoutNumberInput = document.getElementById("scoutNumberInput");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
    scoutNumberInput.value = metaData.scoutNumber;
    if (manualInput) {
      teamNumberInput.value = localStorage.getItem("manualTeam");
    } else {
      teamNumberInput.value = localStorage.getItem("autoTeam");
    }

    console.log(teamNumberInput.options);
    console.log(
      teamNumberInput.options[teamNumberInput.selectedIndex].getAttribute(
        "data-name",
      ),
    );
  }
}
window.saveData = saveData;
function saveData() {
  let teamNumberInput = document.getElementById("teamNumberInput");
  let matchNumberInput = document.getElementById("matchNumberInput");
  let scoutNumberInput = document.getElementById("scoutNumberInput");
  let match;
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  metaData.scoutNumber = scoutNumberInput.value;
  if (!manualInput) {
    for (let i = 0; i < nexusData.matches.length; i++) {
      if (nexusData.matches[i].label == matchNumberInput.value) {
        match = nexusData.matches[i];
      }
    }
    teamNumbers = match.blueTeams.concat(match.redTeams);
    metaData.teamNumber = teamNumbers[teamNumberInput.value];
    metaData.teamPosition =
      teamNumberInput.options[teamNumberInput.selectedIndex]?.getAttribute(
        "data-name",
      ) || "None";
    localStorage.setItem("team", teamNumberInput.value);
  } else {
    metaData.teamNumber = teamNumberInput.value;
    localStorage.setItem("team", teamNumberInput.value);
  }
  let autoDataToSave = {
    autoFuel: parseInt(document.getElementById("autoFuelInput").value) || 0,
    autoClimb: document.getElementById("climbInput").checked ? 1 : 0,
  };
  let teleopDataToSave = {
    teleFuel: parseInt(document.getElementById("fuelInput").value) || 0,
  };
  let endgameDataToSave = {
    name: document.querySelector("input[name='endgameClimb']:checked").value,
  };
  let extraDataToSave = {
    Comments: document.getElementById("commentInput").value,
    defense: document.getElementById("defenseCheck").checked
      ? document.getElementById("defenseInput").value
      : null,
    defended: document.getElementById("impactCheck").checked
      ? document.getElementById("impactInput").value
      : null,
    ferry: document.getElementById("ferryCheck").checked
      ? document.getElementById("ferryInput").value
      : null,
  };
  metaData.matchNumber = matchNumberInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
  localStorage.setItem("03auto", JSON.stringify(autoDataToSave));
  localStorage.setItem("04teleop", JSON.stringify(teleopDataToSave));
  localStorage.setItem("05endgame", JSON.stringify(endgameDataToSave));
  localStorage.setItem("06extra", JSON.stringify(extraDataToSave));
}
window.saveDataAnalysis = saveDataAnalysis;
function saveDataAnalysis() {
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  metaData.scoutNumber = scoutNumberInput.value;
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
if (!navigator.onLine) {
  console.log("offline");
  let analysisButton = document.getElementById("analysisButton");
  analysisButton.setAttribute("disabled", true);
  analysisButton.style.backgroundColor = "gray";
}
// Add this to your existing script.js
if ("serviceWorker" in navigator) {
  // Wait until the page has fully loaded to avoid slowing down the initial paint
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );
      })
      .catch((error) => {
        console.error("Service Worker registration failed:", error);
      });
  });
}

//end starting page

//submit area
let qrButton = document.getElementById("qrButton");
let qrCodeContainer = document.getElementById("qrCodeContainer");
console.log(qrButton);

qrButton.addEventListener("click", async () => {
  saveData();
  let save = ["01metaData", "03auto", "04teleop", "05endgame", "06extra"];
  let savedData = {};
  for (let i = 0; i < save.length; i++) {
    if (localStorage.getItem(save[i]) !== null) {
      savedData[save[i]] = localStorage.getItem(save[i]);
    }
  }
  const json = JSON.stringify(savedData); // Step 1: Minify
  const blob = new Blob([json]);
  const compressedStream = blob
    .stream()
    .pipeThrough(new CompressionStream("gzip"));
  const buffer = await new Response(compressedStream).arrayBuffer();
  const uint8Array = new Uint8Array(buffer);
  let binaryString = "";
  // A simple loop is safer for "ton of data" than the spread operator (...)
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }

  // Step 2: Binary to URL-safe Base64
  let compressedData = btoa(binaryString)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  console.log(compressedData);
  qrCodeContainer.innerHTML = "";
  qrCodeContainer.style.display = "block";
  var qrcode = new QRCode("qrCodeContainer", {
    text:
      "https://team9084.com:9084/input?data=" + compressedData,
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.L,
  });
});

window.scoutAgain = scoutAgain;
function scoutAgain() {
  window.location.href = "/";
}

window.submitData = async function () {
  let save = [
    "01metaData",
    "02startingLocation",
    "03auto",
    "04teleop",
    "05endgame",
    "06extra",
  ];
  let savedData = {};
  for (let i = 0; i < save.length; i++) {
    console.log(save[i]);
    if (localStorage.getItem(save[i]) !== null) {
      savedData[save[i]] = localStorage.getItem(save[i]);
    }
  }
  console.log(localStorage);
  console.log(savedData);
  try {
    let response = await fetch("../submitData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(savedData),
    });

    if (response.status == 200) {
      alert("Match Submitted");
    } else {
      alert("Error submitting data. Please try again.");
    }
  } catch (error) {
    console.error("Error submitting data:", error);
    alert("Failed to submit data. Please check your connection.");
  }
};
