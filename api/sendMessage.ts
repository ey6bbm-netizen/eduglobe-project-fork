import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS, Language, Role } from "./constants.server.js";
import { Role } from "./constants.server.js";

export const config = { runtime: "edge" };

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
    return new Response("Method Not Allowed", { status: 405 });
  }

  const {text, history = [], language, conversationName, generateName} = await req.json();
  
  const messages = [
    ...history,
    { role: Role.USER, text, language }
  ];


  // 1️⃣ Pre-translate history
  const translatedHistory = [
    {
      role: "system",
      parts: [{ text: SYSTEM_PROMPTS[language] }],
    },
    ...await Promise.all(messages.map(async (m: any) => ({
      role: m.role === Role.USER ? "user" : "model",
      parts: [{ 
        text: m.role === Role.USER 
          ? await translateText(m.text, Language.ENGLISH) 
          : m.text 
      }]
    })))
  ];

  // 2️⃣ Optionally generate a chat title up front
  let chatName = conversationName;
  if (!conversationName && generateName && messages.filter(m => m.role === Role.USER).length === 1) {
    chatName = await generateChatName(messages[0].text, language);
  }

  // 3️⃣ Prepare streaming headers
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Kick off the streaming LLM call
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const llmStream = await model.generateContentStream({
          history: translatedHistory,
          text: messages[messages.length - 1].text,
        });

        // As each chunk arrives, optionally translate it back
        for await (const chunk of llmStream) {
          let text = chunk.text ?? "";
          // If you want to translate each fragment into the user's language:
          text = await translateText(text, language);

          const payload = { ...chunk, text, chatName: null };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
        }

        // When done, send a final “done” event that includes the chatName
        controller.enqueue(encoder.encode(
          `event: done\ndata: ${JSON.stringify({ chatName })}\n\n`
        ));
        controller.close();
      } catch (err: any) {
        controller.enqueue(encoder.encode(
          `data: ${JSON.stringify({ error: err.message })}\n\n`
        ));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    }
  });
}

// Client-side consumption \\ dummy edit, can revert

async function sendMessageSSE(payload) {
  const res = await fetch("/api/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop()!;

    for (const part of parts) {
      if (part.startsWith("event: done")) {
        const data = JSON.parse(part.replace(/.*\n/, ""));
        onChatName(data.chatName);
        continue;
      }
      if (!part.startsWith("data:")) continue;
      const chunk = JSON.parse(part.slice(6));
      onNewToken(chunk.text);
    }
  }
}
