// src/lib/constants/locations.ts

export const NORWEGIAN_CITIES = [
  'Oslo',
  'Bergen',
  'Trondheim', 
  'Stavanger',
  'Kristiansand',
  'Tromsø',
  'Drammen',
  'Fredrikstad',
  'Annet'
] as const

export type NorwegianCity = typeof NORWEGIAN_CITIES[number]

// Helper function to validate location
export const isValidLocation = (location: string): location is NorwegianCity => {
  return NORWEGIAN_CITIES.includes(location as NorwegianCity)
}