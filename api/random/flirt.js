import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "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",
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

    res.setHeader("Content-Type", "application/json");
    res.status(200).send(JSON.stringify({
      success: true,
      provider: "CASPER TECH",
      
      pickup,
      
      feedback: "Stay smooth 😉",
    }, null, 2));
  } catch (err) {
    res.status(500).send(JSON.stringify({
      success: false,
      error: "AI failed to generate pickup line",
      details: err.message,
      provider: "Casper AI Pickup API",
    }, null, 2));
  }
      }
