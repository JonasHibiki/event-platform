// src/lib/constants/categories.ts

export const EVENT_CATEGORIES = [
  'Music',
  'Nightlife',
  'Conference',
  'Networking',
  'Workshop',
  'Festival',
  'Sports',
  'Food & Drink',
  'Arts & Culture',
  'Other'
] as const

export type EventCategory = typeof EVENT_CATEGORIES[number]

export const isValidCategory = (category: string): category is EventCategory => {
  return EVENT_CATEGORIES.includes(category as EventCategory)
}

// Category metadata with icon keys for filter UI
export const CATEGORY_METADATA: Record<string, { icon: string; description: string }> = {
  'Music': {
    icon: 'music',
    description: 'Concerts, gigs, and live music'
  },
  'Nightlife': {
    icon: 'nightlife',
    description: 'Parties and social gatherings'
  },
  'Conference': {
    icon: 'conference',
    description: 'Professional and academic conferences'
  },
  'Networking': {
    icon: 'networking',
    description: 'Business and networking meetups'
  },
  'Workshop': {
    icon: 'workshop',
    description: 'Learning workshops and courses'
  },
  'Festival': {
    icon: 'festival',
    description: 'Festivals and large cultural events'
  },
  'Sports': {
    icon: 'sports',
    description: 'Sports events and fitness sessions'
  },
  'Food & Drink': {
    icon: 'food',
    description: 'Food events and drink gatherings'
  },
  'Arts & Culture': {
    icon: 'arts',
    description: 'Art exhibitions and cultural events'
  },
  'Other': {
    icon: 'other',
    description: 'Other types of events'
  }
} as const
