import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'

// Mock OpenAI for now - we'll add the real implementation later
const mockOpenAI = {
  chat: {
    completions: {
      create: async (params: any) => {
        // Mock AI formatting - in production this would call OpenAI
        const { messages } = params
        const userMessage = messages.find((m: any) => m.role === 'user')?.content || ''
        
        // Simple mock formatting based on the French CNESST standards
        let formattedText = userMessage
        
        // Replace "patient" with "travailleur"
        formattedText = formattedText.replace(/\b(le|la)\s+patient(e)?\b/gi, (match) => {
          return match.toLowerCase().includes('la') ? 'la travailleuse' : 'le travailleur'
        })
        
        // Ensure dates come after the action
        formattedText = formattedText.replace(/(Le|La)\s+(\d{1,2}\s+\w+\s+\d{4}),\s+(le|la)\s+travailleur(e)?/gi, 
          (match, article, date, worker) => {
            return `${article} travailleur${worker === 'e' ? 'e' : ''} consulte le docteur, ${date}`
          }
        )
        
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

const SECTION_7_SAMPLE = `
Le travailleur consulte le docteur Nicolas Bussière, le 23 octobre 2022. Le docteur Bussière, chirurgien orthopédiste, diagnostique une tendinite du supra-épineux droit avec élongation musculaire du trapèze. Il prescrit de la physiothérapie et recommande des exercices de renforcement.

Le travailleur revoit le docteur Marc Boudreau, le 5 novembre 2022. Le docteur Boudreau, physiatre, confirme le diagnostic et ajoute une déchirure partielle du grand pectoral droit. Il recommande une infiltration cortisonée et poursuit la physiothérapie.

Le travailleur obtient un rendez-vous avec le docteur Lalavie, le 19 novembre 2022. Le docteur Lalavie, radiologiste, effectue une IRM de l'épaule droite qui révèle une bursite sous-acromiale avec tendinopathie du supra-épineux. La condition est stable avec amélioration progressive.
`

const systemPrompt = `Tu es un assistant médical expert qui formate les textes de rapports médicaux selon les standards professionnels québécois pour les lésions professionnelles CNESST.

INSTRUCTIONS SPÉCIALISÉES:
- Formate le texte brut fourni selon le style de la Section 7 "Historique de faits et évolution"
- Utilise EXCLUSIVEMENT "Le travailleur" ou "La travailleuse" (jamais "Le patient")
- STRUCTURE OBLIGATOIRE: Commence chaque entrée par "Le travailleur/La travailleuse [ACTION]" puis ajoute la date
- Format: "Le travailleur consulte le docteur [Nom], le [date]." (PAS "Le [date], le travailleur...")
- CRITÈRE OBLIGATOIRE: JAMAIS commencer par une date - TOUJOURS commencer par "Le travailleur"
- Préserve TOUTE la terminologie médicale spécialisée
- Maintiens les citations exactes entre guillemets « ... »
- Structure en paragraphes par consultation/procédure

ÉLÉMENTS CRITIQUES À PRÉSERVER:
- Descriptions d'événements entre guillemets exactes
- Noms complets des médecins avec titre "docteur"
- Spécialités complètes (chirurgien orthopédiste, physiatre, radiologiste, etc.)
- Diagnostics médicaux précis avec terminologie exacte
- Résultats d'examens avec conclusions complètes
- Évolution clinique (améliorée, stable, détériorée)
- Tous les traitements et procédures
- Infiltrations et examens d'imagerie

VARIATION OBLIGATOIRE - ÉVITE LA RÉPÉTITION MÉCANIQUE:
- VARIE les verbes de consultation: "consulte", "rencontre", "revoit", "obtient un rendez-vous avec", "se présente chez"
- ALTERNE les structures de phrases pour créer un flow naturel
- STRUCTURE TRAVAILLEUR-PREMIÈRE: TOUJOURS "Le travailleur [verbe] le docteur [Nom], le [date]"
- JAMAIS "Le [date], le travailleur..." - TOUJOURS "Le travailleur [action], le [date]"
- INTERDICTION ABSOLUE: Ne jamais commencer une phrase par "Le 23 octobre 2022," ou toute autre date
- ÉVITE absolument de répéter la même formulation dans un même document
- ADAPTE le vocabulaire selon le contexte (première consultation = "consulte", suivi = "revoit")

GESTION DES DONNÉES MANQUANTES:
- Si un nom de médecin est incomplet ou manquant, utilise "médecin traitant", "professionnel de la santé" ou "médecin de famille"
- Si des détails sont flous, concentre-toi sur les éléments clairs et vérifiables
- N'invente JAMAIS d'information qui n'est pas explicitement dans le texte source
- Pour les noms partiels, utilise le fragment disponible avec le titre approprié

TERMINOLOGIE SPÉCIALISÉE QUÉBÉCOISE:
- Lésions: tendinite, élongation musculaire, déchirure partielle, entorse cervicale, plexopathie brachiale
- Anatomie: supra-épineux, trapèze, grand pectoral, rachis cervical, plexus brachial, C5-C7
- Examens: IRM, échographie, radiographie, arthro-IRM, EMG, doppler veineux
- Traitements: physiothérapie, ergothérapie, acupuncture, infiltration cortisonée
- Évolution: condition améliorée/stable/détériorée, plateau thérapeutique, consolidation avec séquelles

EXEMPLES DE FORMAT AUTHENTIQUE:
${SECTION_7_SAMPLE}

EXEMPLE DÉTAILLÉ DE STRUCTURE OBLIGATOIRE:
INCORRECT: "Le 23 octobre 2022, le travailleur consulte le docteur Nicolas Bussière."
CORRECT: "Le travailleur consulte le docteur Nicolas Bussière, le 23 octobre 2022."

INCORRECT: "Le 5 novembre 2022, le travailleur rencontre le docteur Marc Boudreau."
CORRECT: "Le travailleur rencontre le docteur Marc Boudreau, le 5 novembre 2022."

INCORRECT: "Le 19 novembre 2022, le travailleur consulte le docteur Lalavie."
CORRECT: "Le travailleur consulte le docteur Lalavie, le 19 novembre 2022."

STRUCTURE ABSOLUMENT REQUISE: "Le travailleur [ACTION] le docteur [NOM], le [DATE]."

Réponds uniquement avec le texte formaté selon ces standards stricts, sans explications.`

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
    const formattedText = await formatTextWithAI(text, language)

    return NextResponse.json({
      success: true,
      originalText: text,
      formattedText: formattedText,
      language: language,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI format API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function formatTextWithAI(text: string, language: string): Promise<string> {
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
          content: `Formate le texte suivant selon les standards CNESST québécois:\n\n${text}`
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent formatting
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
    throw new Error('Failed to format text with AI')
  }
}
