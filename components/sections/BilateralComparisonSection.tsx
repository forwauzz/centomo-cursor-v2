"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Plus, Eye } from "lucide-react"

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

export default function BilateralComparisonSection() {
  const [comparisons, setComparisons] = useState<BilateralComparison[]>([])

  const addComparison = () => {
    const newComparison: BilateralComparison = {
      id: Date.now().toString(),
      structure: "",
      leftSide: {
        normal: true,
        findings: "",
        measurements: ""
      },
      rightSide: {
        normal: true,
        findings: "",
        measurements: ""
      },
      comparison: ""
    }
    setComparisons([...comparisons, newComparison])
  }

  const updateComparison = (id: string, side: 'leftSide' | 'rightSide', field: string, value: string | boolean) => {
    setComparisons(comparisons.map(c => 
      c.id === id ? { 
        ...c, 
        [side]: { ...c[side], [field]: value } 
      } : c
    ))
  }

  const updateComparisonField = (id: string, field: string, value: string) => {
    setComparisons(comparisons.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const removeComparison = (id: string) => {
    setComparisons(comparisons.filter(c => c.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Bilateral Comparison
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {comparisons.map((comparison) => (
          <div key={comparison.id} className="p-4 border rounded-lg space-y-4">
            <div>
              <Label>Structure</Label>
              <Input
                value={comparison.structure}
                onChange={(e) => updateComparisonField(comparison.id, 'structure', e.target.value)}
                placeholder="e.g., Shoulder, Knee, Hand"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Side */}
              <div className="space-y-3">
                <h4 className="font-medium">Left Side</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={comparison.leftSide.normal}
                    onCheckedChange={(checked) => updateComparison(comparison.id, 'leftSide', 'normal', checked as boolean)}
                  />
                  <Label>Normal</Label>
                </div>
                <div>
                  <Label>Findings</Label>
                  <Input
                    value={comparison.leftSide.findings}
                    onChange={(e) => updateComparison(comparison.id, 'leftSide', 'findings', e.target.value)}
                    placeholder="Describe findings"
                  />
                </div>
                <div>
                  <Label>Measurements</Label>
                  <Input
                    value={comparison.leftSide.measurements || ""}
                    onChange={(e) => updateComparison(comparison.id, 'leftSide', 'measurements', e.target.value)}
                    placeholder="Measurements (optional)"
                  />
                </div>
              </div>
              
              {/* Right Side */}
              <div className="space-y-3">
                <h4 className="font-medium">Right Side</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={comparison.rightSide.normal}
                    onCheckedChange={(checked) => updateComparison(comparison.id, 'rightSide', 'normal', checked as boolean)}
                  />
                  <Label>Normal</Label>
                </div>
                <div>
                  <Label>Findings</Label>
                  <Input
                    value={comparison.rightSide.findings}
                    onChange={(e) => updateComparison(comparison.id, 'rightSide', 'findings', e.target.value)}
                    placeholder="Describe findings"
                  />
                </div>
                <div>
                  <Label>Measurements</Label>
                  <Input
                    value={comparison.rightSide.measurements || ""}
                    onChange={(e) => updateComparison(comparison.id, 'rightSide', 'measurements', e.target.value)}
                    placeholder="Measurements (optional)"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <Label>Comparison Notes</Label>
              <Input
                value={comparison.comparison}
                onChange={(e) => updateComparisonField(comparison.id, 'comparison', e.target.value)}
                placeholder="Compare left vs right findings"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => removeComparison(comparison.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
        
        <Button onClick={addComparison} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Bilateral Comparison
        </Button>
      </CardContent>
    </Card>
  )
}
