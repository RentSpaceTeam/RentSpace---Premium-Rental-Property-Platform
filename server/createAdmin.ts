import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { cleanMongoUri, maskMongoUri } from './db/connection.ts';
import { UserModel } from './models/User.ts';

dotenv.config();

async function createAdmin() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@rentspace.com';
  const password = args[1] || 'Password@123';
  const name = args[2] || 'RentSpace Platform Admin';

  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) {
    console.log('--- RentSpace Server Admin Creation Tool ---');
    console.log('Notice: MONGODB_URI not set. In preview/in-memory mode, default admin is already pre-configured:');
    console.log('  Email: admin@rentspace.com');
    console.log('  Password: Password@123');
    console.log('  Role: admin');
    return;
  }

  const mongoUri = cleanMongoUri(rawUri);
  console.log(`[RentSpace Admin Tool] Connecting to MongoDB Atlas cluster at ${maskMongoUri(mongoUri)} (dbName: rentspace)...`);

  await mongoose.connect(mongoUri, {
    dbName: 'rentspace',
    serverSelectionTimeoutMS: 8000
  });

  const existing = await UserModel.findOne({ email });
  if (existing) {
    console.log(`User with email ${email} already exists with role: ${existing.role}`);
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Successfully elevated ${email} to admin role!`);
    }
  } else {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    await UserModel.create({
      _id: 'usr_admin_' + Date.now(),
      name,
      email,
      passwordHash,
      role: 'admin',
      phone: '+91 99999 00000',
      status: 'active'
    });
    console.log(`Successfully created new Administrator account: ${email}`);
  }

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('[RentSpace Admin Tool] Error creating admin:', err.message);
  process.exit(1);
});
