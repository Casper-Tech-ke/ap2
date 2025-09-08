import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // Fetch the image directly from ZenQuotes
    const response = await fetch("https://zenquotes.io/api/image");

    if (!response.ok) {
      throw new Error(`ZenQuotes returned ${response.status}`);
    }

    // Get image buffer
    const buffer = await response.arrayBuffer();

    // Set correct headers
    res.setHeader("Content-Type", "image/jpeg"); // ZenQuotes serves JPG
    res.setHeader("Cache-Control", "no-store");  // always fresh image

    // Send the raw image
    res.send(Buffer.from(buffer));
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to load inspirational image",
      details: err.message
    });
  }
}
