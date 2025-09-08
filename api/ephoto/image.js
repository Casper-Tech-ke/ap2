import fetch from "node-fetch";
import * as cheerio from "cheerio";
import FormData from "form-data";

export default async function handler(req, res) {
  try {
    const { method } = req;
    
    if (method !== 'GET' && method !== 'POST') {
      return res.status(405).json({
        success: false,
        error: "Method not allowed",
        provider: "CASPER TECH"
      });
    }

    // For GET: List available effects by category
    if (method === 'GET') {
      const { category = 'text-effects' } = req.query;
      
      let categoryUrl = '';
      switch(category) {
        case 'text-effects':
          categoryUrl = 'https://en.ephoto360.com/text-effects-c6';
          break;
        case '3d-effect':
          categoryUrl = 'https://en.ephoto360.com/3d-effect-c3';
          break;
        case 'love':
          categoryUrl = 'https://en.ephoto360.com/love-c7';
          break;
        case 'birthday':
          categoryUrl = 'https://en.ephoto360.com/happy-birthday-c8';
          break;
        case 'christmas':
          categoryUrl = 'https://en.ephoto360.com/merry-christmas-c1';
          break;
        default:
          categoryUrl = 'https://en.ephoto360.com/';
      }

      const response = await fetch(categoryUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);
      
      const effects = [];
      
      // Extract effects from the main grid
      $('.item').each((index, element) => {
        const $element = $(element);
        const $link = $element.find('a');
        const title = $link.attr('title') || $element.find('.name').text().trim();
        const href = $link.attr('href');
        const $img = $element.find('img');
        const thumbnail = $img.attr('data-src') || $img.attr('src');
        
        if (title && href) {
          effects.push({
            id: index + 1,
            title: title,
            url: href.startsWith('http') ? href : `https://en.ephoto360.com${href}`,
            thumbnail: thumbnail ? (thumbnail.startsWith('http') ? thumbnail : `https://en.ephoto360.com${thumbnail}`) : null,
            category: category
          });
        }
      });

      const customResponse = {
        success: true,
        provider: "CASPER TECH",
        data: {
          category: category,
          totalEffects: effects.length,
          effects: effects.slice(0, 24) // Limit to 24 effects
        },
        feedback: "Ephoto360 effects loaded successfully! 🎨 CASPER IS ALIVE 🥰"
      };

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(customResponse);
    }

    // For POST: Generate effect with text
    if (method === 'POST') {
      const { effectUrl, text1, text2 } = req.body;

      if (!effectUrl || !text1) {
        return res.status(400).json({
          success: false,
          error: "effectUrl and text1 are required",
          provider: "CASPER TECH"
        });
      }

      // Step 1: Get the effect page to understand the form structure
      const effectResponse = await fetch(effectUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });

      if (!effectResponse.ok) {
        throw new Error(`Failed to fetch effect page: ${effectResponse.status}`);
      }

      const effectHtml = await effectResponse.text();
      const $effect = cheerio.load(effectHtml);

      // Extract form information
      const form = $effect('form').first();
      const actionUrl = form.attr('action');
      
      // Look for form inputs
      const inputs = {};
      form.find('input[type="hidden"]').each((i, el) => {
        const name = $effect(el).attr('name');
        const value = $effect(el).attr('value');
        if (name && value) {
          inputs[name] = value;
        }
      });

      // Check if this is a text effect (has text inputs)
      const textInputs = [];
      $effect('input[type="text"], input[name*="text"]').each((i, el) => {
        const name = $effect(el).attr('name') || `text${i + 1}`;
        textInputs.push(name);
      });

      if (textInputs.length === 0) {
        return res.status(400).json({
          success: false,
          error: "This effect doesn't support text input",
          provider: "CASPER TECH"
        });
      }

      // Step 2: Submit the form
      const formData = new FormData();
      
      // Add hidden inputs
      Object.keys(inputs).forEach(key => {
        formData.append(key, inputs[key]);
      });
      
      // Add text inputs
      formData.append(textInputs[0], text1);
      if (textInputs[1] && text2) {
        formData.append(textInputs[1], text2);
      }

      const submitUrl = actionUrl ? 
        (actionUrl.startsWith('http') ? actionUrl : `https://en.ephoto360.com${actionUrl}`) :
        effectUrl;

      const submitResponse = await fetch(submitUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': effectUrl,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        }
      });

      const resultHtml = await submitResponse.text();
      const $result = cheerio.load(resultHtml);

      // Look for the generated image
      let generatedImage = null;
      
      // Try different selectors for the result image
      const imageSelectors = [
        'img.img-responsive',
        '.download img',
        '.result img',
        '#imageResult img',
        '.image-result img',
        'img[src*="ephoto360.com"]'
      ];

      for (const selector of imageSelectors) {
        const img = $result(selector).attr('src');
        if (img && (img.includes('ephoto360') || img.includes('temp') || img.includes('result'))) {
          generatedImage = img.startsWith('http') ? img : `https://en.ephoto360.com${img}`;
          break;
        }
      }

      // Look for download link
      const downloadLink = $result('a[href*="download"], .download-btn').attr('href');

      if (!generatedImage) {
        // Try to find any image that might be the result
        const allImages = [];
        $result('img').each((i, el) => {
          const src = $result(el).attr('src');
          if (src) allImages.push(src);
        });
        
        throw new Error(`Failed to generate or locate result image. Found images: ${allImages.join(', ')}`);
      }

      const customResponse = {
        success: true,
        provider: "CASPER TECH",
        data: {
          originalEffect: effectUrl,
          inputs: {
            text1,
            text2: text2 || null
          },
          result: {
            imageUrl: generatedImage,
            downloadUrl: downloadLink ? 
              (downloadLink.startsWith('http') ? downloadLink : `https://en.ephoto360.com${downloadLink}`) : 
              null
          },
          metadata: {
            textInputsFound: textInputs.length,
            hiddenInputs: Object.keys(inputs).length
          }
        },
        feedback: "Image generated successfully! 🎨 CASPER IS ALIVE 🥰"
      };

      res.setHeader("Content-Type", "application/json");
      return res.status(200).json(customResponse);
    }

  } catch (err) {
    console.error('Ephoto360 scraping error:', err);
    
    res.status(500).json({
      success: false,
      error: "Failed to process Ephoto360 request",
      details: err.message,
      provider: "CASPER TECH",
      feedback: "Something went wrong! 😞 CASPER IS STILL ALIVE 🥰"
    });
  }
}
