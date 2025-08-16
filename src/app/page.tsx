import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Finn dine neste
            <br />
            <span className="text-blue-600">arrangementer</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            En enkel og brukervennlig plattform for unge voksne som vil oppdage og dele arrangementer i Norge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-medium text-lg transition-colors"
            >
              Utforsk arrangementer
            </Link>
            <Link
              href="/create"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 font-medium text-lg border-2 border-blue-600 transition-colors"
            >
              Opprett arrangement
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-4xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Oppdag arrangementer
            </h3>
            <p className="text-gray-600">
              Finn konserter, fester, konferanser og andre spennende arrangementer i din by.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-4xl mb-4">🎫</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Enkel påmelding
            </h3>
            <p className="text-gray-600">
              Meld deg på arrangementer med ett klikk, eller kjøp billetter direkte fra arrangementet.
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Mobiloptimalisert
            </h3>
            <p className="text-gray-600">
              Perfekt designet for mobil, så du kan oppdage og dele arrangementer hvor som helst.
            </p>
          </div>
        </div>

        {/* Privacy Options */}
        <div className="bg-white rounded-xl p-8 shadow-sm mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Offentlige eller private arrangementer
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Du bestemmer hvem som kan se arrangementet ditt. Lag offentlige arrangementer som alle kan oppdage, eller private arrangementer som kun er tilgjengelige via direktelenke.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Offentlige arrangementer
              </h3>
              <p className="text-gray-600 text-sm">
                Vises i arrangementslistene og kan oppdages av alle brukere
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Private arrangementer
              </h3>
              <p className="text-gray-600 text-sm">
                Kun tilgjengelig via direktelenke som du deler med dem du vil invitere
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Klar for å komme i gang?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Bli med på en plattform som handler om å møte folk i virkeligheten
          </p>
          <Link
            href="/auth/signup"
            className="inline-block bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-medium text-lg transition-colors"
          >
            Registrer deg gratis
          </Link>
        </div>
      </div>
    </div>
  )
}