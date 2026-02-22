import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const title = searchParams.get('title') || 'Event'
  const date = searchParams.get('date') || ''
  const time = searchParams.get('time') || ''
  const location = searchParams.get('location') || ''
  const image = searchParams.get('image') || ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          backgroundColor: '#0a0a0a',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        {/* Background event image with overlay */}
        {image && (
          <img
            src={image}
            alt=""
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.4,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to top, rgba(10,10,10,0.95) 40%, rgba(10,10,10,0.5) 100%)',
            display: 'flex',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            padding: '60px',
            width: '100%',
            height: '100%',
          }}
        >
          {/* vibber logo */}
          <div
            style={{
              position: 'absolute',
              top: '48px',
              left: '60px',
              fontSize: '28px',
              fontWeight: 700,
              color: '#f5f5f5',
              letterSpacing: '-0.5px',
              display: 'flex',
            }}
          >
            vibber
          </div>

          {/* Event title */}
          <div
            style={{
              fontSize: title.length > 40 ? '42px' : '52px',
              fontWeight: 700,
              color: '#f5f5f5',
              lineHeight: 1.15,
              letterSpacing: '-1px',
              marginBottom: '24px',
              display: 'flex',
              maxWidth: '900px',
            }}
          >
            {title}
          </div>

          {/* Date, time, location row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              fontSize: '22px',
              color: '#a0a0a0',
            }}
          >
            {date && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <span>{date}</span>
              </div>
            )}
            {time && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{time}</span>
              </div>
            )}
            {location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                <span>{location.length > 40 ? location.slice(0, 40) + '...' : location}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
