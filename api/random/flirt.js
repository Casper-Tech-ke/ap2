import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // 👈 safe
});

export default async function handler(req, res) {
  try {
    const mood = "flirty";
    const prompt = `Generate one very short and creative ${mood} pickup line.`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const pickup = completion.choices[0].message.content.trim();

    res.status(200).json({
      success: true,
      provider: "Casper AI Pickup API",
      mood,
      pickup,
      timestamp: new Date().toISOString(),
      feedback: "Stay smooth 😉",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "AI failed to generate pickup line",
      details: err.message,
      provider: "Casper AI Pickup API",
    });
  }
}
