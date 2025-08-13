export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient'
          specialty?: string
          license_number?: string
          phone?: string
          avatar_url?: string
          is_active: boolean
          last_login?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient'
          specialty?: string
          license_number?: string
          phone?: string
          avatar_url?: string
          is_active?: boolean
          last_login?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: 'admin' | 'doctor' | 'nurse' | 'receptionist' | 'patient'
          specialty?: string
          license_number?: string
          phone?: string
          avatar_url?: string
          is_active?: boolean
          last_login?: string
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          user_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
          health_card_number: string
          phone: string
          email?: string
          address: {
            street: string
            city: string
            province: string
            postal_code: string
            country: string
          }
          emergency_contact: {
            name: string
            relationship: string
            phone: string
          }
          medical_history: Json
          allergies: string[]
          medications: string[]
          insurance_info?: {
            provider: string
            policy_number: string
            group_number?: string
          }
          notes?: string
          status: 'active' | 'inactive' | 'deceased'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name: string
          last_name: string
          date_of_birth: string
          gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
          health_card_number: string
          phone: string
          email?: string
          address: {
            street: string
            city: string
            province: string
            postal_code: string
            country: string
          }
          emergency_contact: {
            name: string
            relationship: string
            phone: string
          }
          medical_history?: Json
          allergies?: string[]
          medications?: string[]
          insurance_info?: {
            provider: string
            policy_number: string
            group_number?: string
          }
          notes?: string
          status?: 'active' | 'inactive' | 'deceased'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string
          last_name?: string
          date_of_birth?: string
          gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
          health_card_number?: string
          phone?: string
          email?: string
          address?: {
            street: string
            city: string
            province: string
            postal_code: string
            country: string
          }
          emergency_contact?: {
            name: string
            relationship: string
            phone: string
          }
          medical_history?: Json
          allergies?: string[]
          medications?: string[]
          insurance_info?: {
            provider: string
            policy_number: string
            group_number?: string
          }
          notes?: string
          status?: 'active' | 'inactive' | 'deceased'
          created_at?: string
          updated_at?: string
        }
      }
      medical_records: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          record_type: 'consultation' | 'examination' | 'procedure' | 'lab_result' | 'imaging' | 'prescription' | 'referral' | 'note'
          title: string
          content: string
          diagnosis?: string[]
          symptoms?: string[]
          medications?: {
            name: string
            dosage: string
            frequency: string
            duration: string
            instructions?: string
          }[]
          vital_signs?: {
            blood_pressure?: string
            heart_rate?: number
            temperature?: number
            weight?: number
            height?: number
            oxygen_saturation?: number
          }
          lab_results?: {
            test_name: string
            result: string
            unit?: string
            reference_range?: string
            status: 'normal' | 'abnormal' | 'critical'
          }[]
          attachments?: {
            filename: string
            url: string
            type: string
            size: number
          }[]
          follow_up_date?: string
          status: 'draft' | 'completed' | 'archived'
          is_urgent: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          record_type: 'consultation' | 'examination' | 'procedure' | 'lab_result' | 'imaging' | 'prescription' | 'referral' | 'note'
          title: string
          content: string
          diagnosis?: string[]
          symptoms?: string[]
          medications?: {
            name: string
            dosage: string
            frequency: string
            duration: string
            instructions?: string
          }[]
          vital_signs?: {
            blood_pressure?: string
            heart_rate?: number
            temperature?: number
            weight?: number
            height?: number
            oxygen_saturation?: number
          }
          lab_results?: {
            test_name: string
            result: string
            unit?: string
            reference_range?: string
            status: 'normal' | 'abnormal' | 'critical'
          }[]
          attachments?: {
            filename: string
            url: string
            type: string
            size: number
          }[]
          follow_up_date?: string
          status?: 'draft' | 'completed' | 'archived'
          is_urgent?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          record_type?: 'consultation' | 'examination' | 'procedure' | 'lab_result' | 'imaging' | 'prescription' | 'referral' | 'note'
          title?: string
          content?: string
          diagnosis?: string[]
          symptoms?: string[]
          medications?: {
            name: string
            dosage: string
            frequency: string
            duration: string
            instructions?: string
          }[]
          vital_signs?: {
            blood_pressure?: string
            heart_rate?: number
            temperature?: number
            weight?: number
            height?: number
            oxygen_saturation?: number
          }
          lab_results?: {
            test_name: string
            result: string
            unit?: string
            reference_range?: string
            status: 'normal' | 'abnormal' | 'critical'
          }[]
          attachments?: {
            filename: string
            url: string
            type: string
            size: number
          }[]
          follow_up_date?: string
          status?: 'draft' | 'completed' | 'archived'
          is_urgent?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointments: {
        Row: {
          id: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          duration_minutes: number
          type: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'lab_work'
          status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          doctor_id: string
          appointment_date: string
          duration_minutes: number
          type: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'lab_work'
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          doctor_id?: string
          appointment_date?: string
          duration_minutes?: number
          type?: 'consultation' | 'follow_up' | 'emergency' | 'procedure' | 'lab_work'
          status?: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
          notes?: string
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string
          action: string
          table_name: string
          record_id?: string
          old_values?: Json
          new_values?: Json
          ip_address?: string
          user_agent?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action: string
          table_name: string
          record_id?: string
          old_values?: Json
          new_values?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action?: string
          table_name?: string
          record_id?: string
          old_values?: Json
          new_values?: Json
          ip_address?: string
          user_agent?: string
          created_at?: string
        }
      }
      voice_recordings: {
        Row: {
          id: string
          user_id: string
          patient_id?: string
          medical_record_id?: string
          filename: string
          url: string
          duration_seconds: number
          transcription?: string
          status: 'recording' | 'processing' | 'completed' | 'failed'
          language: 'en' | 'fr'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          patient_id?: string
          medical_record_id?: string
          filename: string
          url: string
          duration_seconds: number
          transcription?: string
          status?: 'recording' | 'processing' | 'completed' | 'failed'
          language?: 'en' | 'fr'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          patient_id?: string
          medical_record_id?: string
          filename?: string
          url?: string
          duration_seconds?: number
          transcription?: string
          status?: 'recording' | 'processing' | 'completed' | 'failed'
          language?: 'en' | 'fr'
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'appointment' | 'lab_result' | 'medication' | 'system' | 'security'
          title: string
          message: string
          is_read: boolean
          action_url?: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'appointment' | 'lab_result' | 'medication' | 'system' | 'security'
          title: string
          message: string
          is_read?: boolean
          action_url?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'appointment' | 'lab_result' | 'medication' | 'system' | 'security'
          title?: string
          message?: string
          is_read?: boolean
          action_url?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional type definitions for the application
export type User = Database['public']['Tables']['users']['Row']
export type Patient = Database['public']['Tables']['patients']['Row']
export type MedicalRecord = Database['public']['Tables']['medical_records']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AuditLog = Database['public']['Tables']['audit_logs']['Row']
export type VoiceRecording = Database['public']['Tables']['voice_recordings']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']

// Insert types
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type PatientInsert = Database['public']['Tables']['patients']['Insert']
export type MedicalRecordInsert = Database['public']['Tables']['medical_records']['Insert']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']
export type VoiceRecordingInsert = Database['public']['Tables']['voice_recordings']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

// Update types
export type UserUpdate = Database['public']['Tables']['users']['Update']
export type PatientUpdate = Database['public']['Tables']['patients']['Update']
export type MedicalRecordUpdate = Database['public']['Tables']['medical_records']['Update']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update']
export type VoiceRecordingUpdate = Database['public']['Tables']['voice_recordings']['Update']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

// Custom types for the application
export interface MedicalRecordWithRelations extends MedicalRecord {
  patient: Patient
  doctor: User
}

export interface PatientWithRecords extends Patient {
  medical_records: MedicalRecord[]
  appointments: Appointment[]
}

export interface UserWithPatients extends User {
  patients: Patient[]
}

export interface AppointmentWithRelations extends Appointment {
  patient: Patient
  doctor: User
}

// Form types
export interface PatientFormData {
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  health_card_number: string
  phone: string
  email?: string
  address: {
    street: string
    city: string
    province: string
    postal_code: string
    country: string
  }
  emergency_contact: {
    name: string
    relationship: string
    phone: string
  }
  allergies: string[]
  medications: string[]
  insurance_info?: {
    provider: string
    policy_number: string
    group_number?: string
  }
  notes?: string
}

export interface MedicalRecordFormData {
  record_type: 'consultation' | 'examination' | 'procedure' | 'lab_result' | 'imaging' | 'prescription' | 'referral' | 'note'
  title: string
  content: string
  diagnosis?: string[]
  symptoms?: string[]
  medications?: {
    name: string
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
  vital_signs?: {
    blood_pressure?: string
    heart_rate?: number
    temperature?: number
    weight?: number
    height?: number
    oxygen_saturation?: number
  }
  follow_up_date?: string
  is_urgent: boolean
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Search and filter types
export interface PatientSearchFilters {
  search?: string
  status?: 'active' | 'inactive' | 'deceased'
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  age_min?: number
  age_max?: number
}

export interface MedicalRecordFilters {
  record_type?: 'consultation' | 'examination' | 'procedure' | 'lab_result' | 'imaging' | 'prescription' | 'referral' | 'note'
  status?: 'draft' | 'completed' | 'archived'
  is_urgent?: boolean
  date_from?: string
  date_to?: string
  doctor_id?: string
}

// Voice dictation types
export interface VoiceDictationResult {
  text: string
  confidence: number
  language: 'en' | 'fr'
  duration: number
  timestamp: string
}

export interface VoiceDictationSettings {
  language: 'en' | 'fr'
  auto_save: boolean
  noise_reduction: boolean
  medical_terminology: boolean
  punctuation: boolean
}
