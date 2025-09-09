// File: /api/condolences.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use Vercel Environment Variable
});

export default async function handler(req, res) {
  try {
    const mood = "condolences";
    const prompt = `Generate one short, heartfelt, and comforting condolence message suitable for expressing sympathy.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const line = completion.choices[0].message.content.trim();

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({
      success: true,
      provider: "CASPER TECH ",
      
      line,
      
      feedback: "Sending heartfelt sympathy 💐",
    }, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({
      success: false,
      error: "AI failed to generate condolences line",
      details: err.message,
      provider: "Casper AI Condolences API",
    }, null, 2));
  }
      }
