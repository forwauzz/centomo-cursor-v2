"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Activity } from "lucide-react"

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

export default function RangeOfMotionSection() {
  const [rangeOfMotion, setRangeOfMotion] = useState<RangeOfMotion[]>([])

  const addRangeOfMotion = () => {
    const newROM: RangeOfMotion = {
      id: Date.now().toString(),
      joint: "",
      side: "bilateral",
      flexion: "",
      extension: "",
      abduction: "",
      adduction: "",
      rotation: "",
      painLevel: "none"
    }
    setRangeOfMotion([...rangeOfMotion, newROM])
  }

  const updateROM = (id: string, field: keyof RangeOfMotion, value: string) => {
    setRangeOfMotion(rangeOfMotion.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ))
  }

  const removeROM = (id: string) => {
    setRangeOfMotion(rangeOfMotion.filter(r => r.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Range of Motion Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {rangeOfMotion.map((rom) => (
          <div key={rom.id} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Joint</Label>
              <Input
                value={rom.joint}
                onChange={(e) => updateROM(rom.id, 'joint', e.target.value)}
                placeholder="e.g., Shoulder, Knee"
              />
            </div>
            
            <div>
              <Label>Side</Label>
              <Select 
                value={rom.side} 
                onValueChange={(value) => updateROM(rom.id, 'side', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="bilateral">Bilateral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Pain Level</Label>
              <Select 
                value={rom.painLevel} 
                onValueChange={(value) => updateROM(rom.id, 'painLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Flexion</Label>
              <Input
                value={rom.flexion}
                onChange={(e) => updateROM(rom.id, 'flexion', e.target.value)}
                placeholder="Degrees"
              />
            </div>
            
            <div>
              <Label>Extension</Label>
              <Input
                value={rom.extension}
                onChange={(e) => updateROM(rom.id, 'extension', e.target.value)}
                placeholder="Degrees"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => removeROM(rom.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        
        <Button onClick={addRangeOfMotion} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Range of Motion Assessment
        </Button>
      </CardContent>
    </Card>
  )
}
