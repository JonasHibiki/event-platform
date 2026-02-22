// src/lib/constants/locations.ts

export const NORWEGIAN_CITIES = [
  'Oslo',
  'Bergen',
  'Trondheim',
  'Stavanger',
  'Kristiansand',
  'Tromso',
  'Drammen',
  'Fredrikstad',
  'Other'
] as const

export type NorwegianCity = typeof NORWEGIAN_CITIES[number]

export const isValidLocation = (location: string): location is NorwegianCity => {
  return NORWEGIAN_CITIES.includes(location as NorwegianCity)
}
