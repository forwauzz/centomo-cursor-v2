"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText } from "lucide-react"

export default function Section8Page() {
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')

  return (
    <Card className="p-8 h-full">
      <div className="text-center text-gray-500 mt-20">
        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">Subjective Assessment</h3>
        <p className="text-gray-400">
          Section 8: Subjective assessment with template system will be implemented here
        </p>
        {formId && (
          <p className="text-sm text-blue-600 mt-2">
            Editing form: {formId}
          </p>
        )}
        <div className="mt-6 text-sm text-gray-400">
          <p>• Multiple assessment templates</p>
          <p>• Template selection dropdown</p>
          <p>• Freeform narrative mode</p>
          <p>• Admin-configurable templates</p>
        </div>
      </div>
    </Card>
  )
}
