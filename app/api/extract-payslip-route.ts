// app/api/extract-payslip/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { image, filename } = await req.json()
    
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Extract base64 data (remove data URL prefix if present)
    let base64Data = image
    let mediaType = 'image/jpeg'
    
    if (image.startsWith('data:')) {
      const matches = image.match(/^data:([^;]+);base64,(.+)$/)
      if (matches) {
        mediaType = matches[1]
        base64Data = matches[2]
      }
    }

    // Check if it's a PDF (we'll handle differently)
    const isPdf = mediaType === 'application/pdf' || filename?.toLowerCase().endsWith('.pdf')
    
    if (isPdf) {
      // For PDFs, we need to use document type
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
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: base64Data
                }
              },
              {
                type: 'text',
                text: `This is an Australian payslip. Please extract the following information and respond with ONLY a JSON object (no markdown):

{
  "employer": "Company/Organization name",
  "grossPay": "Gross pay amount as number",
  "netPay": "Net/take-home pay amount as number", 
  "frequency": "weekly OR fortnightly OR monthly (based on pay period)",
  "payDate": "YYYY-MM-DD format if visible, otherwise null",
  "superannuation": "Super contribution amount if visible, otherwise null"
}

Look for:
- Employer name at the top
- "Net Pay", "Take Home", "Net Amount" for net pay
- "Gross Pay", "Gross Earnings" for gross
- Pay period dates to determine frequency
- Payment date

Return ONLY the JSON object, no explanation.`
              }
            ]
          }]
        })
      })

      const data = await response.json()
      const responseText = data.content?.[0]?.text || ''
      
      try {
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const extracted = JSON.parse(cleaned)
        return NextResponse.json(extracted)
      } catch {
        return NextResponse.json({ 
          employer: '', 
          netPay: '', 
          frequency: 'fortnightly',
          payDate: new Date().toISOString().split('T')[0],
          raw: responseText 
        })
      }
    } else {
      // For images
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
                  data: base64Data
                }
              },
              {
                type: 'text',
                text: `This is an Australian payslip. Please extract the following information and respond with ONLY a JSON object (no markdown):

{
  "employer": "Company/Organization name",
  "grossPay": "Gross pay amount as number",
  "netPay": "Net/take-home pay amount as number", 
  "frequency": "weekly OR fortnightly OR monthly (based on pay period)",
  "payDate": "YYYY-MM-DD format if visible, otherwise null",
  "superannuation": "Super contribution amount if visible, otherwise null"
}

Look for:
- Employer name at the top
- "Net Pay", "Take Home", "Net Amount" for net pay
- "Gross Pay", "Gross Earnings" for gross
- Pay period dates to determine frequency
- Payment date

Return ONLY the JSON object, no explanation.`
              }
            ]
          }]
        })
      })

      const data = await response.json()
      const responseText = data.content?.[0]?.text || ''
      
      try {
        const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
        const extracted = JSON.parse(cleaned)
        return NextResponse.json(extracted)
      } catch {
        return NextResponse.json({ 
          employer: '', 
          netPay: '', 
          frequency: 'fortnightly',
          payDate: new Date().toISOString().split('T')[0],
          raw: responseText 
        })
      }
    }

  } catch (error) {
    console.error('Payslip extraction error:', error)
    return NextResponse.json({ error: 'Failed to process payslip' }, { status: 500 })
  }
}
