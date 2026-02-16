import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { system, messages, image } = await req.json()

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { reply: 'AI Coach not configured yet. Add ANTHROPIC_API_KEY to your environment variables to enable the trading coach.' },
        { status: 200 }
      )
    }

    // Build messages with image support
    const formattedMessages = messages.map((m: any, idx: number) => {
      // Check if this is the last user message and we have an image
      if (m.role === 'user' && image && idx === messages.length - 1) {
        const base64Match = image.match(/^data:image\/(\w+);base64,(.+)$/)
        if (base64Match) {
          const mediaType = `image/${base64Match[1]}` as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
          const base64Data = base64Match[2]
          return {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: m.content.replace(' [📸 Screenshot attached]', '') || 'Please analyse this chart setup. Does it match my trading strategy and rules? What do you see?',
              },
            ],
          }
        }
      }
      return { role: m.role, content: m.content }
    })

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
        messages: formattedMessages,
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
