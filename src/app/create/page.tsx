'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { NORWEGIAN_CITIES } from '@/lib/constants/locations'
import CompressedImageUploader from '@/components/CompressedImageUploader'
import DatePickerInput from '@/components/DatePickerInput'

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public event', description: 'Visible to everyone in event listings' },
  { value: 'private', label: 'Private event', description: 'Only accessible via direct link' }
]

export default function CreateEventPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '',
    address: '',
    locationLink: '',
    ticketLink: '',
    category: '',
    visibility: 'public'
  })

  const titleCharsLeft = 80 - formData.title.length
  const descriptionCharsLeft = 800 - formData.description.length
  const addressCharsLeft = 200 - formData.address.length

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div style={{ color: 'var(--text-tertiary)' }}>Loading...</div>
    </div>
  }

  if (status === 'unauthenticated') {
    router.push('/auth/signin')
    return null
  }

  if (session && !session.user.canCreateEvents) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center max-w-md px-5">
          <h1 className="text-[20px] font-semibold text-[#f5f5f5] mb-3">No access yet</h1>
          <p className="text-[16px] text-[#888] mb-6">Your account doesn&apos;t have permission to create events. Contact an admin to get access.</p>
          <button onClick={() => router.push('/')} className="text-[16px] font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">Back to events</button>
        </div>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target

    let finalValue = value
    if (name === 'title' && value.length > 80) finalValue = value.slice(0, 80)
    if (name === 'description' && value.length > 800) finalValue = value.slice(0, 800)
    if (name === 'address' && value.length > 200) finalValue = value.slice(0, 200)

    if (name === 'visibility' && finalValue === 'private') {
      setFormData({ ...formData, [name]: finalValue, category: '', location: '' })
    } else {
      setFormData({ ...formData, [name]: finalValue })
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {}

  const validateUrl = (url: string): boolean => {
    if (!url) return true
    try { new URL(url); return true } catch { return false }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      if (!imageUrl) { setError('Event image is required'); setIsSubmitting(false); return }
      if (!formData.address.trim()) { setError('Venue / Address is required'); setIsSubmitting(false); return }
      if (formData.visibility === 'public' && !formData.category) { setError('Category is required for public events'); setIsSubmitting(false); return }
      if (formData.visibility === 'public' && !formData.location) { setError('City is required for public events'); setIsSubmitting(false); return }
      if (formData.locationLink && !validateUrl(formData.locationLink)) { setError('Please enter a valid URL for venue link'); setIsSubmitting(false); return }
      if (formData.ticketLink && !validateUrl(formData.ticketLink)) { setError('Please enter a valid URL for ticket link'); setIsSubmitting(false); return }

      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      if (startDateTime >= endDateTime) { setError('End time must be after start time'); setIsSubmitting(false); return }
      if (startDateTime <= new Date()) { setError('Event must start in the future'); setIsSubmitting(false); return }

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: formData.visibility === 'public' ? formData.location.trim() : 'Private event',
        address: formData.address.trim(),
        locationLink: formData.locationLink.trim() || null,
        ticketLink: formData.ticketLink.trim() || null,
        category: formData.visibility === 'public' ? formData.category : null,
        visibility: formData.visibility,
        imageUrl
      }

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const event = await response.json()
        router.push(`/events/${event.id}`)
      } else {
        const error = await response.json()
        setError(error.message || 'Could not create event')
      }
    } catch (error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputStyle = {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    color: 'var(--text-primary)',
  }

  const labelStyle = { color: 'var(--text-secondary)' }
  const hintStyle = { color: 'var(--text-tertiary)' }

  return (
    <div className="min-h-screen py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-2xl mx-auto px-4">
        <div className="rounded-xl p-6" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
          <h1 className="text-xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>Create new event</h1>

          {error && (
            <div className="rounded-lg p-4 mb-6" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <p style={{ color: 'var(--destructive)' }} className="text-base">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium mb-3" style={labelStyle}>Visibility</label>
              <div className="space-y-3">
                {VISIBILITY_OPTIONS.map((option) => {
                  const isSelected = formData.visibility === option.value
                  return (
                    <label key={option.value} className="flex items-start cursor-pointer group">
                      <input
                        type="radio"
                        name="visibility"
                        value={option.value}
                        checked={isSelected}
                        onChange={handleChange}
                        className="sr-only"
                        required
                      />
                      <span className={`mt-0.5 mr-3 flex-shrink-0 w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#f5f5f5] bg-transparent' : 'border-[#555] bg-transparent group-hover:border-[#888]'}`}>
                        {isSelected && <span className="w-[10px] h-[10px] rounded-full bg-[#f5f5f5]" />}
                      </span>
                      <div>
                        <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{option.label}</div>
                        <div className="text-sm" style={hintStyle}>{option.description}</div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Category - public only */}
            {formData.visibility === 'public' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium mb-2" style={labelStyle}>Category</label>
                <select
                  name="category" id="category"
                  required={formData.visibility === 'public'}
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                  style={inputStyle}
                >
                  <option value="">Select a category</option>
                  {EVENT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="text-sm mt-1" style={hintStyle}>Helps people find your event</div>
              </div>
            )}

            {/* Location/City - public only */}
            {formData.visibility === 'public' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-2" style={labelStyle}>City</label>
                <select
                  name="location" id="location"
                  required={formData.visibility === 'public'}
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                  style={inputStyle}
                >
                  <option value="">Select a city</option>
                  {NORWEGIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <div className="text-sm mt-1" style={hintStyle}>Helps people find events in their city</div>
              </div>
            )}

            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-2" style={labelStyle}>Title</label>
              <input
                type="text" name="title" id="title" required
                value={formData.title} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                style={inputStyle}
                placeholder="What's happening?"
              />
              <div className="text-right text-sm mt-1" style={hintStyle}>{titleCharsLeft} characters left</div>
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium mb-2" style={labelStyle}>Event image</label>
              <CompressedImageUploader
                onUploadComplete={(url) => { setImageUrl(url); setError('') }}
                onUploadError={(error) => { setError(error); setImageUrl('') }}
                className="w-full"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-2" style={labelStyle}>Description</label>
              <textarea
                name="description" id="description" required rows={5}
                value={formData.description} onChange={handleChange} onPaste={handlePaste}
                className="w-full px-3 py-2.5 rounded-lg text-base outline-none resize-y break-words overflow-wrap-anywhere"
                style={inputStyle}
                placeholder="Tell people more about your event..."
              />
              <div className="text-right text-sm mt-1" style={hintStyle}>{descriptionCharsLeft} characters left</div>
            </div>

            {/* Start Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <DatePickerInput
                label="Start date"
                id="startDate"
                value={formData.startDate}
                onChange={(date) => setFormData(p => ({ ...p, startDate: date }))}
                min={new Date().toISOString().split('T')[0]}
                required
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium mb-2" style={labelStyle}>Start time</label>
                <input
                  type="time" name="startTime" id="startTime" required
                  value={formData.startTime} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* End Date/Time */}
            <div className="grid grid-cols-2 gap-4">
              <DatePickerInput
                label="End date"
                id="endDate"
                value={formData.endDate}
                onChange={(date) => setFormData(p => ({ ...p, endDate: date }))}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                required
                inputStyle={inputStyle}
                labelStyle={labelStyle}
              />
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium mb-2" style={labelStyle}>End time</label>
                <input
                  type="time" name="endTime" id="endTime" required
                  value={formData.endTime} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium mb-2" style={labelStyle}>Venue / Address</label>
              <input
                type="text" name="address" id="address" required
                value={formData.address} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                style={inputStyle}
                placeholder="Rockefeller Music Hall, Torggata 16"
              />
              <div className="flex justify-between text-sm mt-1" style={hintStyle}>
                <span>Specific address or venue name</span>
                <span>{addressCharsLeft} characters left</span>
              </div>
            </div>

            {/* Location Link */}
            {formData.address.trim() && (
              <div>
                <label htmlFor="locationLink" className="block text-sm font-medium mb-2" style={labelStyle}>
                  Venue link <span style={hintStyle}>(optional)</span>
                </label>
                <input
                  type="url" name="locationLink" id="locationLink"
                  value={formData.locationLink} onChange={handleChange}
                  className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                  style={inputStyle}
                  placeholder="https://maps.google.com/..."
                />
                <div className="text-sm mt-1" style={hintStyle}>Google Maps link or venue website</div>
              </div>
            )}

            {/* Ticket Link */}
            <div>
              <label htmlFor="ticketLink" className="block text-sm font-medium mb-2" style={labelStyle}>
                Ticket link <span style={hintStyle}>(optional)</span>
              </label>
              <input
                type="url" name="ticketLink" id="ticketLink"
                value={formData.ticketLink} onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-base outline-none"
                style={inputStyle}
                placeholder="https://billetto.no/..."
              />
              <div className="text-sm mt-1" style={hintStyle}>Link to buy tickets</div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting || !imageUrl}
              className="w-full py-3 px-4 rounded-lg font-medium text-base transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              {isSubmitting ? 'Creating event...' : 'Create event'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
