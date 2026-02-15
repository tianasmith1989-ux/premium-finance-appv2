import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { system, messages } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { reply: 'AI Coach not configured yet. Add ANTHROPIC_API_KEY to your environment variables to enable the trading coach.' },
        { status: 200 }
      )
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages,
      }),
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json(
        { reply: 'Coach error: ' + (data.error.message || 'Unknown error. Check your API key.') },
        { status: 200 }
      )
    }

    const reply = data.content?.map((c: any) => c.text || '').join('') || 'No response received.'

    return NextResponse.json({ reply })
  } catch (error: any) {
    return NextResponse.json(
      { reply: 'Connection error: ' + (error.message || 'Please try again.') },
      { status: 200 }
    )
  }
}
