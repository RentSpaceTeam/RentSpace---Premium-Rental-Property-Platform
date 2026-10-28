import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local persistent uploads directory exists
export const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Check Cloudinary configuration
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[RentSpace Storage] Cloudinary cloud storage configured.');
} else {
  console.log('[RentSpace Storage] Local filesystem storage active (/public/uploads). Configure CLOUDINARY_* in .env to use cloud bucket.');
}

// Configure Multer storage using disk storage to avoid high RAM usage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `rentspace-prop-${uniqueSuffix}${ext}`);
  }
});

// File validation filter
export const fileFilter = (
  _req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported image format (${file.mimetype}). Only JPEG, PNG, and WebP are accepted.`));
  }
};

// Max 5MB per file, max 8 images per upload batch
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 8
  }
});

export interface UploadedImageResult {
  url: string;
  originalName: string;
  size: number;
  mimeType: string;
  storage: 'cloudinary' | 'local';
}

/**
 * Process uploaded files: if Cloudinary is configured, push to Cloudinary; otherwise return local URL path.
 */
export async function processUploadedFile(file: Express.Multer.File): Promise<UploadedImageResult> {
  if (isCloudinaryConfigured) {
    try {
      const uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: 'rentspace/properties',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }]
      });

      // Cleanup local temp file after successful cloud upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // non-fatal
      }

      return {
        url: uploadResult.secure_url,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
        storage: 'cloudinary'
      };
    } catch (cloudErr) {
      console.warn('[Cloudinary Upload Failed, falling back to local storage]:', cloudErr);
    }
  }

  // Local storage fallback
  const publicUrl = `/uploads/${file.filename}`;
  return {
    url: publicUrl,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    storage: 'local'
  };
}
