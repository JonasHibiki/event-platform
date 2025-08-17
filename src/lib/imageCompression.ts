// src/lib/imageCompression.ts
import imageCompression from 'browser-image-compression';

// Aggressive compression options optimized for Norwegian event platform
const compressionOptions = {
  maxSizeMB: 0.3,          // Max 300KB (very aggressive for fast mobile)
  maxWidthOrHeight: 800,   // Max dimension 800px (perfect for event cards)
  useWebWorker: true,      // Use web worker to avoid blocking UI
  fileType: 'image/jpeg',  // Force JPEG for best compression
  initialQuality: 0.7,     // Start with 70% quality
};

// More aggressive options for very large images  
const aggressiveOptions = {
  maxSizeMB: 0.2,          // Max 200KB for large uploads
  maxWidthOrHeight: 600,   // Smaller dimensions for very large files
  useWebWorker: true,
  fileType: 'image/jpeg',
  initialQuality: 0.6,     // Lower quality for heavy compression
};

export async function compressImage(file: File): Promise<File> {
  console.log(`🖼️ Original file size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
  
  try {
    // Choose compression strategy based on original file size
    const options = file.size > 2.5 * 1024 * 1024 ? aggressiveOptions : compressionOptions; // 2.5MB threshold
    
    const compressedFile = await imageCompression(file, options);
    
    const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
    
    console.log(`✅ Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
    console.log(`🌱 Size reduction: ${compressionRatio}% (${(file.size - compressedFile.size / 1024 / 1024).toFixed(2)}MB saved)`);
    
    return compressedFile;
  } catch (error) {
    console.error('❌ Compression failed:', error);
    // If compression fails, return original file but log the issue
    return file;
  }
}

// Helper function to estimate compression time for UX
export function estimateCompressionTime(fileSizeInMB: number): string {
  if (fileSizeInMB < 1) return "få sekunder";
  if (fileSizeInMB < 2.5) return "5-10 sekunder";
  if (fileSizeInMB < 4) return "10-15 sekunder";
  return "15-20 sekunder";
}

// Helper to create preview URL for compressed image
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}