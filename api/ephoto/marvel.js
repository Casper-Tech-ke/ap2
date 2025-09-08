import fetch from "node-fetch";
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    if (method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: "Only POST method allowed for text generation",
        provider: "CASPER TECH"
      });
    }

    const { text1, text2 } = req.body;

    // Validate inputs
    if (!text1) {
      return res.status(400).json({
        success: false,
        error: "text1 is required",
        provider: "CASPER TECH"
      });
    }

    const effectUrl = "https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html";

    console.log(`Processing Deadpool effect with text1: "${text1}", text2: "${text2 || 'N/A'}"`);

    // Step 1: Get the effect page to extract form data
    const effectResponse = await fetch(effectUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });

    if (!effectResponse.ok) {
      throw new Error(`Failed to fetch effect page: ${effectResponse.status} ${effectResponse.statusText}`);
    }

    const effectHtml = await effectResponse.text();
    const $ = cheerio.load(effectHtml);

    // Extract form data
    const form = $('#form_effect, form').first();
    if (form.length === 0) {
      throw new Error('Form not found on the page');
    }

    // Extract all form inputs
    const formData = new URLSearchParams();
    
    // Get hidden inputs
    form.find('input[type="hidden"]').each((i, el) => {
      const name = $(el).attr('name');
      const value = $(el).attr('value');
      if (name && value !== undefined) {
        formData.append(name, value);
        console.log(`Hidden input: ${name} = ${value}`);
      }
    });

    // Find text input fields
    const textInputs = [];
    form.find('input[type="text"], input[name*="text"], textarea').each((i, el) => {
      const name = $(el).attr('name');
      const placeholder = $(el).attr('placeholder');
      if (name) {
        textInputs.push({ name, placeholder });
        console.log(`Text input found: ${name} (placeholder: ${placeholder})`);
      }
    });

    if (textInputs.length === 0) {
      throw new Error('No text input fields found on the form');
    }

    // Add text parameters to form data
    if (textInputs[0]) {
      formData.append(textInputs[0].name, text1);
    }
    if (textInputs[1] && text2) {
      formData.append(textInputs[1].name, text2);
    }

    // Get form action
    const formAction = form.attr('action') || '/effect';
    const submitUrl = formAction.startsWith('http') ? formAction : `https://en.ephoto360.com${formAction}`;

    console.log(`Submitting to: ${submitUrl}`);
    console.log(`Form data: ${formData.toString()}`);

    // Step 2: Submit the form
    const submitResponse = await fetch(submitUrl, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Referer': effectUrl,
        'Origin': 'https://en.ephoto360.com',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      body: formData
    });

    if (!submitResponse.ok) {
      throw new Error(`Form submission failed: ${submitResponse.status} ${submitResponse.statusText}`);
    }

    const resultHtml = await submitResponse.text();
    const $result = cheerio.load(resultHtml);

    // Step 3: Extract the generated image
    let generatedImage = null;
    let downloadUrl = null;

    // Try multiple selectors to find the result image
    const imageSelectors = [
      'img.img-responsive',
      '#imageResult img',
      '.result-image img',
      '.download-container img',
      'img[src*="temp"]',
      'img[src*="result"]',
      'img[src*="ephoto360.com/upload"]',
      '.image-result img'
    ];

    for (const selector of imageSelectors) {
      const imgElement = $result(selector);
      if (imgElement.length > 0) {
        const src = imgElement.attr('src');
        if (src && (src.includes('temp') || src.includes('result') || src.includes('upload'))) {
          generatedImage = src.startsWith('http') ? src : `https://en.ephoto360.com${src}`;
          console.log(`Found image with selector "${selector}": ${generatedImage}`);
          break;
        }
      }
    }

    // Look for download link
    const downloadSelectors = [
      'a[href*="download"]',
      '.download-btn',
      'a.btn-download',
      'a[download]'
    ];

    for (const selector of downloadSelectors) {
      const downloadElement = $result(selector);
      if (downloadElement.length > 0) {
        const href = downloadElement.attr('href');
        if (href) {
          downloadUrl = href.startsWith('http') ? href : `https://en.ephoto360.com${href}`;
          break;
        }
      }
    }

    // If we still don't have an image, log all images found for debugging
    if (!generatedImage) {
      const allImages = [];
      $result('img').each((i, el) => {
        const src = $result(el).attr('src');
        if (src) {
          allImages.push(src);
        }
      });
      console.log('All images found:', allImages);
      throw new Error(`Generated image not found. All images on page: ${allImages.join(', ')}`);
    }

    // Success response
    const customResponse = {
      success: true,
      provider: "CASPER TECH",
      data: {
        effect: {
          name: "Deadpool Logo Style",
          url: effectUrl
        },
        inputs: {
          text1: text1,
          text2: text2 || null,
          textInputsUsed: textInputs.length
        },
        result: {
          imageUrl: generatedImage,
          downloadUrl: downloadUrl
        },
        debug: {
          formAction: submitUrl,
          textInputsFound: textInputs.map(input => input.name),
          imageFound: !!generatedImage
        }
      },
      feedback: "Deadpool text effect created successfully! 🔥 CASPER IS ALIVE 🥰"
    };

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(customResponse);

  } catch (err) {
    console.error('Deadpool effect error:', err);
    
    res.status(500).json({
      success: false,
      error: "Failed to create Deadpool text effect",
      details: err.message,
      provider: "CASPER TECH",
      feedback: "Something went wrong with the Deadpool effect! 😞 CASPER IS STILL ALIVE 🥰"
    });
  }
}
