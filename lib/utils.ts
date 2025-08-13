import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { fr, enCA } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date formatting utilities
export const formatDate = (date: string | Date, formatString = "PPP") => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatString, { locale: enCA })
}

export const formatDateRelative = (date: string | Date) => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: enCA })
}

export const formatDateFrench = (date: string | Date, formatString = "PPP") => {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatString, { locale: fr })
}

// Medical-specific utilities
export const formatMedicalDate = (date: string | Date) => {
  return formatDate(date, "yyyy-MM-dd HH:mm")
}

export const formatPatientName = (firstName: string, lastName: string) => {
  return `${lastName}, ${firstName}`.toUpperCase()
}

export const formatPhoneNumber = (phone: string) => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "")
  
  // Format for Canadian phone numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

export const formatHealthCardNumber = (number: string) => {
  // Format Quebec health card number (e.g., ABCD 1234 5678)
  const cleaned = number.replace(/\s/g, "").toUpperCase()
  if (cleaned.length === 12) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8)}`
  }
  return number
}

// Validation utilities
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length === 10 || (cleaned.length === 11 && cleaned.startsWith('1'))
}

export const validateHealthCardNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s/g, "").toUpperCase()
  return cleaned.length === 12 && /^[A-Z]{4}\d{8}$/.test(cleaned)
}

export const validatePostalCode = (postalCode: string): boolean => {
  const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/
  return canadianPostalCodeRegex.test(postalCode)
}

// Medical record utilities
export const generateMedicalRecordId = (): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `MR-${timestamp}-${random}`.toUpperCase()
}

export const sanitizeMedicalText = (text: string): string => {
  // Remove potentially dangerous HTML/script tags
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim()
}

// File utilities
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
  const extension = getFileExtension(filename).toLowerCase()
  return imageExtensions.includes(extension)
}

export const isPdfFile = (filename: string): boolean => {
  return getFileExtension(filename).toLowerCase() === 'pdf'
}

// Security utilities
export const maskSensitiveData = (data: string, type: 'phone' | 'email' | 'healthCard'): string => {
  switch (type) {
    case 'phone':
      return data.replace(/(\d{3})\d{3}(\d{4})/, '$1***$2')
    case 'email':
      const [local, domain] = data.split('@')
      return `${local.slice(0, 2)}***@${domain}`
    case 'healthCard':
      return data.replace(/([A-Z]{4})\s?(\d{4})\s?(\d{4})/, '$1 **** ****')
    default:
      return data
  }
}

// Compliance utilities
export const getDataRetentionDate = (days: number = 2555): Date => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

export const isDataRetentionExpired = (createdAt: string | Date, retentionDays: number = 2555): boolean => {
  const created = typeof createdAt === 'string' ? parseISO(createdAt) : createdAt
  const retentionDate = new Date(created)
  retentionDate.setDate(retentionDate.getDate() + retentionDays)
  return new Date() > retentionDate
}

// Error handling utilities
export const createError = (message: string, code?: string): Error => {
  const error = new Error(message)
  if (code) {
    (error as any).code = code
  }
  return error
}

export const isSupabaseError = (error: any): boolean => {
  return error && (error.code || error.message?.includes('supabase'))
}

// Accessibility utilities
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9)
}

export const getAriaLabel = (action: string, context?: string): string => {
  return context ? `${action} ${context}` : action
}

// Performance utilities
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Color utilities for medical status
export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'stable':
    case 'normal':
      return 'text-medical-success'
    case 'warning':
    case 'caution':
      return 'text-medical-warning'
    case 'critical':
    case 'emergency':
      return 'text-medical-error'
    case 'pending':
    case 'review':
      return 'text-medical-info'
    default:
      return 'text-gray-600'
  }
}

export const getStatusBgColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'stable':
    case 'normal':
      return 'bg-green-100'
    case 'warning':
    case 'caution':
      return 'bg-yellow-100'
    case 'critical':
    case 'emergency':
      return 'bg-red-100'
    case 'pending':
    case 'review':
      return 'bg-blue-100'
    default:
      return 'bg-gray-100'
  }
}
