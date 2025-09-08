import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://api.quotable.io/random");
    const data = await response.json();

    const customResponse = {
      success: true,
      provider: "CASPER TECH",
      timestamp: new Date().toISOString(),
      quote: {
        text: data.content,
        author: data.author,
        length: data.length,
        category: data.tags?.[0] || "general",
      },
      feedback: "Stay strong 💙 Your journey matters.",
    };

    res.status(200).json(customResponse);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch quote",
      details: err.message,
    });
  }
}
