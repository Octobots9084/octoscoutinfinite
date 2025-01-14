let scoutNameInput = document.getElementById("scoutNameInput");
let matchNumberInput = document.getElementById("matchNumberInput");
let teamNumberRedInput = document.getElementById("teamNumberRedInput");
let teamNumberBlueInput = document.getElementById("teamNumberBlueInput");

function loadStoredData() {
  let data = localStorage.getItem("01metaData");
  if (data != null) {
    let metaData = JSON.parse(data);
    scoutNameInput.value = metaData.scoutName;
  }
}

function saveData() {
  let metaData = {};
  metaData.scoutName = scoutNameInput.value;
  metaData.matchNumber = matchNumberInput.value;
  metaData.teamNumberRed = teamNumberRedInput.value;
  metaData.teamNumberBlue = teamNumberBlueInput.value;
  localStorage.setItem("01metaData", JSON.stringify(metaData));
}

loadStoredData();
localStorage.clear();
