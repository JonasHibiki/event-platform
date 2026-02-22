"use client";

import React, { useState } from 'react';
import { compressImage, estimateCompressionTime } from '@/lib/imageCompression';
import { UploadDropzone } from '@/lib/uploadthing';

interface CompressedImageUploaderProps {
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  className?: string;
}

function UploadIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#555]">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#666]">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
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

  // ── Uploaded state ──
  if (uploadComplete && uploadedImageUrl) {
    return (
      <div className={`${className}`}>
        <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#1a1a1a] border border-[#2a2a2a]">
          <img
            src={uploadedImageUrl}
            alt="Uploaded event image"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#22c55e]/90 backdrop-blur-sm text-white text-[13px] font-medium">
            <CheckIcon /> Uploaded
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setUploadComplete(false);
            setUploadedImageUrl("");
            setCompressionStats(null);
          }}
          className="mt-3 text-[14px] text-[#888] hover:text-[#a0a0a0] transition-colors"
        >
          Replace image
        </button>
      </div>
    );
  }

  // ── Compressing state ──
  if (isCompressing) {
    return (
      <div className={`${className}`}>
        <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-[#2a2a2a] bg-[#111]">
          <div className="w-8 h-8 mb-4 rounded-full border-2 border-[#333] border-t-[#f5f5f5] animate-spin" />
          <p className="text-[14px] font-medium text-[#f5f5f5] mb-1">Compressing image...</p>
          <p className="text-[13px] text-[#666]">Estimated time: {estimatedTime}</p>
        </div>
      </div>
    );
  }

  // ── Default dropzone ──
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
          container: "!bg-[#111] !border-2 !border-dashed !border-[#333] hover:!border-[#555] !rounded-xl !py-8 !transition-colors !cursor-pointer",
          uploadIcon: "!hidden",
          label: "!text-[#a0a0a0] !text-[14px] !font-medium",
          allowedContent: "!text-[#555] !text-[13px]",
          button: "!bg-[#222] !text-[#f5f5f5] !border !border-[#444] !rounded-lg !px-4 !py-2 !text-[14px] !font-medium hover:!border-[#666] !transition-colors !ut-uploading:!bg-[#333]"
        }}
        content={{
          uploadIcon: <UploadIcon />,
          label: "Drop image here or click to browse",
          allowedContent: "JPG, PNG or WebP · Max 4MB",
          button: "Select image"
        }}
        config={{ mode: "auto" }}
      />
    </div>
  );
}
