import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role from DB
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (currentUser?.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { canCreateEvents } = body

    if (typeof canCreateEvents !== 'boolean') {
      return NextResponse.json(
        { message: 'canCreateEvents must be a boolean' },
        { status: 400 }
      )
    }

    // Prevent admin from accidentally removing their own permissions
    if (id === session.user.id) {
      return NextResponse.json(
        { message: 'Cannot modify your own permissions' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { canCreateEvents },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        canCreateEvents: true,
        createdAt: true,
        _count: { select: { events: true } }
      }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Admin user PATCH error:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
