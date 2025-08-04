// src/lib/sendMessageStream.ts
import { Language, Role } from "../types";

export async function sendMessageStream(payload: {
  text: string;
  history: Message[];
  language: Language;
  generateName: boolean;
}, onToken: (token: string) => void): Promise<string> {
  const res = await fetch("/api/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let finalChatName = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split("\n\n");
    buf = parts.pop()!;

    for (const part of parts) {
      if (part.startsWith("event: done")) {
        // the line after "event: done" is "data: {\"chatName\":\"…\"}"
        const dataLine = part.split("\n").find(l => l.startsWith("data:"));
        if (dataLine) {
          const { chatName } = JSON.parse(dataLine.slice(6));
          finalChatName = chatName;
        }
        continue;
      }
      if (!part.startsWith("data:")) continue;
      const chunk = JSON.parse(part.slice(6));
      if (chunk.text) onToken(chunk.text);
    }
  }

  return finalChatName;
}
