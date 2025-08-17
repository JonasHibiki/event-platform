'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { EVENT_CATEGORIES } from '@/lib/constants/categories'
import { NORWEGIAN_CITIES } from '@/lib/constants/locations'
import CompressedImageUploader from '@/components/CompressedImageUploader'

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Offentlig arrangement', description: 'Vises i arrangementslistene for alle' },
  { value: 'private', label: 'Privat arrangement', description: 'Kun tilgjengelig via direktelenke' }
]

export default function CreateEventPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')

  // Form state with character limits
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    location: '', // City dropdown (public events only)
    address: '', // Required address field
    locationLink: '',
    ticketLink: '',
    category: '',
    visibility: 'public' // Default to public
  })

  // Character counters
  const titleCharsLeft = 80 - formData.title.length
  const descriptionCharsLeft = 800 - formData.description.length
  const addressCharsLeft = 200 - formData.address.length

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Apply character limits but allow pasting (trim at limit instead of preventing)
    let finalValue = value
    if (name === 'title' && value.length > 80) {
      finalValue = value.slice(0, 80)
    }
    if (name === 'description' && value.length > 800) {
      finalValue = value.slice(0, 800)
    }
    if (name === 'address' && value.length > 200) {
      finalValue = value.slice(0, 200)
    }
    
    // Clear category and location when switching to private
    if (name === 'visibility' && finalValue === 'private') {
      setFormData({
        ...formData,
        [name]: finalValue,
        category: '', // Clear category for private events
        location: ''  // Clear location for private events
      })
    } else {
      setFormData({
        ...formData,
        [name]: finalValue
      })
    }
  }

  // Ensure paste functionality works
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    // Allow default paste behavior
    // The handleChange will automatically trim if too long
  }

  const validateUrl = (url: string): boolean => {
    if (!url) return true // Optional field
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Validate required fields
      if (!imageUrl) {
        setError('Arrangementsbilde er påkrevd')
        setIsSubmitting(false)
        return
      }

      if (!formData.address.trim()) {
        setError('Sted / Adresse er påkrevd')
        setIsSubmitting(false)
        return
      }

      // Validate category only for public events
      if (formData.visibility === 'public' && !formData.category) {
        setError('Kategori er påkrevd for offentlige arrangementer')
        setIsSubmitting(false)
        return
      }

      // Validate location only for public events
      if (formData.visibility === 'public' && !formData.location) {
        setError('By er påkrevd for offentlige arrangementer')
        setIsSubmitting(false)
        return
      }

      // Validate URLs
      if (formData.locationLink && !validateUrl(formData.locationLink)) {
        setError('Vennligst skriv inn en gyldig URL for stedets lenke')
        setIsSubmitting(false)
        return
      }

      if (formData.ticketLink && !validateUrl(formData.ticketLink)) {
        setError('Vennligst skriv inn en gyldig URL for billettlenke')
        setIsSubmitting(false)
        return
      }

      // Validate dates
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`)
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`)

      if (startDateTime >= endDateTime) {
        setError('Sluttidspunkt må være etter starttidspunkt')
        setIsSubmitting(false)
        return
      }

      if (startDateTime <= new Date()) {
        setError('Arrangementet må starte i fremtiden')
        setIsSubmitting(false)
        return
      }

      // Create event with compressed image URL from UploadThing
      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        location: formData.visibility === 'public' ? formData.location.trim() : 'Privat arrangement', // Only set city for public events
        address: formData.address.trim(), // Required field
        locationLink: formData.locationLink.trim() || null,
        ticketLink: formData.ticketLink.trim() || null,
        category: formData.visibility === 'public' ? formData.category : null, // Only set category for public events
        visibility: formData.visibility,
        imageUrl // This comes from UploadThing compressed upload
      }

      const response = await fetch('/api/events/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      })

      if (response.ok) {
        const event = await response.json()
        router.push(`/events/${event.id}`)
      } else {
        const error = await response.json()
        setError(error.message || 'Kunne ikke opprette arrangement')
      }
    } catch (error) {
      setError('Noe gikk galt. Vennligst prøv igjen.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Opprett nytt arrangement</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Visibility Setting - Placed first for importance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Synlighet *
              </label>
              <div className="space-y-3">
                {VISIBILITY_OPTIONS.map((option) => (
                  <label key={option.value} className="flex items-start">
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={formData.visibility === option.value}
                      onChange={handleChange}
                      className="mt-1 mr-3"
                      required
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Category - Only show for public events */}
            {formData.visibility === 'public' && (
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Kategori *
                </label>
                <select
                  name="category"
                  id="category"
                  required={formData.visibility === 'public'}
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg en kategori</option>
                  {EVENT_CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Hjelper folk å finne arrangementet ditt i kategorioversikten
                </div>
              </div>
            )}

            {/* Location/City - Only show for public events */}
            {formData.visibility === 'public' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  By *
                </label>
                <select
                  name="location"
                  id="location"
                  required={formData.visibility === 'public'}
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Velg en by</option>
                  {NORWEGIAN_CITIES.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <div className="text-xs text-gray-500 mt-1">
                  Hjelper folk å finne arrangementer i sin by
                </div>
              </div>
            )}

            {/* Event Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Tittel på arrangement *
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Hva skjer?"
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {titleCharsLeft} tegn igjen
              </div>
            </div>

            {/* Event Image with Compression */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrangementsbilde *
              </label>
              
              <CompressedImageUploader
                onUploadComplete={(url) => {
                  setImageUrl(url)
                  setError('') // Clear any previous errors
                }}
                onUploadError={(error) => {
                  setError(error)
                  setImageUrl('')
                }}
                className="w-full"
              />
            </div>

            {/* Event Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Beskrivelse *
              </label>
              <textarea
                name="description"
                id="description"
                required
                rows={5}
                value={formData.description}
                onChange={handleChange}
                onPaste={handlePaste}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y break-words overflow-wrap-anywhere"
                placeholder="Fortell folk mer om arrangementet ditt..."
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {descriptionCharsLeft} tegn igjen
              </div>
            </div>

            {/* Start Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Startdato *
                </label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Starttid *
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  required
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* End Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Sluttdato *
                </label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Sluttid *
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  required
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Address/Location - Required */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Sted / Adresse *
              </label>
              <input
                type="text"
                name="address"
                id="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Rockefeller Music Hall, Torggata 16"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Spesifikk adresse, stedsnavn eller beskrivelse av hvor arrangementet holdes</span>
                <span>{addressCharsLeft} tegn igjen</span>
              </div>
            </div>

            {/* Location Link - Only show if address is filled */}
            {formData.address.trim() && (
              <div>
                <label htmlFor="locationLink" className="block text-sm font-medium text-gray-700 mb-2">
                  Stedets lenke <span className="text-gray-400">(valgfri)</span>
                </label>
                <input
                  type="url"
                  name="locationLink"
                  id="locationLink"
                  value={formData.locationLink}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://maps.google.com/... eller nettside"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Google Maps-lenke, stedets nettside eller online møtelenke
                </div>
              </div>
            )}

            {/* Ticket Link */}
            <div>
              <label htmlFor="ticketLink" className="block text-sm font-medium text-gray-700 mb-2">
                Billettlenke <span className="text-gray-400">(valgfri)</span>
              </label>
              <input
                type="url"
                name="ticketLink"
                id="ticketLink"
                value={formData.ticketLink}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://billetto.no/... eller billettside"
              />
              <div className="text-xs text-gray-500 mt-1">
                Lenke for å kjøpe billetter (Billetto, Facebook-arrangement, osv.)
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !imageUrl}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isSubmitting ? 'Oppretter arrangement...' : 'Opprett arrangement'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}