import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { image, analyses, customPrompt } = await request.json()
    
    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Handle multi-timeframe analysis
    if (analyses && analyses.length === 3) {
      const combinedPrompt = `You are a professional forex trader analyzing 3 timeframes.

1H: ${analyses[0]}
15M: ${analyses[1]}
5M: ${analyses[2]}

Provide trade recommendation with 1:2 minimum R:R.

Format:
TRADE: YES/NO
PAIR: [pair]
DIRECTION: LONG/SHORT
ENTRY: [price]
STOP_LOSS: [price]
TAKE_PROFIT: [price]
RISK_REWARD: 1:[ratio]
CONFIDENCE: LOW/MEDIUM/HIGH
REASONING:
- [reasons]

If R:R < 1:2, say NO TRADE.`

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [{ role: 'user', content: combinedPrompt }]
        })
      })
      
      const data = await response.json()
      if (!response.ok) {
        return NextResponse.json({ error: data.error?.message || 'Failed' }, { status: response.status })
      }
      
      return NextResponse.json({ recommendation: data.content?.[0]?.text || 'Failed' })
    }

    // Handle single image analysis (existing functionality)
    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    let mediaType = 'image/jpeg'
    if (image.startsWith('data:image/png')) mediaType = 'image/png'
    else if (image.startsWith('data:image/webp')) mediaType = 'image/webp'

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
              source: { type: 'base64', media_type: mediaType, data: image.split(',')[1] }
            },
            {
              type: 'text',
              text: customPrompt || `Analyze this trading chart. Extract: instrument, entry/exit prices, direction, timeframe, key levels, pattern type.`
            }
          ]
        }]
      })
    })
    
    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'Analysis failed' }, { status: response.status })
    }
    
    return NextResponse.json({ analysis: data.content?.[0]?.text || 'Could not analyze' })
    
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
