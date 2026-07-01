import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import clientPromise, { DB_NAME } from "../../../lib/db";
import { getUserFromToken } from "../../../lib/auth";
import { findApprovedStoreApplication } from "../../../lib/store-applications";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// The public store-signup flow has no session yet, so it identifies itself with the
// email from its admin-approved application instead of a login token.
async function hasApprovedStoreApplication(email: string | null): Promise<boolean> {
  if (!email) return false;
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const application = await findApprovedStoreApplication(db, email);
  return Boolean(application);
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const applicantEmail = formData.get("applicantEmail") as string | null;

    const tokenUser = await getUserFromToken();
    if (!tokenUser && !(await hasApprovedStoreApplication(applicantEmail))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"];
    const isVideo = allowedVideoTypes.includes(file.type);
    const isImage = allowedImageTypes.includes(file.type);
    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF images or MP4, WebM, MOV, OGG videos are allowed" },
        { status: 400 },
      );
    }

    // 5 MB limit for images, 100 MB for videos
    const maxSize = isVideo ? 100 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isVideo ? "Video size must be under 100 MB" : "Image size must be under 5 MB" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; resource_type: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder: "amstani/stores", resource_type: isVideo ? "video" : "image" },
          (error, result) => {
            if (error || !result) reject(error ?? new Error("Upload failed"));
            else resolve(result as { secure_url: string; resource_type: string });
          },
        )
        .end(buffer);
    });

    return NextResponse.json(
      { url: result.secure_url, mediaType: result.resource_type === "video" ? "video" : "image" },
      { status: 200 },
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
