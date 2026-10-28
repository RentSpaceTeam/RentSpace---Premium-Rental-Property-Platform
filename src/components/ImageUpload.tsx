import React, { useRef, useState } from 'react';
import { UploadCloud, X, CheckCircle2, AlertCircle, FileImage, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';

export interface UploadedImageMeta {
  url: string;
  originalName: string;
  size: number;
}

interface ImageUploadProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  onError?: (msg: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  maxImages = 8,
  maxSizeMB = 5,
  onError
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFiles = (files: File[]): { valid: File[]; error?: string } => {
    if (images.length + files.length > maxImages) {
      return {
        valid: [],
        error: `Maximum limit reached. You can attach up to ${maxImages} property photographs (currently ${images.length}).`
      };
    }

    const validFiles: File[] = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return {
          valid: [],
          error: `"${file.name}" is not supported. Please select JPEG, PNG, or WebP photographs.`
        };
      }
      if (file.size > maxSizeMB * 1024 * 1024) {
        return {
          valid: [],
          error: `"${file.name}" exceeds ${maxSizeMB}MB. Please choose a smaller photograph.`
        };
      }
      validFiles.push(file);
    }

    return { valid: validFiles };
  };

  const handleUploadFiles = async (files: File[]) => {
    if (files.length === 0) return;
    setUploadError(null);
    setUploadSuccess(null);

    const { valid, error } = validateFiles(files);
    if (error) {
      setUploadError(error);
      if (onError) onError(error);
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(25);

      // Simulate realistic upload progress bar while uploading
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => (prev < 85 ? prev + 15 : prev));
      }, 200);

      const response = await api.uploadImages(valid);
      clearInterval(progressTimer);
      setUploadProgress(100);

      if (response.success && response.urls.length > 0) {
        const updated = [...images, ...response.urls];
        onChange(updated);
        setUploadSuccess(
          `Successfully uploaded ${response.urls.length} photograph${
            response.urls.length > 1 ? 's' : ''
          } from your device!`
        );
      }
    } catch (err: any) {
      const msg = err.message || 'Failed to upload photographs. Please verify file format and try again.';
      setUploadError(msg);
      if (onError) onError(msg);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFiles(Array.from(e.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
    setUploadSuccess(null);
  };

  return (
    <div className="space-y-4">
      {/* Hidden Native File Picker */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Hero Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all ${
          isDragging
            ? 'border-[#4169E1] bg-blue-50/50 scale-[1.01]'
            : 'border-[#EEF1F6] bg-white hover:border-[#4169E1]/40'
        }`}
      >
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F7F4] text-[#4169E1] border border-[#EEF1F6] flex items-center justify-center mx-auto shadow-xs">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#4169E1]" />
            ) : (
              <UploadCloud className="w-7 h-7 text-[#4169E1]" />
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#101A35]">
              Upload Photographs Directly from Your Device
            </h4>
            <p className="text-xs text-[#20283B]/70 leading-relaxed">
              Drag and drop original property images here, or browse your files. High-resolution photos attract 3x more verified tenant enquiries.
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              disabled={isUploading || images.length >= maxImages}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#101A35] hover:bg-[#4169E1] disabled:bg-slate-300 text-white text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 disabled:cursor-not-allowed"
            >
              <FileImage className="w-4 h-4" />
              <span>Choose Images from Device</span>
            </button>
          </div>

          {/* Limits specification banner */}
          <div className="pt-2 flex items-center justify-center gap-3 text-[11px] text-slate-500 font-medium">
            <span>JPEG, PNG, or WebP</span>
            <span>·</span>
            <span>Max {maxSizeMB}MB per photo</span>
            <span>·</span>
            <span>Up to {maxImages} photographs ({images.length}/{maxImages} attached)</span>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-5 space-y-1.5 max-w-sm mx-auto">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#101A35]">
              <span>Uploading to secure persistent storage...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-[#EEF1F6] rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#4169E1] h-full transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Validation Feedback Messages */}
      {uploadError && (
        <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200/80 rounded-xl text-xs text-red-700 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
          <span className="font-medium">{uploadError}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{uploadSuccess}</span>
        </div>
      )}

      {/* Previews Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-[#101A35] uppercase tracking-wider">
            Uploaded Photographs ({images.length})
          </span>
          {images.length > 0 && (
            <span className="text-[11px] text-[#4169E1] font-semibold">
              First image is the primary cover photograph
            </span>
          )}
        </div>

        {images.length === 0 ? (
          <div className="p-8 border border-dashed border-[#EEF1F6] bg-[#F8F7F4] rounded-2xl text-center space-y-2">
            <FileImage className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">
              No photos uploaded yet. Select at least one photograph from your computer or phone to enable listing submission.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((imgUrl, idx) => (
              <div
                key={idx}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-[#EEF1F6] bg-slate-900 shadow-xs"
              >
                <img
                  src={imgUrl}
                  alt={`Property photograph ${idx + 1}`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                />

                {/* Primary Badge */}
                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#101A35]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider rounded-md">
                    Cover Photo
                  </span>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-600 text-white rounded-lg flex items-center justify-center opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow-sm cursor-pointer"
                  title="Remove photograph"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
