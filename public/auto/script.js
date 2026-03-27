import {
  getJSONConfig,
  xPositionMetersToPixelsFromTop,
  yPositionMetersToPixelsFromLeft,
  fieldWidth,
  fieldHeight,
} from "/util.js";

let JSONConfig = await getJSONConfig();
document.title = JSONConfig.pageTitle;
let fieldContainer = document.getElementById("fieldContainer");
let fieldImage = document.getElementById("fieldImage");
let gamePieceContainer = document.getElementById("gamePieceContainer");
let gamePieceViewer = document.getElementById("gamePieceViewer");
let gamePieces = [];
fieldImage.src = "../images/jamie.png";
let isBlue = JSON.parse(localStorage.getItem("01metaData")).teamColor == "Blue";
if (!isBlue) {
  //fieldImage.src = "../images/autoFieldRed.png";
}
document.getElementById("teamNum").innerHTML =
  "Team #: " + JSON.parse(localStorage.getItem("01metaData")).teamNumber;

if (fieldImage.complete) {
  generateCollectionButtons();
  loadStoredData();
} else {
  fieldImage.onload = () => {
    generateCollectionButtons();
    loadStoredData();
  };
}

class GamePiece {
  constructor(name, collectionLocation) {
    this.name = name;
    this.result = collectionLocation;
  }
}

function leaveFunc(bypass) {
  let left = localStorage.getItem("left") === "true";
  let leaveButton = document.getElementById("leave");
  let leave = JSONConfig.leave;
  if (left == false || bypass) {
    leaveButton.style.backgroundColor = "grey";
    leaveButton.onclick = null;
    left = true;
    localStorage.setItem("left", true);
    collectPiece("Move", "Move");
  }
}
function unLeave() {
  let leaveButton = document.getElementById("leave");
  leaveButton.style.backgroundColor = "green";
  localStorage.setItem("left", false);
  leaveButton.onclick = function () {
    leaveFunc();
  };
}

function loadStoredData() {
  let data = localStorage.getItem("03auto");
  if (data != null) {
    gamePieces = JSON.parse(data);
    for (let i = 0; i < gamePieces.length; i++) {
      if (gamePieces[i].name == "Leave") {
        localStorage.setItem("left", true);
        break;
      } else {
        localStorage.setItem("left", false);
      }
    }
    updateGamePieceViewer();
  } else {
    localStorage.setItem("left", false);
  }
}

// Dynamically generating buttons to select auto collections
function generateCollectionButtons() {
  let gamePieces = JSONConfig.gamePieces;

  for (let i = 0; i < gamePieces.length; i++) {
    // Creating the collection locations for the blue alliance, changing the color for differentiation
    for (let j = 0; j < gamePieces[i].autoCollectionLocations.length; j++) {
      addCollectionClickableImage(
        gamePieces[i].autoCollectionLocations[j],
        gamePieces[i].name,
      );
    }
    let noShow = JSONConfig.noShow;
    let noShowButton = document.createElement("img");
    noShowButton.src = "../images/noShow.png";
    noShowButton.classList.add("noShow");
    noShowButton.onclick = function () {
      noShowFunc();
    };
    noShowButton.style.top =
      xPositionMetersToPixelsFromTop(fieldImage, noShow.x, 5) + "px";
    noShowButton.style.left =
      yPositionMetersToPixelsFromLeft(fieldImage, noShow.y, 5) + "px";
    fieldContainer.appendChild(noShowButton);

    //leav
    let left = localStorage.getItem("left") || false;
    let leave = JSONConfig.leave;
    if (leave) {
      let leaveButton = document.createElement("img");
      if (left)
        window.addEventListener("DOMContentLoaded", () => leaveFunc(true));
      leaveButton.src = "../images/Move.png";
      leaveButton.classList.add("leave");
      leaveButton.id = "leave";

      leaveButton.onclick = function () {
        leaveFunc();
      };
      leaveButton.style.top =
        xPositionMetersToPixelsFromTop(fieldImage, leave.x, 5) + "px";
      leaveButton.style.left =
        yPositionMetersToPixelsFromLeft(fieldImage, leave.y, 5) + "px";
      fieldContainer.appendChild(leaveButton);
    }
  }
}

