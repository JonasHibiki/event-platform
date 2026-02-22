// src/lib/imageCompression.ts
import imageCompression from 'browser-image-compression';

// Balanced compression — good quality, reasonable file size
const compressionOptions = {
  maxSizeMB: 1.5,             // Max 1.5MB — sharp enough for hero images
  maxWidthOrHeight: 1920,     // Full HD width preserved
  useWebWorker: true,
  fileType: 'image/webp' as const,  // WebP for best quality-to-size ratio
  initialQuality: 0.85,       // 85% quality — visually lossless for most images
};

// Slightly more aggressive for very large uploads (>5MB)
const largeFileOptions = {
  maxSizeMB: 1.0,             // Max 1MB
  maxWidthOrHeight: 1600,     // Slightly smaller max dimension
  useWebWorker: true,
  fileType: 'image/webp' as const,
  initialQuality: 0.8,        // 80% quality — still looks great
};

export async function compressImage(file: File): Promise<File> {
  const originalSizeMB = file.size / 1024 / 1024;
  console.log(`Original file size: ${originalSizeMB.toFixed(2)}MB`);

  // Skip compression for small files that are already reasonably sized
  if (originalSizeMB < 0.5) {
    console.log('File is small enough, skipping compression');
    return file;
  }

  try {
    const options = originalSizeMB > 5 ? largeFileOptions : compressionOptions;
    const compressedFile = await imageCompression(file, options);

    const compressionRatio = ((file.size - compressedFile.size) / file.size * 100).toFixed(1);
    console.log(`Compressed: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB (${compressionRatio}% reduction)`);

    return compressedFile;
  } catch (error) {
    console.error('Compression failed:', error);
    return file;
  }
}

export function estimateCompressionTime(fileSizeInMB: number): string {
  if (fileSizeInMB < 1) return "a moment";
  if (fileSizeInMB < 3) return "a few seconds";
  if (fileSizeInMB < 5) return "5-10 seconds";
  return "10-15 seconds";
}

export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
