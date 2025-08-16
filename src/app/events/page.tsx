'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { NORWEGIAN_CITIES } from '@/lib/constants/locations'

// Type definitions
interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  location: string
  address: string
  category: string | null
  imageUrl: string
  locationLink?: string | null
  ticketLink?: string | null
  visibility: string
  creator: {
    id: string
    username: string
  }
  _count: {
    rsvps: number
  }
}

interface Filters {
  category: string
  city: string
  startDate: string
  endDate: string
  quickFilter: string
}

// Category Filter Modal
function CategoryModal({ 
  isOpen, 
  onClose, 
  selectedCategory, 
  onSelectCategory 
}: {
  isOpen: boolean
  onClose: () => void
  selectedCategory: string
  onSelectCategory: (category: string) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Velg kategori</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => {
              onSelectCategory('')
              onClose()
            }}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
              selectedCategory === '' 
                ? 'bg-blue-100 text-blue-800 font-medium' 
                : 'hover:bg-gray-100'
            }`}
          >
            Alle kategorier
          </button>
          
          {EVENT_CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => {
                onSelectCategory(category)
                onClose()
              }}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                selectedCategory === category 
                  ? 'bg-blue-100 text-blue-800 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// City Filter Modal
function CityModal({ 
  isOpen, 
  onClose, 
  selectedCity, 
  onSelectCity 
}: {
  isOpen: boolean
  onClose: () => void
  selectedCity: string
  onSelectCity: (city: string) => void
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Velg sted</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2">
          <button
            onClick={() => {
              onSelectCity('')
              onClose()
            }}
            className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
              selectedCity === '' 
                ? 'bg-green-100 text-green-800 font-medium' 
                : 'hover:bg-gray-100'
            }`}
          >
            Alle byer
          </button>
          
          {NORWEGIAN_CITIES.filter(city => city !== 'Annet').map(city => (
            <button
              key={city}
              onClick={() => {
                onSelectCity(city)
                onClose()
              }}
              className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                selectedCity === city 
                  ? 'bg-green-100 text-green-800 font-medium' 
                  : 'hover:bg-gray-100'
              }`}
            >
              📍 {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// Date Filter Modal
function DateModal({ 
  isOpen, 
  onClose, 
  startDate, 
  endDate, 
  onSelectDates 
}: {
  isOpen: boolean
  onClose: () => void
  startDate: string
  endDate: string
  onSelectDates: (startDate: string, endDate: string) => void
}) {
  const [tempStartDate, setTempStartDate] = useState(startDate)
  const [tempEndDate, setTempEndDate] = useState(endDate)

  useEffect(() => {
    setTempStartDate(startDate)
    setTempEndDate(endDate)
  }, [startDate, endDate])

  if (!isOpen) return null

  const handleApply = () => {
    onSelectDates(tempStartDate, tempEndDate)
    onClose()
  }

  const handleClear = () => {
    setTempStartDate('')
    setTempEndDate('')
    onSelectDates('', '')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Velg datoperiode</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="modalStartDate" className="block text-sm font-medium text-gray-700 mb-2">
              Fra dato
            </label>
            <input
              type="date"
              id="modalStartDate"
              value={tempStartDate}
              onChange={(e) => setTempStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="modalEndDate" className="block text-sm font-medium text-gray-700 mb-2">
              Til dato
            </label>
            <input
              type="date"
              id="modalEndDate"
              value={tempEndDate}
              onChange={(e) => setTempEndDate(e.target.value)}
              min={tempStartDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Nullstill
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Bruk filter
          </button>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date(dateString))
}

function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString))
}

function getWeekendDates() {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  
  // Calculate this weekend (Friday evening to Sunday night)
  let fridayDate = new Date(now)
  const daysUntilFriday = (5 - dayOfWeek + 7) % 7
  
  if (dayOfWeek === 5 || dayOfWeek === 6 || dayOfWeek === 0) {
    // It's already weekend (Friday, Saturday, or Sunday)
    if (dayOfWeek === 5) fridayDate = new Date(now) // Today is Friday
    else if (dayOfWeek === 6) fridayDate.setDate(now.getDate() - 1) // Yesterday was Friday
    else fridayDate.setDate(now.getDate() - 2) // Friday was 2 days ago
  } else {
    // Calculate next Friday
    fridayDate.setDate(now.getDate() + daysUntilFriday)
  }
  
  const fridayStart = new Date(fridayDate)
  fridayStart.setHours(18, 0, 0, 0) // Friday 6 PM
  
  const sundayEnd = new Date(fridayDate)
  sundayEnd.setDate(fridayDate.getDate() + 2)
  sundayEnd.setHours(23, 59, 59, 999) // Sunday 11:59 PM
  
  return { 
    start: fridayStart.toISOString().split('T')[0], 
    end: sundayEnd.toISOString().split('T')[0] 
  }
}

function getTodayDates() {
  const today = new Date().toISOString().split('T')[0]
  return { start: today, end: today }
}

function EventCard({ event }: { event: Event }) {
  const isUpcoming = new Date(event.startDate) > new Date()
  
  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Event Image */}
        <div className="w-full h-48 relative bg-gray-200">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Category Badge Overlay - Only show if category exists */}
          {event.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-block bg-white/90 backdrop-blur text-gray-900 text-xs font-medium px-2.5 py-1 rounded">
                {event.category}
              </span>
            </div>
          )}
          {/* City Badge Overlay - Show city for public events */}
          {event.location !== 'Privat arrangement' && (
            <div className="absolute top-3 right-3">
              <span className="inline-block bg-green-500/90 backdrop-blur text-white text-xs font-medium px-2.5 py-1 rounded">
                📍 {event.location}
              </span>
            </div>
          )}
          {/* Past Event Badge */}
          {!isUpcoming && (
            <div className="absolute bottom-3 right-3">
              <span className="inline-block bg-black/70 text-white text-xs font-medium px-2.5 py-1 rounded">
                AVSLUTTET
              </span>
            </div>
          )}
        </div>
        
        {/* Event Content */}
        <div className="p-4">
          {/* Event Title */}
          <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
            {event.title}
          </h3>
          
          {/* Event Description */}
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {event.description}
          </p>
          
          {/* Event Details */}
          <div className="space-y-1 text-sm text-gray-500">
            <div className="flex items-center">
              <span className="font-medium mr-1">📅</span>
              {formatDate(event.startDate)}
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">🕐</span>
              {formatTime(event.startDate)} - {formatTime(event.endDate)}
            </div>
            <div className="flex items-center">
              <span className="font-medium mr-1">📍</span>
              <span className="line-clamp-1">{event.address}</span>
            </div>
          </div>
          
          {/* Event Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center text-sm text-gray-500">
              <span className="mr-1">👤</span>
              av {event.creator.username}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              {event.ticketLink && (
                <span className="text-green-600 font-medium">🎫 Billetter</span>
              )}
              <span>{event._count.rsvps} deltar</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [filters, setFilters] = useState<Filters>({
    category: '',
    city: '',
    startDate: '',
    endDate: '',
    quickFilter: ''
  })

  const [modals, setModals] = useState({
    category: false,
    city: false,
    date: false
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events')
      if (response.ok) {
        const eventsData = await response.json()
        setEvents(eventsData)
      } else {
        setError('Kunne ikke laste arrangementer')
      }
    } catch (error) {
      setError('Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  const openModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: true }))
  }

  const closeModal = (modalName: keyof typeof modals) => {
    setModals(prev => ({ ...prev, [modalName]: false }))
  }

  const handleCategorySelect = (category: string) => {
    setFilters(prev => ({ ...prev, category }))
  }

  const handleCitySelect = (city: string) => {
    setFilters(prev => ({ ...prev, city }))
  }

  const handleDateSelect = (startDate: string, endDate: string) => {
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate,
      quickFilter: ''
    }))
  }

  const handleQuickFilter = (filterType: string) => {
    if (filterType === 'today') {
      const { start, end } = getTodayDates()
      setFilters(prev => ({
        ...prev,
        startDate: start,
        endDate: end,
        quickFilter: 'today'
      }))
    } else if (filterType === 'weekend') {
      const { start, end } = getWeekendDates()
      setFilters(prev => ({
        ...prev,
        startDate: start,
        endDate: end,
        quickFilter: 'weekend'
      }))
    }
  }

  const clearAllFilters = () => {
    setFilters({
      category: '',
      city: '',
      startDate: '',
      endDate: '',
      quickFilter: ''
    })
  }

  // Apply filters to events
  const filteredEvents = events.filter(event => {
    // Category filter
    if (filters.category && event.category !== filters.category) return false
    
    // City filter
    if (filters.city && event.location !== filters.city) return false
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      const eventDate = new Date(event.startDate).toISOString().split('T')[0]
      
      if (filters.startDate && eventDate < filters.startDate) return false
      if (filters.endDate && eventDate > filters.endDate) return false
    }
    
    return true
  })

  const upcomingEvents = filteredEvents.filter(event => new Date(event.startDate) > new Date())
  const pastEvents = filteredEvents.filter(event => new Date(event.startDate) <= new Date())

  const hasActiveFilters = filters.category || filters.city || filters.startDate || filters.endDate

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Laster arrangementer...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Oppdag arrangementer</h1>
          <p className="text-gray-600">Finn fantastiske arrangementer som skjer rundt deg</p>
        </div>

        {/* Compact Filter Buttons */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3">
            {/* Category Filter Button */}
            <button
              onClick={() => openModal('category')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                filters.category
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🏷️ {filters.category || 'Kategori'}
            </button>

            {/* City Filter Button */}
            <button
              onClick={() => openModal('city')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                filters.city
                  ? 'bg-green-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📍 {filters.city || 'Sted'}
            </button>

            {/* Quick Date Filters */}
            <button
              onClick={() => handleQuickFilter('today')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.quickFilter === 'today'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📅 I dag
            </button>

            <button
              onClick={() => handleQuickFilter('weekend')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.quickFilter === 'weekend'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🎉 Denne helgen
            </button>

            {/* Custom Date Filter Button */}
            <button
              onClick={() => openModal('date')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                (filters.startDate || filters.endDate) && !filters.quickFilter
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              📆 Velg dato
            </button>

            {/* Clear All Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                🗑️ Nullstill alle
              </button>
            )}
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-4 text-sm text-gray-600">
              Viser {filteredEvents.length} av {events.length} arrangementer
              {filters.quickFilter === 'today' && ' (i dag)'}
              {filters.quickFilter === 'weekend' && ' (denne helgen)'}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {/* Results Summary */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</div>
            <div className="text-sm text-gray-600">Kommende arrangementer</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{pastEvents.length}</div>
            <div className="text-sm text-gray-600">Tidligere arrangementer</div>
          </div>
        </div>
        
        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Kommende arrangementer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        
        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Tidligere arrangementer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {pastEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}
        
        {/* No Results */}
        {filteredEvents.length === 0 && events.length > 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ingen arrangementer funnet</h3>
            <p className="text-gray-600 mb-6">Prøv å justere filtrene dine eller sjekk andre kategorier</p>
            <button
              onClick={clearAllFilters}
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Nullstill filtre
            </button>
          </div>
        )}

        {/* Empty State - No events at all */}
        {events.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ingen arrangementer enda</h3>
            <p className="text-gray-600 mb-6">Bli den første til å opprette et arrangement!</p>
            <Link
              href="/create"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Opprett ditt første arrangement
            </Link>
          </div>
        )}
        
        {/* Create Event CTA */}
        {events.length > 0 && (
          <div className="text-center mt-12">
            <Link
              href="/create"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 font-medium"
            >
              + Opprett nytt arrangement
            </Link>
          </div>
        )}

        {/* Filter Modals */}
        <CategoryModal
          isOpen={modals.category}
          onClose={() => closeModal('category')}
          selectedCategory={filters.category}
          onSelectCategory={handleCategorySelect}
        />

        <CityModal
          isOpen={modals.city}
          onClose={() => closeModal('city')}
          selectedCity={filters.city}
          onSelectCity={handleCitySelect}
        />

        <DateModal
          isOpen={modals.date}
          onClose={() => closeModal('date')}
          startDate={filters.startDate}
          endDate={filters.endDate}
          onSelectDates={handleDateSelect}
        />
      </div>
    </div>
  )
}