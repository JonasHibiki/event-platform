// src/components/OptimizedEventCard.tsx
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
    <Link href={`/events/${event.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border">
        {/* Optimized Image with Next.js Image Component */}
        <div className="relative aspect-[4/5] w-full bg-gray-100">
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={false} // Lazy load for performance
            quality={75} // Additional compression for display
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
          
          {/* Status overlay for past events */}
          {isPastEvent && (
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-medium">
                AVSLUTTET
              </span>
            </div>
          )}
          
          {/* Compression indicator (show only in dev) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded opacity-80">
              🌱 Komprimert
            </div>
          )}
        </div>

        {/* Event Details */}
        <div className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2">
            {event.title}
          </h3>

          {/* Date */}
          <p className="text-gray-600 text-sm">
            📅 {formatDate(event.startDate)}
          </p>

          {/* Location */}
          <p className="text-gray-600 text-sm line-clamp-1">
            📍 {event.address}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {event.category && (
              <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                🏷️ {event.category}
              </span>
            )}
            {event.location !== 'Privat arrangement' && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                📍 {event.location}
              </span>
            )}
            {event.visibility === 'private' && (
              <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
                🔒 Privat
              </span>
            )}
          </div>

          {/* Creator */}
          <p className="text-gray-500 text-xs">
            av {event.creator.username}
          </p>
        </div>
      </div>
    </Link>
  );
}

// Utility CSS classes for line clamping (add to globals.css)
/*
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
*/