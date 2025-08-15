export default function CreateEvent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <a href="/" className="text-xl font-semibold">EventsPlatform</a>
          <a href="/events" className="text-blue-600">All Events</a>
        </div>
      </nav>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">Create Event</h2>
        <div className="text-gray-500">Event creation form will go here...</div>
      </div>
    </div>
  )
}