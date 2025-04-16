import { getJSONOutput } from "/util.js";
let parsedJSONOutput;
let errored = false;
async function updateJSON() {
  let JSONOutput = await getJSONOutput();
  // Parse JSON strings in data
  parsedJSONOutput = JSONOutput.map((item) => {
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
}
async function createDataBlocks() {
  await updateJSON();
  let container = document.getElementById("dataContainer");
  container.innerHTML = "";
  let errors = 0;
  for (let i = 0; i < parsedJSONOutput.length; i++) {
    if (!parsedJSONOutput[i].deleted) {
      //create container

      let wrapper = document.createElement("div");
      wrapper.classList.add("dataWrapper");

      container.appendChild(wrapper);

      //create delete button
      let clickableDeleteImage = document.createElement("img");
      clickableDeleteImage.src = "/images/deleteImage.png";
      clickableDeleteImage.classList.add("deleteButton");
      clickableDeleteImage.onclick = () => {
        console.log(i);
        removeData(i);
        createDataBlocks();
      };
      wrapper.appendChild(clickableDeleteImage);
      try {
        //show important data
        let metaData = parsedJSONOutput[i]["01metaData"];
        let metaDataDisplay = document.createElement("div");
        metaDataDisplay.classList.add("dataHolder");
        wrapper.appendChild(metaDataDisplay);
        metaDataDisplay.innerHTML =
          "Scout Name: " +
          metaData.scoutName +
          " | Team Number: " +
          metaData.teamNumber +
          " | Match: " +
          metaData.matchNumber;

        //show starting location
        let startingLocation = parsedJSONOutput[i]["02startingLocation"];
        let startingLocationDisplay = document.createElement("div");
        startingLocationDisplay.classList.add("dataHolder");
        wrapper.appendChild(startingLocationDisplay);
        startingLocationDisplay.innerHTML =
          "Starting Location: " + startingLocation.name;
        //show autonomous results

        let auto = parsedJSONOutput[i]["03auto"];
        let autoDisplay = document.createElement("div");
        autoDisplay.classList.add("dataHolder", "collapsible");
        wrapper.appendChild(autoDisplay);
        autoDisplay.innerHTML = "Click to View Auto Data";
        autoDisplay.style.paddingBottom = "5px";

        for (let j = 0; j < auto.length; j++) {
          //creating the cointainer for the piece

          let piece = auto[j];
          let pieceContainer = document.createElement("div");
          pieceContainer.classList.add("gamePiece", "content");
          //creating the image of the piece

          let pieceImage = document.createElement("img");
          pieceImage.classList.add("pieceImage");
          pieceImage.setAttribute("src", "../images/" + piece.name + ".png");
          pieceContainer.appendChild(pieceImage);
          autoDisplay.appendChild(pieceContainer);

          //showing data about the piece
          let pieceInfo = document.createElement("div");
          pieceContainer.appendChild(pieceInfo);
          pieceContainer.classList.add("pieceInfo");
          pieceInfo.innerHTML =
            "Collected: " +
            piece.collectionLocation.name +
            " | Result: " +
            piece.result;
        }

        if (auto.length == 0) {
          autoDisplay.innerHTML = "No Auto Data";
          autoDisplay.classList.remove("collapsible");
        }

        //show teleoperated results
        let teleop = parsedJSONOutput[i]["04teleop"];
        let teleopDisplay = document.createElement("div");
        teleopDisplay.classList.add("dataHolder", "collapsible");
        wrapper.appendChild(teleopDisplay);
        teleopDisplay.innerHTML = "Click to View Teleop Data";
        teleopDisplay.style.paddingBottom = "5px";

        for (let j = 0; j < teleop.length; j++) {
          //creating the cointainer for the piece
          let piece = teleop[j];
          let pieceContainer = document.createElement("div");
          pieceContainer.classList.add("gamePiece", "content");

          //creating the image of the piece
          let pieceImage = document.createElement("img");
          pieceImage.classList.add("pieceImage");
          pieceImage.setAttribute("src", "../images/" + piece.name + ".png");
          pieceContainer.appendChild(pieceImage);
          teleopDisplay.appendChild(pieceContainer);

          //showing data about the piece
          let pieceInfo = document.createElement("div");
          pieceContainer.appendChild(pieceInfo);
          pieceContainer.classList.add("pieceInfo");
          pieceInfo.innerHTML =
            "Collected: " +
            piece.collectionLocation.name +
            " | Result: " +
            piece.result;
        }

        if (teleop.length == 0) {
          teleopDisplay.innerHTML = "No Teleop Data";
          teleopDisplay.classList.remove("collapsible");
        }

        //show endgame data
        let endgame = parsedJSONOutput[i]["05endgame"];
        let endgameDisplay = document.createElement("div");
        endgameDisplay.classList.add("dataHolder");
        wrapper.appendChild(endgameDisplay);
        endgameDisplay.innerHTML =
          "Deep: " +
          endgame.Deep +
          " | Shallow: " +
          endgame.Shallow +
          " | Park: " +
          endgame.Park;

        //show extra data
        let extra = parsedJSONOutput[i]["06extra"];
        let extraDisplay = document.createElement("div");
        extraDisplay.classList.add("dataHolder");
        wrapper.appendChild(extraDisplay);
        extraDisplay.innerHTML =
          "Died: " +
          extra.Died +
          " | Defense: " +
          extra.Defense +
          " | Driver Quality: " +
          extra.Driver_Quality;

        //show comments

        let commentDisplay = document.createElement("div");
        commentDisplay.classList.add("dataHolder");
        wrapper.appendChild(commentDisplay);
        commentDisplay.innerHTML = "Comment : " + extra.Comments;

        //find anomalies
        try {
          var anomalies = detectAnomalies();
          if (anomalies[metaData.matchNumber] != 6) {
            if (anomalies[metaData.matchNumber] > 6) {
              wrapper.classList.add("anomalyBig");
            } else if (anomalies[metaData.matchNumber] < 6) {
              wrapper.classList.add("anomalySmall");
            }
            let anomalyDisplay = document.createElement("div");
            anomalyDisplay.classList.add("dataHolder");
            wrapper.appendChild(anomalyDisplay);
            anomalyDisplay.innerHTML =
              "Number of results: " + anomalies[metaData.matchNumber];
          }
        } catch (e) {}
      } catch (e) {
        errors++;
        removeErrorData(i);
        console.log(e);
        createDataBlocks();
      }
    }
  }
  let anomalous = 0;
  let anomalousBig = 0;
  let anomalousSmall = 0;
  let anomalyCounter = document.createElement("div");
  container.prepend(anomalyCounter);
  anomalyCounter.classList.add("anomalyCounter");
  for (let i = 0; i < Object.keys(anomalies).length; i++) {
    if (anomalies[Object.keys(anomalies)[i]] < 6) {
      anomalousSmall++;
      anomalous++;
    } else if (anomalies[Object.keys(anomalies)[i]] > 6) {
      anomalousBig++;
      anomalous++;
    }
  }
  console.log("Errors: " + errors);
  if (errors > 0 && errored == false) {
    alert("Automatically Deleted Errors X" + errors);
    errored = true;
  }
  anomalyCounter.innerHTML =
    "Total Anomalies: " +
    anomalous +
    " | Matches with less scouts: " +
    anomalousSmall +
    " | Matches with too many scouts: " +
    anomalousBig;
  createCollapsibleElements();
}
async function removeData(index) {
  const input = [];
  input.push(index);
  if (confirm("Are you sure you want to delete this data?")) {
    let response = await fetch("../removeData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (response.status == 200) {
      alert("Match Removed");
      console.log(parsedJSONOutput[index]);
    } else {
      alert("Error!");
    }
  }
}
async function removeErrorData(index) {
  const input = [];
  input.push(index);
  let response = await fetch("../removeData", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (response.status == 200) {
    console.log(parsedJSONOutput[index]);
  } else {
    alert("Error!");
  }
}
function detectAnomalies() {
  let matches = {};
  for (let i = 0; i < parsedJSONOutput.length; i++) {
    try {
      if (!parsedJSONOutput[i].deleted) {
        if (
          Object.keys(matches).includes(
            parsedJSONOutput[i]["01metaData"].matchNumber
          )
        ) {
          matches[parsedJSONOutput[i]["01metaData"].matchNumber]++;
        } else {
          matches[parsedJSONOutput[i]["01metaData"].matchNumber] = 1;
        }
      }
    } catch (e) {}
  }
  return matches;
}
function createCollapsibleElements() {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.children;
      var z;
      for (z = 0; z < content.length; z++) {
        if (content[z].style.display === "block") {
          content[z].style.display = "none";
        } else {
          content[z].style.display = "block";
        }
      }
    });
  }
}
createDataBlocks();
createCollapsibleElements();
