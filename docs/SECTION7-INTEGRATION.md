# Section 7: Physical Examination Integration

## Overview

Section 7 provides a comprehensive physical examination interface with professional medical workflow, database session management, and voice integration preparation. The component is designed for zero-retention compliance and Quebec Law 25 adherence.

## Features

### Core Functionality
- **Physical Measurements**: Height, weight, blood pressure, temperature, pulse, oxygen saturation
- **Range of Motion Assessment**: Detailed joint mobility evaluation with pain levels
- **Bilateral Comparisons**: Side-by-side comparison tables for anatomical structures
- **Timeline Events**: Chronological tracking of medical events
- **Radiology Reports**: Verbatim imaging report entry
- **Narrative Documentation**: Comprehensive examination findings

### Database Integration
- **Session Management**: Temporary form sessions with 30-minute auto-expiration
- **Auto-save**: Real-time data persistence every 30 seconds
- **Zero Retention**: Automatic session cleanup for compliance
- **User Authentication**: Secure access control

### Voice Integration Preparation
- **Voice Commands**: French medical terminology support
- **Verbatim Mode**: Word-for-word dictation capabilities
- **Template Integration**: Quick insertion of common phrases
- **Real-time Processing**: Live voice-to-text conversion

## Architecture

### Components
```
components/sections/Section7PhysicalExamination.tsx
├── Physical Measurements Panel
├── Range of Motion Assessment
├── Bilateral Comparisons
├── Narrative Documentation
├── Timeline Events
├── Radiology Reports
└── Context/Tools Panel
```

### Database Schema
```sql
form_sessions (
  id: uuid PRIMARY KEY,
  user_id: uuid REFERENCES users(id),
  session_data: jsonb,
  expires_at: timestamp,
  created_at: timestamp,
  updated_at: timestamp
)
```

### API Routes
```
/api/form-sessions
├── GET /?section=section7
├── POST / (create session)
├── PUT / (update session)
└── DELETE /?sessionId=uuid

/api/admin/session-cleanup
├── GET / (session statistics)
└── POST / (cleanup operations)
```

## Usage

### Basic Implementation
```tsx
import { Section7PhysicalExamination } from "@/components/sections/Section7PhysicalExamination"

export default function Section7Page() {
  return (
    <MedicalLayout>
      <Section7PhysicalExamination />
    </MedicalLayout>
  )
}
```

### Form Session Hook
```tsx
import { useFormSession } from "@/hooks/use-form-session"

const {
  sessionId,
  sessionData,
  isLoading,
  isSaving,
  lastSaved,
  saveSession,
  updateSectionData,
  clearSession
} = useFormSession({
  section: "section7",
  autoSaveInterval: 30000,
  sessionTimeout: 30
})
```

## Data Types

### Physical Measurement
```typescript
interface PhysicalMeasurement {
  id: string
  type: "height" | "weight" | "blood_pressure" | "temperature" | "pulse" | "oxygen_saturation"
  value: string
  unit: string
  side?: "left" | "right" | "bilateral"
  notes?: string
}
```

### Range of Motion
```typescript
interface RangeOfMotion {
  id: string
  joint: string
  side: "left" | "right" | "bilateral"
  flexion: string
  extension: string
  abduction: string
  adduction: string
  rotation: string
  painLevel: "none" | "mild" | "moderate" | "severe"
  notes?: string
}
```

### Bilateral Comparison
```typescript
interface BilateralComparison {
  id: string
  structure: string
  leftSide: {
    normal: boolean
    findings: string
    measurements?: string
  }
  rightSide: {
    normal: boolean
    findings: string
    measurements?: string
  }
  comparison: string
}
```

## Voice Commands

### French Medical Commands
- `"Ouvrir guillemet"` - Start verbatim content
- `"Fermer guillemet"` - End verbatim content
- `"Insérer examen annuel"` - Insert annual exam template
- `"Nouvelle ligne"` - Insert line break
- `"Mesure tension"` - Blood pressure measurement
- `"Amplitude articulaire"` - Range of motion assessment

### Medical Terminology
- `"Déchirure musculaire"` - Muscle tear
- `"Consolidation"` - Consolidation
- `"Plateau thérapeutique"` - Therapeutic plateau
- `"Atteinte permanente"` - Permanent impairment
- `"Limitations fonctionnelles"` - Functional limitations

## Compliance Features

