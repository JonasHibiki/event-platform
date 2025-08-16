// src/lib/auth.ts
import { PrismaClient } from '@prisma/client'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import type { AuthOptions } from 'next-auth'
import type { JWT } from 'next-auth/jwt'
import type { Session } from 'next-auth'

const prisma = new PrismaClient()

interface AuthUser {
  id: string
  email: string
  name: string
}

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // ✅ recommended

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        if (!user) return null

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        if (!isPasswordValid) return null

        return { id: user.id, email: user.email, name: user.username }
      }
    })
  ],

  session: { strategy: 'jwt' },

  pages: { signIn: '/auth/signin' },

  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: AuthUser }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    }
  }
}
