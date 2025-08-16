'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="text-xl font-bold text-blue-600 hover:text-blue-700"
            >
              Arrangementer
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              href="/events" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Utforsk
            </Link>

            {status === 'loading' ? (
              <div className="text-gray-400 text-sm">Laster...</div>
            ) : session ? (
              <>
                <Link 
                  href="/my-events" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Mine arrangementer
                </Link>
                <Link 
                  href="/create" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Opprett
                </Link>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    Hei, {session.user?.name || session.user?.email || 'Bruker'}!
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Logg ut
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/signin" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logg inn
                </Link>
                <Link 
                  href="/auth/signup" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Registrer deg
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/events" 
                className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Utforsk arrangementer
              </Link>
              
              {status === 'loading' ? (
                <div className="px-3 py-2 text-gray-400 text-sm">Laster...</div>
              ) : session ? (
                <>
                  <Link 
                    href="/my-events" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Mine arrangementer
                  </Link>
                  <Link 
                    href="/create" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Opprett arrangement
                  </Link>
                  
                  {/* Mobile User Info */}
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      Hei, {session.user?.name || session.user?.email || 'Bruker'}!
                    </div>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="block w-full text-left px-3 py-2 text-gray-600 hover:text-red-600 text-sm font-medium"
                    >
                      Logg ut
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/signin" 
                    className="block px-3 py-2 text-gray-600 hover:text-gray-900 text-sm font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Logg inn
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="block px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium text-center mx-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registrer deg
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}