// src/lib/sendMessageStream.ts
import { Language, Role } from "../types";

export async function sendMessageStream(
  { text, history, language, generateName }: Payload,
  onToken: (token: string) => void
): Promise<string> {
  const res = await fetch("/api/sendMessage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, history, language, generateName }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  for await (const chunk of llmStream) {
    // …
    const chunk = JSON.parse(part.slice(6));
    if (chunk.text) onToken(chunk.text);    // ← use the callback you passed in
  }
  const reader = res.body!.getReader();
  const textDecoder = new TextDecoder();
  let buffer = '';
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += textDecoder.decode(value, { stream: true });
    const parts = buffer.split('\n\n');
    buffer = parts.pop()!;
    for (const part of parts) {
      if (part.startsWith('data:')) {
        const chunk = JSON.parse(part.slice(6));
        if (chunk.text) onToken(chunk.text);
        continue;
      }
      if (part.startsWith('event: done')) {
        const dataLine = part.split('\n').find(l => l.startsWith('data:'))!;
        const { chatName } = JSON.parse(dataLine.slice(6));
        return chatName;
      }
    }
  }
  return '';
}
