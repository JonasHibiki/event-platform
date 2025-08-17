import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Create RSVP
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params  // ✅ NEW: Await params first
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Du må være logget inn' },
        { status: 401 }
      )
    }

    const event = await prisma.event.findUnique({
      where: { id }  // ✅ CHANGED: Use awaited id
    })

    if (!event) {
      return NextResponse.json(
        { message: 'Arrangementet ble ikke funnet' },
        { status: 404 }
      )
    }

    if (new Date(event.startDate) <= new Date()) {
      return NextResponse.json(
        { message: 'Du kan ikke melde deg på avsluttede arrangementer' },
        { status: 400 }
      )
    }

    if (event.creatorId === session.user.id) {
      return NextResponse.json(
        { message: 'Du kan ikke melde deg på ditt eget arrangement' },
        { status: 400 }
      )
    }

    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id  // ✅ CHANGED: Use awaited id
        }
      }
    })

    if (existingRsvp) {
      return NextResponse.json(
        { message: 'Du er allerede påmeldt dette arrangementet' },
        { status: 409 }
      )
    }

    const rsvp = await prisma.rSVP.create({
      data: {
        userId: session.user.id,
        eventId: id  // ✅ CHANGED: Use awaited id
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
      { message: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}

// Delete RSVP
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params  // ✅ NEW: Await params first
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Du må være logget inn' },
        { status: 401 }
      )
    }

    const existingRsvp = await prisma.rSVP.findUnique({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id  // ✅ CHANGED: Use awaited id
        }
      }
    })

    if (!existingRsvp) {
      return NextResponse.json(
        { message: 'Du er ikke påmeldt dette arrangementet' },
        { status: 404 }
      )
    }

    await prisma.rSVP.delete({
      where: {
        userId_eventId: {
          userId: session.user.id,
          eventId: id  // ✅ CHANGED: Use awaited id
        }
      }
    })

    return NextResponse.json({ message: 'Påmelding fjernet' })

  } catch (error) {
    console.error('Error deleting RSVP:', error)
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}