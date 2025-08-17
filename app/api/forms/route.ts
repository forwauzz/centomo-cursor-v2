import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-admin'
import { Database } from '@/lib/database-schema'

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const formId = searchParams.get('formId')
    const section = searchParams.get('section')

    if (!formId) {
      return NextResponse.json({ error: 'FormId parameter required' }, { status: 400 })
    }

    // Verify the form belongs to the user
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, user_id')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // If section is specified, return section data
    if (section) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('form_sections')
        .select('section_data, completed')
        .eq('form_id', formId)
        .eq('section_name', section)
        .single()

      if (sectionError && sectionError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching section data:', sectionError)
        return NextResponse.json({ error: 'Failed to fetch section data' }, { status: 500 })
      }

      return NextResponse.json({ 
        sectionData: sectionData?.section_data || null,
        completed: sectionData?.completed || false
      })
    }

    // Return all sections for the form
    const { data: sections, error: sectionsError } = await supabase
      .from('form_sections')
      .select('section_name, section_data, completed, updated_at')
      .eq('form_id', formId)
      .order('section_name')

    if (sectionsError) {
      console.error('Error fetching sections:', sectionsError)
      return NextResponse.json({ error: 'Failed to fetch form sections' }, { status: 500 })
    }

    return NextResponse.json({ sections })
  } catch (error) {
    console.error('Forms GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
    const { formId, section, sectionData, completed = false } = body

    if (!formId || !section || !sectionData) {
      return NextResponse.json({ error: 'FormId, section, and sectionData required' }, { status: 400 })
    }

    // Verify the form belongs to the user
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id, user_id')
      .eq('id', formId)
      .eq('user_id', user.id)
      .single()

    if (formError || !form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 })
    }

    // Check if section already exists
    const { data: existingSection } = await supabase
      .from('form_sections')
      .select('id')
      .eq('form_id', formId)
      .eq('section_name', section)
      .single()

    const sectionRecord = {
      form_id: formId,
      section_name: section,
      section_data: sectionData,
      completed,
      updated_at: new Date().toISOString()
    }

    let result
    if (existingSection) {
      // Update existing section
      const { data, error } = await supabase
        .from('form_sections')
        .update(sectionRecord)
        .eq('id', existingSection.id)
        .select()
        .single()

      if (error) {
        console.error('Error updating section:', error)
        return NextResponse.json({ error: 'Failed to update section' }, { status: 500 })
      }
      result = data
    } else {
      // Create new section
      const { data, error } = await supabase
        .from('form_sections')
        .insert(sectionRecord)
        .select()
        .single()

      if (error) {
        console.error('Error creating section:', error)
        return NextResponse.json({ error: 'Failed to create section' }, { status: 500 })
      }
      result = data
    }

    // Update form status to in-progress
    const { error: formUpdateError } = await supabase
      .from('forms')
      .update({ 
        status: 'in-progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', formId)

    if (formUpdateError) {
      console.warn('Failed to update form status:', formUpdateError)
    }

    return NextResponse.json({ section: result })
  } catch (error) {
    console.error('Forms POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
