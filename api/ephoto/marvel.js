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
              required: ["text1"],
              optional: ["text2"],
              provider: "CASPER TECH",
            },
            null,
            2
          )
        );
    }

    // Validate required params - only text1 is required for Deadpool effect
    if (!text1) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .send(
          JSON.stringify(
            {
              success: false,
              error: "Missing required parameter: text1",
              required: ["text1"],
              optional: ["text2"],
              provider: "CASPER TECH",
            },
            null,
            2
          )
        );
    }

    // Effect URL (Deadpool Effect)
    const effectUrl =
      "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html";

    console.log(`Processing Deadpool effect with text1: "${text1}"${text2 ? `, text2: "${text2}"` : ''}`);

    // Step 1: Load page
    const effectResponse = await fetch(effectUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!effectResponse.ok) {
      throw new Error(`Failed to fetch effect page: ${effectResponse.statusText}`);
    }

    const effectHtml = await effectResponse.text();
    const $ = cheerio.load(effectHtml);

    // Step 2: Extract form - try multiple selectors
    let form = $("#form_effect").first();
    if (form.length === 0) {
      form = $("form").first();
    }
    if (form.length === 0) {
      form = $("form[action*='create'], form[action*='go']").first();
    }
    
    if (form.length === 0) {
      throw new Error("Form not found on the page");
    }

    const formData = new URLSearchParams();

    // Add all hidden inputs
    form.find('input[type="hidden"]').each((i, el) => {
      const name = $(el).attr("name");
      const value = $(el).attr("value");
      if (name && value !== undefined) {
        formData.append(name, value);
      }
    });

    // Find text inputs with more flexible selectors
    const textInputs = [];
    const textSelectors = [
      'input[type="text"]',
      'input[name*="text"]', 
      'input[name*="word"]',
      'input[name*="name"]',
      'textarea',
      'input[placeholder*="text"]',
      'input[placeholder*="word"]',
      'input[placeholder*="name"]'
    ];

    textSelectors.forEach(selector => {
      form.find(selector).each((i, el) => {
        const name = $(el).attr("name");
        if (name && !textInputs.includes(name)) {
          textInputs.push(name);
        }
      });
    });

    console.log(`Found ${textInputs.length} text inputs:`, textInputs);

    // Handle different numbers of text inputs
    if (textInputs.length === 0) {
      throw new Error("No text inputs found in the form");
    } else if (textInputs.length === 1) {
      // Single input - use text1
      formData.append(textInputs[0], text1);
      console.log(`Using single input: ${textInputs[0]} = "${text1}"`);
    } else if (textInputs.length >= 2) {
      // Multiple inputs - use both text1 and text2 if available
      formData.append(textInputs[0], text1);
      formData.append(textInputs[1], text2 || text1); // Use text1 as fallback for text2
      console.log(`Using multiple inputs: ${textInputs[0]} = "${text1}", ${textInputs[1]} = "${text2 || text1}"`);
    }

    // Get submit URL
    let submitUrl = form.attr("action");
    if (!submitUrl) {
      // Try to find submit button and check if it has a formaction
      const submitBtn = form.find('input[type="submit"], button[type="submit"]').first();
      submitUrl = submitBtn.attr("formaction") || "/go";
    }
    
    if (!submitUrl.startsWith("http")) {
      submitUrl = `https://en.ephoto360.com${submitUrl}`;
    }

    console.log(`Submitting to: ${submitUrl}`);
    console.log(`Form data:`, Object.fromEntries(formData));

    // Step 3: Submit form
    const submitResponse = await fetch(submitUrl, {
      method: "POST",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": effectUrl,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Origin": "https://en.ephoto360.com",
      },
      body: formData,
      redirect: 'follow'
    });

    if (!submitResponse.ok) {
      throw new Error(`Form submission failed: ${submitResponse.statusText}`);
    }

    const resultHtml = await submitResponse.text();
    const $result = cheerio.load(resultHtml);

    // Step 4: Extract generated image with more selectors
    let generatedImage = null;
    const selectors = [
      "img.img-responsive",
      "img[src*='upload']",
      "img[src*='result']",
      "img[src*='temp']",
      "img[src*='effect']",
      ".thumbnail img",
      ".result-image img",
      "#form_value img",
      ".effect-result img",
      "img[alt*='result']",
      "img[alt*='effect']",
      ".download-image",
      "a[href*='download'] img",
      "img[src*='gen']"
    ];

    for (const selector of selectors) {
      const imgElement = $result(selector).first();
      if (imgElement.length > 0) {
        let src = imgElement.attr("src");
        if (!src) {
          // Try data-src for lazy loaded images
          src = imgElement.attr("data-src");
        }
        if (src && !src.includes('placeholder') && !src.includes('loading')) {
          generatedImage = src.startsWith("http")
            ? src
            : `https://en.ephoto360.com${src}`;
          console.log(`Found image with selector "${selector}": ${generatedImage}`);
          break;
        }
      }
    }

    // Alternative: Look for download links
    if (!generatedImage) {
      const downloadLink = $result('a[href*="download"], a[href*="temp"], a[href*="result"]').first();
      if (downloadLink.length > 0) {
        const href = downloadLink.attr("href");
        if (href) {
          generatedImage = href.startsWith("http") ? href : `https://en.ephoto360.com${href}`;
          console.log(`Found download link: ${generatedImage}`);
        }
      }
    }

    if (!generatedImage) {
      console.log("=== DEBUG: No result image found ===");
      console.log("Available images in result page:");
      $result("img").each((i, el) => {
        const src = $result(el).attr("src") || $result(el).attr("data-src");
        const alt = $result(el).attr("alt");
        const className = $result(el).attr("class");
        console.log(`  ${i}: src="${src}", alt="${alt}", class="${className}"`);
      });
      
      console.log("Available input fields:");
      $result("input").each((i, el) => {
        const name = $result(el).attr("name");
        const value = $result(el).attr("value");
        const type = $result(el).attr("type");
        if (value && value.includes('ephoto360.com')) {
          console.log(`  ${i}: name="${name}", type="${type}", value="${value}"`);
        }
      });
      
      throw new Error("Generated image not found in result page. Check debug output above.");
    }

    // Step 5: Respond with pretty JSON
    res.setHeader("Content-Type", "application/json");
    return res.status(200).send(
      JSON.stringify(
        {
          success: true,
          provider: "CASPER TECH",
          data: {
            effect: "Deadpool Logo Style",
            inputs: { 
              text1, 
              ...(text2 && { text2 })
            },
            result: generatedImage,
            debug: {
              textInputsFound: textInputs.length,
              textInputNames: textInputs,
              submitUrl
            }
          },
          feedback: "Deadpool text effect created successfully! 🚀 CASPER IS ALIVE 🥰",
        },
        null,
        2
      )
    );
  } catch (err) {
    console.error("Deadpool effect error:", err.message);
    res.setHeader("Content-Type", "application/json");
    return res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: "Failed to create Deadpool text effect",
          details: err.message,
          required: ["text1", "text2"],
          note: "text1 = large text, text2 = small text",
          provider: "CASPER TECH",
        },
        null,
        2
      )
    );
  }
}
