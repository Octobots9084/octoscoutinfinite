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
