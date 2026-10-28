export type UserRole = 'tenant' | 'owner' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  status?: 'active' | 'suspended';
}

export type PropertyType = 'pg' | 'shared_room' | 'private_room' | 'studio' | 'flat';
export type FurnishingStatus = 'unfurnished' | 'semi-furnished' | 'fully-furnished';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';
export type AvailabilityStatus = 'available' | 'rented' | 'under_maintenance';

export interface Property {
  _id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  address?: string; // Private street address: unlocked only for authenticated users
  furnishing: FurnishingStatus;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  availability: AvailabilityStatus;
  owner?: string;
  ownerName?: string;
  ownerPhone?: string; // Private contact phone: unlocked only for authenticated users
  moderationStatus: ModerationStatus;
  moderationFeedback?: string;
  isFeatured: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  isPublicPreview?: boolean;
  isContactUnlocked?: boolean;
  userEnquiryStatus?: EnquiryStatus;
}

export type EnquiryStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'closed';

export interface Enquiry {
  _id: string;
  tenant: string;
  tenantName: string;
  tenantEmail: string;
  tenantPhone: string;
  property: string;
  propertyTitle: string;
  propertyCity: string;
  propertyRent: number;
  propertyImage?: string;
  owner: string;
  ownerPhone?: string;
  message: string;
  moveInDate?: string;
  preferredDuration?: string;
  status: EnquiryStatus;
  ownerNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  property: string;
  tenant: string;
  tenantName: string;
  tenantAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Report {
  _id: string;
  property: string;
  propertyTitle: string;
  reportedBy: string;
  reporterEmail: string;
  reason: 'inaccurate_info' | 'fake_photos' | 'fraud_scam' | 'already_rented' | 'offensive_content' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminNotes?: string;
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  tenants: number;
  owners: number;
  totalProperties: number;
  approvedProperties: number;
  pendingProperties: number;
  totalEnquiries: number;
  pendingReports: number;
}
