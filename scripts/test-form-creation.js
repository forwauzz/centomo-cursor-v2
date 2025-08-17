const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFormCreation() {
  try {
    console.log('🧪 Testing form creation...')
    
    // First, check if we have any users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1)
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      return
    }
    
    if (!users || users.length === 0) {
      console.log('⚠️  No users found in database')
      return
    }
    
    const testUser = users[0]
    console.log(`👤 Using test user: ${testUser.email} (${testUser.role})`)
    
    // Check if we have form templates
    const { data: templates, error: templatesError } = await supabase
      .from('form_templates')
      .select('id, template_name, is_default')
    
    if (templatesError) {
      console.error('❌ Error fetching templates:', templatesError)
    } else {
      console.log(`📋 Found ${templates?.length || 0} form templates`)
      if (templates && templates.length > 0) {
        templates.forEach(t => console.log(`  - ${t.template_name} (default: ${t.is_default})`))
      }
    }
    
    // Try to create a test form
    const testFormData = {
      user_id: testUser.id,
      patient_name: 'Test Patient',
      patient_id: 'TEST001',
      form_type: 'cnesst',
      status: 'draft'
    }
    
    console.log('📝 Creating test form...')
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert(testFormData)
      .select()
      .single()
    
    if (formError) {
      console.error('❌ Error creating form:', formError)
      return
    }
    
    console.log('✅ Form created successfully!')
    console.log(`   Form ID: ${form.id}`)
    console.log(`   Patient: ${form.patient_name}`)
    console.log(`   Status: ${form.status}`)
    
    // Clean up - delete the test form
    const { error: deleteError } = await supabase
      .from('forms')
      .delete()
      .eq('id', form.id)
    
    if (deleteError) {
      console.warn('⚠️  Could not clean up test form:', deleteError)
    } else {
      console.log('🧹 Test form cleaned up')
    }
    
    console.log('🎉 Form creation test completed successfully!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testFormCreation()
