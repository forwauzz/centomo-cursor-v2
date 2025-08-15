"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Plus, Thermometer, Ruler, Activity, Heart } from "lucide-react"

interface PhysicalMeasurement {
  id: string
  type: "height" | "weight" | "blood_pressure" | "temperature" | "pulse" | "oxygen_saturation"
  value: string
  unit: string
  side?: "left" | "right" | "bilateral"
  notes?: string
}

export default function PhysicalMeasurementsSection() {
  const [measurements, setMeasurements] = useState<PhysicalMeasurement[]>([])

  const addMeasurement = () => {
    const newMeasurement: PhysicalMeasurement = {
      id: Date.now().toString(),
      type: "height",
      value: "",
      unit: "cm"
    }
    setMeasurements([...measurements, newMeasurement])
  }

  const updateMeasurement = (id: string, field: keyof PhysicalMeasurement, value: string) => {
    setMeasurements(measurements.map(m => 
      m.id === id ? { ...m, [field]: value } : m
    ))
  }

  const removeMeasurement = (id: string) => {
    setMeasurements(measurements.filter(m => m.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="w-5 h-5" />
          Physical Measurements
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {measurements.map((measurement) => (
          <div key={measurement.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
            <div>
              <Label>Type</Label>
              <Select 
                value={measurement.type} 
                onValueChange={(value) => updateMeasurement(measurement.id, 'type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="height">Height</SelectItem>
                  <SelectItem value="weight">Weight</SelectItem>
                  <SelectItem value="blood_pressure">Blood Pressure</SelectItem>
                  <SelectItem value="temperature">Temperature</SelectItem>
                  <SelectItem value="pulse">Pulse</SelectItem>
                  <SelectItem value="oxygen_saturation">O2 Saturation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Value</Label>
              <Input
                value={measurement.value}
                onChange={(e) => updateMeasurement(measurement.id, 'value', e.target.value)}
                placeholder="Enter value"
              />
            </div>
            
            <div>
              <Label>Unit</Label>
              <Input
                value={measurement.unit}
                onChange={(e) => updateMeasurement(measurement.id, 'unit', e.target.value)}
                placeholder="Unit"
              />
            </div>
            
            <div className="flex items-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => removeMeasurement(measurement.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        
        <Button onClick={addMeasurement} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Measurement
        </Button>
      </CardContent>
    </Card>
  )
}
