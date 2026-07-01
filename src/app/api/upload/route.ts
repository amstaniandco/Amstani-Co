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

    const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const videoTypes = ["video/mp4", "video/webm", "video/quicktime"];
    const isImage = imageTypes.includes(file.type);
    const isVideo = videoTypes.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, WebP, GIF images or MP4, WebM, MOV videos are allowed" },
        { status: 400 }
      );
    }

    // Images: 5 MB, videos: 50 MB
    const maxBytes = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { error: `File size must be under ${isVideo ? "50" : "5"} MB` },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const resourceType = isVideo ? "video" : "image";
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "amstani/stores", resource_type: resourceType }, (error, result) => {
          if (error || !result) reject(error ?? new Error("Upload failed"));
          else resolve(result as { secure_url: string });
        })
        .end(buffer);
    });

    return NextResponse.json(
      { url: result.secure_url, mediaType: resourceType },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
