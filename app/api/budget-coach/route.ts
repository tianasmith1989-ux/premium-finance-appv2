import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { question, financialContext } = await request.json()
    
    if (!question || !financialContext) {
      return NextResponse.json({ error: 'Missing question or context' }, { status: 400 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const prompt = `${financialContext}

You are a professional financial advisor. Based on the user's actual financial data above, provide specific, actionable advice. Use their real numbers in your response. Be encouraging but honest. Keep responses concise and practical.

User's question: ${question}`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{
          role: 'user',
          content: prompt
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
    
    const advice = data.content?.[0]?.text || 'I apologize, but I could not generate advice.'
    return NextResponse.json({ advice })
    
  } catch (error) {
    console.error('Budget coach error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
