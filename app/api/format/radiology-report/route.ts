import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'

// Mock OpenAI for now - we'll add the real implementation later
const mockOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => {
        // Mock radiology report formatting - in production this would call OpenAI
        const { messages } = params
        const userMessage = messages.find((m: any) => m.role === 'user')?.content || ''
        
        // Simple mock formatting for radiology reports
        let formattedText = userMessage
        
        // Ensure proper medical terminology
        formattedText = formattedText.replace(/\b(patient|patiente)\b/gi, 'travailleur')
        
        // Add standard radiology report structure
        if (!formattedText.includes('RAPPORT RADIOLOGIQUE')) {
          formattedText = `RAPPORT RADIOLOGIQUE\n\n${formattedText}`
        }
        
        // Ensure proper punctuation and spacing
        formattedText = formattedText.replace(/([.!?])\s*([A-Z])/g, '$1\n\n$2')
        
        return {
          choices: [{
            message: {
              content: formattedText
            }
          }]
        }
      }
    }
  }
}

const systemPrompt = `Tu es un assistant médical expert qui formate les rapports radiologiques selon les standards professionnels québécois pour les lésions professionnelles CNESST.

INSTRUCTIONS SPÉCIALISÉES POUR RAPPORTS RADIOLOGIQUES:
- Formate le texte brut fourni selon le style de rapport radiologique standard
- Utilise EXCLUSIVEMENT "Le travailleur" ou "La travailleuse" (jamais "Le patient")
- Maintiens la terminologie radiologique exacte et technique
- Préserve TOUS les détails techniques et mesures
- Structure en sections claires: Technique, Résultats, Conclusion
- Utilise la terminologie médicale québécoise appropriée

ÉLÉMENTS CRITIQUES À PRÉSERVER:
- Tous les détails techniques d'imagerie
- Mesures exactes et dimensions
- Terminologie anatomique précise
- Conclusions radiologiques
- Recommandations médicales
- Dates et heures d'examen

FORMATAGE REQUIS:
- Titre: "RAPPORT RADIOLOGIQUE"
- Sections: Technique, Résultats, Conclusion
- Terminologie: travailleur/travailleuse
- Structure claire avec sauts de ligne appropriés

Réponds uniquement avec le rapport formaté, sans explications.`

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
    const { text, language = 'fr-CA' } = body

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Format text using mock OpenAI
    const formattedText = await formatRadiologyReportWithAI(text, language)

    return NextResponse.json({
      success: true,
      originalText: text,
      formattedText: formattedText,
      language: language,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Radiology report format API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function formatRadiologyReportWithAI(text: string, language: string): Promise<string> {
  try {
    const response = await mockOpenAI.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: `Formate le rapport radiologique suivant selon les standards CNESST québécois:\n\n${text}`
        }
      ],
      temperature: 0.2, // Lower temperature for more consistent formatting
      max_tokens: 4000,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    })

    const formattedText = response.choices[0]?.message?.content?.trim()
    
    if (!formattedText) {
      throw new Error('No response from AI')
    }

    return formattedText

  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to format radiology report with AI')
  }
}
