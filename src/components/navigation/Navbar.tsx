'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'

function VibberLogo({ className = '' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 91 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M45.3604 19.8447C57.7705 19.8448 68.9497 21.8687 76.9814 25.0957C81.0004 26.7105 84.1717 28.6025 86.3184 30.6416C88.4622 32.6781 89.5048 34.778 89.5049 36.8545C89.5049 38.9312 88.4623 41.0318 86.3184 43.0684C84.1717 45.1075 81.0004 46.9995 76.9814 48.6143C68.9497 51.8413 57.7705 53.8652 45.3604 53.8652C32.9501 53.8652 21.7701 51.8413 13.7383 48.6143C9.71935 46.9995 6.54803 45.1075 4.40137 43.0684C2.25742 41.0318 1.21484 38.9312 1.21484 36.8545C1.21497 34.778 2.25755 32.6781 4.40137 30.6416C6.54802 28.6025 9.71932 26.7105 13.7383 25.0957C21.7701 21.8686 32.9501 19.8447 45.3604 19.8447Z" stroke="currentColor" strokeWidth="2.43"/>
      <path d="M45.3604 1.21484C57.7705 1.21488 68.9497 3.23877 76.9814 6.46582C81.0004 8.08061 84.1717 9.97259 86.3184 12.0117C88.4622 14.0482 89.5048 16.1481 89.5049 18.2246C89.5049 20.3013 88.4623 22.4019 86.3184 24.4385C84.1717 26.4776 81.0004 28.3696 76.9814 29.9844C68.9497 33.2114 57.7705 35.2353 45.3604 35.2354C32.9501 35.2354 21.7701 33.2115 13.7383 29.9844C9.71935 28.3696 6.54803 26.4776 4.40137 24.4385C2.25742 22.4019 1.21484 20.3013 1.21484 18.2246C1.21497 16.1481 2.25755 14.0482 4.40137 12.0117C6.54802 9.97258 9.71932 8.08062 13.7383 6.46582C21.7701 3.23874 32.9501 1.21484 45.3604 1.21484Z" stroke="currentColor" strokeWidth="2.43"/>
    </svg>
  )
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12 19 5 12 12 5"/>
    </svg>
  )
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const isHome = pathname === '/'

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = () => {
    setIsDropdownOpen(false)
    signOut({ callbackUrl: '/' })
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-[#1e1e1e]">
      <div className="max-w-[960px] mx-auto px-5 h-14 flex items-center gap-4">

        {/* Left side: Logo on home, back arrow elsewhere */}
        {isHome ? (
          <div className="flex-shrink-0 text-[#f5f5f5]">
            <VibberLogo className="h-[22px] w-auto" />
          </div>
        ) : (
          <Link href="/" className="flex items-center gap-1.5 text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors">
            <ArrowLeftIcon />
          </Link>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right side: Auth */}
        <div className="flex items-center gap-2">
          {status === 'loading' ? (
            <div className="w-[34px] h-[34px] rounded-full bg-[#1a1a1a] animate-pulse" />
          ) : session ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-[34px] h-[34px] rounded-full bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center hover:border-[#666] transition-colors"
              >
                <svg className="w-4 h-4 text-[#a0a0a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute top-[calc(100%+8px)] right-0 bg-[#111] border border-[#2a2a2a] rounded-xl w-[calc(100vw-40px)] sm:w-auto sm:min-w-[220px] p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <div className="px-3 py-2 mb-1">
                    <div className="text-[16px] font-medium text-[#f5f5f5]">{session.user?.name || 'User'}</div>
                    <div className="text-[14px] text-[#888]">{session.user?.email}</div>
                  </div>
                  <div className="h-px bg-[#1e1e1e] my-1" />
                  <Link
                    href="/my-events"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[16px] font-medium text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#f5f5f5] rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="3" y="4" width="18" height="18" rx="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    My events
                  </Link>
                  {session.user.canCreateEvents && (
                    <Link
                      href="/create"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[16px] font-medium text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#f5f5f5] rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Create new
                    </Link>
                  )}
                  {session.user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[16px] font-medium text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#f5f5f5] rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                      </svg>
                      Admin
                    </Link>
                  )}
                  <div className="h-px bg-[#1e1e1e] my-1" />
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2.5 w-full px-3 py-2.5 text-[16px] font-medium text-[#a0a0a0] hover:bg-[#1a1a1a] hover:text-[#f5f5f5] rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="sm:hidden flex items-center justify-center w-[38px] h-[38px] rounded-full hover:bg-[#1a1a1a] transition-colors"
              >
                <svg className="w-5 h-5 text-[#a0a0a0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </Link>
              <div className="hidden sm:flex items-center gap-3">
                <Link href="/auth/signin" className="text-[16px] font-medium text-[#a0a0a0] hover:text-[#f5f5f5] transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link href="/auth/signup" className="text-[16px] font-medium text-[#0a0a0a] bg-[#f5f5f5] hover:opacity-85 px-4 py-1.5 rounded-lg transition-opacity">
                  Sign up
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
