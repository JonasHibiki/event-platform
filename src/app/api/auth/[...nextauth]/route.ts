// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

// Create the handler using authOptions
const handler = NextAuth(authOptions)

// Only export the HTTP method handlers - this is what Next.js expects
export { handler as GET, handler as POST }