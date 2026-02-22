import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Delete a specific RSVP by ID (used for guest un-RSVP)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; rsvpId: string }> }
) {
  try {
    const { id, rsvpId } = await params

    const rsvp = await prisma.rSVP.findUnique({
      where: { id: rsvpId }
    })

    if (!rsvp || rsvp.eventId !== id) {
      return NextResponse.json(
        { message: 'RSVP not found' },
        { status: 404 }
      )
    }

    await prisma.rSVP.delete({
      where: { id: rsvpId }
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