window.decrementOne = decrementOne;
window.decrementThree = decrementThree;
window.decrementTen = decrementTen;
window.incrementOne = incrementOne;
window.incrementThree = incrementThree;
window.incrementTen = incrementTen;
function noShowFunc() {
  localStorage.setItem(
    "02startingLocation",
    JSON.stringify({ name: "noShow" }),
  );
  window.location.href = "/noShow";
}
// Adds a clickable image to the field using the position of the button (in meters), the piece type, and the button's color
function addCollectionClickableImage(collectionLocation, gamePieceName) {
  collectionLocation.x = fieldHeight - collectionLocation.x;
  collectionLocation.y = fieldWidth - collectionLocation.y;
  let clickableImage = document.createElement("img");
  let clickableImageSideLength = 5; // In units of vh
  clickableImage.onclick = function () {
    collectPiece(collectionLocation.name, gamePieceName);
  };
  clickableImage.addEventListener("touchstart", function () {
    clickableImage.style.backgroundColor = "white";
  });
  clickableImage.addEventListener("touchend", function () {
    clickableImage.style.backgroundColor = imageBackgroundColor;
  });

  clickableImage.classList.add("clickableImage");

  // Computing the correct position for the button to be at
  clickableImage.style.top =
    xPositionMetersToPixelsFromTop(
      fieldImage,
      collectionLocation.x,
      clickableImageSideLength,
    ) + "px";
  clickableImage.style.left =
    yPositionMetersToPixelsFromLeft(
      fieldImage,
      collectionLocation.y,
      clickableImageSideLength,
    ) + "px";
  fieldContainer.appendChild(clickableImage);

  // Setting additional style elements
  clickableImage.src = "/images/" + gamePieceName + ".png";
  clickableImage.style.backgroundColor = `rgb(0, 0, 50)`;
  clickableImage.style.width = clickableImageSideLength + "vh";
  clickableImage.style.height = clickableImageSideLength + "vh";
}
// Creates a game piece object to represent a collected game piece and updates the viewer
function collectPiece(location, gamePieceName) {
  leaveFunc();
  gamePieces.push(new GamePiece(gamePieceName, location));
  updateGamePieceViewer();
  startPieceTimer();
}

// Updates the visualization of the game pieces collected
function updateGamePieceViewer() {
  let gamePieceImageSideLength = 5; // In units of vh
  let clickableDeleteImageSideLength = 5;
  gamePieceContainer.innerHTML = "";
  if (gamePieces.length == 0) {
    stopPieceTimer();
  }
  // Looping through game pieces
  for (let i = 0; i < gamePieces.length; i++) {
    // Finding possible results
    let possibleResults = [];
    for (let j = 0; j < JSONConfig.gamePieces.length; j++) {
      if (JSONConfig.gamePieces[j].name == gamePieces[i].name) {
        possibleResults = JSONConfig.gamePieces[j].autoPossibleResults;
      }
    }

    // Creating game piece element
    let gamePiece = document.createElement("div");
    gamePiece.classList.add("gamePieceContainer");

    let gamePieceImage = document.createElement("img");
    gamePieceImage.src = "/images/" + gamePieces[i].name + ".png";
    gamePieceImage.style.width = gamePieceImageSideLength + " vh";
    gamePieceImage.style.height = gamePieceImageSideLength + "vh";
    var resultText = document.createElement("h3");
    resultText.innerHTML = gamePieces[i].result || "None";
    resultText.classList.add("resultText");

    let clickableDeleteImage = document.createElement("img");
    clickableDeleteImage.src = "/images/deleteImage.png";
    clickableDeleteImage.style.width = clickableDeleteImageSideLength + "vh";
    clickableDeleteImage.style.height = clickableDeleteImageSideLength + "vh";
    clickableDeleteImage.onclick = () => {
      if (gamePieces[i].result == "Move") {
        unLeave();
      }
      gamePieces.splice(i, 1);
      updateGamePieceViewer();
    };

    // Compiling elements together
    gamePiece.appendChild(gamePieceImage);
    if (possibleResults.length > 1) {
      gamePiece.appendChild(gamePieceResultSelector);
    } else {
      gamePiece.appendChild(resultText);
    }
    gamePiece.appendChild(clickableDeleteImage);
    gamePieceContainer.appendChild(gamePiece);

    // Setting background color of game piece and scrolling to bottom of the viewer
    gamePieces[i].result == "Move"
      ? (gamePiece.style.backgroundColor = `green`)
      : (gamePiece.style.backgroundColor = ` rgb(0, 0, 50)`);
    gamePieceViewer.scrollTop = gamePieceViewer.scrollHeight;
  }
}
window.saveData = saveData;
function saveData() {
  let dataToSave = {
    autoFuel: parseInt(document.getElementById("fuelInput").value) || 0,
    autoClimb: document.getElementById("climbInput").value == "on" ? 1 : 0,
  };
  console.log(dataToSave);
  localStorage.setItem("03auto", JSON.stringify(dataToSave));
}
function placeCoral() {
  $("#image").click(function () {
    $("#foo").addClass("myClass");
  });
}
