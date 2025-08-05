import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPTS, Language, Role } from "./constants.server.js";

export const config = { runtime: "edge" };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

/* ───────── helpers ───────── */
const getLanguageCode = (lang: string) =>
  ({ en: "en", bo: "bo", haw: "haw", te: "te" } as const)[lang as any] ?? "en";

const translateText = async (text: string, targetLang: string) => {
  const target = getLanguageCode(targetLang);
  if (target === "en") return text;
  const url =
    "https://translation.googleapis.com/language/translate/v2?key=" +
    process.env.GEMINI_API_KEY;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, target, format: "text" }),
  });
  if (!resp.ok) return text;
  const j = await resp.json();
  return j?.data?.translations?.[0]?.translatedText ?? text;
};
/* ─────────────────────────── */

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST")
    return new Response("Method Not Allowed", { status: 405 });

  const { text, history = [], language, conversationName, generateName } =
    await req.json();

  // 👇 ADD THIS 👇
  const messages = [...history, { role: Role.USER, text, language }];

  /* Build translated history */
  const baseHistory = [
    {
      role: "system",
      parts: [{ text: SYSTEM_PROMPTS[language as keyof typeof SYSTEM_PROMPTS] }],
    },
    ...(
      await Promise.all(
        [...history, { role: Role.USER, text, language }].map(async (m) => ({
          role: m.role === Role.USER ? "user" : "model",
          parts: [
            {
              text:
                m.role === Role.USER
                  ? await translateText(m.text, Language.ENGLISH)
                  : m.text,
            },
          ],
        }))
      )
    ),
  ];

  /* Prepare SSE stream */
  const encoder = new TextEncoder();
  /* ① rebuild translatedHistory */
  const translatedHistory = [
    { role: "system", parts: [{ text: SYSTEM_PROMPTS[language] }] },
    ...history.map(m => ({
      role: m.role === Role.USER ? "user" : "model",
      parts: [{ text: m.text }],
    })),
    // push the new user message last
    { role: "user", parts: [{ text }] },
  ];
  
  /* ② now build the ReadableStream that references it */
   const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
         /* get the streaming iterable safely */
          const result = await model.generateContentStream({
            history: translatedHistory,
            text: messages[messages.length - 1].text,
          });
          const llmStream: any = result.stream;
          console.log("result", result);
          console.log("llmStream", llmStream);
          
          if (!llmStream || typeof llmStream[Symbol.asyncIterator] !== "function") {
            throw new Error("llmStream is not iterable");
          }
          for await (const chunk of llmStream) {
            let out = chunk.text ?? "";
            out = await translateText(out, language);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: out })}\n\n`)
            );
          }
  
          /* final done frame (no optional title here) */
          controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
          controller.close();
        } catch (err: any) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
          );
          controller.close();
        }
      },
    });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
