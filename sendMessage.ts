import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS, Language, Role } from "./constants.server.js";

// Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Language mapping
const getLanguageCode = (lang: string): string => {
  const codes: Record<string, string> = {
    [Language.ENGLISH]: "en",
    [Language.TIBETAN]: "bo",
    [Language.HAWAIIAN]: "haw",
    [Language.TELUGU]: "te",
  };
  return codes[lang as keyof typeof codes] || "en";
};

// Translate text to target language using REST
const translateText = async (
  text: string,
  targetLang: string
): Promise<string> => {
  const target = getLanguageCode(targetLang);
  if (target === "en") return text;

  const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_KEY}`;
  console.log("📡 Calling Translate API with target:", target);

  try {
    console.log("→ Translating:", text, "to", target);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, target, format: "text" }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Translation API error:", res.status, errText);
      return text;
    }

    const json = await res.json();
    console.log("✅ Translate API response:", JSON.stringify(json));

    return json?.data?.translations?.[0]?.translatedText || text;
  } catch (err) {
    console.error("❌ Translation error:", err);
    return text;
  }
};

// Generate short conversation title
const generateChatName = async (
  firstMessage: string,
  lang: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Summarize this user query into a short, 3-5 word chat title. Reply in "${lang}": "${firstMessage}"`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();
    return text.replace(/["'.]/g, "");
  } catch (err) {
    console.error("⚠️ Error generating chat name:", err);
    return firstMessage.slice(0, 30) + "...";
  }
};

// ------ ONLY CHANGES BELOW: Express-style handler & body parsing ------

// Route handler (Express-style for Vercel Node serverless)
export default async function handler(req: any, res: any) {
  
  // --- CORS (minimal) ---
  res.setHeader("Access-Control-Allow-Origin", "*"); // or set to your site origin
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end(); // preflight OK, no body
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res
      .status(500)
      .json({ error: "GEMINI_API_KEY is not configured" });
  }

  try {
    // ⬇⬇⬇ CHANGED: use Express-parsed body instead of await req.json()
    const body: {
      messages: { role: string; text: string; language: string }[];
      language: string;
      conversationName?: string;
    } = req.body;

    const { messages, language, conversationName } = body;
    console.log("📥 Incoming request with messages:", messages);

    if (!Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid or missing 'messages' array in request body" });
    }
    
    const userMessages = messages.filter(
      (m: { role: string }) => m.role === Role.USER
    );
    const lastUserMessage = userMessages[userMessages.length - 1]?.text ?? "";
    console.log("🧠 Last user message:", lastUserMessage);

    const systemPrompt = SYSTEM_PROMPTS[language] || "";

    const translatedMessages = await Promise.all(
      messages.map(async (msg, idx) => {
        // For the very first user message, prepend the system prompt
        if (idx === 0 && msg.role === Role.USER) {
          const translatedText = await translateText(msg.text, Language.ENGLISH);
          return {
            role: "user",
            parts: [{ text: systemPrompt + "\n\n" + translatedText }],
          };
        }
        const translatedText =
          msg.role === Role.USER
            ? await translateText(msg.text, Language.ENGLISH)
            : msg.text;
        return {
          role: msg.role === Role.USER ? "user" : "model",
          parts: [{ text: translatedText }],
        };
      })
    );
    console.log("📜 Translated message history:", translatedMessages);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({ history: translatedMessages });

    const result = await chat.sendMessage([{ text: lastUserMessage }]);
    const englishResponse = await result.response.text();
    const translatedResponse = await translateText(englishResponse, language);

    const aiMessage = {
      id: Date.now().toString(),
      role: Role.AI,
      text: translatedResponse,
      language,
    };

    let title = conversationName;
    if (!conversationName && userMessages.length === 1) {
      title = await generateChatName(lastUserMessage, language);
    }

    console.log("✅ Final AI message:", aiMessage);

    // ⬇⬇⬇ CHANGED: Express-style response
    return res
      .status(200)
      .json({ message: aiMessage, conversationName: title });
  } catch (err) {
    console.error("🔥 Internal server error:", err);
    // ⬇⬇⬇ CHANGED: Express-style error response
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