### Zero Retention Policy
- **Session Expiration**: Automatic cleanup after 30 minutes
- **No Patient Data**: Temporary storage only
- **Export & Delete**: Immediate data removal after export
- **Audit Trails**: Admin monitoring without PHI

### Quebec Law 25 Compliance
- **Data Localization**: All data stored in Quebec
- **Consent Management**: Explicit user consent tracking
- **Right to Deletion**: Immediate session cleanup
- **Transparency**: Clear data handling policies

## Admin Functions

### Session Management
```typescript
// Get session statistics
GET /api/admin/session-cleanup

// Cleanup expired sessions
POST /api/admin/session-cleanup
{
  "action": "cleanup_expired"
}

// Cleanup user sessions
POST /api/admin/session-cleanup
{
  "action": "cleanup_user",
  "userId": "uuid"
}
```

### Monitoring
- **Active Sessions**: Real-time session count
- **Expiring Sessions**: Sessions expiring within 1 hour
- **Cleanup Logs**: Automated cleanup tracking
- **User Activity**: Session creation/update monitoring

## Error Handling

### Session Errors
- **Authentication Failure**: Redirect to login
- **Session Expired**: Create new session
- **Save Failure**: Retry with exponential backoff
- **Network Issues**: Offline mode with local storage

### User Feedback
- **Loading States**: Clear loading indicators
- **Save Status**: Real-time save confirmation
- **Error Messages**: User-friendly error descriptions
- **Recovery Options**: Automatic retry mechanisms

## Performance Optimization

### Data Management
- **Debounced Updates**: Prevent excessive API calls
- **Lazy Loading**: Load sections on demand
- **Memory Management**: Cleanup unused data
- **Caching**: Intelligent data caching

### UI Performance
- **Virtual Scrolling**: Handle large datasets
- **Component Memoization**: Prevent unnecessary re-renders
- **Image Optimization**: Compress uploaded images
- **Bundle Splitting**: Code splitting for large components

## Testing

### Unit Tests
```typescript
// Test form session hook
describe('useFormSession', () => {
  it('should initialize session correctly')
  it('should save data automatically')
  it('should handle session expiration')
  it('should clear session on completion')
})

// Test component functionality
describe('Section7PhysicalExamination', () => {
  it('should render all panels')
  it('should handle measurement inputs')
  it('should validate bilateral comparisons')
  it('should integrate voice commands')
})
```

### Integration Tests
- **API Endpoints**: Test all CRUD operations
- **Database Operations**: Verify session management
- **Authentication**: Test user access control
- **Compliance**: Verify data retention policies

## Deployment

### Environment Variables
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Voice Integration (future)
OPENAI_API_KEY=your_openai_key
WHISPER_MODEL=whisper-1
```

### Database Setup
```sql
-- Create form_sessions table
CREATE TABLE form_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_form_sessions_user_id ON form_sessions(user_id);
CREATE INDEX idx_form_sessions_expires_at ON form_sessions(expires_at);
CREATE INDEX idx_form_sessions_section ON form_sessions USING GIN ((session_data->>'section'));

-- Enable RLS
ALTER TABLE form_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own sessions" ON form_sessions
  FOR ALL USING (auth.uid() = user_id);
```

## Future Enhancements

### Voice Integration
- **Real-time Transcription**: Live voice-to-text
- **Medical Speech Recognition**: Specialized medical terminology
- **Command Processing**: Voice command interpretation
- **Multi-language Support**: French and English

### AI Features
- **Smart Suggestions**: AI-powered medical terminology
- **Auto-completion**: Intelligent form completion
- **Quality Assurance**: Automated validation checks
- **Template Generation**: Dynamic template creation

### Advanced Features
- **Image Upload**: Radiology image attachment
- **PDF Export**: Professional report generation
- **Collaboration**: Multi-user session sharing
- **Mobile Support**: Responsive mobile interface

## Troubleshooting

### Common Issues
1. **Session Not Loading**: Check authentication and database connection
2. **Auto-save Failing**: Verify API endpoint availability
3. **Voice Not Working**: Ensure microphone permissions
4. **Performance Issues**: Check for memory leaks or excessive re-renders

### Debug Tools
- **Session Inspector**: View current session data
- **API Monitor**: Track API calls and responses
- **Performance Profiler**: Monitor component performance
- **Error Logger**: Centralized error tracking

## Support

For technical support or questions about Section 7 integration:
- **Documentation**: Check this file and related docs
- **Issues**: Report bugs via GitHub issues
- **Questions**: Contact the development team
- **Training**: Request training sessions for medical staff
