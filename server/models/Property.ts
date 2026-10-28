import mongoose, { Schema } from 'mongoose';

export type PropertyType = 'pg' | 'shared_room' | 'private_room' | 'studio' | 'flat';
export type FurnishingStatus = 'unfurnished' | 'semi-furnished' | 'fully-furnished';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type AvailabilityStatus = 'available' | 'rented' | 'under_maintenance';

export interface IProperty {
  _id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  address: string;
  furnishing: FurnishingStatus;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  availability: AvailabilityStatus;
  owner: string;
  ownerName?: string;
  ownerPhone?: string;
  moderationStatus: ModerationStatus;
  moderationFeedback?: string;
  isFeatured: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ['pg', 'shared_room', 'private_room', 'studio', 'flat'],
      required: true
    },
    rent: { type: Number, required: true, min: 0 },
    deposit: { type: Number, default: 0, min: 0 },
    city: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    furnishing: {
      type: String,
      enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
      default: 'semi-furnished'
    },
    bedrooms: { type: Number, default: 1, min: 0 },
    bathrooms: { type: Number, default: 1, min: 1 },
    amenities: [{ type: String }],
    images: [{ type: String }],
    availability: {
      type: String,
      enum: ['available', 'rented', 'under_maintenance'],
      default: 'available'
    },
    owner: { type: String, ref: 'User', required: true, index: true },
    ownerName: { type: String, default: '' },
    ownerPhone: { type: String, default: '' },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true
    },
    moderationFeedback: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

PropertySchema.index({ city: 1, propertyType: 1, rent: 1 });
PropertySchema.index({ moderationStatus: 1, availability: 1 });
PropertySchema.index({ owner: 1, moderationStatus: 1 });

export const PropertyModel =
  mongoose.models.Property || mongoose.model<IProperty>('Property', PropertySchema);
