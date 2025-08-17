"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function TestVoicePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [testText, setTestText] = useState('')
  const [formattedText, setFormattedText] = useState('')
  const [sessionId, setSessionId] = useState('')
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const testStartRecording = async () => {
    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to test the voice recording API",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/voice/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'start_recording',
          language: 'fr'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setSessionId(result.sessionId)
        toast({
          title: "Success",
          description: `Recording session started: ${result.sessionId}`,
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testProcessChunk = async () => {
    if (!sessionId) {
      toast({
        title: "No Session",
        description: "Please start a recording session first",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Mock audio chunk (base64 encoded)
      const mockAudioChunk = btoa('mock audio data')

      const response = await fetch('/api/voice/record', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          action: 'process_chunk',
          sessionId,
          audioChunk: mockAudioChunk,
          language: 'fr'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Chunk processed: ${result.transcription}`,
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testGetTranscription = async () => {
    if (!sessionId) {
      toast({
        title: "No Session",
        description: "Please start a recording session first",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(`/api/voice/record?sessionId=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Success",
          description: `Session retrieved: ${result.recording?.chunks?.length || 0} chunks`,
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testAIFormat = async () => {
    if (!testText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to format",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to test the AI formatting API",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/format/main-narrative', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          text: testText,
          language: 'fr-CA'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setFormattedText(result.formattedText)
        toast({
          title: "Success",
          description: "Text formatted successfully",
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const testCompileDocument = async () => {
    if (!testText.trim()) {
      toast({
        title: "No Text",
        description: "Please enter some text to compile",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast({
          title: "Authentication Error",
          description: "Please log in to test the compile API",
          variant: "destructive"
        })
        return
      }

      const response = await fetch('/api/format/compile-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          mainNarrative: testText,
          radiologyReport: "Radiology findings: Normal",
          transcript: "Voice transcript: Patient reports pain",
          language: 'fr-CA'
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setFormattedText(result.compiledDocument)
        toast({
          title: "Success",
          description: "Document compiled successfully",
          variant: "default"
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Test error:', error)
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Voice Recording & AI Formatting Test</h1>
        <p className="text-gray-600">Test the voice recording and AI formatting APIs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Recording Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Recording API Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">Session ID: {sessionId || 'None'}</p>
            </div>
            
            <Button 
              onClick={testStartRecording} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Start Recording'}
            </Button>
            
            <Button 
              onClick={testProcessChunk} 
              disabled={isLoading || !sessionId}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Process Chunk'}
            </Button>
            
            <Button 
              onClick={testGetTranscription} 
              disabled={isLoading || !sessionId}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Testing...' : 'Test Get Transcription'}
            </Button>
          </CardContent>
        </Card>

        {/* AI Formatting Tests */}
        <Card>
          <CardHeader>
            <CardTitle>AI Formatting API Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Text:</label>
              <Textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to format..."
                className="mt-1"
                rows={3}
              />
            </div>
            
                         <Button 
               onClick={testAIFormat} 
               disabled={isLoading || !testText.trim()}
               className="w-full"
             >
               {isLoading ? 'Formatting...' : 'Test AI Format'}
             </Button>
             
             <Button 
               onClick={testCompileDocument} 
               disabled={isLoading || !testText.trim()}
               variant="outline"
               className="w-full"
             >
               {isLoading ? 'Compiling...' : 'Test Compile Document'}
             </Button>
            
            {formattedText && (
              <div>
                <label className="text-sm font-medium">Formatted Result:</label>
                <Textarea
                  value={formattedText}
                  readOnly
                  className="mt-1"
                  rows={4}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
