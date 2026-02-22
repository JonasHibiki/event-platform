import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidCategory } from '@/lib/constants/categories'
import { isValidLocation } from '@/lib/constants/locations'



// Get single event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true }
        },
        rsvps: {
          include: {
            user: {
              select: { id: true, username: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error('Error fetching event:', error)
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}

// Add this PUT method to your existing src/app/api/events/[id]/route.ts
// Insert this between your GET and DELETE methods

// PUT method - Edit event
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in' },
        { status: 401 }
      )
    }

    // Check if event exists and user is the creator
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      select: { creatorId: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    if (existingEvent.creatorId !== session.user.id) {
      return NextResponse.json(
        { message: 'You can only edit your own events' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { 
      title, 
      description, 
      imageUrl, 
      startDate, 
      endDate, 
      location,
      address,
      locationLink,
      ticketLink,
      category,
      visibility 
    } = body

    // Validate required fields
    if (!title || !description || !address || !startDate || !endDate || !visibility) {
      return NextResponse.json(
        { message: 'Alle påkrevde felt må fylles ut' },
        { status: 400 }
      )
    }

    // Validate visibility
    if (!['public', 'private'].includes(visibility)) {
      return NextResponse.json(
        { message: 'Ugyldig synlighetsinnstilling' },
        { status: 400 }
      )
    }

    // Validate category only for public events
    if (visibility === 'public' && !category) {
      return NextResponse.json(
        { message: 'Category is required for public events' },
        { status: 400 }
      )
    }

    // Validate location only for public events
    if (visibility === 'public' && !location) {
      return NextResponse.json(
        { message: 'City is required for public events' },
        { status: 400 }
      )
    }

    // Validate field lengths
    if (title.trim().length > 80) {
      return NextResponse.json(
        { message: 'Tittel må være 80 tegn eller mindre' },
        { status: 400 }
      )
    }

    if (description.trim().length > 800) {
      return NextResponse.json(
        { message: 'Beskrivelse må være 800 tegn eller mindre' },
        { status: 400 }
      )
    }

    if (address.trim().length > 200) {
      return NextResponse.json(
        { message: 'Sted / Adresse må være 200 tegn eller mindre' },
        { status: 400 }
      )
    }

    // Validate URLs (optional fields)
    const validateUrl = (url: string): boolean => {
      if (!url) return true
      try {
        new URL(url)
        return true
      } catch {
        return false
      }
    }

    if (locationLink && !validateUrl(locationLink)) {
      return NextResponse.json(
        { message: 'Ugyldig URL for stedets lenke' },
        { status: 400 }
      )
    }

    if (ticketLink && !validateUrl(ticketLink)) {
      return NextResponse.json(
        { message: 'Ugyldig URL for billettlenke' },
        { status: 400 }
      )
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: 'Ugyldig datoformat' },
        { status: 400 }
      )
    }

    if (start >= end) {
      return NextResponse.json(
        { message: 'Sluttidspunkt må være etter starttidspunkt' },
        { status: 400 }
      )
    }

    // Update event in database
    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl?.trim() || undefined, // Only update if provided
        startDate: start,
        endDate: end,
        location: location ? location.trim() : 'Private event',
        address: address.trim(),
        locationLink: locationLink?.trim() || null,
        ticketLink: ticketLink?.trim() || null,
        category: category?.trim() || null,
        visibility: visibility.trim(),
      },
      include: {
        creator: {
          select: {
            id: true,
            username: true
          }
        },
        rsvps: {
          include: {
            user: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedEvent, { status: 200 })

  } catch (error) {
    console.error('Error updating event:', error)
    return NextResponse.json(
      { message: 'Could not update event' },
      { status: 500 }
    )
  }
}

// Delete event
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'You must be logged in' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Check if event exists and user is the creator
    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        creatorId: true,
        title: true,
        _count: {
          select: {
            rsvps: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 404 }
      )
    }

    // Check if user is the creator
    if (event.creatorId !== session.user.id) {
      return NextResponse.json(
        { message: 'You can only delete your own events' },
        { status: 403 }
      )
    }

    // Delete the event (this will cascade delete RSVPs due to onDelete: Cascade in schema)
    await prisma.event.delete({
      where: { id }
    })

    return NextResponse.json({
      message: `Event "${event.title}" was deleted`,
      deletedEvent: {
        id: event.id,
        title: event.title,
        rsvpCount: event._count.rsvps
      }
    })

  } catch (error) {
    console.error('Error deleting event:', error)
    return NextResponse.json(
      { message: 'Could not delete event' },
      { status: 500 }
    )
  }
}