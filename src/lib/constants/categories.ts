// src/lib/constants/categories.ts

export const EVENT_CATEGORIES = [
  'Konsert',
  'Fest',
  'Konferanse', 
  'Møte',
  'Workshop',
  'Festival',
  'Sport',
  'Mat & Drikke',
  'Kunst & Kultur',
  'Annet'
] as const

export type EventCategory = typeof EVENT_CATEGORIES[number]

// Helper function to validate category
export const isValidCategory = (category: string): category is EventCategory => {
  return EVENT_CATEGORIES.includes(category as EventCategory)
}

// Category metadata for display and filtering
export const CATEGORY_METADATA = {
  'Konsert': {
    emoji: '🎵',
    description: 'Musikkarrangementer og konserter'
  },
  'Fest': {
    emoji: '🎉',
    description: 'Fester og sosiale sammenkomster'
  },
  'Konferanse': {
    emoji: '📊',
    description: 'Profesjonelle og akademiske konferanser'
  },
  'Møte': {
    emoji: '💼',
    description: 'Forretnings- og nettverksmøter'
  },
  'Workshop': {
    emoji: '🛠️',
    description: 'Læringsworkshops og kurs'
  },
  'Festival': {
    emoji: '🎪',
    description: 'Festivaler og større kulturarrangementer'
  },
  'Sport': {
    emoji: '⚽',
    description: 'Sportsarrangementer og treningsøkter'
  },
  'Mat & Drikke': {
    emoji: '🍽️',
    description: 'Matarrangementer og drikkesammenkomster'
  },
  'Kunst & Kultur': {
    emoji: '🎨',
    description: 'Kunstutstillinger og kulturelle arrangementer'
  },
  'Annet': {
    emoji: '📋',
    description: 'Andre typer arrangementer'
  }
} as const