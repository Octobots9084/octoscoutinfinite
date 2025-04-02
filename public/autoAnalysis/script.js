import { getJSONOutput, autoFieldHeight, autoFieldWidth } from "/util.js";
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

// Defining constants
let fieldSizeMultiplier = 50;
let gamePieceDimension = 1;
let gamePieceBoxDimension = 1.4;

// Function to draw an auto path to the screen
function drawAutoPath(pieces, matchNumber) {
  // Creating container
  let canvasDiv = document.createElement("div");
  canvasDiv.classList.add("autoCanvasContainer");

  // Creating title
  let canvasTitle = document.createElement("h1");
  canvasTitle.innerHTML = matchNumber;
  canvasTitle.classList.add("canvasTitle");

  // Creating canvas
  let canvas = document.createElement("canvas");
  let ctx = canvas.getContext("2d");
  canvas.classList.add("autoCanvas");

  canvasDiv.appendChild(canvasTitle);
  canvasContainer.appendChild(canvasDiv);
  canvasDiv.appendChild(canvas);

  // Setting canvas properties
  canvas.style.height = autoFieldHeight * fieldSizeMultiplier + "px";
  canvas.style.width = autoFieldWidth * fieldSizeMultiplier + "px";
  canvas.height = autoFieldHeight * fieldSizeMultiplier;
  canvas.width = autoFieldWidth * fieldSizeMultiplier;
  ctx.font = "bold 12px serif";
  ctx.textAlign = "center";
  ctx.lineWidth = 15;

  // Drawing field image
  ctx.drawImage(
    document.getElementById("fieldImage"),
    (autoFieldWidth * fieldSizeMultiplier) / 4,
    75,
    (autoFieldWidth * fieldSizeMultiplier) / 2,
    (autoFieldHeight * fieldSizeMultiplier) / 1.18
  );

  // Setting color iterators for lines between collections
  let iteratorColorStartingValue = 100;
  let colorIterator = iteratorColorStartingValue;
  let maxColorIteratorValue = 255;

  // Drawing a line between pieces
  for (let i = 0; i < pieces.length - 1; i++) {
    ctx.strokeStyle =
      "rgb(" +
      [0, (colorIterator - iteratorColorStartingValue) / 2, colorIterator].join(
        ","
      ) +
      ")";
    colorIterator +=
      (maxColorIteratorValue - iteratorColorStartingValue) /
      (pieces.length - 1);

    ctx.beginPath();
    ctx.moveTo(
      pieces[i].collectionLocation.y * fieldSizeMultiplier +
        (autoFieldWidth * fieldSizeMultiplier) / 4,
      pieces[i].collectionLocation.x * fieldSizeMultiplier + 75
    );
    ctx.lineTo(
      pieces[i + 1].collectionLocation.y * fieldSizeMultiplier +
        (autoFieldWidth * fieldSizeMultiplier) / 4,
      pieces[i + 1].collectionLocation.x * fieldSizeMultiplier + 75
    );
    ctx.stroke();
  }

  // Drawing pieces
  for (let i = 0; i < pieces.length; i++) {
    // Creating image for piece
    let img = new Image();
    img.src = "../images/" + pieces[i].name + ".png";

    img.onload = function () {
      ctx.fillStyle = "#bb9839";

      // Drawing a background square
      ctx.fillRect(
        (pieces[i].collectionLocation.y - gamePieceBoxDimension / 2) *
          fieldSizeMultiplier +
          (autoFieldWidth * fieldSizeMultiplier) / 4,
        (pieces[i].collectionLocation.x - gamePieceBoxDimension / 2) *
          fieldSizeMultiplier +
          75,
        gamePieceBoxDimension * fieldSizeMultiplier,
        gamePieceBoxDimension * fieldSizeMultiplier
      );

      // Drawing the piece
      ctx.drawImage(
        img,
        (pieces[i].collectionLocation.y - gamePieceDimension / 2) *
          fieldSizeMultiplier +
          (autoFieldWidth * fieldSizeMultiplier) / 4,
        (pieces[i].collectionLocation.x - gamePieceDimension / 2) *
          fieldSizeMultiplier +
          75,
        gamePieceDimension * fieldSizeMultiplier,
        gamePieceDimension * fieldSizeMultiplier
      );

      ctx.fillStyle = "#FFFFFF";

      // Drawing the piece result
      ctx.fillText(
        pieces[i].result,
        pieces[i].collectionLocation.y * fieldSizeMultiplier +
          (autoFieldWidth * fieldSizeMultiplier) / 4,
        pieces[i].collectionLocation.x * fieldSizeMultiplier + 75
      );
    };
  }
}

// Function to get data from the json file, and
function getDataAndDrawAutoPaths() {
  // Get matches for the selected team
  let matchesOfTeam = parsedJSONOutput.filter((obj) => {
    try {
      const metaData = obj["01metaData"];
      if (obj.deleted) {
        return false;
      }
      return metaData.teamNumber === teamNumber;
    } catch (e) {
      console.warn("ERROR: " + e);
    }
  });

  // Draw the auto path for each match
  for (let i = 0; i < matchesOfTeam.length; i++) {
    try {
      drawAutoPath(
        [
          {
            collectionLocation: {
              name: "blue3",
              x: matchesOfTeam[i]["02startingLocation"].x,
              y: matchesOfTeam[i]["02startingLocation"].y,
            },
            name: "robot",
            result: "Starting Location",
          },
        ].concat(matchesOfTeam[i]["03auto"]),
        "Match " + matchesOfTeam[i]["01metaData"].matchNumber
      );
    } catch (e) {
      console.warn(e);
    }
  }
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

getDataAndDrawAutoPaths();
