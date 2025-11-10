import { getJSONOutput } from "/util.js";
let parsedJSONOutput;
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
  for (let i = 0; i < parsedJSONOutput.length; i++) {
    if (parsedJSONOutput[i].deleted) {
      //create container

      let dataWrapper = document.createElement("div");
      dataWrapper.classList.add("dataWrapper");

      container.appendChild(dataWrapper);

      let buttonContainer = document.createElement("div");
      buttonContainer.classList.add("buttonContainer");

      //create revive button
      let clickableReviveImage = document.createElement("img");
      clickableReviveImage.src = "/images/ressurect.png";
      clickableReviveImage.classList.add("deleteButton");
      clickableReviveImage.onclick = () => {
        console.log(i);
        reviveData(i);
        createDataBlocks();
      };
      buttonContainer.appendChild(clickableReviveImage);
      //create delete button
      let clickableDeleteImage = document.createElement("img");
      clickableDeleteImage.src = "/images/deleteImage.png";
      clickableDeleteImage.classList.add("deleteButton");
      clickableDeleteImage.onclick = () => {
        console.log(i);
        deleteData(i);
        createDataBlocks();
      };
      buttonContainer.appendChild(clickableDeleteImage);

      let wrapper = document.createElement("div");
      wrapper.classList.add("dataWrapperContainer");
      dataWrapper.appendChild(wrapper);
      dataWrapper.appendChild(buttonContainer);
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
          metaData.matchNumber +
          " | Position: " +
          metaData.teamPosition;
      } catch (e) {
        let errorDisplay = document.createElement("div");
        errorDisplay.classList.add("dataHolder");
        errorDisplay.style.fontSize = "larger";
        errorDisplay.style.backgroundColor = "red";

        wrapper.appendChild(errorDisplay);
        dataWrapper.style.backgroundColor = "red";
        errorDisplay.innerHTML = "ERROR: " + e;
      }
      //show autonomous results
      try {
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
          pieceInfo.innerHTML = "Result: " + piece.result;
        }

        if (auto.length == 0) {
          autoDisplay.innerHTML = "No Auto Data";
          autoDisplay.classList.remove("collapsible");
        }
      } catch (e) {
        let errorDisplay = document.createElement("div");
        errorDisplay.classList.add("dataHolder");
        errorDisplay.style.fontSize = "larger";
        errorDisplay.style.backgroundColor = "red";

        wrapper.appendChild(errorDisplay);
        dataWrapper.style.backgroundColor = "red";
        errorDisplay.innerHTML = "ERROR: " + e;
      }
      try {
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
      } catch (e) {
        let errorDisplay = document.createElement("div");
        errorDisplay.classList.add("dataHolder");
        errorDisplay.style.fontSize = "larger";
        errorDisplay.style.backgroundColor = "red";

        wrapper.appendChild(errorDisplay);
        dataWrapper.style.backgroundColor = "red";
        errorDisplay.innerHTML = "ERROR: " + e;
      }
      try {
        //show endgame data
        let endgame = parsedJSONOutput[i]["05endgame"];
        let endgameDisplay = document.createElement("div");
        endgameDisplay.classList.add("dataHolder");
        wrapper.appendChild(endgameDisplay);
        endgameDisplay.innerHTML = "Endgame: " + endgame[0]?.name || "none";
      } catch (e) {
        let errorDisplay = document.createElement("div");
        errorDisplay.classList.add("dataHolder");
        errorDisplay.style.fontSize = "larger";
        errorDisplay.style.backgroundColor = "red";

        wrapper.appendChild(errorDisplay);
        dataWrapper.style.backgroundColor = "red";
        errorDisplay.innerHTML = "ERROR: " + e;
      }
      try {
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
      } catch (e) {
        let errorDisplay = document.createElement("div");
        errorDisplay.classList.add("dataHolder");
        errorDisplay.style.fontSize = "larger";
        errorDisplay.style.backgroundColor = "red";

        wrapper.appendChild(errorDisplay);
        dataWrapper.style.backgroundColor = "red";
        errorDisplay.innerHTML = "ERROR: " + e;
      }
      //show comments
      try {
        let extra = parsedJSONOutput[i]["06extra"];
        let commentDisplay = document.createElement("div");
        commentDisplay.classList.add("dataHolder");
        wrapper.appendChild(commentDisplay);
        commentDisplay.innerHTML = "Comment : " + extra.Comments;

        createCollapsibleElements();
      } catch (e) {
        let errorDisplay = document.createElement("div");
        errorDisplay.classList.add("dataHolder");
        errorDisplay.style.fontSize = "larger";
        errorDisplay.style.backgroundColor = "red";

        wrapper.appendChild(errorDisplay);
        dataWrapper.style.backgroundColor = "red";
        errorDisplay.innerHTML = "ERROR: " + e;
      }
    }
  }
}
async function reviveData(index) {
  const input = [];
  input.push(index);
  if (confirm("Are you sure you want to bring back this data?")) {
    let response = await fetch("../resurrectData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (response.status == 200) {
      alert("Match Removed");
    } else {
      alert("Error!");
    }
  }
}
async function deleteData(index) {
  const input = [];
  input.push(index);
  if (confirm("Are you sure you want to PERMANENTLY DELETE this data?")) {
    let response = await fetch("../deleteData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });
    if (response.status == 200) {
      alert("Match Removed");
    } else {
      alert("Error!");
    }
  }
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
