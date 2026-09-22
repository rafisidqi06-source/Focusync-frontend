const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

/**
 * Calls the Focusync backend (FastAPI + LangChain + Groq) for an AI reply.
 * Throws on network/server error so the caller can fall back gracefully.
 */
export async function fetchAiReply(message, history) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      history: history.map((m) => ({ role: m.role, text: m.text })),
    }),
  })

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status}`)
  }

  const data = await res.json()
  return data.reply
}
