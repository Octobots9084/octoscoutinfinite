import { getPitJSONConfig } from "/util.js";
let JSONConfig = await getPitJSONConfig();
let options = JSONConfig.questions;
for (let i = 0; i++; i < options.length) {
  let label = document.createElement();
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
