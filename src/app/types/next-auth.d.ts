// src/types/next-auth.d.ts
import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      canCreateEvents: boolean
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    canCreateEvents: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: string
    canCreateEvents?: boolean
  }
}