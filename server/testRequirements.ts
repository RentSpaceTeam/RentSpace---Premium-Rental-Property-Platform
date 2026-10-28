import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { cleanMongoUri } from './db/connection.ts';
import { dbStore } from './store.ts';
import { isMPCity, MP_CITIES } from './utils/mpCities.ts';
import { serializePropertyForAuthenticated, serializePropertyForPublic } from './utils/serializers.ts';

dotenv.config();

async function runVerification() {
  console.log('====================================================');
  console.log(' RentSpace Requirements 1, 2 & 3 Verification Suite ');
  console.log('====================================================\n');

  const rawUri = process.env.MONGODB_URI || '';
  const cleanedUri = cleanMongoUri(rawUri);

  let passedAll = true;

  try {
    if (cleanedUri) {
      await mongoose.connect(cleanedUri, {
        dbName: 'rentspace',
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });
      console.log('✓ Connected to MongoDB Atlas for integration testing.\n');
    } else {
      console.log('ℹ MONGODB_URI not provided; testing with in-memory / local fallback store.\n');
    }

    // ==========================================
    // REQUIREMENT 1: OWNER CONTACT NUMBER PRIVACY
    // ==========================================
    console.log('--- TEST 1: Owner Contact Number Privacy ---');

    // Create test owner and 2 distinct tenants
    const testOwner = await dbStore.createUser({
      name: 'Test MP Landlord',
      email: `test_owner_${Date.now()}@rentspace.in`,
      passwordHash: 'hash123',
      role: 'owner',
      phone: '+91 98765 43210'
    });

    const tenantA = await dbStore.createUser({
      name: 'Tenant Alice',
      email: `tenant_a_${Date.now()}@rentspace.in`,
      passwordHash: 'hash123',
      role: 'tenant',
      phone: '+91 98000 00001'
    });

    const tenantB = await dbStore.createUser({
      name: 'Tenant Bob',
      email: `tenant_b_${Date.now()}@rentspace.in`,
      passwordHash: 'hash123',
      role: 'tenant',
      phone: '+91 98000 00002'
    });

    const adminUser = await dbStore.createUser({
      name: 'Admin Moderator',
      email: `admin_${Date.now()}@rentspace.in`,
      passwordHash: 'hash123',
      role: 'admin',
      phone: '+91 98999 99999'
    });

    // Create a property
    const testProperty = await dbStore.createProperty(testOwner, {
      title: 'Private Room in MP Nagar Bhopal',
      description: 'Well-furnished room close to coaching hubs.',
      rent: 8500,
      deposit: 15000,
      propertyType: 'private_room',
      furnishing: 'fully-furnished',
      bedrooms: 1,
      bathrooms: 1,
      city: 'Bhopal',
      locality: 'MP Nagar Zone II',
      address: 'Plot 45, Zone II, MP Nagar',
      amenities: ['WiFi', 'Air Conditioning', 'Power Backup'],
      images: ['https://example.com/bhopal-room.jpg'],
      availability: 'available',
      isFeatured: false,
      isVerified: false
    });

    // Approve the property for active listing
    await dbStore.moderateProperty(testProperty._id, 'approved', 'Verified and approved', true, true);
    const activeTestProperty = (await dbStore.getPropertyById(testProperty._id))!;

    // Subtest 1.1: Public serialization (unauthenticated guest)
    const publicSerialized = serializePropertyForPublic(activeTestProperty);
    const pubHasPhone = 'ownerPhone' in publicSerialized && Boolean((publicSerialized as any).ownerPhone);
    if (!pubHasPhone) {
      console.log('  ✓ 1.1: Public response completely redacts ownerPhone.');
    } else {
      console.error('  ✗ 1.1 FAIL: Public response leaked ownerPhone!');
      passedAll = false;
    }

    // Subtest 1.2: Tenant A before sending any enquiry
    const hasAcceptedBefore = await dbStore.hasAcceptedEnquiry(activeTestProperty._id, tenantA._id);
    const tenantABeforeSerialized = serializePropertyForAuthenticated(activeTestProperty, tenantA, {
      hasAcceptedEnquiry: hasAcceptedBefore
    });
    if (!tenantABeforeSerialized.ownerPhone && tenantABeforeSerialized.isContactUnlocked === false) {
      console.log('  ✓ 1.2: Tenant without enquiry cannot view ownerPhone (isContactUnlocked = false).');
    } else {
      console.error('  ✗ 1.2 FAIL: Tenant saw phone without enquiry!', tenantABeforeSerialized);
      passedAll = false;
    }

    // Subtest 1.3: Tenant A submits enquiry (status = 'pending')
    const enquiryA = await dbStore.createEnquiry(tenantA, {
      propertyId: activeTestProperty._id,
      message: 'Interested in moving in next month.',
      moveInDate: '2026-11-01',
      preferredDuration: '6 months',
      contactPhone: tenantA.phone
    });

    const hasAcceptedPending = await dbStore.hasAcceptedEnquiry(activeTestProperty._id, tenantA._id);
    const tenantAPendingSerialized = serializePropertyForAuthenticated(activeTestProperty, tenantA, {
      hasAcceptedEnquiry: hasAcceptedPending
    });
    if (!tenantAPendingSerialized.ownerPhone && tenantAPendingSerialized.isContactUnlocked === false) {
      console.log('  ✓ 1.3: Pending enquiry does not reveal ownerPhone (isContactUnlocked = false).');
    } else {
      console.error('  ✗ 1.3 FAIL: Pending enquiry leaked phone!');
      passedAll = false;
    }

    // Subtest 1.4: Owner rejects enquiry
    await dbStore.updateEnquiryStatus(enquiryA._id, testOwner._id, 'rejected', 'Dates unavailable');
    const hasAcceptedRejected = await dbStore.hasAcceptedEnquiry(activeTestProperty._id, tenantA._id);
    const tenantARejectedSerialized = serializePropertyForAuthenticated(activeTestProperty, tenantA, {
      hasAcceptedEnquiry: hasAcceptedRejected
    });
    if (!tenantARejectedSerialized.ownerPhone && tenantARejectedSerialized.isContactUnlocked === false) {
      console.log('  ✓ 1.4: Rejected enquiry does not reveal ownerPhone.');
    } else {
      console.error('  ✗ 1.4 FAIL: Rejected enquiry leaked phone!');
      passedAll = false;
    }

    // Subtest 1.5: Owner accepts enquiry
    await dbStore.updateEnquiryStatus(enquiryA._id, testOwner._id, 'accepted', 'Please call to coordinate key handover');
    const hasAcceptedAccepted = await dbStore.hasAcceptedEnquiry(activeTestProperty._id, tenantA._id);
    const tenantAAcceptedSerialized = serializePropertyForAuthenticated(activeTestProperty, tenantA, {
      hasAcceptedEnquiry: hasAcceptedAccepted
    });
    if (tenantAAcceptedSerialized.ownerPhone === '+91 98765 43210' && tenantAAcceptedSerialized.isContactUnlocked === true) {
      console.log('  ✓ 1.5: Accepted enquiry securely unlocks owner contact number for Tenant A.');
    } else {
      console.error('  ✗ 1.5 FAIL: Accepted enquiry failed to unlock phone for Tenant A!', tenantAAcceptedSerialized);
      passedAll = false;
    }

    // Subtest 1.6: Tenant B still cannot see owner contact
    const hasAcceptedB = await dbStore.hasAcceptedEnquiry(activeTestProperty._id, tenantB._id);
    const tenantBSerialized = serializePropertyForAuthenticated(activeTestProperty, tenantB, {
      hasAcceptedEnquiry: hasAcceptedB
    });
    if (!tenantBSerialized.ownerPhone && tenantBSerialized.isContactUnlocked === false) {
      console.log('  ✓ 1.6: Unaccepted Tenant B still cannot see owner phone for that same property.');
    } else {
      console.error('  ✗ 1.6 FAIL: Tenant B saw phone without accepted enquiry!');
      passedAll = false;
    }

    // Subtest 1.7: Owner & Admin always retain administrative contact visibility
    const ownerSerialized = serializePropertyForAuthenticated(activeTestProperty, testOwner, {
      hasAcceptedEnquiry: false
    });
    const adminSerialized = serializePropertyForAuthenticated(activeTestProperty, adminUser, {
      hasAcceptedEnquiry: false
    });
    if (ownerSerialized.ownerPhone && adminSerialized.ownerPhone) {
      console.log('  ✓ 1.7: Property Owner and Admin retain administrative contact access.');
    } else {
      console.error('  ✗ 1.7 FAIL: Owner or Admin could not view contact!');
      passedAll = false;
    }

    // ==========================================
    // REQUIREMENT 2: ALLOW ALL CITIES IN MP
    // ==========================================
    console.log('\n--- TEST 2: Allow All Cities in Madhya Pradesh ---');
    console.log(`  ℹ Total MP districts & major cities loaded: ${MP_CITIES.length}`);

    // Verify sample MP cities validate true
    const sampleMPCities = ['Indore', 'Bhopal', 'Gwalior', 'Jabalpur', 'Ujjain', 'Satna', 'Rewa', 'Chhindwara', 'Neemuch', 'Singrauli', 'Hoshangabad', 'Narmadapuram', 'Burhanpur', 'Ratlam'];
    let allSampleValid = true;
    for (const city of sampleMPCities) {
      if (!isMPCity(city)) {
        console.error(`  ✗ MP city validation failed for: ${city}`);
        allSampleValid = false;
        passedAll = false;
      }
    }
    if (allSampleValid) {
      console.log(`  ✓ 2.1: Successfully verified sample of MP cities across regions (${sampleMPCities.join(', ')}).`);
    }

    // Non-MP cities must validate false
    const invalidCities = ['Chennai', 'Mumbai', 'Bangalore', 'Delhi', 'Kolkata', 'Hyderabad', 'Pune'];
    let allInvalidRejected = true;
    for (const city of invalidCities) {
      if (isMPCity(city)) {
        console.error(`  ✗ Non-MP city was wrongly accepted: ${city}`);
        allInvalidRejected = false;
        passedAll = false;
      }
    }
    if (allInvalidRejected) {
      console.log(`  ✓ 2.2: Non-MP cities (${invalidCities.join(', ')}) strictly rejected.`);
    }

    // Create property in a previously unsupported MP city (Satna)
    const satnaProperty = await dbStore.createProperty(testOwner, {
      title: '2 BHK Independent House in Bharhut Nagar Satna',
      description: 'Family home near Satna railway station.',
      rent: 11000,
      deposit: 22000,
      propertyType: 'flat',
      furnishing: 'semi-furnished',
      bedrooms: 2,
      bathrooms: 2,
      city: 'Satna',
      locality: 'Bharhut Nagar',
      address: 'Civil Lines Road, Bharhut Nagar',
      amenities: ['Power Backup', 'Parking'],
      images: ['https://example.com/satna.jpg'],
      availability: 'available',
      isFeatured: false,
      isVerified: false
    });

    const retrievedSatna = await dbStore.getPropertyById(satnaProperty._id);
    if (retrievedSatna && retrievedSatna.city === 'Satna') {
      console.log('  ✓ 2.3: Successfully saved and retrieved listing in MP city: Satna.');
    } else {
      console.error('  ✗ 2.3 FAIL: Could not save/retrieve Satna property!');
      passedAll = false;
    }

    // Approve the Satna property so it is active in searches
    await dbStore.moderateProperty(satnaProperty._id, 'approved', 'Approved', false, true);

    // Filter by Satna
    const satnaList = await dbStore.getProperties({ city: 'Satna' });
    if (satnaList.some((p) => p._id === satnaProperty._id)) {
      console.log('  ✓ 2.4: Successfully filtered listings by city: Satna.');
    } else {
      console.error('  ✗ 2.4 FAIL: City filter for Satna failed!');
      passedAll = false;
    }

    // ==========================================
    // REQUIREMENT 3: ADMIN CAN DELETE LISTED PROPERTIES
    // ==========================================
    console.log('\n--- TEST 3: Admin Can Delete Listed Properties ---');

    // Create saved property reference and enquiry for satnaProperty
    await dbStore.toggleSaveProperty(tenantA._id, satnaProperty._id);
    await dbStore.createEnquiry(tenantA, {
      propertyId: satnaProperty._id,
      message: 'Looking for a 12 month lease.',
      moveInDate: '2026-12-01',
      preferredDuration: '12 months',
      contactPhone: tenantA.phone
    });

    // Check saved item exists before delete
    const savedBefore = await dbStore.getSavedProperties(tenantA._id);
    const hasSavedBefore = savedBefore.some((p) => p._id === satnaProperty._id);
    console.log(`  ℹ Pre-delete: Tenant A has saved property: ${hasSavedBefore}`);

    // Subtest 3.1: Non-owner / Tenant cannot delete property
    let tenantDeleteBlocked = false;
    try {
      await dbStore.deleteProperty(satnaProperty._id, tenantA._id, false);
    } catch (e: any) {
      if (e.message?.includes('Unauthorized')) {
        tenantDeleteBlocked = true;
      }
    }
    if (tenantDeleteBlocked) {
      console.log('  ✓ 3.1: Unauthorized delete by Tenant is blocked with error.');
    } else {
      console.error('  ✗ 3.1 FAIL: Tenant was able to delete property!');
      passedAll = false;
    }

    // Subtest 3.2: Perform Admin Deletion
    const deleteSuccess = await dbStore.deleteProperty(satnaProperty._id, adminUser._id, true);
    if (deleteSuccess) {
      console.log('  ✓ 3.2: Admin deletion executed successfully.');
    } else {
      console.error('  ✗ 3.2 FAIL: Admin deletion failed!');
      passedAll = false;
    }

    // Verify property is no longer retrievable
    const retrievedAfterDelete = await dbStore.getPropertyById(satnaProperty._id);
    if (!retrievedAfterDelete) {
      console.log('  ✓ 3.3: Property is completely deleted and returns null.');
    } else {
      console.error('  ✗ 3.3 FAIL: Property still exists after delete!');
      passedAll = false;
    }

    // Verify it does not appear in public search/list
    const allRemainingProps = await dbStore.getProperties({ city: 'Satna' });
    const inList = allRemainingProps.some((p) => p._id === satnaProperty._id);
    if (!inList) {
      console.log('  ✓ 3.4: Deleted property no longer appears in searches or city listings.');
    } else {
      console.error('  ✗ 3.4 FAIL: Deleted property still appears in listings!');
      passedAll = false;
    }

    // Verify cascade cleanup of saved properties
    const savedAfter = await dbStore.getSavedProperties(tenantA._id);
    const hasSavedAfter = savedAfter.some((p) => p._id === satnaProperty._id);
    if (!hasSavedAfter) {
      console.log('  ✓ 3.5: Associated saved-property records cleanly removed.');
    } else {
      console.error('  ✗ 3.5 FAIL: Saved-property record was orphaned!');
      passedAll = false;
    }

    // Clean up testProperty
    await dbStore.deleteProperty(activeTestProperty._id, adminUser._id, true);

    console.log('\n====================================================');
    if (passedAll) {
      console.log('   ALL 3 REQUIREMENTS VERIFIED & PASSED 100%!       ');
    } else {
      console.log('   SOME TESTS FAILED - REVIEW OUTPUT ABOVE.         ');
    }
    console.log('====================================================');

    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    process.exit(passedAll ? 0 : 1);
  } catch (err: any) {
    console.error('Test execution error:', err);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
}

runVerification();
