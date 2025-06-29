// Gemini API helper for Supabase Edge Functions (Deno)
// Usage: callGemini([...messages]) => string or parsed JSON

interface GeminiMessage {
  role: 'user' | 'system';
  content: string;
}

export async function callGemini(
  messages: GeminiMessage[],
  { parseJson = false }: { parseJson?: boolean } = {}
) {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) throw new Error('Missing GEMINI_API_KEY env var');

  const url =
    'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=' +
    apiKey;

  // Transform messages to Gemini format
  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini error: ${res.status} ${errText}`);
  }

  const json = await res.json();
  const text =
    json.candidates?.[0]?.content?.parts?.[0]?.text ??
    json.candidates?.[0]?.content?.text ??
    '';

  return parseJson ? JSON.parse(text) : text;
}

export const callGeminiApi = callGemini; 