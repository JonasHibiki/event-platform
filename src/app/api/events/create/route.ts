// src/app/api/events/create/route.ts - Updated for address field

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isValidCategory } from '@/lib/constants/categories'
import { isValidLocation } from '@/lib/constants/locations'

const validateUrl = (url: string): boolean => {
  if (!url) return true // Optional field
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Autentisering påkrevd' },
        { status: 401 }
      )
    }

    // Check permission to create events (from DB, not session, for security)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { canCreateEvents: true }
    })

    if (!user?.canCreateEvents) {
      return NextResponse.json(
        { message: 'You do not have permission to create events' },
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
    if (!title || !description || !imageUrl || !startDate || !endDate || !address || !visibility) {
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
    if (visibility === 'public') {
      if (!category) {
        return NextResponse.json(
          { message: 'Category is required for public events' },
          { status: 400 }
        )
      }
      
      if (!isValidCategory(category)) {
        return NextResponse.json(
          { message: 'Ugyldig kategori' },
          { status: 400 }
        )
      }
    }

    // Validate location only for public events
    if (visibility === 'public') {
      if (!location) {
        return NextResponse.json(
          { message: 'City is required for public events' },
          { status: 400 }
        )
      }
      
      if (!isValidLocation(location)) {
        return NextResponse.json(
          { message: 'Ugyldig by' },
          { status: 400 }
        )
      }
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

    if (start <= new Date()) {
      return NextResponse.json(
        { message: 'Event cannot be scheduled in the past' },
        { status: 400 }
      )
    }

    // Create event in database
    const event = await prisma.event.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        startDate: start,
        endDate: end,
        location: location ? location.trim() : 'Private event',
        address: address.trim(), // Required field now
        locationLink: locationLink?.trim() || null,
        ticketLink: ticketLink?.trim() || null,
        category: category?.trim() || null,
        visibility: visibility.trim(),
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
      }
    })

    return NextResponse.json(event, { status: 201 })

  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}