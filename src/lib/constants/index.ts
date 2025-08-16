// src/lib/constants/index.ts

// Re-export all constants for easy importing
export * from './categories'
export * from './locations'

// Combined exports for convenience
export { EVENT_CATEGORIES, type EventCategory, isValidCategory, CATEGORY_METADATA } from './categories'
export { NORWEGIAN_CITIES, type NorwegianCity, isValidLocation } from './locations'