'use client'

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SigninForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const successMessage = searchParams.get('message')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
        return
      }

      if (result?.ok) {
        router.push('/events')
        router.refresh()
      }
    } catch (_error) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-sm w-full space-y-8">
        <div>
          <h2 className="text-center text-2xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sign in
          </h2>
          <p className="mt-2 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
            Welcome back to vibber
          </p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          {successMessage && (
            <div className="px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', color: 'var(--success)' }}>
              {successMessage}
            </div>
          )}

          {error && (
            <div className="px-4 py-3 rounded-md text-sm" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--destructive)' }}>
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="din@epost.no"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-colors"
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
                placeholder="Skriv inn ditt passord"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'var(--text-primary)',
                color: 'var(--bg-primary)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>
                Sign up
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  )
}

function SigninLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: 'var(--text-secondary)' }}></div>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-tertiary)' }}>Loading...</p>
      </div>
    </div>
  )
}

export default function SigninPage() {
  return (
    <Suspense fallback={<SigninLoading />}>
      <SigninForm />
    </Suspense>
  )
}
