'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface Event {
  id: string
  title: string
  description: string
  imageUrl: string
  startDate: string
  endDate: string
  location: string
  address: string
  category: string | null
  visibility: string
  creator: {
    id: string
    username: string
  }
  _count: {
    rsvps: number
  }
}

interface MyEventsData {
  createdEvents: Event[]
  attendingEvents: Event[]
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nb-NO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nb-NO', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

// Delete Confirmation Modal
function DeleteConfirmModal({ 
  event, 
  isOpen, 
  onClose, 
  onConfirm, 
  isDeleting 
}: {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Slett arrangement?
        </h3>
        
        <p className="text-gray-600 mb-4">
          Er du sikker på at du vil slette arrangementet <strong>"{event.title}"</strong>?
          {event._count.rsvps > 0 && (
            <span className="text-red-600 block mt-2">
              ⚠️ {event._count.rsvps} personer har meldt seg på dette arrangementet.
            </span>
          )}
        </p>
        
        <p className="text-sm text-gray-500 mb-6">
          Denne handlingen kan ikke angres.
        </p>
        
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? 'Sletter...' : 'Slett arrangement'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EventCard({ 
  event, 
  showManagement = false,
  onDelete 
}: { 
  event: Event
  showManagement?: boolean
  onDelete?: (event: Event) => void
}) {
  const isUpcoming = new Date(event.startDate) > new Date()
  const isPrivate = event.visibility === 'private'
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Event Image */}
      <Link href={`/events/${event.id}`}>
        <div className="w-full h-32 relative bg-gray-200 hover:opacity-95 transition-opacity">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Event Status Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {event.category && (
              <span className="inline-block bg-white/90 backdrop-blur text-gray-900 text-xs font-medium px-2 py-1 rounded">
                {event.category}
              </span>
            )}
            {isPrivate && (
              <span className="inline-block bg-amber-500/90 backdrop-blur text-white text-xs font-medium px-2 py-1 rounded">
                🔒 PRIVAT
              </span>
            )}
          </div>
          {!isUpcoming && (
            <div className="absolute top-2 right-2">
              <span className="inline-block bg-black/70 text-white text-xs font-medium px-2 py-1 rounded">
                AVSLUTTET
              </span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Event Content */}
      <div className="p-4">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {event.title}
          </h3>
        </Link>
        
        {/* Event Details */}
        <div className="space-y-1 text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <span className="mr-1">📅</span>
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center">
            <span className="mr-1">🕐</span>
            {formatTime(event.startDate)} - {formatTime(event.endDate)}
          </div>
          <div className="flex items-center">
            <span className="mr-1">📍</span>
            <span className="line-clamp-1">{event.address}</span>
          </div>
          <div className="flex items-center">
            <span className="mr-1">👥</span>
            {event._count.rsvps} deltar
          </div>
        </div>
        
        {/* Management Buttons for Created Events */}
        {showManagement && (
          <div className="flex gap-2 pt-3 border-t border-gray-100">
            <Link
              href={`/events/${event.id}/edit`}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-center text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              ✏️ Rediger
            </Link>
            <button
              onClick={() => onDelete?.(event)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-red-700 transition-colors"
            >
              🗑️ Slett
            </button>
          </div>
        )}

        {/* Link to Event for Attending Events */}
        {!showManagement && (
          <div className="pt-3 border-t border-gray-100">
            <Link
              href={`/events/${event.id}`}
              className="block w-full bg-gray-100 text-gray-700 px-3 py-2 rounded text-center text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Se arrangement →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MyEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<MyEventsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    event: null as Event | null,
    isDeleting: false
  })

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-600">Laster...</div>
    </div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  useEffect(() => {
    fetchMyEvents()
  }, [])

  const fetchMyEvents = async () => {
    try {
      const response = await fetch('/api/my-events')
      if (response.ok) {
        const eventsData = await response.json()
        setData(eventsData)
      } else {
        setError('Kunne ikke laste dine arrangementer')
      }
    } catch (error) {
      setError('Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (event: Event) => {
    setDeleteModal({
      isOpen: true,
      event: event,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.event) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      const response = await fetch(`/api/events/${deleteModal.event.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Refresh the events list
        await fetchMyEvents()
        
        // Close modal
        setDeleteModal({
          isOpen: false,
          event: null,
          isDeleting: false
        })
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Kunne ikke slette arrangementet')
        setDeleteModal(prev => ({ ...prev, isDeleting: false }))
      }
    } catch (error) {
      setError('Noe gikk galt ved sletting av arrangementet')
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      event: null,
      isDeleting: false
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Laster dine arrangementer...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Prøv igjen
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  // Separate upcoming and past events
  const upcomingCreated = data.createdEvents.filter(event => new Date(event.startDate) > new Date())
  const pastCreated = data.createdEvents.filter(event => new Date(event.startDate) <= new Date())
  const upcomingAttending = data.attendingEvents.filter(event => new Date(event.startDate) > new Date())
  const pastAttending = data.attendingEvents.filter(event => new Date(event.startDate) <= new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mine arrangementer</h1>
          <p className="text-gray-600">Oversikt over dine arrangementer og påmeldinger</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}
        
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{data.createdEvents.length}</div>
            <div className="text-sm text-gray-600">Opprettet</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{data.attendingEvents.length}</div>
            <div className="text-sm text-gray-600">Påmeldt</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{upcomingCreated.length + upcomingAttending.length}</div>
            <div className="text-sm text-gray-600">Kommende</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{pastCreated.length + pastAttending.length}</div>
            <div className="text-sm text-gray-600">Tidligere</div>
          </div>
        </div>

        {/* My Created Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Arrangementer du har opprettet ({data.createdEvents.length})
            </h2>
            <Link
              href="/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium text-sm"
            >
              + Opprett nytt
            </Link>
          </div>

          {/* Upcoming Created Events */}
          {upcomingCreated.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kommende arrangementer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingCreated.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    showManagement={true}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Past Created Events */}
          {pastCreated.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tidligere arrangementer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {pastCreated.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    showManagement={true}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Created Events */}
          {data.createdEvents.length === 0 && (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🎪</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Du har ikke opprettet noen arrangementer enda</h3>
              <p className="text-gray-600 mb-4">Opprett ditt første arrangement og få folk til å samles!</p>
              <Link
                href="/create"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
              >
                Opprett ditt første arrangement
              </Link>
            </div>
          )}
        </div>

        {/* Events I'm Attending */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Arrangementer du deltar på ({data.attendingEvents.length})
          </h2>

          {/* Upcoming Attending Events */}
          {upcomingAttending.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Kommende arrangementer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAttending.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Past Attending Events */}
          {pastAttending.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tidligere arrangementer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {pastAttending.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State for Attending Events */}
          {data.attendingEvents.length === 0 && (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">🎫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Du har ikke meldt deg på noen arrangementer enda</h3>
              <p className="text-gray-600 mb-4">Utforsk arrangementer og finn noe gøy å gjøre!</p>
              <Link
                href="/events"
                className="inline-block bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
              >
                Utforsk arrangementer
              </Link>
            </div>
          )}
        </div>

        {/* Quick Action Buttons */}
        <div className="bg-white rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Kom i gang</h3>
          <div className="flex gap-4 justify-center">
            <Link
              href="/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              + Opprett arrangement
            </Link>
            <Link
              href="/events"
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 font-medium"
            >
              Utforsk arrangementer
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        event={deleteModal.event}
        isOpen={deleteModal.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteModal.isDeleting}
      />
    </div>
  )
}