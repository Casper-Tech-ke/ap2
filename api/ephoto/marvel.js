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
      res.setHeader("Content-Type", "application/json");
      return res
        .status(405)
        .send(
          JSON.stringify(
            {
              success: false,
              error: "Only GET and POST methods allowed",
              required: ["text1", "text2"],
              provider: "CASPER TECH",
            },
            null,
            2
          )
        );
    }

    // Validate required params
    const missingParams = [];
    if (!text1) missingParams.push("text1");
    if (!text2) missingParams.push("text2");

    if (missingParams.length > 0) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .send(
          JSON.stringify(
            {
              success: false,
              error: "Missing required parameters",
              missing: missingParams,
              required: ["text1", "text2"],
              provider: "CASPER TECH",
            },
            null,
            2
          )
        );
    }

    // Effect URL (Marvel Example)
    const effectUrl =
      "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html";

    console.log(`Processing Marvel effect with text1: "${text1}", text2: "${text2}"`);

    // Step 1: Load page
    const effectResponse = await fetch(effectUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!effectResponse.ok) {
      throw new Error(`Failed to fetch effect page: ${effectResponse.statusText}`);
    }

    const effectHtml = await effectResponse.text();
    const $ = cheerio.load(effectHtml);

    // Step 2: Extract form
    const form = $("#form_effect, form").first();
    if (form.length === 0) throw new Error("Form not found on the page");

    const formData = new URLSearchParams();

    form.find('input[type="hidden"]').each((i, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      if (name && value !== undefined) formData.append(name, value);
    });

    const textInputs = [];
    form.find('input[type="text"], input[name*="text"], textarea').each((i, el) => {
      const name = $(el).attr("name");
      if (name) textInputs.push(name);
    });

    if (textInputs.length < 2) {
      throw new Error("Marvel form did not expose 2 text inputs");
    }

    formData.append(textInputs[0], text1);
    formData.append(textInputs[1], text2);

    const submitUrl =
      form.attr("action")?.startsWith("http")
        ? form.attr("action")
        : `https://en.ephoto360.com${form.attr("action")}`;

    // Step 3: Submit form
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

    // Step 4: Extract generated image
    let generatedImage = null;
    const selectors = [
      "img.img-responsive",
      "img[src*='upload']",
      "img[src*='result']",
      "img[src*='temp']",
      ".thumbnail img",
      ".result-image img",
      "#form_value img",
    ];

    for (const selector of selectors) {
      const imgElement = $result(selector).first();
      if (imgElement.length > 0) {
        const src = imgElement.attr("src");
        if (src) {
          generatedImage = src.startsWith("http")
            ? src
            : `https://en.ephoto360.com${src}`;
          break;
        }
      }
    }

    if (!generatedImage) throw new Error("Generated image not found");

    // Step 5: Respond pretty JSON
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(
      JSON.stringify(
        {
          success: true,
          provider: "CASPER TECH",
          data: {
            effect: "Marvel Logo Style",
            inputs: { text1, text2 },
            result: generatedImage,
          },
          feedback: "Marvel text effect created successfully! 🚀 CASPER IS ALIVE 🥰",
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Marvel effect error:", err.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: "Failed to create Marvel text effect",
          details: err.message,
          required: ["text1", "text2"],
          provider: "CASPER TECH",
        },
        null,
        2
      )
    );
  }
}
