import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  startDate: Date;
  endDate: Date;
  location: string;
  address: string;
  category: string | null;
  visibility: string;
  creator: {
    username: string;
  };
}

interface OptimizedEventCardProps {
  event: Event;
}

export default function OptimizedEventCard({ event }: OptimizedEventCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isPastEvent = new Date(event.endDate) < new Date();

  return (
    <Link href={`/events/${event.id}`} className="block group">
      <div
        className="rounded-xl overflow-hidden transition-colors"
        style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--border)' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] w-full" style={{ background: 'var(--bg-tertiary)' }}>
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={false}
            quality={75}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />

          {isPastEvent && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-xs font-medium px-3 py-1 rounded-full" style={{ background: 'var(--bg-elevated)' }}>
                ENDED
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-4 space-y-2.5">
          <h3 className="font-medium text-sm leading-tight line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            {event.title}
          </h3>

          <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {formatDate(event.startDate)}
          </p>

          <p className="text-xs line-clamp-1" style={{ color: 'var(--text-tertiary)' }}>
            {event.address}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {event.category && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {event.category}
              </span>
            )}
            {event.location !== 'Private event' && event.location && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                {event.location}
              </span>
            )}
            {event.visibility === 'private' && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}
              >
                Private
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
