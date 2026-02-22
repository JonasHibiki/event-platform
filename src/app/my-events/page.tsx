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

/* SVG Icons */
function CalendarIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function ClockIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function PinIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function UsersIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}

function DeleteConfirmModal({
  event, isOpen, onClose, onConfirm, isDeleting
}: {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeleting: boolean
}) {
  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="rounded-xl p-6 max-w-md w-full" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Delete event?
        </h3>

        <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
          Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>&quot;{event.title}&quot;</strong>?
          {event._count.rsvps > 0 && (
            <span className="block mt-2" style={{ color: 'var(--destructive)' }}>
              {event._count.rsvps} people have RSVP&apos;d to this event.
            </span>
          )}
        </p>

        <p className="text-xs mb-6" style={{ color: 'var(--text-tertiary)' }}>
          This action cannot be undone.
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
            style={{ color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'var(--destructive)', color: '#fff' }}
          >
            {isDeleting ? 'Deleting...' : 'Delete event'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EventCard({
  event, showManagement = false, onDelete
}: {
  event: Event
  showManagement?: boolean
  onDelete?: (event: Event) => void
}) {
  const isUpcoming = new Date(event.startDate) > new Date()
  const isPrivate = event.visibility === 'private'

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
      <Link href={`/events/${event.id}`}>
        <div className="w-full h-32 relative" style={{ background: 'var(--bg-tertiary)' }}>
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2 flex gap-1">
            {event.category && (
              <span className="text-xs font-medium px-2 py-1 rounded-full backdrop-blur" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                {event.category}
              </span>
            )}
            {isPrivate && (
              <span className="text-xs font-medium px-2 py-1 rounded-full backdrop-blur" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                Private
              </span>
            )}
          </div>
          {!isUpcoming && (
            <div className="absolute top-2 right-2">
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
                ENDED
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/events/${event.id}`}>
          <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:opacity-80 transition-opacity" style={{ color: 'var(--text-primary)' }}>
            {event.title}
          </h3>
        </Link>

        <div className="space-y-1.5 text-xs mb-3" style={{ color: 'var(--text-tertiary)' }}>
          <div className="flex items-center gap-1.5">
            <CalendarIcon />
            {formatDate(event.startDate)}
          </div>
          <div className="flex items-center gap-1.5">
            <ClockIcon />
            {formatTime(event.startDate)} - {formatTime(event.endDate)}
          </div>
          <div className="flex items-center gap-1.5">
            <PinIcon />
            <span className="line-clamp-1">{event.address}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <UsersIcon />
            {event._count.rsvps} going
          </div>
        </div>

        {showManagement && (
          <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <Link
              href={`/events/${event.id}/edit`}
              className="flex-1 py-2 rounded-lg text-center text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
            >
              Edit
            </Link>
            <button
              onClick={() => onDelete?.(event)}
              className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--destructive)' }}
            >
              Delete
            </button>
          </div>
        )}

        {!showManagement && (
          <div className="pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <Link
              href={`/events/${event.id}`}
              className="block w-full py-2 rounded-lg text-center text-xs font-medium transition-colors"
              style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
            >
              View event
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

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (status === 'authenticated') {
      fetchMyEvents()
    }
  }, [status, router])

  const fetchMyEvents = async () => {
    try {
      const response = await fetch('/api/my-events')
      if (response.ok) {
        const eventsData = await response.json()
        setData(eventsData)
      } else {
        setError('Could not load your events')
      }
    } catch (fetchError) {
      setError('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (event: Event) => {
    setDeleteModal({ isOpen: true, event: event, isDeleting: false })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.event) return
    setDeleteModal(prev => ({ ...prev, isDeleting: true }))

    try {
      const response = await fetch(`/api/events/${deleteModal.event.id}`, { method: 'DELETE' })
      if (response.ok) {
        await fetchMyEvents()
        setDeleteModal({ isOpen: false, event: null, isDeleting: false })
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Could not delete event')
        setDeleteModal(prev => ({ ...prev, isDeleting: false }))
      }
    } catch (deleteError) {
      setError('Something went wrong while deleting the event')
      setDeleteModal(prev => ({ ...prev, isDeleting: false }))
    }
  }

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, event: null, isDeleting: false })
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div style={{ color: 'var(--text-tertiary)' }}>Loading your events...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') return null

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  if (!data) return null

  const upcomingCreated = data.createdEvents.filter(event => new Date(event.startDate) > new Date())
  const pastCreated = data.createdEvents.filter(event => new Date(event.startDate) <= new Date())
  const upcomingAttending = data.attendingEvents.filter(event => new Date(event.startDate) > new Date())
  const pastAttending = data.attendingEvents.filter(event => new Date(event.startDate) <= new Date())

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>My events</h1>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>Overview of your events and RSVPs</p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <p className="text-sm" style={{ color: 'var(--destructive)' }}>{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Created', value: data.createdEvents.length },
            { label: 'Attending', value: data.attendingEvents.length },
            { label: 'Upcoming', value: upcomingCreated.length + upcomingAttending.length },
            { label: 'Past', value: pastCreated.length + pastAttending.length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-4 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</div>
              <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Created Events */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
              Your events ({data.createdEvents.length})
            </h2>
            <Link
              href="/create"
              className="px-4 py-2 rounded-lg font-medium text-xs transition-colors"
              style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
            >
              + Create new
            </Link>
          </div>

          {upcomingCreated.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Upcoming</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingCreated.map(event => (
                  <EventCard key={event.id} event={event} showManagement={true} onDelete={handleDeleteClick} />
                ))}
              </div>
            </div>
          )}

          {pastCreated.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Past</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {pastCreated.map(event => (
                  <EventCard key={event.id} event={event} showManagement={true} onDelete={handleDeleteClick} />
                ))}
              </div>
            </div>
          )}

          {data.createdEvents.length === 0 && (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No events yet</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Create your first event and bring people together</p>
              <Link
                href="/create"
                className="inline-block px-6 py-2 rounded-lg font-medium text-sm"
                style={{ background: 'var(--text-primary)', color: 'var(--bg-primary)' }}
              >
                Create event
              </Link>
            </div>
          )}
        </div>

        {/* Attending Events */}
        <div className="mb-12">
          <h2 className="text-lg font-medium mb-6" style={{ color: 'var(--text-primary)' }}>
            Attending ({data.attendingEvents.length})
          </h2>

          {upcomingAttending.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Upcoming</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAttending.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {pastAttending.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--text-secondary)' }}>Past</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">
                {pastAttending.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}

          {data.attendingEvents.length === 0 && (
            <div className="rounded-xl p-8 text-center" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No RSVPs yet</h3>
              <p className="text-xs mb-4" style={{ color: 'var(--text-tertiary)' }}>Explore events and find something great</p>
              <Link
                href="/events"
                className="inline-block px-6 py-2 rounded-lg font-medium text-sm"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Explore events
              </Link>
            </div>
          )}
        </div>
      </div>

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
