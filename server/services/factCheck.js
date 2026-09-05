// Calls Google's Gemini API to fact-check a post's content and returns a structured verdict.
// This runs AFTER the post is already saved, so it must never block the request.
export async function runFactCheck(title, content) {
  const prompt = `You are a fact-checking assistant. Evaluate the following claim for factual accuracy.

Title: ${title}
Content: ${content}

Respond with ONLY a JSON object in this exact shape, no other text, no markdown formatting:
{
  "status": "verified" | "disputed" | "unverified",
  "confidence": 0.0 to 1.0,
  "reasoning": "one or two sentence explanation",
  "sources": ["short description of source 1", "short description of source 2"]
}`;

  const model = "gemini-3.6-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(
      `Fact-check API call failed: ${response.status} ${errText}`,
    );
  }

  const data = await response.json();
  const rawText = data.candidates[0].content.parts[0].text;
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  return JSON.parse(cleaned);
}
