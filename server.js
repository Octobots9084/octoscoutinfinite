const express = require("express");
const multer = require("multer");
const path = require("path");
const app = express();
const fs = require("fs");
const fileLock = require("proper-lockfile");
const { json } = require("stream/consumers");
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.static("public"));

//check for upload location for robo images
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

//do some fancy stuff i dont really understand
const storage = multer.memoryStorage();
const upload = multer({ storage });

const retryOptions = {
  retries: {
    retries: 5,
    factor: 3,
    minTimeout: 1 * 1000,
    maxTimeout: 60 * 1000,
    randomize: true,
  },
};
app.post("/submitData", async (req, res) => {
  console.log(req.body);
  await writeDataToJSON(req.body);
  res.sendStatus(200);
});

app.post("/removeData", async (req, res) => {
  console.log(req.body);
  await removeDataFromJSON(req.body);
  res.sendStatus(200);
});
app.post("/resurrectData", async (req, res) => {
  console.log(req.body);
  await resurrectData(req.body);
  res.sendStatus(200);
});
app.post("/deleteData", async (req, res) => {
  console.log(req.body);
  await deleteDataFromJSON(req.body);
  res.sendStatus(200);
});
//image upload from pitScouting;
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const originalExt = path.extname(req.file.originalname); // Keep original extension
  let baseName = req.body.filename || path.parse(req.file.originalname).name;

  // Sanitize filename
  baseName = baseName.replace(/[^a-z0-9_\-]/gi, "_").toLowerCase();

  const finalName = `${baseName}${originalExt}`;
  const finalPath = path.join(uploadDir, finalName);

  fs.writeFile(finalPath, req.file.buffer, (err) => {
    if (err) return res.status(500).json({ error: "Failed to save file" });

    res.json({ message: `Image saved as ${finalName}` });
  });
});

app.get("/output.json", async (req, res) => {
  const filePath = "./output.json";
  let data;
  // Acquire lock
  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read the JSON file
    data = fs.readFileSync(filePath, "utf8");
    return release();
  });
  // Set headers to indicate JSON response
  res.setHeader("Content-Type", "application/json");
  // Send JSON data as response
  res.send(data);
});

app.get("/pitScout.json", async (req, res) => {
  const filePath = "./pitScout.json";
  let data;
  // Acquire lock
  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read the JSON file
    data = fs.readFileSync(filePath, "utf8");
    return release();
  });
  // Set headers to indicate JSON response
  res.setHeader("Content-Type", "application/json");
  // Send JSON data as response
  res.send(data);
});

async function removeDataFromJSON(index) {
  const filePath = "./output.json";
  await fileLock.lock(filePath, retryOptions).then((release) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    console.log(jsonData[index]);
    jsonData[index].deleted = true;

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data removed from output.json.");
    return release();
  });
}
async function deleteDataFromJSON(index) {
  const filePath = "./output.json";
  await fileLock.lock(filePath, retryOptions).then((release) => {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    console.log(jsonData[index]);
    jsonData.splice(index, 1);

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data removed from output.json.");
    return release();
  });
}
async function writeDataToJSON(data) {
  const filePath = "./output.json";
  data.timestamp = new Date();
  data.deleted = false;
  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read existing file content
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    jsonData.push(data);

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data appended to output.json.");
    return release();
  });
}

async function resurrectData(index) {
  const filePath = "./output.json";
  await fileLock.lock(filePath, retryOptions).then((release) => {
    // Read existing file content
    const fileContent = fs.readFileSync(filePath, "utf8");
    const jsonData = JSON.parse(fileContent || "[]");
    // Append new data
    jsonData[index].deleted = false;

    // Write updated data to file
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2));
    console.log("Data appended to output.json.");
    return release();
  });
}

const PORT = 9084;
app.listen(PORT, () => {
  console.log("App is listening on port 9084");
});
