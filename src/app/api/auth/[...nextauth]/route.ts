// src/app/api/auth/[...nextauth]/route.ts
import NextAuth, { type AuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

const prisma = new PrismaClient()

// Define proper user type for callbacks
interface AuthUser {
  id: string
  email: string
  name: string
}

// Export the authOptions with proper typing
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const  // Add 'as const' for proper typing
  },
  pages: {
    signIn: '/auth/signin'
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}

// Use the exported authOptions in the handler
const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }