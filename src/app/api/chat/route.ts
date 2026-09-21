import { createChatPrompt, type ChatInputMode } from "@/lib/chat-prompt";
import type { ChatContext } from "@/lib/chat-context";
export const runtime = "nodejs";
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "openai/gpt-oss-120b";
type ChatMessage = { role: "user" | "assistant"; content: string };
export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return new Response("Chat is unavailable.", { status: 503 });
  let body: { messages?: ChatMessage[]; inputMode?: ChatInputMode; context?: ChatContext };
  try { body = await request.json(); } catch { return new Response("Invalid request.", { status: 400 }); }
  const messages = Array.isArray(body.messages) ? body.messages.filter((m): m is ChatMessage => Boolean(m) && (m.role === "user" || m.role === "assistant") && typeof m.content === "string").slice(-20) : [];
  if (!messages.length) return new Response("A message is required.", { status: 400 });
  let upstream: Response;
  try { upstream = await fetch(GROQ_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` }, body: JSON.stringify({ model: GROQ_MODEL, stream: true, messages: [{ role: "system", content: createChatPrompt(body.context, body.inputMode === "voice" ? "voice" : "text") }, ...messages] }), signal: request.signal }); }
  catch (error) { console.error("Groq chat request failed", error); return new Response("The chat service is temporarily unavailable.", { status: 502 }); }
  if (!upstream.ok || !upstream.body) { console.error("Groq chat request failed", { status: upstream.status, detail: (await upstream.text()).slice(0, 500) }); return new Response(upstream.status === 429 ? "The assistant is busy. Please try again in a moment." : "The chat service is temporarily unavailable.", { status: upstream.status || 502 }); }
  const reader = upstream.body.getReader(), decoder = new TextDecoder(), encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({ async start(controller) { let buffer = ""; try { while (true) { const { done, value } = await reader.read(); if (done) break; buffer += decoder.decode(value, { stream: true }); const lines = buffer.split("\n"); buffer = lines.pop() ?? ""; for (const raw of lines) { const data = raw.trim().replace(/^data:\s*/, ""); if (!data || data === "[DONE]") continue; try { const json: unknown = JSON.parse(data); const content = typeof json === "object" && json !== null ? (json as { choices?: Array<{ delta?: { content?: unknown } }> }).choices?.[0]?.delta?.content : undefined; if (typeof content === "string") controller.enqueue(encoder.encode(content)); } catch { /* ignore malformed SSE */ } } } controller.close(); } catch (error) { controller.error(error); } } });
  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache", "X-Accel-Buffering": "no", "X-Content-Type-Options": "nosniff" } });
}
