"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Play, Pause, Settings, Volume2, Headphones } from "lucide-react"
import { useLanguage } from "@/context/LanguageContext"

interface VoiceStatus {
  isRecording: boolean
  isConnected: boolean
  quality: 'excellent' | 'good' | 'poor'
  duration: number
  transcription: string
}

export default function VoicePage() {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>({
    isRecording: false,
    isConnected: true,
    quality: 'excellent',
    duration: 0,
    transcription: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  
  const { t } = useLanguage()

  const handleStartRecording = async () => {
    setIsLoading(true)
    
    try {
      // TODO: Implement actual voice recording
      console.log('Starting voice recording...')
      
      setVoiceStatus(prev => ({
        ...prev,
        isRecording: true,
        duration: 0
      }))
      
      // Simulate recording
      const interval = setInterval(() => {
        setVoiceStatus(prev => ({
          ...prev,
          duration: prev.duration + 1
        }))
      }, 1000)
      
      // Store interval for cleanup
      ;(window as any).recordingInterval = interval
      
    } catch (error) {
      console.error('Error starting recording:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStopRecording = async () => {
    try {
      // TODO: Stop actual voice recording
      console.log('Stopping voice recording...')
      
      // Clear interval
      if ((window as any).recordingInterval) {
        clearInterval((window as any).recordingInterval)
      }
      
      setVoiceStatus(prev => ({
        ...prev,
        isRecording: false,
        transcription: 'Patient presents with... [Transcription would appear here]'
      }))
      
    } catch (error) {
      console.error('Error stopping recording:', error)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent':
        return 'text-green-600'
      case 'good':
        return 'text-yellow-600'
      case 'poor':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Mic className="w-8 h-8 text-purple-600" />
          Voice Recording
        </h1>
        <p className="text-gray-600 mt-2">
          Use voice dictation to create medical documentation efficiently
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Recording Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Dictation
              </CardTitle>
              <CardDescription>
                Start recording to dictate your medical notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Recording Status */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${voiceStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div>
                    <div className="font-medium text-gray-900">Connection</div>
                    <div className="text-sm text-gray-600">
                      {voiceStatus.isConnected ? 'Connected' : 'Disconnected'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${voiceStatus.isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <div>
                    <div className="font-medium text-gray-900">Recording</div>
                    <div className="text-sm text-gray-600">
                      {voiceStatus.isRecording ? `Active (${formatDuration(voiceStatus.duration)})` : 'Inactive'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Volume2 className={`w-4 h-4 ${getQualityColor(voiceStatus.quality)}`} />
                  <div>
                    <div className="font-medium text-gray-900">Audio Quality</div>
                    <div className={`text-sm capitalize ${getQualityColor(voiceStatus.quality)}`}>
                      {voiceStatus.quality}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant={voiceStatus.isRecording ? "destructive" : "default"}
                  className="w-32 h-32 rounded-full"
                  onClick={voiceStatus.isRecording ? handleStopRecording : handleStartRecording}
                  disabled={isLoading}
                >
                  {voiceStatus.isRecording ? (
                    <>
                      <Pause className="w-8 h-8 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-8 h-8 mr-2" />
                      Start
                    </>
                  )}
                </Button>
              </div>

              {/* Transcription Display */}
              {voiceStatus.transcription && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-900">Transcription</h3>
                  <div className="p-4 bg-gray-50 rounded-lg border min-h-[100px]">
                    <p className="text-gray-700">{voiceStatus.transcription}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Device Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Device Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Headphones className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium">Microphone</div>
                  <div className="text-sm text-gray-600">Default Microphone</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium">Sample Rate</div>
                  <div className="text-sm text-gray-600">44.1 kHz</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Voice Settings
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Mic className="w-4 h-4 mr-2" />
                Test Microphone
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Voice Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Speak clearly and at a normal pace</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use medical terminology naturally</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Pause briefly between sentences</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
