// File: /api/funny.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Safe: use Vercel Environment Variable
});

export default async function handler(req, res) {
  try {
    const mood = "funny";
    const prompt = `Generate one very short and creative ${mood} pickup line or joke.`;

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
      
      feedback: "Laugh and flirt 😂",
    }, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({
      success: false,
      error: "AI failed to generate funny line",
      details: err.message,
      provider: "Casper AI Pickup API",
    }, null, 2));
  }
      }
