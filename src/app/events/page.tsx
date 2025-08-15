export default function Events() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <a href="/" className="text-xl font-semibold">EventsPlatform</a>
          <a href="/create" className="bg-blue-600 text-white px-3 py-1 rounded">Create Event</a>
        </div>
      </nav>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">All Events</h2>
        <div className="text-gray-500">Events will appear here...</div>
      </div>
    </div>
  )
}