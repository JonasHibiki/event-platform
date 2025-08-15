// Fixed src/app/create/page.tsx
import Link from 'next/link';

export default function CreateEvent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-semibold">EventsPlatform</Link>
          <Link href="/events" className="text-blue-600">All Events</Link>
        </div>
      </nav>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Create Event</h2>
        <div className="text-gray-500">Event creation form will go here...</div>
      </div>
    </div>
  )
}