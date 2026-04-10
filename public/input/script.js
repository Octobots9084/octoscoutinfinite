let queryString = window.location.search;
let urlParams = new URLSearchParams(queryString);
if (!urlParams.has("data")) {
  window.alert("No data found");
  window.location.href = "/";
}
let data = urlParams.get("data");
async function submitData() {
  try {
    // Step 1: URL-safe Base64 → standard Base64
    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");

    // Restore padding
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    // Step 2: Base64 → binary string
    const binaryString = atob(base64);

    // Step 3: binary string → Uint8Array
    const uint8Array = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i);
    }

    // Step 4: Decompress (gunzip)
    const decompressedStream = new Blob([uint8Array])
      .stream()
      .pipeThrough(new DecompressionStream("gzip"));

    const decompressedBuffer = await new Response(
      decompressedStream,
    ).arrayBuffer();

    // Step 5: Convert back to string
    const jsonString = new TextDecoder().decode(decompressedBuffer);

    // Step 6: Parse JSON
    data = JSON.parse(jsonString);

    console.log(data);
    let response = await fetch("../submitData", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.status == 200) {
      alert("Match Submitted");
    } else {
      alert("Error submitting data. Please try again.");
    }
    window.location.href = "/";
  } catch (e) {
    window.alert("Error: " + e);
    window.location.href = "/";
  }
}
submitData();
