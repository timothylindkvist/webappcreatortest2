import { NextRequest } from 'next/server'

// Make sure you set OPENAI_API_KEY in Vercel dashboard
const OPENAI_API_KEY = process.env.OPENAI_API_KEY as string

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',   // you wanted GPT-5
        messages,
        stream: false,    // set to true if you want streaming
      }),
    })

    if (!resp.ok) {
      const err = await resp.text()
      return new Response(JSON.stringify({ error: err }), { status: 500 })
    }

    const data = await resp.json()
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
