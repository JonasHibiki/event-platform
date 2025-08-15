export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">EventsPlatform</h1>
          <div className="space-x-4">
            <a href="/events" className="text-blue-600">Events</a>
            <a href="/create" className="bg-blue-600 text-white px-3 py-1 rounded">Create Event</a>
          </div>
        </div>
      </nav>
      <div className="p-4 text-center mt-8">
        <h2 className="text-2xl font-bold mb-4">Connect in Real Life</h2>
        <p className="text-gray-600 mb-6">Discover events in Norway. Quit social media, meet real people.</p>
        <a href="/events" className="bg-blue-600 text-white px-6 py-2 rounded-lg">Browse Events</a>
      </div>
    </div>
  )
}