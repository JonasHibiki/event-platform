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

  // If already uploaded, show the result
  if (uploadComplete && uploadedImageUrl) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Final uploaded image */}
        <div className="relative aspect-[4/5] w-full max-w-xs mx-auto">
          <img
            src={uploadedImageUrl}
            alt="Opplastet arrangementsbilde"
            className="w-full h-full object-cover rounded-lg border-2 border-green-200"
          />
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            ✓ Opplastet
          </div>
        </div>

        {/* Final compression stats */}
        {compressionStats && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-green-800 mb-2">🌱 Vellykket opplasting!</h4>
            <div className="space-y-1 text-green-700">
              <p>Opprinnelig: <span className="font-medium">{compressionStats.originalSize.toFixed(2)}MB</span></p>
              <p>Komprimert: <span className="font-medium">{compressionStats.compressedSize.toFixed(2)}MB</span></p>
              <p className="text-green-600 font-medium">
                🌍 Spart {compressionStats.savedMB.toFixed(2)}MB ({compressionStats.savedPercentage.toFixed(1)}%)
              </p>
              <p className="text-xs text-green-600 mt-2">
                Takk for at du bidrar til et grønnere internett! 🚀
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
          className="text-blue-600 hover:text-blue-700 text-sm underline w-full text-center"
        >
          Last opp nytt bilde
        </button>
      </div>
    );
  }

  if (isCompressing) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium mb-2">🗜️ Komprimerer bilde...</h3>
        <p className="text-gray-600 mb-2">Estimert tid: {estimatedTime}</p>
        <p className="text-sm text-gray-500">Reduserer filstørrelse for optimal ytelse 🌱</p>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-sm text-blue-700">
          <p><strong>Hva skjer nå:</strong></p>
          <p>• Reduserer bildet til optimal størrelse (maks 800px)</p>
          <p>• Komprimerer til høy kvalitet JPEG</p>
          <p>• Reduserer filstørrelse med 50-80%</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <UploadDropzone
        endpoint="eventImageUploader"
        onBeforeUploadBegin={async (files) => {
          // This is where we compress the file before upload
          if (files.length === 0) return files;
          
          const file = files[0];
          const originalSizeMB = file.size / 1024 / 1024;
          
          setEstimatedTime(estimateCompressionTime(originalSizeMB));
          setIsCompressing(true);

          try {
            const compressedFile = await compressImage(file);
            
            // Calculate compression stats
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
            
            // Return the compressed file for upload
            return [compressedFile];
          } catch (error) {
            setIsCompressing(false);
            onUploadError(`Komprimering feilet: ${error}`);
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
          onUploadError(`Opplasting feilet: ${error.message}`);
        }}
        appearance={{
          container: "ut-ready:bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors",
          uploadIcon: "text-blue-600",
          label: "text-blue-700 font-medium",
          allowedContent: "text-blue-600 text-sm"
        }}
        content={{
          label: "Klikk eller dra og slipp bildet her",
          allowedContent: "JPG, PNG eller WebP. Maks 4MB.",
          button: "Velg bilde"
        }}
        config={{ mode: "auto" }}
      />
      
      {/* Compression Notice */}
      <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
        <p className="font-medium mb-1">🌱 Automatisk komprimering</p>
        <p className="text-xs">
          Bildet blir komprimert før opplasting for rask lasting og mindre miljøpåvirkning!
          Forventet reduksjon: 50-80% mindre filstørrelse.
        </p>
      </div>
    </div>
  );
}