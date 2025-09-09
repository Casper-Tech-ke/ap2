import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { method, query, body } = req;

    // Support GET and POST
    let text1, text2;
    if (method === "GET") {
      text1 = query.text1;
      text2 = query.text2;
    } else if (method === "POST") {
      text1 = body.text1;
      text2 = body.text2;
    } else {
      return res.status(405).json({
        success: false,
        error: "Only GET and POST methods allowed",
        required: ["text1", "text2"],
        provider: "CASPER TECH",
      });
    }

    // Validate required params
    const missingParams = [];
    if (!text1) missingParams.push("text1");
    if (!text2) missingParams.push("text2");

    if (missingParams.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters",
        missing: missingParams,
        required: ["text1", "text2"],
        provider: "CASPER TECH",
      });
    }

    // Effect URL
    const effectUrl =
      "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html";

    console.log(`Processing Deadpool effect with text1: "${text1}", text2: "${text2}"`);

    // Fetch effect page
    const effectResponse = await fetch(effectUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!effectResponse.ok) {
      throw new Error(`Failed to fetch effect page: ${effectResponse.statusText}`);
    }

    const effectHtml = await effectResponse.text();
    const $ = cheerio.load(effectHtml);

    // Extract form
    const form = $("#form_effect, form").first();
    if (form.length === 0) throw new Error("Form not found on the page");

    // Collect form data
    const formData = new URLSearchParams();
    form.find('input[type="hidden"]').each((i, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      if (name && value !== undefined) {
        formData.append(name, value);
      }
    });

    const textInputs = [];
    form.find('input[type="text"], input[name*="text"], textarea').each((i, el) => {
      const name = $(el).attr("name");
      if (name) textInputs.push(name);
    });

    // Append our text1 and text2
    formData.append(textInputs[0], text1);
    formData.append(textInputs[1], text2);

    // Submit form
    const submitUrl =
      form.attr("action")?.startsWith("http")
        ? form.attr("action")
        : `https://en.ephoto360.com${form.attr("action")}`;

    const submitResponse = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: effectUrl,
      },
      body: formData,
    });

    const resultHtml = await submitResponse.text();
    const $result = cheerio.load(resultHtml);

    // Extract result image
    let generatedImage = null;
    $result("img").each((i, el) => {
      const src = $result(el).attr("src");
      if (src && src.includes("upload")) {
        generatedImage = src.startsWith("http") ? src : `https://en.ephoto360.com${src}`;
      }
    });

    if (!generatedImage) {
      throw new Error("Generated image not found");
    }

    // Success response
    return res.status(200).json({
      success: true,
      provider: "CASPER TECH",
      data: {
        effect: "Deadpool Logo Style",
        inputs: { text1, text2 },
        result: generatedImage,
      },
      feedback: "Deadpool text effect created successfully! 🔥 CASPER IS ALIVE 🥰",
    });
  } catch (err) {
    console.error("Deadpool effect error:", err.message);
    return res.status(500).json({
      success: false,
      error: "Failed to create Deadpool text effect",
      details: err.message,
      required: ["text1", "text2"],
      provider: "CASPER TECH",
    });
  }
}
