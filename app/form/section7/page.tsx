"use client"

import { useSearchParams } from "next/navigation"
import { Section7PhysicalExamination } from "@/components/sections/Section7PhysicalExamination"
import MedicalLayout from "@/components/layout/medical-layout"

export default function Section7Page() {
  const searchParams = useSearchParams()
  const formId = searchParams.get('formId')

  return (
    <MedicalLayout>
      <Section7PhysicalExamination formId={formId} />
    </MedicalLayout>
  )
}
