'use client'

import { useState, useEffect, use, useCallback } from 'react'
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
  locationLink?: string | null
  ticketLink?: string | null
  category: string | null
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

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString))
}

function formatTimeRange(start: string, end: string): string {
  const fmt = (d: string) => new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(d))
  return `${fmt(start)} - ${fmt(end)}`
}

const CalendarIcon = () => (
  <svg className="w-[18px] h-[18px] text-[#666] flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const ClockIcon = () => (
  <svg className="w-[18px] h-[18px] text-[#666] flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const PinIcon = () => (
  <svg className="w-[18px] h-[18px] text-[#666] flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
)

const ExternalIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
  </svg>
)

const ArrowLeftIcon = () => (
  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
)

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
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 max-w-md w-full">
        <h3 className="text-[16px] font-semibold text-[#f5f5f5] mb-4">Delete event?</h3>
        <p className="text-[14px] text-[#a0a0a0] mb-4">
          Are you sure you want to delete <span className="text-[#f5f5f5] font-medium">&quot;{event.title}&quot;</span>?
          {event.rsvps.length > 0 && (
            <span className="text-[#ef4444] block mt-2">
              {event.rsvps.length} {event.rsvps.length === 1 ? 'person has' : 'people have'} RSVP&apos;d to this event.
            </span>
          )}
        </p>
        <p className="text-[12px] text-[#666] mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} disabled={isDeleting} className="px-4 py-2 text-[13px] font-medium text-[#a0a0a0] hover:text-[#f5f5f5] disabled:opacity-50 transition-colors">Cancel</button>
          <button onClick={onConfirm} disabled={isDeleting} className="px-4 py-2 text-[13px] font-medium bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] disabled:opacity-50 transition-colors">
            {isDeleting ? 'Deleting...' : 'Delete event'}
          </button>
        </div>
      </div>
    </div>
  )
}

