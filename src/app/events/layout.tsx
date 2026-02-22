import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Discover upcoming events near you',
  openGraph: {
    title: 'Events | vibber',
    description: 'Discover upcoming events near you',
  },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
