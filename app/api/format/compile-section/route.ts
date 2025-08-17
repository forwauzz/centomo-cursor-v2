import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'

// Mock OpenAI for now - we'll add the real implementation later
const mockOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => {
        // Mock compilation - in production this would call OpenAI
        const { messages } = params
        const userMessage = messages.find((m: any) => m.role === 'user')?.content || ''
        
        // Simple mock compilation that combines sections
        const sections = userMessage.split('\n\n---\n\n')
        if (sections.length >= 3) {
          const mainNarrative = sections[0].replace('Main Narrative:', '').trim()
          const radiologyReport = sections[1].replace('Radiology Report:', '').trim()
          const transcript = sections[2].replace('Voice Transcript:', '').trim()
          
          let compiledDocument = ''
          
          if (mainNarrative) {
            compiledDocument += `HISTORIQUE DE FAITS ET ÉVOLUTION\n\n${mainNarrative}\n\n`
          }
          
          if (radiologyReport) {
            compiledDocument += `RAPPORT RADIOLOGIQUE\n\n${radiologyReport}\n\n`
          }
          
          if (transcript) {
            compiledDocument += `TRANSCRIPTION VOCALE\n\n${transcript}\n\n`
          }
          
          return {
            choices: [{
              message: {
                content: compiledDocument.trim()
              }
            }]
          }
        }
        
        return {
          choices: [{
            message: {
              content: userMessage
            }
          }]
        }
      }
    }
  }
}

const systemPrompt = `Tu es un assistant médical expert qui compile les sections de rapports médicaux selon les standards professionnels québécois pour les lésions professionnelles CNESST.

INSTRUCTIONS DE COMPILATION:
- Combine les sections fournies en un document final cohérent
- Maintiens la structure et la terminologie médicale exacte
- Assure une transition fluide entre les sections
- Respecte les standards de formatage CNESST
- Préserve toutes les informations médicales importantes

STRUCTURE REQUISE:
1. HISTORIQUE DE FAITS ET ÉVOLUTION (si disponible)
2. RAPPORT RADIOLOGIQUE (si disponible)  
3. TRANSCRIPTION VOCALE (si disponible)

FORMATAGE:
- Utilise des titres de section clairs
- Ajoute des sauts de ligne appropriés
- Maintiens la cohérence terminologique
- Préserve les citations exactes

Réponds uniquement avec le document compilé, sans explications.`

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized - No auth header' }, { status: 401 })
    }

    // Extract the token from the Authorization header
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized - No token' }, { status: 401 })
    }

    // Verify the user is authenticated using the token
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { mainNarrative, radiologyReport, transcript, language = 'fr-CA' } = body

    if (!mainNarrative && !radiologyReport && !transcript) {
      return NextResponse.json(
        { error: 'At least one section must be provided' },
        { status: 400 }
      )
    }

    // Compile document using mock OpenAI
    const compiledDocument = await compileDocumentWithAI(mainNarrative, radiologyReport, transcript, language)

    return NextResponse.json({
      success: true,
      compiledDocument: compiledDocument,
      language: language,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Compile section API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function compileDocumentWithAI(
  mainNarrative: string, 
  radiologyReport: string, 
  transcript: string, 
  language: string
): Promise<string> {
  try {
    // Prepare sections for compilation
    const sections = []
    
    if (mainNarrative?.trim()) {
      sections.push(`Main Narrative:\n${mainNarrative}`)
    }
    
    if (radiologyReport?.trim()) {
      sections.push(`Radiology Report:\n${radiologyReport}`)
    }
    
    if (transcript?.trim()) {
      sections.push(`Voice Transcript:\n${transcript}`)
    }
    
    const combinedSections = sections.join('\n\n---\n\n')
    
    const response = await mockOpenAI.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Compile les sections suivantes en un document final:\n\n${combinedSections}`
        }
      ],
      temperature: 0.3,
      max_tokens: 4000,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })

    const compiledText = response.choices[0]?.message?.content?.trim()
    
    if (!compiledText) {
      throw new Error('No response from AI')
    }

    return compiledText

  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to compile document with AI')
  }
}
