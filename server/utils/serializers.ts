import { PropertyData, UserData } from '../store.ts';

export interface PublicPropertyDTO {
  _id: string;
  title: string;
  description: string;
  propertyType: 'pg' | 'shared_room' | 'private_room' | 'studio' | 'flat';
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  availability: 'available' | 'rented' | 'under_maintenance';
  moderationStatus: 'approved';
  isFeatured: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  isPublicPreview: true;
}

export interface AuthenticatedPropertyDTO extends Omit<PublicPropertyDTO, 'isPublicPreview'> {
  address: string;
  owner: string;
  ownerName?: string;
  ownerPhone?: string; // Private contact phone: unlocked ONLY if owner, admin, or accepted enquiry
  isContactUnlocked: boolean;
  userEnquiryStatus?: string;
  moderationFeedback?: string;
  updatedAt: string;
  isPublicPreview: false;
}

/**
 * Explicit serializer that returns ONLY non-sensitive, approved fields to unauthenticated guests.
 * Strips private street address, owner contact phone/email/id, and moderation internals.
 */
export function serializePropertyForPublic(property: PropertyData): PublicPropertyDTO {
  const rawDesc = property.description || '';
  const truncatedDesc =
    rawDesc.length > 180 ? `${rawDesc.slice(0, 180).trim()}...` : rawDesc;

  return {
    _id: property._id,
    title: property.title,
    description: truncatedDesc,
    propertyType: property.propertyType,
    rent: property.rent,
    deposit: property.deposit,
    city: property.city,
    locality: property.locality,
    furnishing: property.furnishing,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: property.amenities || [],
    images: property.images || [],
    availability: property.availability,
    moderationStatus: 'approved',
    isFeatured: Boolean(property.isFeatured),
    isVerified: Boolean(property.isVerified),
    averageRating: property.averageRating || 0,
    reviewCount: property.reviewCount || 0,
    createdAt: property.createdAt,
    isPublicPreview: true
  };
}

/**
 * Serializer for logged-in users (tenants, owners, admins).
 * Provides full verified address, but strictly protects owner contact phone number
 * unless user is admin, the property owner, or a tenant with an ACCEPTED enquiry.
 */
export function serializePropertyForAuthenticated(
  property: PropertyData,
  currentUser?: UserData,
  options?: { hasAcceptedEnquiry?: boolean; userEnquiryStatus?: string }
): AuthenticatedPropertyDTO {
  const isOwnerOrAdmin =
    Boolean(currentUser && (currentUser.role === 'admin' || currentUser._id === property.owner));

  const hasAccepted = Boolean(options?.hasAcceptedEnquiry);
  const isContactUnlocked = isOwnerOrAdmin || hasAccepted;

  return {
    _id: property._id,
    title: property.title,
    description: property.description,
    propertyType: property.propertyType,
    rent: property.rent,
    deposit: property.deposit,
    city: property.city,
    locality: property.locality,
    address: property.address, // Street address unlocked for authenticated users
    furnishing: property.furnishing,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    amenities: property.amenities || [],
    images: property.images || [],
    availability: property.availability,
    owner: property.owner,
    ownerName: property.ownerName || 'Verified Host',
    // Strictly backend-enforced privacy: ownerPhone is omitted unless authorized!
    ownerPhone: isContactUnlocked ? (property.ownerPhone || '') : undefined,
    isContactUnlocked,
    userEnquiryStatus: options?.userEnquiryStatus,
    moderationStatus: property.moderationStatus as any,
    moderationFeedback: isOwnerOrAdmin ? property.moderationFeedback : undefined,
    isFeatured: Boolean(property.isFeatured),
    isVerified: Boolean(property.isVerified),
    averageRating: property.averageRating || 0,
    reviewCount: property.reviewCount || 0,
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
    isPublicPreview: false
  };
}
