export async function runFactCheck(title, content) {
  console.log("[factCheck] starting for:", title);

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

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("[factCheck] sending request to Groq...");

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: [{ role: "user", content: prompt }],
        }),
        signal: controller.signal,
      },
    );

    console.log("[factCheck] got a response, status:", response.status);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(
        `Fact-check API call failed: ${response.status} ${errText}`,
      );
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content;
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    console.log("[factCheck] parsed successfully");
    return JSON.parse(cleaned);
  } finally {
    clearTimeout(timeoutId);
  }
}
