# Form Editing Feature

## Overview
The form editing feature allows users to continue working on their draft forms and edit existing forms. This feature provides a seamless experience for users to pick up where they left off and make changes to their medical reports.

## Features Implemented

### 1. Draft Forms Management
- **Location**: `/form/drafts`
- **Functionality**: 
  - Lists all user's draft and in-progress forms
  - Shows progress percentage for each form
  - Displays last modified date
  - Provides edit, view, and delete actions

### 2. Form Data Persistence
- **Database Tables**: 
  - `forms` - Main form records
  - `form_sections` - Section-specific data
- **Auto-save**: Form data is automatically saved every 2 seconds of inactivity
- **Session Management**: Form data is also saved in browser sessions for immediate recovery

### 3. Section Navigation
- **Navigation Buttons**: Previous/Next buttons in the header when editing forms
- **Section Flow**: Section 7 → Section 8 → Section 11
- **Form ID Tracking**: All sections maintain the same form ID for data consistency

### 4. Data Loading
- **Existing Data**: When editing a form, existing data is automatically loaded
- **Loading States**: Clear loading indicators while data is being fetched
- **Error Handling**: Graceful fallback if data loading fails

## Technical Implementation

### API Endpoints

#### GET `/api/forms`
- **Purpose**: Load form data
- **Parameters**: 
  - `formId` (required): The form ID to load
  - `section` (optional): Specific section to load
- **Response**: Form section data or all sections

#### POST `/api/forms`
- **Purpose**: Save form data
- **Body**:
  ```json
  {
    "formId": "uuid",
    "section": "section7",
    "sectionData": { ... },
    "completed": false
  }
  ```

### Database Schema

#### Forms Table
```sql
CREATE TABLE forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_id TEXT NOT NULL,
  form_type TEXT NOT NULL,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Form Sections Table
```sql
CREATE TABLE form_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES forms(id) ON DELETE CASCADE,
  section_name TEXT NOT NULL,
  section_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Component Updates

#### Section7PhysicalExamination
- **New Props**: `formId?: string | null`
- **Data Loading**: Loads existing form data when `formId` is provided
- **Auto-save**: Saves data to database every 2 seconds of inactivity
- **Loading States**: Shows loading indicator while fetching data

#### Medical Layout
- **Navigation**: Added Previous/Next buttons for form sections
- **Form Context**: Shows current section and form ID in header
- **Save & Exit**: Button to return to drafts page

## User Workflow

### Creating a New Form
1. Navigate to `/form/new`
2. Fill in patient information
3. Click "Create Form"
4. Redirected to Section 7 with new form ID

### Editing an Existing Form
1. Navigate to `/form/drafts`
2. Click "Continue" on any draft form
3. Redirected to Section 7 with existing form ID
4. Existing data is automatically loaded
5. Use navigation buttons to move between sections
6. Data is automatically saved as you work

### Form Management
1. View all drafts at `/form/drafts`
2. See progress percentage for each form
3. Delete unwanted drafts
4. Continue editing any draft

## Security Features

### Authentication
- All API endpoints require valid authentication
- Form access is restricted to the form owner
- Row Level Security (RLS) policies enforce data isolation

### Data Validation
- Form ownership verification before any operations
- Input validation on all form fields
- Error handling for failed operations

## Performance Optimizations

### Debounced Saving
- Form data is saved after 2 seconds of inactivity
- Prevents excessive API calls during rapid typing
- Maintains data integrity without performance impact

### Lazy Loading
- Heavy components are loaded only when needed
- Section data is loaded on-demand
- Optimized for large form datasets

### Caching
- Session data is cached in browser
- Reduces server load for frequently accessed data
- Provides offline capability for recent changes

## Error Handling

### Network Errors
- Graceful fallback to session storage
- User notification of save failures
- Automatic retry mechanisms

### Data Loading Errors
- Fallback to empty form state
- Clear error messages to users
- Option to retry loading

### Validation Errors
- Real-time validation feedback
- Clear error messages
- Prevention of invalid data submission

## Future Enhancements

### Planned Features
1. **Form Templates**: Pre-configured form templates
2. **Collaborative Editing**: Multiple users editing same form
3. **Version History**: Track changes and revert to previous versions
4. **Form Export**: Export forms to various formats
5. **Advanced Search**: Search through form content
6. **Form Analytics**: Usage statistics and insights

### Technical Improvements
1. **Real-time Sync**: WebSocket-based real-time updates
2. **Offline Support**: Full offline capability with sync
3. **Advanced Caching**: Redis-based caching for better performance
4. **Bulk Operations**: Batch operations for multiple forms
5. **API Rate Limiting**: Prevent abuse and ensure fair usage

## Testing

### Manual Testing Checklist
- [ ] Create new form and verify data persistence
- [ ] Edit existing form and verify data loading
- [ ] Navigate between sections with form ID
- [ ] Test auto-save functionality
- [ ] Verify error handling for network issues
- [ ] Test form deletion
- [ ] Verify progress calculation
- [ ] Test navigation buttons functionality

### Automated Testing
- Unit tests for form data operations
- Integration tests for API endpoints
- E2E tests for complete user workflows
- Performance tests for large datasets

## Troubleshooting

### Common Issues

#### Form Data Not Loading
- Check authentication status
- Verify form ownership
- Check network connectivity
- Review browser console for errors

#### Auto-save Not Working
- Check API endpoint availability
- Verify authentication token
- Review network requests in browser dev tools
- Check for JavaScript errors

#### Navigation Issues
- Verify form ID in URL parameters
- Check section routing configuration
- Ensure all sections are properly configured

### Debug Information
- Form ID tracking in URL
- Console logging for data operations
- Network request monitoring
- Session storage inspection
