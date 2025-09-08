import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({ success: false, error: "Missing ?text= parameter" });
    }

    // Step 1: Load effect page (example: Neon Effect)
    const pageUrl = "https://en.ephoto360.com/create-neon-text-effect-online-433.html";
    const pageResponse = await fetch(pageUrl);
    const html = await pageResponse.text();

    // Step 2: Extract hidden values with Cheerio
    const $ = cheerio.load(html);
    const token = $('input[name="token"]').val();
    const build_server = $('input[name="build_server"]').val();
    const build_server_id = $('input[name="build_server_id"]').val();

    // Step 3: Send POST request to generate image
    const createResponse = await fetch("https://en.ephoto360.com/effect/create-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cookie": pageResponse.headers.get("set-cookie") // keep session
      },
      body: new URLSearchParams({
        "text[]": text,
        token,
        build_server,
        build_server_id
      })
    });

    const result = await createResponse.json();

    if (!result.success) {
      throw new Error("Ephoto360 failed to generate image");
    }

    // Step 4: Final image URL
    const finalImage = build_server + result.image;

    res.status(200).json({
      success: true,
      provider: "Casper Ephoto360 API",
      effect: "Neon Text",
      text,
      image_url: finalImage
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
