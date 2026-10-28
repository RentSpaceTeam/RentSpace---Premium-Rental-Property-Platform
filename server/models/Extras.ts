import mongoose, { Schema } from 'mongoose';

export interface IReview {
  _id: string;
  property: string;
  tenant: string;
  tenantName: string;
  tenantAvatar?: string;
  rating: number;
  comment: string;
  status: 'active' | 'hidden' | 'flagged';
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    property: { type: String, ref: 'Property', required: true, index: true },
    tenant: { type: String, ref: 'User', required: true },
    tenantName: { type: String, required: true },
    tenantAvatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    status: { type: String, enum: ['active', 'hidden', 'flagged'], default: 'active' }
  },
  { timestamps: true }
);

ReviewSchema.index({ property: 1, tenant: 1 });

export const ReviewModel =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export interface ISavedProperty {
  _id: string;
  user: string;
  property: string;
  createdAt: Date;
}

const SavedPropertySchema = new Schema<ISavedProperty>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    user: { type: String, ref: 'User', required: true, index: true },
    property: { type: String, ref: 'Property', required: true }
  },
  { timestamps: true }
);

SavedPropertySchema.index({ user: 1, property: 1 }, { unique: true });

export const SavedPropertyModel =
  mongoose.models.SavedProperty ||
  mongoose.model<ISavedProperty>('SavedProperty', SavedPropertySchema);

export interface IReport {
  _id: string;
  property: string;
  propertyTitle: string;
  reportedBy: string;
  reporterEmail: string;
  reason: 'inaccurate_info' | 'fake_photos' | 'fraud_scam' | 'already_rented' | 'offensive_content' | 'other';
  details: string;
  status: 'pending' | 'reviewed' | 'resolved';
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    property: { type: String, ref: 'Property', required: true, index: true },
    propertyTitle: { type: String, required: true },
    reportedBy: { type: String, ref: 'User', required: true },
    reporterEmail: { type: String, required: true },
    reason: {
      type: String,
      enum: ['inaccurate_info', 'fake_photos', 'fraud_scam', 'already_rented', 'offensive_content', 'other'],
      required: true
    },
    details: { type: String, required: true },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved'], default: 'pending' },
    adminNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

export const ReportModel =
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
