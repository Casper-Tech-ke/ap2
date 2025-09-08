import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();

    const quoteData = data[0];

    const customResponse = {
      success: true,
      provider: "Casper Random Quotes API (ZenQuotes)",
      timestamp: new Date().toISOString(),
      quote: {
        text: quoteData.q,
        author: quoteData.a,
        html: quoteData.h,
        category: "inspiration"
      },
      feedback: "Stay inspired 💙 Great things are coming!"
    };

    res.status(200).json(customResponse);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch quote",
      details: err.message
    });
  }
}
