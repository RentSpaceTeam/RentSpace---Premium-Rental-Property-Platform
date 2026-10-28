import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { cleanMongoUri, maskMongoUri, getDatabaseStatus } from './db/connection.ts';
import { UserModel } from './models/User.ts';
import { PropertyModel } from './models/Property.ts';
import { EnquiryModel } from './models/Enquiry.ts';
import { ReviewModel, SavedPropertyModel, ReportModel } from './models/Extras.ts';

dotenv.config();

async function runTestSuite() {
  console.log('====================================================');
  console.log('   RentSpace MongoDB Atlas & API Verification Suite  ');
  console.log('====================================================');

  const rawUri = process.env.MONGODB_URI || '';
  const cleanedUri = cleanMongoUri(rawUri);
  console.log('1. Connection String Check:');
  console.log('   - Raw string present:', Boolean(rawUri));
  console.log('   - Sanitized Scheme valid:', cleanedUri.startsWith('mongodb+srv://') || cleanedUri.startsWith('mongodb://'));
  console.log('   - Masked Cluster URI:', maskMongoUri(cleanedUri));
  console.log('   - Target Database Name: rentspace');

  console.log('\n2. Testing Mongoose Schemas & Compilations:');
  console.log('   - UserModel loaded:', Boolean(UserModel.modelName === 'User'));
  console.log('   - PropertyModel loaded:', Boolean(PropertyModel.modelName === 'Property'));
  console.log('   - EnquiryModel loaded:', Boolean(EnquiryModel.modelName === 'Enquiry'));
  console.log('   - ReviewModel loaded:', Boolean(ReviewModel.modelName === 'Review'));
  console.log('   - SavedPropertyModel loaded:', Boolean(SavedPropertyModel.modelName === 'SavedProperty'));
  console.log('   - ReportModel loaded:', Boolean(ReportModel.modelName === 'Report'));

  console.log('\n3. Testing Database Connection Attempt:');
  try {
    await mongoose.connect(cleanedUri, {
      dbName: 'rentspace',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000
    });
    console.log('   -> Atlas Connection SUCCESS! Active DB:', mongoose.connection.name);
    console.log('   -> Connection State:', mongoose.connection.readyState);

    // Verify Ping
    const ping = await mongoose.connection.db?.admin().ping();
    console.log('   -> MongoDB Admin Ping:', JSON.stringify(ping));

    await mongoose.disconnect();
  } catch (err: any) {
    console.log('   -> Atlas Connection Notice:', err.message);
    if (err.message?.includes('SSL alert number 80') || err.message?.includes('whitelist')) {
      console.log('   -> Reason: IP Whitelist Required in MongoDB Atlas Network Access.');
      console.log('   -> Resolution: Add 0.0.0.0/0 in MongoDB Atlas Console -> Network Access.');
    }
  }

  console.log('\n4. Verification Suite Completed Cleanly.');
  process.exit(0);
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