function PublicEventView({
  event, session, isUpcoming, isCreator, userRsvp, rsvpLoading, onRsvp, onDeleteClick
}: {
  event: Event; session: any; isUpcoming: boolean; isCreator: boolean; userRsvp: boolean; rsvpLoading: boolean; onRsvp: () => void; onDeleteClick: () => void
}) {
  return (
    <div className="max-w-[720px] mx-auto px-5 pb-28 sm:pb-10">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#666] hover:text-[#a0a0a0] py-4 transition-colors">
        <ArrowLeftIcon /> Back
      </Link>

      <div className="relative w-[calc(100%+40px)] -ml-5 sm:w-full sm:ml-0 sm:rounded-2xl sm:mt-2 aspect-video overflow-hidden bg-[#1a1a1a]">
        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 720px" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent pointer-events-none" />
        <div className="absolute top-4 left-4 flex gap-2">
          {event.category && <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xl text-[#f5f5f5]">{event.category}</span>}
          {event.location !== 'Private event' && <span className="text-[11px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xl text-[#f5f5f5]">{event.location}</span>}
        </div>
      </div>

      <div className="pt-6">
        {(event.category || event.location !== 'Private event') && (
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {event.category && <span className="text-[12px] font-semibold uppercase tracking-wider text-[#a0a0a0]">{event.category}</span>}
            {event.category && event.location !== 'Private event' && <span className="w-[3px] h-[3px] rounded-full bg-[#666]" />}
            {event.location !== 'Private event' && <span className="text-[12px] font-medium text-[#666]">{event.location}</span>}
          </div>
        )}

        <h1 className="text-[28px] sm:text-[36px] font-bold leading-[1.15] tracking-tight text-[#f5f5f5] mb-7">{event.title}</h1>

        {isCreator && (
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/events/${event.id}/edit`} className="text-[13px] font-medium text-[#666] hover:text-[#a0a0a0] transition-colors">Edit</Link>
            <button onClick={onDeleteClick} className="text-[13px] font-medium text-[#666] hover:text-[#ef4444] transition-colors">Delete</button>
          </div>
        )}

        <div className="grid gap-px bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden mb-8">
          <div className="flex items-start gap-3.5 px-[18px] py-4 bg-[#111]">
            <CalendarIcon />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#666] mb-0.5">Date</div>
              <div className="text-[14px] text-[#f5f5f5]">{formatDate(event.startDate)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 px-[18px] py-4 bg-[#111]">
            <ClockIcon />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#666] mb-0.5">Time</div>
              <div className="text-[14px] text-[#f5f5f5]">{formatTimeRange(event.startDate, event.endDate)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 px-[18px] py-4 bg-[#111]">
            <PinIcon />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#666] mb-0.5">Location</div>
              <div className="text-[14px] text-[#f5f5f5]">{event.address}</div>
              {event.locationLink && (
                <a href={event.locationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] text-[#a0a0a0] hover:text-[#f5f5f5] mt-1 transition-colors">
                  View on map <ExternalIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {isUpcoming && !isCreator && (
          <div className="hidden sm:flex gap-2.5 mb-10">
            <button onClick={onRsvp} disabled={rsvpLoading} className={`flex-1 py-3 px-6 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50 ${userRsvp ? 'bg-[#222] text-[#f5f5f5] border border-[#2a2a2a]' : 'bg-[#f5f5f5] text-[#0a0a0a] hover:opacity-85'}`}>
              {rsvpLoading ? 'Updating...' : userRsvp ? 'Going' : "I'm going"}
            </button>
            {event.ticketLink && (
              <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-[#111] text-[#f5f5f5] border border-[#2a2a2a] px-6 py-3 rounded-lg text-[14px] font-semibold hover:border-[#666] transition-colors">
                <ExternalIcon /> Tickets
              </a>
            )}
          </div>
        )}

        {!isUpcoming && (
          <div className="flex items-center px-4 py-3 bg-[#111] border border-[#2a2a2a] rounded-xl mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#666]">Event ended</span>
          </div>
        )}

        <div className="text-[13px] font-semibold uppercase tracking-wider text-[#666] mb-3">About</div>
        <p className="text-[15px] leading-[1.7] text-[#a0a0a0] whitespace-pre-wrap mb-10">{event.description}</p>

        <div className="h-px bg-[#1e1e1e] mb-8" />

        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-[#666]">Who&apos;s going</div>
            <span className="text-[13px] text-[#666] font-medium">{event.rsvps.length} {event.rsvps.length === 1 ? 'person' : 'people'}</span>
          </div>
          {event.rsvps.length > 0 ? (
            <div>
              {event.rsvps.map(rsvp => (
                <div key={rsvp.id} className="flex items-center gap-3 py-2.5 border-b border-[#1e1e1e] last:border-0">
                  <div className="w-[34px] h-[34px] rounded-full bg-[#1a1a1a] flex items-center justify-center text-[13px] font-semibold text-[#a0a0a0] flex-shrink-0">
                    {rsvp.user.username[0].toUpperCase()}
                  </div>
                  <span className="text-[14px] font-medium text-[#f5f5f5]">{rsvp.user.username}</span>
                  {rsvp.user.id === session?.user?.id && (
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-[#666] bg-[#1a1a1a] px-2 py-0.5 rounded ml-auto">You</span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-[14px] text-[#666]">No one has RSVP&apos;d yet</div>
            </div>
          )}
        </div>
      </div>

      {isUpcoming && !isCreator && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-[#0a0a0a]/92 backdrop-blur-xl border-t border-[#1e1e1e] z-40 flex gap-2.5">
          <button onClick={onRsvp} disabled={rsvpLoading} className={`flex-1 py-3 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50 ${userRsvp ? 'bg-[#222] text-[#f5f5f5] border border-[#2a2a2a]' : 'bg-[#f5f5f5] text-[#0a0a0a]'}`}>
            {rsvpLoading ? 'Updating...' : userRsvp ? 'Going' : "I'm going"}
          </button>
          {event.ticketLink && (
            <a href={event.ticketLink} target="_blank" rel="noopener noreferrer" className="bg-[#111] text-[#f5f5f5] border border-[#2a2a2a] px-5 py-3 rounded-lg text-[14px] font-semibold">Tickets</a>
          )}
        </div>
      )}
    </div>
  )
}

function PrivateEventView({
  event, session, isUpcoming, isCreator, userRsvp, rsvpLoading, onRsvp, onDeleteClick
}: {
  event: Event; session: any; isUpcoming: boolean; isCreator: boolean; userRsvp: boolean; rsvpLoading: boolean; onRsvp: () => void; onDeleteClick: () => void
}) {
  return (
    <div>
      <div className="relative w-full h-[55vh] min-h-[320px] max-h-[500px] overflow-hidden bg-[#1a1a1a]">
        <Image src={event.imageUrl} alt={event.title} fill className="object-cover" sizes="100vw" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/15 via-transparent via-30% to-[#0a0a0a] pointer-events-none" />
        <div className="absolute top-[72px] left-5 opacity-50">
          <svg className="h-[18px] w-auto text-white" viewBox="0 0 91 56" fill="none">
            <path d="M45.3604 19.8447C57.7705 19.8448 68.9497 21.8687 76.9814 25.0957C81.0004 26.7105 84.1717 28.6025 86.3184 30.6416C88.4622 32.6781 89.5048 34.778 89.5049 36.8545C89.5049 38.9312 88.4623 41.0318 86.3184 43.0684C84.1717 45.1075 81.0004 46.9995 76.9814 48.6143C68.9497 51.8413 57.7705 53.8652 45.3604 53.8652C32.9501 53.8652 21.7701 51.8413 13.7383 48.6143C9.71935 46.9995 6.54803 45.1075 4.40137 43.0684C2.25742 41.0318 1.21484 38.9312 1.21484 36.8545C1.21497 34.778 2.25755 32.6781 4.40137 30.6416C6.54802 28.6025 9.71932 26.7105 13.7383 25.0957C21.7701 21.8686 32.9501 19.8447 45.3604 19.8447Z" stroke="currentColor" strokeWidth="2.43"/>
            <path d="M45.3604 1.21484C57.7705 1.21488 68.9497 3.23877 76.9814 6.46582C81.0004 8.08061 84.1717 9.97259 86.3184 12.0117C88.4622 14.0482 89.5048 16.1481 89.5049 18.2246C89.5049 20.3013 88.4623 22.4019 86.3184 24.4385C84.1717 26.4776 81.0004 28.3696 76.9814 29.9844C68.9497 33.2114 57.7705 35.2353 45.3604 35.2354C32.9501 35.2354 21.7701 33.2115 13.7383 29.9844C9.71935 28.3696 6.54803 26.4776 4.40137 24.4385C2.25742 22.4019 1.21484 20.3013 1.21484 18.2246C1.21497 16.1481 2.25755 14.0482 4.40137 12.0117C6.54802 9.97258 9.71932 8.08062 13.7383 6.46582C21.7701 3.23874 32.9501 1.21484 45.3604 1.21484Z" stroke="currentColor" strokeWidth="2.43"/>
          </svg>
        </div>
      </div>

      <div className="max-w-[520px] mx-auto px-6 -mt-10 relative pb-28 sm:pb-10">
        <div className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#666] mb-4">You&apos;re invited</div>
        <h1 className="text-[32px] sm:text-[42px] font-bold leading-[1.1] tracking-tight text-[#f5f5f5] mb-8">{event.title}</h1>

        {isCreator && (
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/events/${event.id}/edit`} className="text-[13px] font-medium text-[#666] hover:text-[#a0a0a0] transition-colors">Edit</Link>
            <button onClick={onDeleteClick} className="text-[13px] font-medium text-[#666] hover:text-[#ef4444] transition-colors">Delete</button>
          </div>
        )}

        <div className="flex flex-col gap-5 mb-9">
          <div className="flex items-start gap-3.5">
            <CalendarIcon />
            <div>
              <div className="text-[15px] font-medium text-[#f5f5f5]">{formatDate(event.startDate)}</div>
              <div className="text-[13px] text-[#666] mt-0.5">{formatTimeRange(event.startDate, event.endDate)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <PinIcon />
            <div>
              <div className="text-[15px] font-medium text-[#f5f5f5]">{event.address}</div>
              {event.locationLink && (
                <a href={event.locationLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[13px] text-[#a0a0a0] hover:text-[#f5f5f5] mt-1 transition-colors">
                  Open in maps <ExternalIcon />
                </a>
              )}
            </div>
          </div>
        </div>

        {isUpcoming && !isCreator && (
          <div className="hidden sm:flex gap-2.5 mb-10">
            <button onClick={onRsvp} disabled={rsvpLoading} className={`flex-1 py-3 px-6 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50 ${userRsvp ? 'bg-[#222] text-[#f5f5f5] border border-[#2a2a2a]' : 'bg-[#f5f5f5] text-[#0a0a0a] hover:opacity-85'}`}>
              {rsvpLoading ? 'Updating...' : userRsvp ? 'Going' : "I'm going"}
            </button>
          </div>
        )}

        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[13px] font-semibold text-[#666]">Going</span>
            <span className="text-[12px] text-[#666] bg-[#1a1a1a] px-2 py-0.5 rounded">{event.rsvps.length} {event.rsvps.length === 1 ? 'person' : 'people'}</span>
          </div>
          {event.rsvps.length > 0 && (
            <div className="flex">
              {event.rsvps.slice(0, 5).map((rsvp, i) => (
                <div key={rsvp.id} className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] flex items-center justify-center text-[12px] font-semibold text-[#a0a0a0]" style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 10 - i }}>
                  {rsvp.user.username[0].toUpperCase()}
                </div>
              ))}
              {event.rsvps.length > 5 && (
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-semibold text-[#666]" style={{ marginLeft: '-8px' }}>
                  +{event.rsvps.length - 5}
                </div>
              )}
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-[14px] leading-[1.7] text-[#666] whitespace-pre-wrap pt-8 border-t border-[#1e1e1e]">{event.description}</p>
        )}
      </div>

      {isUpcoming && !isCreator && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-[#0a0a0a]/92 backdrop-blur-xl border-t border-[#1e1e1e] z-40 flex gap-2.5">
          <button onClick={onRsvp} disabled={rsvpLoading} className={`flex-1 py-3 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50 ${userRsvp ? 'bg-[#222] text-[#f5f5f5] border border-[#2a2a2a]' : 'bg-[#f5f5f5] text-[#0a0a0a]'}`}>
            {rsvpLoading ? 'Updating...' : userRsvp ? 'Going' : "I'm going"}
          </button>
        </div>
      )}
    </div>
  )
}

function GuestRsvpModal({
  isOpen, onClose, onSubmit, isLoading
}: {
  isOpen: boolean; onClose: () => void; onSubmit: (name: string) => void; isLoading: boolean
}) {
  const [name, setName] = useState('')
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-t-2xl sm:rounded-xl p-6 w-full sm:max-w-sm">
        <h3 className="text-[16px] font-semibold text-[#f5f5f5] mb-1">What&apos;s your name?</h3>
        <p className="text-[13px] text-[#666] mb-5">So people know who&apos;s coming.</p>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          autoFocus
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#666] focus:border-[#444] transition-colors mb-4"
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()) }}
        />
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 text-[13px] font-medium text-[#666] hover:text-[#a0a0a0] transition-colors">Cancel</button>
          <button onClick={() => name.trim() && onSubmit(name.trim())} disabled={isLoading || !name.trim()} className="flex-1 py-2.5 rounded-lg text-[14px] font-semibold bg-[#f5f5f5] text-[#0a0a0a] disabled:opacity-40 transition-all">
            {isLoading ? 'Joining...' : "I'm going"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, isDeleting: false })
  const [guestModal, setGuestModal] = useState(false)

  const userRsvp = event?.rsvps.find(rsvp => rsvp.user.id === session?.user?.id)
  const isCreator = event?.creator.id === session?.user?.id

  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${id}`)
      if (response.ok) setEvent(await response.json())
      else if (response.status === 404) setError('Event not found')
      else setError('Could not load event')
    } catch { setError('Something went wrong') }
    finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchEvent() }, [fetchEvent])

  // Hide navbar for private events
  useEffect(() => {
    if (event?.visibility === 'private') {
      const nav = document.querySelector('nav')
      if (nav) nav.style.display = 'none'
      return () => { if (nav) nav.style.display = '' }
    }
  }, [event])

  const handleRsvp = async (guestName?: string) => {
    // If not logged in, show guest name modal
    if (!session && !guestName) {
      setGuestModal(true)
      return
    }

    setRsvpLoading(true)
    try {
      const options: RequestInit = userRsvp
        ? { method: 'DELETE' }
        : {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(guestName ? { name: guestName } : {})
          }
      const response = await fetch(`/api/events/${id}/rsvp`, options)
      if (response.ok) {
        setGuestModal(false)
        await fetchEvent()
      }
      else setError('Could not update RSVP')
    } catch { setError('Something went wrong') }
    finally { setRsvpLoading(false) }
  }

  const handleDeleteConfirm = async () => {
    if (!event) return
    setDeleteModal(prev => ({ ...prev, isDeleting: true }))
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (response.ok) router.push('/my-events?deleted=true')
      else { setError('Could not delete event'); setDeleteModal({ isOpen: false, isDeleting: false }) }
    } catch { setError('Something went wrong'); setDeleteModal({ isOpen: false, isDeleting: false }) }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-[#666] text-[14px]">Loading event...</div></div>

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[18px] font-semibold text-[#f5f5f5] mb-2">{error || 'Not found'}</h2>
          <Link href="/events" className="text-[13px] font-medium text-[#666] hover:text-[#a0a0a0] transition-colors">Back to events</Link>
        </div>
      </div>
    )
  }

  const isUpcoming = new Date(event.startDate) > new Date()
  const isPrivate = event.visibility === 'private'
  const viewProps = { event, session, isUpcoming, isCreator: !!isCreator, userRsvp: !!userRsvp, rsvpLoading, onRsvp: () => handleRsvp(), onDeleteClick: () => setDeleteModal({ isOpen: true, isDeleting: false }) }

  return (
    <>
      {isPrivate ? <PrivateEventView {...viewProps} /> : <PublicEventView {...viewProps} />}
      <DeleteConfirmModal event={event} isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, isDeleting: false })} onConfirm={handleDeleteConfirm} isDeleting={deleteModal.isDeleting} />
      <GuestRsvpModal isOpen={guestModal} onClose={() => setGuestModal(false)} onSubmit={(name) => handleRsvp(name)} isLoading={rsvpLoading} />
    </>
  )
}
