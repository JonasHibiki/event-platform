import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import EventDetailPage from './EventDetail'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      imageUrl: true,
      startDate: true,
      location: true,
      address: true,
      visibility: true,
      creator: { select: { username: true } },
    },
  })

  if (!event) {
    return {
      title: 'Event not found',
    }
  }

  const date = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(event.startDate))

  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(event.startDate))

  const isPrivate = event.visibility === 'private'
  const locationText = isPrivate ? event.address : `${event.address}, ${event.location}`
  const description = `${date} at ${time} — ${locationText}`

  return {
    title: event.title,
    description,
    openGraph: {
      title: event.title,
      description,
      type: 'website',
      images: [
        {
          url: event.imageUrl,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description,
      images: [event.imageUrl],
    },
  }
}

export default function Page({ params }: Props) {
  return <EventDetailPage params={params} />
}
