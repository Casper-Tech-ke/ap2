// File: /api/congratulations.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Use Vercel Environment Variable
});

export default async function handler(req, res) {
  try {
    const mood = "congratulations";
    const prompt = `Generate one short, uplifting, and creative congratulations line suitable for celebrating achievements or good news.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const line = completion.choices[0].message.content.trim();

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({
      success: true,
      provider: "Casper AI Congratulations API",
      mood,
      line,
      timestamp: new Date().toISOString(),
      feedback: "Celebrate every win 🎉",
    }, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({
      success: false,
      error: "AI failed to generate congratulations line",
      details: err.message,
      provider: "Casper AI Congratulations API",
    }, null, 2));
  }
                                        }
  
