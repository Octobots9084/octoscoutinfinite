let scoutNameInput = document.getElementById("scoutNameInput");
let teamNumberInput = document.getElementById("teamNumberInput");
let matchNumberInput = document.getElementById("matchNumberInput");
let teamColorInput = document.getElementById("teamColorInput");

const eventKey = "demo7228";
const apiUrl = `https://frc.nexus/api/v1/event/${eventKey}`;

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
    const matchSelector = document.getElementById("matchNumberInput");
    for (let i = 0; i < data.matches.length; i++) {
      try {
        if (
          data.matches[i + 3].status != "On field" &&
          data.matches[i].status != "Queuing soon"
        ) {
          let match = document.createElement("option");
          match.value = i + 1;
          match.innerHTML = data.matches[i].label;
          matchSelector.appendChild(match);
        }
      } catch (error) {
        if (data.matches[i].status != "Queuing soon") {
          let match = document.createElement("option");
          match.value = i + 1;
          match.innerHTML = data.matches[i].label;
          matchSelector.appendChild(match);
        }
      }
    }
  })
  .catch((error) => {
    console.error("There was a problem with the fetch operation:", error); // Handle any errors
  });

function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
    teamColorInput.value = metaData.teamColor;
    matchNumberInput.value = metaData.matchNumber;
    teamNumberInput.value = metaData.teamNumber;
  }
}

function saveData() {
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  metaData.teamNumber = teamNumberInput.value;
  metaData.matchNumber = matchNumberInput.value;
  metaData.teamColor = teamColorInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}

loadStoredData();
localStorage.clear();
