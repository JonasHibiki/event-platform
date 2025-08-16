// src/app/api/events/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const events = await prisma.event.findMany({
      where: {
        visibility: 'public' // Only show public events
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
        startDate: 'asc'
      }
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { message: 'Intern serverfeil' },
      { status: 500 }
    )
  }
}