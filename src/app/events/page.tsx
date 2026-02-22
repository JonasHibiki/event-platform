'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { NORWEGIAN_CITIES } from '@/lib/constants/locations'

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
  creator: { id: string; username: string }
  _count: { rsvps: number }
}

interface Filters {
  category: string
  city: string
  startDate: string
  endDate: string
  quickFilter: string
}

// ======================== CATEGORY ICON SVGs ========================
function CategoryIcon({ category, size = 20 }: { category: string; size?: number }) {
  const props = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '1.6', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

  switch (category) {
    case 'Music':
      return <svg {...props}><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
    case 'Nightlife':
      return <svg {...props}><path d="M12 3a6 6 0 009 5.197V21H3V8.197A6 6 0 0012 3z"/></svg>
    case 'Conference':
      return <svg {...props}><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
    case 'Networking':
      return <svg {...props}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
    case 'Workshop':
      return <svg {...props}><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>
    case 'Festival':
      return <svg {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'Sports':
      return <svg {...props}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20 14.5 14.5 0 000-20"/><path d="M2 12h20"/></svg>
    case 'Food & Drink':
      return <svg {...props}><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
    case 'Arts & Culture':
      return <svg {...props}><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
    default:
      return <svg {...props}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  }
}

// ======================== SMALL ICONS ========================
function CalendarSmall() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
}
function PinSmall() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function SunIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
}
function WeekendIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
}
function MapPinIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
}
function DateRangeIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></svg>
}
function XIcon() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}

// ======================== FILTER MODAL ========================
function FilterModal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="bg-[#111] border border-[#2a2a2a] rounded-t-2xl sm:rounded-xl p-5 w-full sm:max-w-md max-h-[70vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-[#f5f5f5]">{title}</h3>
          <button onClick={onClose} className="text-[#666] hover:text-[#a0a0a0] transition-colors p-1"><XIcon /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ======================== HELPERS ========================
function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(dateString))
}

function formatTime(dateString: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(dateString))
}

function getWeekendDates() {
  const now = new Date()
  const dow = now.getDay()
  const fri = new Date(now)
  if (dow === 5) { /* friday */ }
  else if (dow === 6) fri.setDate(now.getDate() - 1)
  else if (dow === 0) fri.setDate(now.getDate() - 2)
  else fri.setDate(now.getDate() + (5 - dow + 7) % 7)
  const sun = new Date(fri); sun.setDate(fri.getDate() + 2)
  return { start: fri.toISOString().split('T')[0], end: sun.toISOString().split('T')[0] }
}

