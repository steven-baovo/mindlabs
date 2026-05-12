import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs'
import path from 'path'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { messages, skillId } = await req.json()
    
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ 
        error: 'Missing Google API Key. Please add GOOGLE_GENERATIVE_AI_API_KEY to your .env.local' 
      }, { status: 500 })
    }

    // 1. Load Global Rules and Skill Content
    let globalRule = ''
    let skillContext = ''
    
    try {
      const globalPath = path.join(process.cwd(), '.agents', 'GLOBAL_RULE.md')
      if (fs.existsSync(globalPath)) {
        globalRule = fs.readFileSync(globalPath, 'utf8')
      }
    } catch (err) {
      console.error('Error reading global rule:', err)
    }

    if (skillId) {
      try {
        const skillPath = path.join(process.cwd(), '.agents', 'skills', `${skillId}.md`)
        if (fs.existsSync(skillPath)) {
          skillContext = fs.readFileSync(skillPath, 'utf8')
        }
      } catch (err) {
        console.error('Error reading skill file:', err)
      }
    }

    // 2. Prepare the System Prompt
    const systemPrompt = `
      ${globalRule ? `GLOBAL RULES:\n${globalRule}` : ''}
      
      mindAI IDENTITY:
      You are mindAI, an advanced AI Agent integrated into the Mindlabs platform.
      
      ${skillContext ? `ACTIVE SKILL CONTEXT:\n${skillContext}` : 'No specific skill selected. Use general knowledge.'}
      
      INSTRUCTIONS:
      - Always respond in Vietnamese (unless the user asks otherwise).
      - Maintain a professional, expert, and helpful tone.
      - If the skill requires research, simulate a research process and provide high-quality, relevant results.
      - If you generate a plan, table, or detailed script, WRAP IT inside a code-like block using ":::artifact" and ":::" tags. 
      - Example:
        :::artifact
        | Day | Topic |
        | --- | --- |
        | Mon | Intro |
        :::
      - Everything outside these tags will be displayed in the chat bubble.
      - Keep the chat response friendly and concise. Put the heavy lifting inside the artifact.
    `

    // 3. Call Gemini with Google Search Tool
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      tools: [{ googleSearch: {} }] as any
    })
    
    // Format messages for Gemini
    const history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }))

    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 8192,
      },
    })

    // Prepend system prompt to the latest user message for context
    const latestMessage = messages[messages.length - 1].content
    const promptWithContext = `${systemPrompt}\n\nUSER REQUEST: ${latestMessage}`

    const result = await chat.sendMessage(promptWithContext)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ content: text })

  } catch (error: any) {
    console.error('MindAI API Error:', error)
    return NextResponse.json({ error: error.message || 'An error occurred during the AI request.' }, { status: 500 })
  }
}
