'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminUser {
  id: string
  email: string
  username: string
  role: string
  canCreateEvents: boolean
  createdAt: string
  _count: { events: number }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
    if (status === 'authenticated') {
      if (session.user.role !== 'admin') {
        router.push('/')
        return
      }
      fetchUsers()
    }
  }, [status, session, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.status === 403) {
        router.push('/')
        return
      }
      if (!res.ok) throw new Error('Failed to load users')
      setUsers(await res.json())
    } catch (err) {
      setError('Could not load users')
    } finally {
      setLoading(false)
    }
  }

  const togglePermission = async (userId: string, currentValue: boolean) => {
    setTogglingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ canCreateEvents: !currentValue })
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.message || 'Failed to update')
        return
      }

      const updatedUser = await res.json()
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
    } catch {
      setError('Something went wrong')
    } finally {
      setTogglingId(null)
    }
  }

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(d))

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-[#888] text-[16px]">Loading...</div>
      </div>
    )
  }

  if (session?.user.role !== 'admin') return null

  return (
    <div className="min-h-screen">
      <div className="max-w-[720px] mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[24px] font-bold text-[#f5f5f5]">Admin</h1>
          <Link href="/" className="text-[14px] text-[#888] hover:text-[#a0a0a0] transition-colors">Back to events</Link>
        </div>

        {error && (
          <div className="bg-[#111] border border-[#ef4444]/30 rounded-xl p-4 mb-6">
            <p className="text-[#ef4444] text-[14px]">{error}</p>
            <button onClick={() => setError('')} className="text-[12px] text-[#888] mt-1 hover:text-[#a0a0a0]">Dismiss</button>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#888]">
            Users ({users.length})
          </h2>
        </div>

        <div className="space-y-2">
          {users.map(user => {
            const isCurrentUser = user.id === session?.user.id
            const isToggling = togglingId === user.id

            return (
              <div
                key={user.id}
                className="bg-[#111] border border-[#1e1e1e] rounded-xl px-5 py-4 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[16px] font-medium text-[#f5f5f5] truncate">{user.username}</span>
                    {user.role === 'admin' && (
                      <span className="text-[11px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#222] text-[#a0a0a0] border border-[#333]">Admin</span>
                    )}
                  </div>
                  <div className="text-[14px] text-[#888] truncate">{user.email}</div>
                  <div className="text-[13px] text-[#555] mt-1">
                    Joined {formatDate(user.createdAt)} · {user._count.events} {user._count.events === 1 ? 'event' : 'events'}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {isCurrentUser ? (
                    <span className="text-[13px] text-[#555]">You</span>
                  ) : (
                    <button
                      onClick={() => togglePermission(user.id, user.canCreateEvents)}
                      disabled={isToggling}
                      className={`relative w-[44px] h-[24px] rounded-full transition-colors duration-200 disabled:opacity-50 ${
                        user.canCreateEvents ? 'bg-[#22c55e]' : 'bg-[#333]'
                      }`}
                      aria-label={`${user.canCreateEvents ? 'Revoke' : 'Grant'} event creation for ${user.username}`}
                    >
                      <span
                        className={`absolute top-[2px] w-[20px] h-[20px] rounded-full bg-white transition-transform duration-200 ${
                          user.canCreateEvents ? 'left-[22px]' : 'left-[2px]'
                        }`}
                      />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {users.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-[16px] text-[#888]">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
