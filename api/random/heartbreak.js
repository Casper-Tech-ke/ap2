// File: /api/heartbreak.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use Vercel Environment Variable
});

export default async function handler(req, res) {
  try {
    const mood = "heartbreak";
    const prompt = `Generate one very short and creative ${mood} pickup line or sad love quote.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const pickup = completion.choices[0].message.content.trim();

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({
      success: true,
      provider: "CASPER TECH",
      
      pickup,
            feedback: "Heartfelt vibes 💔",
    }, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({
      success: false,
      error: "AI failed to generate heartbreak line",
      details: err.message,
      provider: "Casper AI Pickup API",
    }, null, 2));
  }
}
