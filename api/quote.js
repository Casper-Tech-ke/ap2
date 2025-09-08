import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://zenquotes.io/api/random");
    const data = await response.json();

    const quoteData = data[0];

    const customResponse = {
      success: true,
      provider: "CASPER TECH",
      timestamp: new Date().toISOString(),
      quote: {
        text: quoteData.q,
        author: quoteData.a,
      },
      feedback: "Stay inspired 💙 Great things are coming! REMEMBER CASPER IS ALIVE 🤢"
    };

    // ✅ Pretty print JSON (indentation = 2 spaces)
    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(customResponse, null, 2));
  } catch (err) {
    res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: "Failed to fetch quote",
          details: err.message
        },
        null,
        2
      )
    );
  }
}
