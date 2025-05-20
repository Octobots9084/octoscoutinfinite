import { getPitJSONConfig } from "/util.js";
let JSONConfig = await getPitJSONConfig();
let options = JSONConfig.questions;
let questionContainer = document.getElementById("customQuestions");
for (let i = 0; i < options.length; i++) {
  let name=options[i].name;
  let smolName = options[i].name.split(" ").join("_");
  let type= options[i].type;
  
  let label = document.createElement("label");
  label.innerHTML = name;  
  label.setAttribute("for", smolName);
  questionContainer.appendChild(label);
  
  let input = document.createElement("input");
  if(type=="text"){
    input.setAttribute("type", "text");  
  }
  if(type=="boolean"){
    input.setAttribute("type", "checkbox");
  }
  
  input.id = smolName;
  questionContainer.appendChild(input);
}
let form = document.getElementById("pitForm");
form.addEventListener("submit", function (event) {
  event.preventDefault();
  console.log("yipee");
  uploadData();
});
async function uploadData() {
  const fileInput = document.getElementById("imageInput");
  const file = fileInput.files[0];
  let name = "9084";

  if (!file) {
    alert("Please select an image.");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);
  if (name) formData.append("filename", name);

  const response = await fetch("/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log(result);
}
