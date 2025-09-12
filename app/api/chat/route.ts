import { NextRequest } from 'next/server'
import { convertToCoreMessages, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

// Uses your Vercel env var OPENAI_API_KEY
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: openai('gpt-5'),
      messages: convertToCoreMessages(messages),
    })

    // IMPORTANT: This returns an AI SDK DataStream that @ai-sdk/react/useChat expects
  return result.toTextStreamResponse()
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
