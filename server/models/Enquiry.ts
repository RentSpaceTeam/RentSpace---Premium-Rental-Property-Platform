import mongoose, { Schema } from 'mongoose';

export type EnquiryStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'new'
  | 'contacted'
  | 'in_progress'
  | 'closed';

export interface IEnquiry {
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
  message: string;
  moveInDate?: string;
  preferredDuration?: string;
  status: EnquiryStatus;
  ownerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnquirySchema = new Schema<IEnquiry>(
  {
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    tenant: { type: String, ref: 'User', required: true, index: true },
    tenantName: { type: String, required: true },
    tenantEmail: { type: String, required: true },
    tenantPhone: { type: String, required: true },
    property: { type: String, ref: 'Property', required: true, index: true },
    propertyTitle: { type: String, required: true },
    propertyCity: { type: String, required: true },
    propertyRent: { type: Number, required: true },
    propertyImage: { type: String, default: '' },
    owner: { type: String, ref: 'User', required: true, index: true },
    message: { type: String, required: true },
    moveInDate: { type: String, default: '' },
    preferredDuration: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'new', 'contacted', 'in_progress', 'closed'],
      default: 'pending'
    },
    ownerNotes: { type: String, default: '' }
  },
  { timestamps: true }
);

EnquirySchema.index({ tenant: 1, createdAt: -1 });
EnquirySchema.index({ owner: 1, status: 1 });

export const EnquiryModel =
  mongoose.models.Enquiry || mongoose.model<IEnquiry>('Enquiry', EnquirySchema);
