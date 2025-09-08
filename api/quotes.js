import fetch from "node-fetch";

// Map friendly category names to ZenQuotes categories
const categoryMap = {
  love: "love",
  happy: "happiness",
  sad: "sadness",
  marriage: "love", // ZenQuotes doesn’t have "marriage", we reuse "love"
  heartbreak: "sadness"
};

export default async function handler(req, res) {
  try {
    const { category } = req.query;

    if (!categoryMap[category]) {
      return res.status(404).send(
        JSON.stringify(
          {
            success: false,
            error: "Category not found",
            availableCategories: Object.keys(categoryMap)
          },
          null,
          2
        )
      );
    }

    // Fetch quotes from ZenQuotes API
    const response = await fetch(
      `https://zenquotes.io/api/quotes/${categoryMap[category]}`
    );
    const data = await response.json();

    // Pick a random one from that category
    const randomQuote = data[Math.floor(Math.random() * data.length)];

    const customResponse = {
      success: true,
      provider: "Casper Quotes API (ZenQuotes)",
      category,
      timestamp: new Date().toISOString(),
      quote: {
        text: randomQuote.q,
        author: randomQuote.a,
        html: randomQuote.h,
        category
      },
      feedback: "Stay inspired 💙"
    };

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(customResponse, null, 2));
  } catch (err) {
    res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: "Failed to fetch quotes",
          details: err.message
        },
        null,
        2
      )
    );
  }
}
