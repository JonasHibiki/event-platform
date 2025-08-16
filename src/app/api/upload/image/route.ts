import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/route'

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { message: 'Du må være logget inn' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { message: 'Ingen bildefil ble sendt' },
        { status: 400 }
      )
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Ugyldig filtype. Vennligst last opp JPG, PNG eller WebP' },
        { status: 400 }
      )
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'Filen er for stor. Maksimal størrelse er 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()
    const fileName = `event-${timestamp}-${randomString}.${fileExtension}`

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save file to public/uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const filePath = join(uploadsDir, fileName)
    
    await writeFile(filePath, buffer)

    // Return the public URL
    const imageUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      imageUrl,
      message: 'Bilde lastet opp' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { message: 'Kunne ikke laste opp bilde' },
      { status: 500 }
    )
  }
}