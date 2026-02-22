import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

// Create RSVP (works with or without login)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    const event = await prisma.event.findUnique({
      where: { id }
    })

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    if (new Date(event.startDate) <= new Date()) {
      return NextResponse.json(
        { message: 'You cannot RSVP to ended events' },
        { status: 400 }
      )
    }

    let userId: string

    if (session?.user?.id) {
      // Logged-in user
      userId = session.user.id

      if (event.creatorId === userId) {
        return NextResponse.json(
          { message: 'You cannot RSVP to your own event' },
          { status: 400 }
        )
      }
    } else {
      // Guest RSVP — parse name from body, create a guest user
      let name = 'Guest'
      try {
        const body = await req.json()
        if (body.name && typeof body.name === 'string' && body.name.trim()) {
          name = body.name.trim().slice(0, 50)
        }
      } catch {
        // No body or invalid JSON is fine, default to "Guest"
      }

      const guestEmail = `guest_${randomBytes(8).toString('hex')}@vibber.guest`
      const guestUser = await prisma.user.create({
        data: {
          email: guestEmail,
          username: name,
          password: '', // Guest accounts have no password
        }
      })
      userId = guestUser.id
    }

    // Check for existing RSVP
    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId: id
        }
      }
    })

    if (existingRsvp) {
      return NextResponse.json(
        { message: 'You are already attending this event' },
        { status: 409 }
      )
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        userId,
        eventId: id
      },
      include: {
        user: {
          select: {
            id: true,
            username: true
          }
        }
      }
    })

    return NextResponse.json(rsvp, { status: 201 })

  } catch (error) {
    console.error('Error creating RSVP:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete RSVP (requires login)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in' },
        { status: 401 }
      )
    }

    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id
        }
      }
    })

    if (!existingRsvp) {
      return NextResponse.json(
        { message: 'You are not attending this event' },
        { status: 404 }
      )
    }

    await prisma.rSVP.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id
        }
      }
    })

    return NextResponse.json({ message: 'RSVP removed' })

  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
