'use client'

import { useState, useEffect, use } from 'react'
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
  address: string // Required field
  locationLink?: string | null
  ticketLink?: string | null
  category: string | null // Nullable for private events
  visibility: string
  creator: {
    id: string
    username: string
  }
  rsvps: Array<{
    id: string
    user: {
      id: string
      username: string
    }
  }>
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
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
          {event.rsvps.length > 0 && (
            <span className="text-red-600 block mt-2">
              ⚠️ {event.rsvps.length} personer har meldt seg på dette arrangementet.
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

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap the params Promise using React.use()
  const { id } = use(params)
  
  const { data: session } = useSession()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  })

  // Check if current user has RSVP'd
  const userRsvp = event?.rsvps.find(rsvp => rsvp.user.id === session?.user?.id)
  const isCreator = event?.creator.id === session?.user?.id

  useEffect(() => {
    fetchEvent()
  }, [id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events/${id}`)
      if (response.ok) {
        const eventData = await response.json()
        setEvent(eventData)
      } else if (response.status === 404) {
        setError('Arrangementet ble ikke funnet')
      } else {
        setError('Kunne ikke laste arrangementet')
      }
    } catch (error) {
      setError('Noe gikk galt')
    } finally {
      setLoading(false)
    }
  }

  const handleRsvp = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setRsvpLoading(true)
    try {
      const response = await fetch(`/api/events/${id}/rsvp`, {
        method: userRsvp ? 'DELETE' : 'POST'
      })

      if (response.ok) {
        await fetchEvent()
      } else {
        setError('Kunne ikke oppdatere påmelding')
      }
    } catch (error) {
      setError('Noe gikk galt')
    } finally {
      setRsvpLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setDeleteModal({
      isOpen: true,
      isDeleting: false
    })
  }

  const handleDeleteConfirm = async () => {
    if (!event) return

    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        const result = await response.json()
        
        // Redirect to my events page with success message
        router.push('/my-events?deleted=true')
        
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Kunne ikke slette arrangementet')
        setDeleteModal({ isOpen: false, isDeleting: false })
      }
    } catch (error) {
      setError('Noe gikk galt ved sletting av arrangementet')
      setDeleteModal({ isOpen: false, isDeleting: false })
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({
      isOpen: false,
      isDeleting: false
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Laster arrangement...</div>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Arrangementet ble ikke funnet'}
          </h2>
          <Link 
            href="/events" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Tilbake til arrangementer
          </Link>
        </div>
      </div>
    )
  }

  const isUpcoming = new Date(event.startDate) > new Date()
  const isPrivate = event.visibility === 'private'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            href="/events" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Tilbake til arrangementer
          </Link>
        </div>

        {/* Private Event Notice */}
        {isPrivate && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <div className="text-amber-600 mr-2">🔒</div>
              <div>
                <h3 className="text-sm font-medium text-amber-800">Privat arrangement</h3>
                <p className="text-sm text-amber-700 mt-1">
                  Dette arrangementet er privat og kun tilgjengelig via direktelenke
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Event Image */}
          <div className="w-full h-64 md:h-80 relative bg-gray-200">
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>

          <div className="p-6 md:p-8">
            {/* Event Header */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  {/* Category Tag - Only show for public events with category */}
                  {event.category && (
                    <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded">
                      {event.category}
                    </span>
                  )}
                  
                  {/* City Tag - Only show for public events */}
                  {event.visibility === 'public' && event.location !== 'Privat arrangement' && (
                    <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">
                      📍 {event.location}
                    </span>
                  )}
                  
                  {!isUpcoming && (
                    <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded">
                      AVSLUTTET
                    </span>
                  )}
                  
                  {isPrivate && (
                    <span className="inline-block bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded">
                      🔒 PRIVAT
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <span>Opprettet av <span className="font-medium">{event.creator.username}</span></span>
                  {isCreator && (
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/events/${event.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        ✏️ Rediger
                      </Link>
                      <button
                        onClick={handleDeleteClick}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        🗑️ Slett
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Desktop only - Non-creators only */}
              {isUpcoming && !isCreator && (
                <div className="mt-4 md:mt-0 md:ml-6 space-y-3 hidden md:block">
                  {/* Ticket Link - Always show if available */}
                  {event.ticketLink && (
                    <div>
                      <a
                        href={event.ticketLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium text-center"
                      >
                        🎫 Kjøp billetter
                      </a>
                    </div>
                  )}

                  {/* RSVP Button - Desktop */}
                  <button
                    onClick={handleRsvp}
                    disabled={rsvpLoading}
                    className={`w-full px-6 py-2 rounded-md font-medium transition-colors ${
                      userRsvp
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {rsvpLoading ? 'Oppdaterer...' : userRsvp ? "✓ Jeg kommer!" : "Jeg kommer"}
                  </button>
                </div>
              )}
            </div>

            {/* Event Details Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* Left Column - Event Info */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Arrangementsdetaljer</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <span className="text-xl mr-3 mt-1">📅</span>
                    <div>
                      <div className="font-medium text-gray-900">Start</div>
                      <div className="text-gray-600">{formatDateTime(event.startDate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-xl mr-3 mt-1">🏁</span>
                    <div>
                      <div className="font-medium text-gray-900">Slutt</div>
                      <div className="text-gray-600">{formatDateTime(event.endDate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-xl mr-3 mt-1">📍</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Sted</div>
                      <div className="text-gray-600">{event.address}</div>
                      {event.locationLink && (
                        <a
                          href={event.locationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          🗺️ Se sted →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Attendees */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Hvem kommer ({event.rsvps.length})
                </h2>
                
                {event.rsvps.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {event.rsvps.map(rsvp => (
                      <div key={rsvp.id} className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                          {rsvp.user.username[0].toUpperCase()}
                        </div>
                        <span className="text-gray-700">{rsvp.user.username}</span>
                        {rsvp.user.id === session?.user?.id && (
                          <span className="ml-2 text-xs text-blue-600 font-medium">(Deg)</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <div className="text-4xl mb-2">👻</div>
                    <div>Ingen kommer enda</div>
                    {isUpcoming && !isCreator && (
                      <div className="text-sm mt-1">Bli den første til å melde deg på!</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Event Description */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Om arrangementet</h2>
              <div className="prose prose-gray max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-wrap-anywhere">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Action Footer for Mobile - Non-creators only */}
            {isUpcoming && !isCreator && (
              <div className="mt-8 pt-6 border-t border-gray-200 md:hidden">
                <div className="space-y-3">
                  {event.ticketLink && (
                    <a
                      href={event.ticketLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 font-medium text-center"
                    >
                      🎫 Kjøp billetter
                    </a>
                  )}
                  <button
                    onClick={handleRsvp}
                    disabled={rsvpLoading}
                    className={`w-full px-6 py-3 rounded-md font-medium transition-colors ${
                      userRsvp
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {rsvpLoading ? 'Oppdaterer...' : userRsvp ? "✓ Jeg kommer!" : "Jeg kommer"}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Creator Management */}
            {isCreator && (
              <div className="mt-8 pt-6 border-t border-gray-200 md:hidden">
                <div className="space-y-3">
                  <Link
                    href={`/events/${event.id}/edit`}
                    className="w-full bg-blue-600 text-white font-medium flex items-center justify-center gap-2 px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    ✏️ Rediger arrangement
                  </Link>
                  <button
                    onClick={handleDeleteClick}
                    className="w-full text-red-600 hover:text-red-800 font-medium flex items-center justify-center gap-2 px-4 py-2 border border-red-200 rounded-md hover:bg-red-50"
                  >
                    🗑️ Slett arrangement
                  </button>
                </div>
              </div>
            )}

            {/* Creator Status for Mobile (Non-upcoming events) */}
            {!isUpcoming && isCreator && (
              <div className="mt-8 pt-6 border-t border-gray-200 md:hidden">
                <div className="bg-green-50 text-green-800 px-4 py-2 rounded-md text-sm font-medium text-center">
                  Ditt arrangement
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <DeleteConfirmModal
          event={event}
          isOpen={deleteModal.isOpen}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          isDeleting={deleteModal.isDeleting}
        />
      </div>
    </div>
  )
}