-- Create default CNESST form template
-- Run this script in your Supabase SQL editor

-- Insert default CNESST template
INSERT INTO form_templates (
  template_name,
  section_type,
  template_data,
  is_default,
  created_by
) VALUES (
  'CNESST Default',
  'cnesst_medical_report',
  '{
    "sections": [
      {
        "name": "section7",
        "title": "Physical Examination",
        "description": "Comprehensive physical examination findings",
        "fields": [
          "general_appearance",
          "vital_signs",
          "cardiovascular",
          "respiratory",
          "musculoskeletal",
          "neurological",
          "other_findings"
        ]
      },
      {
        "name": "section8",
        "title": "Subjective Assessment",
        "description": "Patient-reported symptoms and complaints",
        "fields": [
          "chief_complaint",
          "history_present_illness",
          "past_medical_history",
          "medications",
          "allergies"
        ]
      },
      {
        "name": "section11",
        "title": "Medical Conclusions",
        "description": "Diagnostic conclusions and recommendations",
        "fields": [
          "diagnosis",
          "prognosis",
          "treatment_plan",
          "work_restrictions",
          "follow_up"
        ]
      }
    ],
    "metadata": {
      "version": "1.0",
      "created": "2024-01-01",
      "description": "Default CNESST medical report template"
    }
  }',
  true,
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1)
) ON CONFLICT (template_name) DO NOTHING;

-- If no admin user exists, create the template without created_by
INSERT INTO form_templates (
  template_name,
  section_type,
  template_data,
  is_default
) 
SELECT 
  'CNESST Default',
  'cnesst_medical_report',
  '{
    "sections": [
      {
        "name": "section7",
        "title": "Physical Examination",
        "description": "Comprehensive physical examination findings",
        "fields": [
          "general_appearance",
          "vital_signs",
          "cardiovascular",
          "respiratory",
          "musculoskeletal",
          "neurological",
          "other_findings"
        ]
      },
      {
        "name": "section8",
        "title": "Subjective Assessment",
        "description": "Patient-reported symptoms and complaints",
        "fields": [
          "chief_complaint",
          "history_present_illness",
          "past_medical_history",
          "medications",
          "allergies"
        ]
      },
      {
        "name": "section11",
        "title": "Medical Conclusions",
        "description": "Diagnostic conclusions and recommendations",
        "fields": [
          "diagnosis",
          "prognosis",
          "treatment_plan",
          "work_restrictions",
          "follow_up"
        ]
      }
    ],
    "metadata": {
      "version": "1.0",
      "created": "2024-01-01",
      "description": "Default CNESST medical report template"
    }
  }',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM form_templates WHERE template_name = 'CNESST Default'
) AND NOT EXISTS (
  SELECT 1 FROM users WHERE role = 'admin'
);
