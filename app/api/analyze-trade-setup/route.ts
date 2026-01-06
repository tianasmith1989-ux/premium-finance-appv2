import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { analyses } = await request.json()
    
    if (!analyses || analyses.length !== 3) {
      return NextResponse.json({ error: 'Need 3 timeframe analyses' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const combinedPrompt = `You are a professional forex trader analyzing 3 timeframes for confluence.

1H CHART ANALYSIS: ${analyses[0]}

15M CHART ANALYSIS: ${analyses[1]}

5M CHART ANALYSIS: ${analyses[2]}

Based on this multi-timeframe analysis, provide a trade recommendation with MINIMUM 1:2 risk:reward ratio.

Format EXACTLY as follows:
TRADE: YES or NO
PAIR: [currency pair]
DIRECTION: LONG or SHORT
ENTRY: [entry price]
STOP_LOSS: [stop loss price]
TAKE_PROFIT: [take profit price]
RISK_PIPS: [risk in pips]
REWARD_PIPS: [reward in pips]
RISK_REWARD: 1:[ratio]
CONFIDENCE: LOW, MEDIUM, or HIGH
REASONING:
- [Key reason 1]
- [Key reason 2]
- [Key reason 3]

CRITICAL: If risk:reward is less than 1:2, set TRADE: NO and explain why.`

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
        messages: [{
          role: 'user',
          content: combinedPrompt
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
    
    const recommendation = data.content?.[0]?.text || 'Could not analyze trade setup'
    return NextResponse.json({ recommendation })
    
  } catch (error) {
    console.error('Analysis error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
