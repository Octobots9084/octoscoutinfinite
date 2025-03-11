import { getJSONOutput } from "/util.js";
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
function createDataBlocks() {
  let container = document.getElementById("dataContainer");

  for (let i = 0; i < parsedJSONOutput.length; i++) {
    //create container
    console.log(parsedJSONOutput[i]);
    let wrapper = document.createElement("div");
    wrapper.classList.add("dataWrapper");
    container.appendChild(wrapper);
    //show important data
  }
}
function createCollapsibleElements() {
  var coll = document.getElementsByClassName("collapsible");
  var i;

  for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var content = this.nextElementSibling;
      if (content.style.display === "block") {
        content.style.display = "none";
      } else {
        content.style.display = "block";
      }
    });
  }
}
createDataBlocks();
