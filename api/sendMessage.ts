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

  const url = `https://translation.googleapis.com/language/translate/v2?key=${process.env.GEMINI_API_KEY}`;
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

// Route handler
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
      { status: 500 }
    );
  }

  try {
    const body: {
      messages: { role: string; text: string; language: string }[];
      language: string;
      conversationName?: string;
    } = await req.json();

    const { messages, language, conversationName } = body;
    console.log("📥 Incoming request with messages:", messages);

    const userMessages = messages.filter(
      (m: { role: string }) => m.role === Role.USER
    );
    const lastUserMessage = userMessages[userMessages.length - 1]?.text ?? "";
    console.log("🧠 Last user message:", lastUserMessage);

    const translatedMessages = [
      {
        role: "system",
        parts: [{ text: SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] }],
      },
      ...(await Promise.all(
        messages.map(async (msg: { role: string; text: string }) => {
          const translatedText = msg.role === Role.USER
            ? await translateText(msg.text, Language.ENGLISH)
            : msg.text;
          return {
            role: msg.role === Role.USER ? "user" : "model",
            parts: [{ text: translatedText }],
          };
        })
      )),
    ];

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

    return new Response(
      JSON.stringify({ message: aiMessage, conversationName: title }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("🔥 Internal server error:", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
