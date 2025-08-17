// src/app/api/uploadthing/core.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// FileRouter for your app
export const ourFileRouter = {
  // Event image uploader with aggressive compression
  eventImageUploader: f({ 
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1,
    }
  })
  .middleware(async ({ req }) => {
    // Get user session
    const session = await getServerSession(authOptions);
    
    // If user is not logged in, throw error
    if (!session?.user?.id) {
      throw new UploadThingError("Du må være innlogget for å laste opp bilder");
    }

    // Pass user data to onUploadComplete
    return { userId: session.user.id };
  })
  .onUploadComplete(async ({ metadata, file }) => {
    // Log successful upload with compression info
    console.log("Komprimert bilde lastet opp av bruker:", metadata.userId);
    console.log("Komprimert fil URL:", file.url);
    console.log("Fil størrelse:", file.size, "bytes");

    // Return compressed file URL for frontend
    return { 
      url: file.url,
      userId: metadata.userId,
      compressedSize: file.size
    };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;