"use client";

import React, { useState, useRef } from 'react';
import { compressImage, estimateCompressionTime, createPreviewUrl } from '@/lib/imageCompression';
import { UploadDropzone } from '@/lib/uploadthing';

interface CompressedImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
}

export default function CompressedImageUploader({
  onUploadComplete,
  onUploadError,
  className = ""
}: CompressedImageUploaderProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    savedMB: number;
    savedPercentage: number;
  } | null>(null);
  const [estimatedTime, setEstimatedTime] = useState<string>("");
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string>("");

  if (uploadComplete && uploadedImageUrl) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="relative aspect-[4/5] w-full max-w-xs mx-auto">
          <img
            src={uploadedImageUrl}
            alt="Uploaded event image"
            className="w-full h-full object-cover rounded-lg"
            style={{ border: '2px solid var(--success)' }}
          />
          <div
            className="absolute top-2 right-2 text-xs px-2 py-1 rounded-full"
            style={{ background: 'var(--success)', color: '#fff' }}
          >
            Uploaded
          </div>
        </div>

        {compressionStats && (
          <div className="rounded-lg p-4 text-sm" style={{ background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
            <h4 className="font-medium mb-2" style={{ color: 'var(--success)' }}>Upload successful</h4>
            <div className="space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <p>Original: <span className="font-medium">{compressionStats.originalSize.toFixed(2)}MB</span></p>
              <p>Compressed: <span className="font-medium">{compressionStats.compressedSize.toFixed(2)}MB</span></p>
              <p className="font-medium" style={{ color: 'var(--success)' }}>
                Saved {compressionStats.savedMB.toFixed(2)}MB ({compressionStats.savedPercentage.toFixed(1)}%)
              </p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setUploadComplete(false);
            setUploadedImageUrl("");
            setCompressionStats(null);
          }}
          className="text-sm underline w-full text-center"
          style={{ color: 'var(--text-secondary)' }}
        >
          Upload new image
        </button>
      </div>
    );
  }

  if (isCompressing) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-10 w-10 mx-auto mb-4" style={{ borderWidth: '2px', borderStyle: 'solid', borderColor: 'var(--border)', borderTopColor: 'var(--text-primary)' }}></div>
        <h3 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Compressing image...</h3>
        <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Estimated time: {estimatedTime}</p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>Reducing file size for optimal performance</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <UploadDropzone
        endpoint="eventImageUploader"
        onBeforeUploadBegin={async (files) => {
          if (files.length === 0) return files;

          const file = files[0];
          const originalSizeMB = file.size / 1024 / 1024;

          setEstimatedTime(estimateCompressionTime(originalSizeMB));
          setIsCompressing(true);

          try {
            const compressedFile = await compressImage(file);

            const originalSize = file.size;
            const compressedSize = compressedFile.size;
            const savedMB = (originalSize - compressedSize) / 1024 / 1024;
            const savedPercentage = ((originalSize - compressedSize) / originalSize * 100);

            setCompressionStats({
              originalSize: originalSize / 1024 / 1024,
              compressedSize: compressedSize / 1024 / 1024,
              savedMB,
              savedPercentage
            });

            setIsCompressing(false);

            return [compressedFile];
          } catch (error) {
            setIsCompressing(false);
            onUploadError(`Compression failed: ${error}`);
            return [];
          }
        }}
        onClientUploadComplete={(res) => {
          if (res?.[0]?.url) {
            setUploadedImageUrl(res[0].url);
            setUploadComplete(true);
            onUploadComplete(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          setIsCompressing(false);
          onUploadError(`Upload failed: ${error.message}`);
        }}
        appearance={{
          container: "border-2 border-dashed rounded-lg transition-colors",
          uploadIcon: "",
          label: "font-medium text-sm",
          allowedContent: "text-sm"
        }}
        content={{
          label: "Click or drag and drop image here",
          allowedContent: "JPG, PNG or WebP. Max 4MB.",
          button: "Select image"
        }}
        config={{ mode: "auto" }}
      />

      <div className="mt-3 rounded-lg p-3 text-xs" style={{ background: 'var(--bg-tertiary)', border: '1px solid var(--border-subtle)' }}>
        <p className="font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Auto compression</p>
        <p style={{ color: 'var(--text-tertiary)' }}>
          Your image will be compressed before uploading for fast loading and reduced environmental impact.
        </p>
      </div>
    </div>
  );
}
