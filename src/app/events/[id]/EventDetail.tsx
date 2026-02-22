'use client'

import { useState, useEffect, use, useCallback, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface SessionData {
  user?: { id: string; name?: string | null; email?: string | null } | null
}

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
  <svg className="w-[18px] h-[18px] text-[#888] flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)

const ClockIcon = () => (
  <svg className="w-[18px] h-[18px] text-[#888] flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
)

const PinIcon = () => (
  <svg className="w-[18px] h-[18px] text-[#888] flex-shrink-0 mt-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
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
        <p className="text-[12px] text-[#888] mb-6">This action cannot be undone.</p>
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

function GuestListModal({
  rsvps, session, isOpen, onClose, isCreator, onRemoveGuest, removingId, onRenameGuest
}: {
  rsvps: Event['rsvps']; session: SessionData | null; isOpen: boolean; onClose: () => void; isCreator: boolean; onRemoveGuest: (rsvpId: string) => void; removingId: string | null; onRenameGuest: (userId: string, newName: string) => void
}) {
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const startEditing = (userId: string, currentName: string) => {
    setEditingUserId(userId)
    setEditName(currentName)
  }

  const saveEdit = () => {
    if (editingUserId && editName.trim()) {
      onRenameGuest(editingUserId, editName.trim())
      setEditingUserId(null)
      setEditName('')
    }
  }

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-t-2xl sm:rounded-xl w-full sm:max-w-sm max-h-[70vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1e1e1e]">
          <div>
            <h3 className="text-[16px] font-semibold text-[#f5f5f5]">Guest list</h3>
            <p className="text-[12px] text-[#888] mt-0.5">{rsvps.length} {rsvps.length === 1 ? 'person' : 'people'} going</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] transition-colors">
            <svg className="w-4 h-4 text-[#888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-3 flex-1">
          {rsvps.length > 0 ? (
            <div>
              {rsvps.map(rsvp => (
                <div key={rsvp.id} className="flex items-center gap-3 py-3 border-b border-[#1e1e1e] last:border-0">
                  <div className="w-[36px] h-[36px] rounded-full bg-[#1a1a1a] flex items-center justify-center text-[13px] font-semibold text-[#a0a0a0] flex-shrink-0">
                    {(editingUserId === rsvp.user.id ? editName : rsvp.user.username)[0]?.toUpperCase() || '?'}
                  </div>
                  {editingUserId === rsvp.user.id ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        maxLength={50}
                        autoFocus
                        className="flex-1 px-2 py-1 rounded text-[14px] outline-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] focus:border-[#444] transition-colors"
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingUserId(null) }}
                      />
                      <button onClick={saveEdit} className="text-[#22c55e] hover:text-[#4ade80] transition-colors p-1" title="Save">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                      </button>
                      <button onClick={() => setEditingUserId(null)} className="text-[#888] hover:text-[#a0a0a0] transition-colors p-1" title="Cancel">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-[14px] font-medium text-[#f5f5f5] flex-1">{rsvp.user.username}</span>
                      {rsvp.user.id === session?.user?.id && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded">You</span>
                      )}
                      {isCreator && (
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => startEditing(rsvp.user.id, rsvp.user.username)}
                            className="text-[#888] hover:text-[#a0a0a0] transition-colors p-1"
                            title="Edit name"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          </button>
                          <button
                            onClick={() => onRemoveGuest(rsvp.id)}
                            disabled={removingId === rsvp.id}
                            className="text-[#888] hover:text-[#ef4444] transition-colors disabled:opacity-40 p-1"
                            title="Remove guest"
                          >
                            {removingId === rsvp.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-[#888] border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-[14px] text-[#888]">No one yet</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PublicEventView({
  event, session, isUpcoming, isCreator, userRsvp, rsvpLoading, onRsvp, onDeleteClick, onShowGuestList, onShareClick
}: {
  event: Event; session: SessionData | null; isUpcoming: boolean; isCreator: boolean; userRsvp: boolean; rsvpLoading: boolean; onRsvp: () => void; onDeleteClick: () => void; onShowGuestList: () => void; onShareClick: () => void
}) {
  return (
    <div className="max-w-[720px] mx-auto px-5 pb-28 sm:pb-10">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#888] hover:text-[#a0a0a0] py-4 transition-colors">
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
            {event.location !== 'Private event' && <span className="text-[12px] font-medium text-[#888]">{event.location}</span>}
          </div>
        )}

        <h1 className="text-[28px] sm:text-[36px] font-bold leading-[1.15] tracking-tight text-[#f5f5f5] mb-7">{event.title}</h1>

        {isCreator && (
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onShareClick} className="text-[13px] font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">Share</button>
            <Link href={`/events/${event.id}/edit`} className="text-[13px] font-medium text-[#888] hover:text-[#a0a0a0] transition-colors">Edit</Link>
            <button onClick={onDeleteClick} className="text-[13px] font-medium text-[#888] hover:text-[#ef4444] transition-colors">Delete</button>
          </div>
        )}

        <div className="grid gap-px bg-[#1e1e1e] border border-[#2a2a2a] rounded-xl overflow-hidden mb-8">
          <div className="flex items-start gap-3.5 px-[18px] py-4 bg-[#111]">
            <CalendarIcon />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#888] mb-0.5">Date</div>
              <div className="text-[14px] text-[#f5f5f5]">{formatDate(event.startDate)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 px-[18px] py-4 bg-[#111]">
            <ClockIcon />
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#888] mb-0.5">Time</div>
              <div className="text-[14px] text-[#f5f5f5]">{formatTimeRange(event.startDate, event.endDate)}</div>
            </div>
          </div>
          <div className="flex items-start gap-3.5 px-[18px] py-4 bg-[#111]">
            <PinIcon />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-[#888] mb-0.5">Location</div>
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
              {rsvpLoading ? 'Updating...' : userRsvp ? 'Going \u2715' : "I'm going"}
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
            <span className="text-[11px] font-semibold uppercase tracking-wide text-[#888]">Event ended</span>
          </div>
        )}

        <div className="text-[13px] font-semibold uppercase tracking-wider text-[#888] mb-3">About</div>
        <p className="text-[15px] leading-[1.7] text-[#a0a0a0] whitespace-pre-wrap mb-10">{event.description}</p>

        <div className="h-px bg-[#1e1e1e] mb-8" />

        <button onClick={onShowGuestList} className="w-full mb-10 text-left group">
          <div className="flex items-center justify-between mb-4">
            <div className="text-[13px] font-semibold uppercase tracking-wider text-[#888]">Who&apos;s going</div>
            <span className="text-[13px] text-[#888] font-medium group-hover:text-[#a0a0a0] transition-colors">{event.rsvps.length} {event.rsvps.length === 1 ? 'person' : 'people'} &rsaquo;</span>
          </div>
          {event.rsvps.length > 0 ? (
            <div className="flex">
              {event.rsvps.slice(0, 8).map((rsvp, i) => (
                <div key={rsvp.id} className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] flex items-center justify-center text-[12px] font-semibold text-[#a0a0a0]" style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 10 - i }}>
                  {rsvp.user.username[0].toUpperCase()}
                </div>
              ))}
              {event.rsvps.length > 8 && (
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-semibold text-[#888]" style={{ marginLeft: '-8px' }}>
                  +{event.rsvps.length - 8}
                </div>
              )}
            </div>
          ) : (
            <div className="text-[14px] text-[#888]">No one yet</div>
          )}
        </button>
      </div>

      {isUpcoming && !isCreator && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-[#0a0a0a]/92 backdrop-blur-xl border-t border-[#1e1e1e] z-40 flex gap-2.5">
          <button onClick={onRsvp} disabled={rsvpLoading} className={`flex-1 py-3 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50 ${userRsvp ? 'bg-[#222] text-[#f5f5f5] border border-[#2a2a2a]' : 'bg-[#f5f5f5] text-[#0a0a0a]'}`}>
            {rsvpLoading ? 'Updating...' : userRsvp ? 'Going \u2715' : "I'm going"}
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
  event, session, isUpcoming, isCreator, userRsvp, rsvpLoading, onRsvp, onDeleteClick, onShowGuestList, onShareClick
}: {
  event: Event; session: SessionData | null; isUpcoming: boolean; isCreator: boolean; userRsvp: boolean; rsvpLoading: boolean; onRsvp: () => void; onDeleteClick: () => void; onShowGuestList: () => void; onShareClick: () => void
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
        <h1 className="text-[32px] sm:text-[42px] font-bold leading-[1.1] tracking-tight text-[#f5f5f5] mb-8">{event.title}</h1>

        {isCreator && (
          <div className="flex items-center gap-4 mb-6">
            <button onClick={onShareClick} className="text-[13px] font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">Share</button>
            <Link href={`/events/${event.id}/edit`} className="text-[13px] font-medium text-[#888] hover:text-[#a0a0a0] transition-colors">Edit</Link>
            <button onClick={onDeleteClick} className="text-[13px] font-medium text-[#888] hover:text-[#ef4444] transition-colors">Delete</button>
          </div>
        )}

        <div className="flex flex-col gap-5 mb-9">
          <div className="flex items-start gap-3.5">
            <CalendarIcon />
            <div>
              <div className="text-[15px] font-medium text-[#f5f5f5]">{formatDate(event.startDate)}</div>
              <div className="text-[13px] text-[#888] mt-0.5">{formatTimeRange(event.startDate, event.endDate)}</div>
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
              {rsvpLoading ? 'Updating...' : userRsvp ? 'Going \u2715' : "I'm going"}
            </button>
          </div>
        )}

        <button onClick={onShowGuestList} className="mb-10 text-left group w-full">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="text-[13px] font-semibold text-[#888]">Going</span>
            <span className="text-[12px] text-[#888] bg-[#1a1a1a] px-2 py-0.5 rounded group-hover:text-[#a0a0a0] transition-colors">{event.rsvps.length} {event.rsvps.length === 1 ? 'person' : 'people'} &rsaquo;</span>
          </div>
          {event.rsvps.length > 0 && (
            <div className="flex">
              {event.rsvps.slice(0, 5).map((rsvp, i) => (
                <div key={rsvp.id} className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] flex items-center justify-center text-[12px] font-semibold text-[#a0a0a0]" style={{ marginLeft: i > 0 ? '-8px' : '0', zIndex: 10 - i }}>
                  {rsvp.user.username[0].toUpperCase()}
                </div>
              ))}
              {event.rsvps.length > 5 && (
                <div className="w-9 h-9 rounded-full bg-[#1a1a1a] border-2 border-[#0a0a0a] flex items-center justify-center text-[10px] font-semibold text-[#888]" style={{ marginLeft: '-8px' }}>
                  +{event.rsvps.length - 5}
                </div>
              )}
            </div>
          )}
        </button>

        {event.description && (
          <p className="text-[14px] leading-[1.7] text-[#888] whitespace-pre-wrap pt-8 border-t border-[#1e1e1e]">{event.description}</p>
        )}
      </div>

      {isUpcoming && !isCreator && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 px-5 py-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] bg-[#0a0a0a]/92 backdrop-blur-xl border-t border-[#1e1e1e] z-40 flex gap-2.5">
          <button onClick={onRsvp} disabled={rsvpLoading} className={`flex-1 py-3 rounded-lg text-[14px] font-semibold transition-all disabled:opacity-50 ${userRsvp ? 'bg-[#222] text-[#f5f5f5] border border-[#2a2a2a]' : 'bg-[#f5f5f5] text-[#0a0a0a]'}`}>
            {rsvpLoading ? 'Updating...' : userRsvp ? 'Going \u2715' : "I'm going"}
          </button>
        </div>
      )}
    </div>
  )
}

function GuestRsvpModal({
  isOpen, onClose, onSubmit, isLoading, initialName
}: {
  isOpen: boolean; onClose: () => void; onSubmit: (name: string) => void; isLoading: boolean; initialName?: string
}) {
  const [name, setName] = useState(initialName || '')

  useEffect(() => {
    if (initialName) setName(initialName)
  }, [initialName])

  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-t-2xl sm:rounded-xl p-6 w-full sm:max-w-sm">
        {initialName ? (
          <>
            <h3 className="text-[16px] font-semibold text-[#f5f5f5] mb-1">Hey {initialName}!</h3>
            <p className="text-[13px] text-[#888] mb-5">You&apos;ve been invited. Confirm below to RSVP.</p>
          </>
        ) : (
          <>
            <h3 className="text-[16px] font-semibold text-[#f5f5f5] mb-1">What&apos;s your name?</h3>
            <p className="text-[13px] text-[#888] mb-5">So people know who&apos;s coming.</p>
          </>
        )}
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Your name"
          maxLength={50}
          autoFocus={!initialName}
          className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#666] focus:border-[#444] transition-colors mb-4"
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSubmit(name.trim()) }}
        />
        <div className="flex gap-3">
          <button onClick={onClose} disabled={isLoading} className="flex-1 py-2.5 text-[13px] font-medium text-[#888] hover:text-[#a0a0a0] transition-colors">Cancel</button>
          <button onClick={() => name.trim() && onSubmit(name.trim())} disabled={isLoading || !name.trim()} className="flex-1 py-2.5 rounded-lg text-[14px] font-semibold bg-[#f5f5f5] text-[#0a0a0a] disabled:opacity-40 transition-all">
            {isLoading ? 'Joining...' : "I'm going"}
          </button>
        </div>
      </div>
    </div>
  )
}

function InviteModal({
  isOpen, onClose, eventId
}: {
  isOpen: boolean; onClose: () => void; eventId: string
}) {
  const [mode, setMode] = useState<'menu' | 'single' | 'bulk'>('menu')
  const [singleName, setSingleName] = useState('')
  const [bulkNames, setBulkNames] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [bulkLinks, setBulkLinks] = useState<Array<{ name: string; url: string }>>([])

  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}/events/${eventId}` : ''

  const getInviteUrl = (name: string) => `${baseUrl}?invite=${encodeURIComponent(name.trim())}`

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    } catch { /* ignore */ }
  }

  const generateBulkLinks = () => {
    const names = bulkNames.split('\n').map(n => n.trim()).filter(Boolean)
    setBulkLinks(names.map(name => ({ name, url: getInviteUrl(name) })))
  }

  const copyAllLinks = async () => {
    const text = bulkLinks.map(l => `${l.name}: ${l.url}`).join('\n')
    await copyToClipboard(text, 'all')
  }

  const handleClose = () => {
    setMode('menu')
    setSingleName('')
    setBulkNames('')
    setBulkLinks([])
    setCopied(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={handleClose}>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#1e1e1e]">
          <div className="flex items-center gap-3">
            {mode !== 'menu' && (
              <button onClick={() => { setMode('menu'); setBulkLinks([]) }} className="text-[#888] hover:text-[#a0a0a0] transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              </button>
            )}
            <h3 className="text-[16px] font-semibold text-[#f5f5f5]">
              {mode === 'menu' ? 'Share event' : mode === 'single' ? 'Personal invite' : 'Paste guestlist'}
            </h3>
          </div>
          <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#1a1a1a] transition-colors">
            <svg className="w-4 h-4 text-[#888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-4 flex-1">
          {mode === 'menu' && (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => copyToClipboard(baseUrl, 'open')}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#a0a0a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#f5f5f5]">Copy link</div>
                  <div className="text-[12px] text-[#888]">Share one link with everyone</div>
                </div>
                {copied === 'open' && <span className="text-[12px] font-medium text-[#22c55e]">Copied</span>}
              </button>

              <button
                onClick={() => setMode('single')}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#a0a0a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#f5f5f5]">Personal invite</div>
                  <div className="text-[12px] text-[#888]">Name pre-filled when they open</div>
                </div>
              </button>

              <button
                onClick={() => setMode('bulk')}
                className="flex items-center gap-3.5 px-4 py-3.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222] border border-[#2a2a2a] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-[#222] flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-[#a0a0a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-medium text-[#f5f5f5]">Paste guestlist</div>
                  <div className="text-[12px] text-[#888]">Generate links for multiple guests</div>
                </div>
              </button>
            </div>
          )}

          {mode === 'single' && (
            <div>
              <input
                type="text"
                value={singleName}
                onChange={e => setSingleName(e.target.value)}
                placeholder="Guest name"
                maxLength={50}
                autoFocus
                className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#666] focus:border-[#444] transition-colors mb-3"
                onKeyDown={e => { if (e.key === 'Enter' && singleName.trim()) copyToClipboard(getInviteUrl(singleName), 'single') }}
              />
              {singleName.trim() && (
                <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 mb-3">
                  <div className="text-[12px] text-[#888] mb-1.5">Invite link for {singleName.trim()}</div>
                  <div className="text-[12px] text-[#a0a0a0] break-all font-mono">{getInviteUrl(singleName)}</div>
                </div>
              )}
              <button
                onClick={() => copyToClipboard(getInviteUrl(singleName), 'single')}
                disabled={!singleName.trim()}
                className="w-full py-2.5 rounded-lg text-[14px] font-semibold bg-[#f5f5f5] text-[#0a0a0a] disabled:opacity-40 transition-all"
              >
                {copied === 'single' ? 'Copied!' : 'Copy invite link'}
              </button>
            </div>
          )}

          {mode === 'bulk' && (
            <div>
              {bulkLinks.length === 0 ? (
                <>
                  <p className="text-[13px] text-[#888] mb-3">Paste names, one per line</p>
                  <textarea
                    value={bulkNames}
                    onChange={e => setBulkNames(e.target.value)}
                    placeholder={"Jonas Gripsrud\nOla Nordmann\nKari Nordmann"}
                    rows={6}
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-lg text-[14px] outline-none bg-[#1a1a1a] border border-[#2a2a2a] text-[#f5f5f5] placeholder-[#666] focus:border-[#444] transition-colors mb-3 resize-none"
                  />
                  <button
                    onClick={generateBulkLinks}
                    disabled={!bulkNames.trim()}
                    className="w-full py-2.5 rounded-lg text-[14px] font-semibold bg-[#f5f5f5] text-[#0a0a0a] disabled:opacity-40 transition-all"
                  >
                    Generate links
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[13px] text-[#888]">{bulkLinks.length} {bulkLinks.length === 1 ? 'link' : 'links'} generated</span>
                    <button onClick={copyAllLinks} className="text-[13px] font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">
                      {copied === 'all' ? 'Copied all!' : 'Copy all'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {bulkLinks.map((link, i) => (
                      <div key={i} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] font-medium text-[#f5f5f5] mb-0.5">{link.name}</div>
                          <div className="text-[11px] text-[#888] break-all font-mono">{link.url}</div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(link.url, `bulk-${i}`)}
                          className="text-[#888] hover:text-[#a0a0a0] transition-colors flex-shrink-0 mt-0.5"
                        >
                          {copied === `bulk-${i}` ? (
                            <svg className="w-4 h-4 text-[#22c55e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                          ) : (
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="9" y="9" width="13" height="13" rx="2"/>
                              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-[#888] text-[14px]">Loading event...</div></div>}>
      <EventDetailContent params={params} />
    </Suspense>
  )
}

export function EventDetailContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteName = searchParams.get('invite') || ''
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, isDeleting: false })
  const [guestModal, setGuestModal] = useState(false)
  const [guestListModal, setGuestListModal] = useState(false)
  const [inviteModal, setInviteModal] = useState(false)
  const [guestRsvpDone, setGuestRsvpDone] = useState(false)
  const [removingGuestId, setRemovingGuestId] = useState<string | null>(null)

  // Check localStorage for guest RSVP on mount
  useEffect(() => {
    try {
      const guestRsvps = JSON.parse(localStorage.getItem('vibber_guest_rsvps') || '{}')
      if (guestRsvps[id]) setGuestRsvpDone(true)
    } catch { /* ignore */ }
  }, [id])

  // Auto-open RSVP modal if invite param is present and user hasn't RSVP'd
  useEffect(() => {
    if (inviteName && !guestRsvpDone && !session && event && !loading) {
      setGuestModal(true)
    }
  }, [inviteName, guestRsvpDone, session, event, loading])

  const userRsvp = event?.rsvps.find(rsvp => rsvp.user.id === session?.user?.id)
  const hasRsvpd = !!userRsvp || (!session && guestRsvpDone)
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
    // If not logged in and hasn't RSVP'd yet, show guest name modal
    if (!session && !guestRsvpDone && !guestName) {
      setGuestModal(true)
      return
    }

    // If guest wants to un-go, remove from localStorage and refresh
    if (!session && guestRsvpDone) {
      try {
        const guestRsvps = JSON.parse(localStorage.getItem('vibber_guest_rsvps') || '{}')
        const rsvpId = guestRsvps[id]
        if (rsvpId) {
          setRsvpLoading(true)
          const response = await fetch(`/api/events/${id}/rsvp/${rsvpId}`, { method: 'DELETE' })
          if (response.ok) {
            delete guestRsvps[id]
            localStorage.setItem('vibber_guest_rsvps', JSON.stringify(guestRsvps))
            setGuestRsvpDone(false)
            await fetchEvent()
          } else {
            setError('Could not remove RSVP')
          }
          setRsvpLoading(false)
        }
      } catch { setError('Something went wrong'); setRsvpLoading(false) }
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
        // If guest RSVP, store the RSVP ID in localStorage
        if (!session && guestName) {
          try {
            const data = await response.json()
            const guestRsvps = JSON.parse(localStorage.getItem('vibber_guest_rsvps') || '{}')
            guestRsvps[id] = data.id
            localStorage.setItem('vibber_guest_rsvps', JSON.stringify(guestRsvps))
            setGuestRsvpDone(true)
          } catch { /* ignore */ }
        }
        await fetchEvent()
      }
      else setError('Could not update RSVP')
    } catch { setError('Something went wrong') }
    finally { setRsvpLoading(false) }
  }

  const handleRenameGuest = async (userId: string, newName: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newName, eventId: id })
      })
      if (response.ok) await fetchEvent()
      else setError('Could not update name')
    } catch { setError('Something went wrong') }
  }

  const handleRemoveGuest = async (rsvpId: string) => {
    setRemovingGuestId(rsvpId)
    try {
      const response = await fetch(`/api/events/${id}/rsvp/${rsvpId}`, { method: 'DELETE' })
      if (response.ok) await fetchEvent()
      else setError('Could not remove guest')
    } catch { setError('Something went wrong') }
    finally { setRemovingGuestId(null) }
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

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-[#888] text-[14px]">Loading event...</div></div>

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-[18px] font-semibold text-[#f5f5f5] mb-2">{error || 'Not found'}</h2>
          <Link href="/events" className="text-[13px] font-medium text-[#888] hover:text-[#a0a0a0] transition-colors">Back to events</Link>
        </div>
      </div>
    )
  }

  const isUpcoming = new Date(event.startDate) > new Date()
  const isPrivate = event.visibility === 'private'
  const viewProps = { event, session, isUpcoming, isCreator: !!isCreator, userRsvp: hasRsvpd, rsvpLoading, onRsvp: () => handleRsvp(), onDeleteClick: () => setDeleteModal({ isOpen: true, isDeleting: false }), onShowGuestList: () => setGuestListModal(true), onShareClick: () => setInviteModal(true) }

  return (
    <>
      {isPrivate ? <PrivateEventView {...viewProps} /> : <PublicEventView {...viewProps} />}
      <DeleteConfirmModal event={event} isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ isOpen: false, isDeleting: false })} onConfirm={handleDeleteConfirm} isDeleting={deleteModal.isDeleting} />
      <GuestRsvpModal isOpen={guestModal} onClose={() => setGuestModal(false)} onSubmit={(name) => handleRsvp(name)} isLoading={rsvpLoading} initialName={inviteName || undefined} />
      <GuestListModal rsvps={event.rsvps} session={session} isOpen={guestListModal} onClose={() => setGuestListModal(false)} isCreator={!!isCreator} onRemoveGuest={handleRemoveGuest} removingId={removingGuestId} onRenameGuest={handleRenameGuest} />
      <InviteModal isOpen={inviteModal} onClose={() => setInviteModal(false)} eventId={id} />
    </>
  )
}
