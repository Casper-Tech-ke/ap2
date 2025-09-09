// File: /api/chatbot.js
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Always use env variable
});

export default async function handler(req, res) {
  try {
    const { message, user = "Guest" } = req.body || {};

    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required",
        provider: "CASPER TECH",
      });
    }

    // Customize chatbot personality
    const systemPrompt = `
You are Casper AI, the official AI chatbot of Casper Tech, Developed by Traby Casper from kenya. 
Your responses should reflect a friendly, professional, and creative style. 
You know about Casper Tech products, developer tools, and casual tech conversations.
Always mention the company if relevant and maintain a helpful tone.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 250
    });

    const reply = completion.choices[0].message.content.trim();

    res.status(200).json({
      success: true,
      provider: "CASPER TECH",
      user,
      message: message,
      reply,
      
      feedback: "Casper AI at your service 🤖"
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "AI failed to generate response",
      details: err.message,
      provider: "CASPER TECH",
    });
  }
}
