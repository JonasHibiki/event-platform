import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Du må være logget inn' },
        { status: 401 }
      )
    }

    // Get events created by the user
    const createdEvents = await prisma.event.findMany({
      where: {
        creatorId: session.user.id
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            rsvps: true
          }
        }
      },
      orderBy: {
        startDate: 'desc'
      }
    })

    // Get events the user has RSVP'd to
    const rsvpEvents = await prisma.rSVP.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        event: {
          include: {
            creator: {
              select: {
                id: true,
                username: true
              }
            },
            _count: {
              select: {
                rsvps: true
              }
            }
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'desc'
        }
      }
    })

    // Extract just the events from RSVPs
    const attendingEvents = rsvpEvents.map(rsvp => rsvp.event)

    return NextResponse.json({
      createdEvents,
      attendingEvents
    })

  } catch (error) {
    console.error('Error fetching user events:', error)
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}