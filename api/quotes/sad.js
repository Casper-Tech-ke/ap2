import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const response = await fetch("https://zenquotes.io/api/quotes/sadness");
    const data = await response.json();

    const randomQuote = data[Math.floor(Math.random() * data.length)];

    const customResponse = {
      success: true,
      provider: "CASPER TECH",
      
      quote: {
        text: randomQuote.q,
        author: randomQuote.a,
        
      },
      feedback: "It’s okay to feel sad 💔, better days are REMEMBER CASPER IS ALIVE 😭"
    };

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify(customResponse, null, 2));
  } catch (err) {
    res.status(500).send(
      JSON.stringify(
        {
          success: false,
          error: "Failed to fetch sad quote",
          details: err.message
        },
        null,
        2
      )
    );
  }
}
