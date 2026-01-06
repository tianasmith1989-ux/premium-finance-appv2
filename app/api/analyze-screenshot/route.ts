import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json()
    
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Detect image type from base64 string
    let mediaType = 'image/jpeg'
    if (image.startsWith('data:image/png')) {
      mediaType = 'image/png'
    } else if (image.startsWith('data:image/jpg') || image.startsWith('data:image/jpeg')) {
      mediaType = 'image/jpeg'
    } else if (image.startsWith('data:image/webp')) {
      mediaType = 'image/webp'
    } else if (image.startsWith('data:image/gif')) {
      mediaType = 'image/gif'
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: image.split(',')[1]
              }
            },
            {
              type: 'text',
              text: `Analyze this trading chart screenshot. Extract:
1. Instrument/pair being traded
2. Entry price (if visible)
3. Exit price (if visible)  
4. Direction (long/short)
5. Timeframe
6. Key price levels
7. Pattern or setup type
8. Any other relevant trading details

Be specific and concise. Format as a list.`
            }
          ]
        }]
      })
    })
    
    const data = await response.json()
    
    if (!response.ok) {
      console.error('Anthropic API error:', data)
      return NextResponse.json({ 
        error: data.error?.message || 'Analysis failed' 
      }, { status: response.status })
    }
    
    const analysis = data.content?.[0]?.text || 'Could not analyze screenshot'
    return NextResponse.json({ analysis })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