// ======================== DATE FILTER CONTENT ========================
function DateFilterContent({ startDate, endDate, onApply, onClear }: { startDate: string; endDate: string; onApply: (s: string, e: string) => void; onClear: () => void }) {
  const [s, setS] = useState(startDate)
  const [e, setE] = useState(endDate)
  useEffect(() => { setS(startDate); setE(endDate) }, [startDate, endDate])
  return (
    <div>
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[12px] font-medium text-[#666] mb-2">From</label>
          <input type="date" value={s} onChange={ev => setS(ev.target.value)} className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[14px] text-[#f5f5f5] focus:outline-none focus:border-[#666]" />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-[#666] mb-2">To</label>
          <input type="date" value={e} onChange={ev => setE(ev.target.value)} min={s} className="w-full px-3 py-2.5 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-[14px] text-[#f5f5f5] focus:outline-none focus:border-[#666]" />
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onClear} className="px-4 py-2 text-[13px] font-medium text-[#666] hover:text-[#a0a0a0] transition-colors">Clear</button>
        <button onClick={() => onApply(s, e)} className="px-5 py-2 bg-[#f5f5f5] text-[#0a0a0a] rounded-lg text-[13px] font-semibold hover:opacity-85 transition-opacity">Apply</button>
      </div>
    </div>
  )
}

// ======================== EVENT CARD ========================
function EventCard({ event }: { event: Event }) {
  const isUpcoming = new Date(event.startDate) > new Date()
  return (
    <Link href={`/events/${event.id}`}>
      <div className="bg-[#111] border border-[#1e1e1e] rounded-xl overflow-hidden hover:border-[#444] transition-colors group">
        <div className="w-full aspect-[4/3] relative bg-[#1a1a1a] overflow-hidden">
          <Image src={event.imageUrl} alt={event.title} fill className="object-cover group-hover:scale-[1.02] transition-transform duration-300" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          {event.category && (
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xl text-[#f5f5f5]">{event.category}</span>
            </div>
          )}
          {event.location !== 'Private event' && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full bg-black/55 backdrop-blur-xl text-[#f5f5f5]">{event.location}</span>
            </div>
          )}
          {!isUpcoming && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#a0a0a0]">Ended</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-[15px] text-[#f5f5f5] mb-2.5 line-clamp-2 leading-snug">{event.title}</h3>
          <div className="space-y-1.5 text-[13px] text-[#666]">
            <div className="flex items-center gap-1.5"><CalendarSmall /> {formatDate(event.startDate)}</div>
            <div className="flex items-center gap-1.5"><PinSmall /> <span className="line-clamp-1">{event.address}</span></div>
          </div>
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-[#1e1e1e]">
            <span className="text-[12px] text-[#666]">{event._count.rsvps} going</span>
            {event.ticketLink && <span className="text-[12px] text-[#a0a0a0] font-medium">Tickets</span>}
          </div>
        </div>
      </div>
    </Link>
  )
}

// ======================== MAIN PAGE ========================
export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<Filters>({ category: '', city: '', startDate: '', endDate: '', quickFilter: '' })
  const [modals, setModals] = useState({ city: false, date: false })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/events')
        if (res.ok) setEvents(await res.json())
        else setError('Could not load events')
      } catch { setError('Something went wrong') }
      finally { setLoading(false) }
    })()
  }, [])

  const filteredEvents = events.filter(e => {
    if (filters.category && e.category !== filters.category) return false
    if (filters.city && e.location !== filters.city) return false
    if (filters.startDate || filters.endDate) {
      const d = new Date(e.startDate).toISOString().split('T')[0]
      if (filters.startDate && d < filters.startDate) return false
      if (filters.endDate && d > filters.endDate) return false
    }
    return true
  })

  const upcoming = filteredEvents.filter(e => new Date(e.startDate) > new Date())
  const past = filteredEvents.filter(e => new Date(e.startDate) <= new Date())
  const hasFilters = filters.category || filters.city || filters.startDate || filters.endDate

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-[#666] text-[14px]">Loading events...</div></div>

  return (
    <div className="min-h-screen">
      <div className="max-w-[960px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-[#f5f5f5] tracking-tight">Discover</h1>
        </div>

        {/* ==================== CATEGORY PILLS (horizontal scroll, icon + label) ==================== */}
        <div className="mb-5 -mx-5 px-5">
          <div ref={scrollRef} className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
            <button
              onClick={() => setFilters(p => ({ ...p, category: '' }))}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${!filters.category ? 'bg-[#f5f5f5] text-[#0a0a0a]' : 'bg-[#111] border border-[#2a2a2a] text-[#a0a0a0] hover:border-[#666] hover:text-[#f5f5f5]'}`}
            >
              All
            </button>
            {EVENT_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setFilters(p => ({ ...p, category: p.category === cat ? '' : cat }))}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[13px] font-medium whitespace-nowrap transition-all flex-shrink-0 ${filters.category === cat ? 'bg-[#f5f5f5] text-[#0a0a0a]' : 'bg-[#111] border border-[#2a2a2a] text-[#a0a0a0] hover:border-[#666] hover:text-[#f5f5f5]'}`}
              >
                <CategoryIcon category={cat} size={16} />
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ==================== SECONDARY FILTERS ==================== */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setModals(p => ({ ...p, city: true }))}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${filters.city ? 'bg-[#222] text-[#f5f5f5] border border-[#666]' : 'bg-[#111] border border-[#2a2a2a] text-[#666] hover:border-[#666] hover:text-[#a0a0a0]'}`}>
            <MapPinIcon /> {filters.city || 'Location'}
          </button>

          <button onClick={() => { const d = new Date().toISOString().split('T')[0]; filters.quickFilter === 'today' ? setFilters(p => ({ ...p, startDate: '', endDate: '', quickFilter: '' })) : setFilters(p => ({ ...p, startDate: d, endDate: d, quickFilter: 'today' })) }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${filters.quickFilter === 'today' ? 'bg-[#222] text-[#f5f5f5] border border-[#666]' : 'bg-[#111] border border-[#2a2a2a] text-[#666] hover:border-[#666] hover:text-[#a0a0a0]'}`}>
            <SunIcon /> Today
          </button>

          <button onClick={() => { if (filters.quickFilter === 'weekend') { setFilters(p => ({ ...p, startDate: '', endDate: '', quickFilter: '' })) } else { const { start, end } = getWeekendDates(); setFilters(p => ({ ...p, startDate: start, endDate: end, quickFilter: 'weekend' })) } }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${filters.quickFilter === 'weekend' ? 'bg-[#222] text-[#f5f5f5] border border-[#666]' : 'bg-[#111] border border-[#2a2a2a] text-[#666] hover:border-[#666] hover:text-[#a0a0a0]'}`}>
            <WeekendIcon /> This weekend
          </button>

          <button onClick={() => setModals(p => ({ ...p, date: true }))}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${(filters.startDate || filters.endDate) && !filters.quickFilter ? 'bg-[#222] text-[#f5f5f5] border border-[#666]' : 'bg-[#111] border border-[#2a2a2a] text-[#666] hover:border-[#666] hover:text-[#a0a0a0]'}`}>
            <DateRangeIcon /> Pick dates
          </button>

          {hasFilters && (
            <button onClick={() => setFilters({ category: '', city: '', startDate: '', endDate: '', quickFilter: '' })}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] font-medium bg-[#1a1a1a] text-[#666] hover:text-[#a0a0a0] transition-colors">
              <XIcon /> Clear
            </button>
          )}
        </div>

        {hasFilters && <div className="mb-6 text-[13px] text-[#666]">Showing {filteredEvents.length} of {events.length} events</div>}

        {error && <div className="bg-[#111] border border-[#ef4444]/30 rounded-xl p-4 mb-8"><p className="text-[#ef4444] text-[14px]">{error}</p></div>}

        {/* ==================== EVENT GRID ==================== */}
        {upcoming.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#666] mb-5">Upcoming</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{upcoming.map(e => <EventCard key={e.id} event={e} />)}</div>
          </div>
        )}

        {past.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[#666] mb-5">Past events</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 opacity-60">{past.map(e => <EventCard key={e.id} event={e} />)}</div>
          </div>
        )}

        {filteredEvents.length === 0 && events.length > 0 && (
          <div className="text-center py-20">
            <h3 className="text-[16px] font-medium text-[#f5f5f5] mb-2">No events found</h3>
            <p className="text-[14px] text-[#666] mb-6">Try different filters</p>
            <button onClick={() => setFilters({ category: '', city: '', startDate: '', endDate: '', quickFilter: '' })} className="bg-[#f5f5f5] text-[#0a0a0a] px-5 py-2.5 rounded-lg text-[14px] font-semibold hover:opacity-85 transition-opacity">Clear filters</button>
          </div>
        )}

        {events.length === 0 && !loading && (
          <div className="text-center py-20">
            <h3 className="text-[16px] font-medium text-[#f5f5f5] mb-2">No events yet</h3>
            <p className="text-[14px] text-[#666] mb-6">Be the first to create one</p>
            <Link href="/create" className="inline-block bg-[#f5f5f5] text-[#0a0a0a] px-5 py-2.5 rounded-lg text-[14px] font-semibold hover:opacity-85 transition-opacity">Create event</Link>
          </div>
        )}

        {events.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/create" className="inline-block bg-[#111] text-[#f5f5f5] border border-[#2a2a2a] hover:border-[#666] px-5 py-2.5 rounded-lg text-[14px] font-semibold transition-colors">Create event</Link>
          </div>
        )}

        {/* ==================== MODALS ==================== */}
        <FilterModal isOpen={modals.city} onClose={() => setModals(p => ({ ...p, city: false }))} title="Select location">
          <div className="space-y-1">
            <button onClick={() => { setFilters(p => ({ ...p, city: '' })); setModals(p => ({ ...p, city: false })) }}
              className={`w-full text-left px-4 py-3 rounded-lg text-[14px] transition-colors ${!filters.city ? 'bg-[#222] text-[#f5f5f5] font-medium' : 'text-[#a0a0a0] hover:bg-[#1a1a1a]'}`}>All locations</button>
            {NORWEGIAN_CITIES.filter(c => c !== 'Other').map(c => (
              <button key={c} onClick={() => { setFilters(p => ({ ...p, city: c })); setModals(p => ({ ...p, city: false })) }}
                className={`w-full text-left px-4 py-3 rounded-lg text-[14px] transition-colors ${filters.city === c ? 'bg-[#222] text-[#f5f5f5] font-medium' : 'text-[#a0a0a0] hover:bg-[#1a1a1a]'}`}>{c}</button>
            ))}
          </div>
        </FilterModal>

        <FilterModal isOpen={modals.date} onClose={() => setModals(p => ({ ...p, date: false }))} title="Select date range">
          <DateFilterContent startDate={filters.startDate} endDate={filters.endDate}
            onApply={(s, e) => { setFilters(p => ({ ...p, startDate: s, endDate: e, quickFilter: '' })); setModals(p => ({ ...p, date: false })) }}
            onClear={() => { setFilters(p => ({ ...p, startDate: '', endDate: '', quickFilter: '' })); setModals(p => ({ ...p, date: false })) }} />
        </FilterModal>
      </div>
    </div>
  )
}
