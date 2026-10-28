import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { cleanMongoUri, maskMongoUri } from './db/connection.ts';
import { UserModel } from './models/User.ts';
import { PropertyModel } from './models/Property.ts';
import { EnquiryModel } from './models/Enquiry.ts';
import { ReviewModel } from './models/Extras.ts';

dotenv.config();

async function runSeed() {
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.error('[RentSpace Seed] MONGODB_URI is not set. Please provide a valid MongoDB connection string.');
    process.exit(1);
  }

  const mongoUri = cleanMongoUri(rawUri);
  console.log(`[RentSpace Seed] Connecting to MongoDB Atlas cluster at ${maskMongoUri(mongoUri)} (dbName: rentspace)...`);

  await mongoose.connect(mongoUri, {
    dbName: 'rentspace',
    serverSelectionTimeoutMS: 8000
  });

  console.log('[RentSpace Seed] Connected. Clearing existing collections...');
  await UserModel.deleteMany({});
  await PropertyModel.deleteMany({});
  await EnquiryModel.deleteMany({});
  await ReviewModel.deleteMany({});

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('Password@123', salt);

  console.log('[RentSpace Seed] Seeding demo users...');
  const tenant = await UserModel.create({
    _id: 'usr_tenant_1',
    name: 'Aarav Sharma',
    email: 'tenant@rentspace.com',
    passwordHash,
    role: 'tenant',
    phone: '+91 98765 43210',
    status: 'active'
  });

  const owner1 = await UserModel.create({
    _id: 'usr_owner_1',
    name: 'Rajesh Verma',
    email: 'owner@rentspace.com',
    passwordHash,
    role: 'owner',
    phone: '+91 98111 22334',
    status: 'active'
  });

  const owner2 = await UserModel.create({
    _id: 'usr_owner_2',
    name: 'Priya Mehra',
    email: 'priya.landlord@rentspace.com',
    passwordHash,
    role: 'owner',
    phone: '+91 97222 33445',
    status: 'active'
  });

  const admin = await UserModel.create({
    _id: 'usr_admin_1',
    name: 'RentSpace Platform Admin',
    email: 'admin@rentspace.com',
    passwordHash,
    role: 'admin',
    phone: '+91 99999 00000',
    status: 'active'
  });

  console.log('[RentSpace Seed] Seeding properties...');
  const prop1 = await PropertyModel.create({
    _id: 'prop_1',
    title: 'Skyline Heights Sunlit Studio Apartment',
    description: 'A designer sunlit studio apartment in the heart of Vijay Nagar, Indore with hardwood oak flooring, modular kitchen, and smart electronic security.',
    propertyType: 'studio',
    rent: 24000,
    deposit: 48000,
    city: 'Indore',
    locality: 'Vijay Nagar',
    address: 'Scheme No 54, Near Meghdoot Garden, Vijay Nagar',
    furnishing: 'fully-furnished',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['High-Speed WiFi', 'Air Conditioning', 'Power Backup', 'Lift', '24/7 Security'],
    images: ['/src/assets/images/property_studio_apartment_1792498408044.jpg'],
    availability: 'available',
    owner: owner1._id,
    ownerName: owner1.name,
    ownerPhone: owner1.phone,
    moderationStatus: 'approved',
    isFeatured: true,
    isVerified: true,
    averageRating: 4.8,
    reviewCount: 12
  });

  const prop2 = await PropertyModel.create({
    _id: 'prop_2',
    title: 'Zenith Executive PG for Students & Professionals',
    description: 'Contemporary executive PG suite located 5 minutes from DB City Mall and coaching hubs in MP Nagar, Bhopal. Includes dedicated study desk, high-speed fiber internet.',
    propertyType: 'pg',
    rent: 14500,
    deposit: 15000,
    city: 'Bhopal',
    locality: 'MP Nagar Zone II',
    address: 'Zone II, Near DB City Mall, MP Nagar',
    furnishing: 'fully-furnished',
    bedrooms: 1,
    bathrooms: 1,
    amenities: ['High-Speed WiFi', 'Nutritious Meals Included', 'Air Conditioning', 'Housekeeping', 'CCTV Security'],
    images: ['/src/assets/images/property_pg_accommodation_1792498407710.jpg'],
    availability: 'available',
    owner: owner2._id,
    ownerName: owner2.name,
    ownerPhone: owner2.phone,
    moderationStatus: 'approved',
    isFeatured: true,
    isVerified: true,
    averageRating: 4.7,
    reviewCount: 22
  });

  console.log('[RentSpace Seed] Seeding enquiries...');
  await EnquiryModel.create({
    _id: 'enq_1',
    tenant: tenant._id,
    tenantName: tenant.name,
    tenantEmail: tenant.email,
    tenantPhone: tenant.phone || '+91 98765 43210',
    property: prop1._id,
    propertyTitle: prop1.title,
    propertyCity: prop1.city,
    propertyRent: prop1.rent,
    propertyImage: prop1.images[0] || '',
    owner: owner1._id,
    message: 'Hello Mr. Verma, I am moving to Indore next month for work. Is the studio apartment available for move-in from the 1st?',
    moveInDate: '2026-11-01',
    preferredDuration: '11 months',
    status: 'new'
  });

  console.log('[RentSpace Seed] Completed successfully!');
  await mongoose.disconnect();
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[RentSpace Seed] Error during seed:', err.message);
  process.exit(1);
});
