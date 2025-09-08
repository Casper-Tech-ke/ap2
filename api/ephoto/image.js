import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({ success: false, error: "Missing ?text= parameter" });
    }

    // Step 1: Load effect page
    const effectUrl = "https://en.ephoto360.com/create-neon-text-effect-online-433.html";
    const pageResponse = await fetch(effectUrl);
    const html = await pageResponse.text();

    // Step 2: Extract hidden values
    const $ = cheerio.load(html);
    const token = $('input[name="token"]').val();
    const build_server = $('input[name="build_server"]').val();
    const build_server_id = $('input[name="build_server_id"]').val();

    if (!token || !build_server_id) {
      throw new Error("Failed to scrape required form data");
    }

    // Step 3: Send POST request
    const formBody = new URLSearchParams({
      "text[]": text,
      token,
      build_server,
      build_server_id
    });

    const createResponse = await fetch("https://en.ephoto360.com/effect/create-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": pageResponse.headers.get("set-cookie") || "",
        "Referer": effectUrl,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36"
      },
      body: formBody.toString()
    });

    const result = await createResponse.json();

    if (!result.success || !result.image) {
      throw new Error("Ephoto360 failed to generate image");
    }

    const finalImage = build_server + result.image;

    res.status(200).json({
      success: true,
      provider: "Casper Ephoto360 API",
      effect: "Neon Text",
      text,
      image_url: finalImage
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}
