import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Update a user's username (creator-only, for editing guest names)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { username, eventId } = body

    if (!username || typeof username !== 'string' || !username.trim()) {
      return NextResponse.json(
        { message: 'Name is required' },
        { status: 400 }
      )
    }

    if (!eventId) {
      return NextResponse.json(
        { message: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Verify the caller is the creator of the event
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { creatorId: true }
    })

    if (!event || event.creatorId !== session.user.id) {
      return NextResponse.json(
        { message: 'Only the event creator can edit guest names' },
        { status: 403 }
      )
    }

    // Verify the user being renamed is actually an RSVP on this event
    const rsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId
        }
      }
    })

    if (!rsvp) {
      return NextResponse.json(
        { message: 'This user is not attending this event' },
        { status: 404 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { username: username.trim().slice(0, 50) },
      select: { id: true, username: true }
    })

    return NextResponse.json(updatedUser)

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { message: 'Could not update name' },
      { status: 500 }
    )
  }
}
