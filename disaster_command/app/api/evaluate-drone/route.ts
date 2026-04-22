import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPEN_API_KEY });

export async function POST(req: Request) {
  try {
    const drone = await req.json();

    const prompt = `
You are a drone maintenance AI system.

Analyze this drone data and return ONLY valid JSON with no markdown, no code fences, no extra text.

Drone Data:
${JSON.stringify(drone, null, 2)}

Rules:
- Score from 0 to 100
- Decide if drone is "pass" or "warn" based on overall health
- Dynamically generate 4 to 7 checklist items relevant to this specific drone's systems
  (e.g. battery reserve, flight controller, GPS lock, motor health, ESC status, compass calibration, firmware version, signal strength)
- Only include items that are relevant to the data provided
- Each item label should be concise (2-4 words)
- Please providing reasoning on why you provied this score and explain your choice

Return this exact JSON format with no other text:

{
  "status": "pass" | "warn",
  "score": number,
  "title": string,
  "summary": string,
  "reasoning": string, 
  "items": [
    { "label": string, "pass": boolean }
  ]
}
`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const text = response.choices[0]?.message?.content;
    if (!text) throw new Error("No valid response from AI");

    const parsed = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (err) {
    return NextResponse.json(
      { error: "Evaluation failed", details: String(err) },
      { status: 500 }
    );
  }
}