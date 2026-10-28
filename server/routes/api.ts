import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../store.ts';
import { getDatabaseStatus } from '../db/connection.ts';
import { requireAuth, requireRole, optionalAuth, generateToken, AuthRequest } from '../middleware/auth.ts';
import { serializePropertyForPublic, serializePropertyForAuthenticated } from '../utils/serializers.ts';
import { uploadMiddleware, processUploadedFile } from '../utils/uploadStorage.ts';
import { isMPCity } from '../utils/mpCities.ts';

export const apiRouter = Router();

// Health & System Info
apiRouter.get('/health', (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    success: true,
    platform: 'RentSpace - Premium Real Estate & Rental Platform',
    version: '2.4.0-production',
    storageMode: dbStore.getStorageMode(),
    database: {
      provider: 'MongoDB Atlas',
      connected: dbStatus.isConnected,
      databaseName: dbStatus.dbName,
      clusterHost: dbStatus.host,
      clusterEndpoint: dbStatus.maskedUri
    },
    mongoConnected: dbStore.isMongoConnected,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. AUTHENTICATION & PROFILE
// ==========================================

// Register Tenant or Owner (Never allow public registration to create admin!)
apiRouter.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Disallow public registration of admin accounts
    let assignedRole: 'tenant' | 'owner' = 'tenant';
    if (role === 'owner') {
      assignedRole = 'owner';
    } else if (role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: Administrator accounts cannot be created via public registration. Use server setup script.'
      });
    }

    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const user = await dbStore.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: assignedRole,
      phone: phone ? phone.trim() : '',
      avatar: ''
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to RentSpace.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
});

// Login
apiRouter.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ success: false, message: 'This account has been suspended by administration.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
});

// Get Current Authenticated User
apiRouter.get('/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  res.json({
    success: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar
    }
  });
});

// Update Profile
apiRouter.put('/auth/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, avatar } = req.body;
    const updated = await dbStore.updateUserProfile(req.user!._id, { name, phone, avatar });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone,
        avatar: updated.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update profile' });
  }
});

// ==========================================
// 2. PROPERTIES
// ==========================================

// Public & Authenticated Explore / Search Properties
apiRouter.get('/properties', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      city,
      locality,
      propertyType,
      minRent,
      maxRent,
      furnishing,
      bedrooms,
      amenities,
      search,
      sortBy
    } = req.query;

    let parsedAmenities: string[] | undefined = undefined;
    if (typeof amenities === 'string') {
      parsedAmenities = amenities.split(',').map((a) => a.trim());
    } else if (Array.isArray(amenities)) {
      parsedAmenities = amenities.map((a) => String(a).trim());
    }

    const properties = await dbStore.getProperties({
      city: city ? String(city) : undefined,
      locality: locality ? String(locality) : undefined,
      propertyType: propertyType ? String(propertyType) : undefined,
      minRent: minRent ? Number(minRent) : undefined,
      maxRent: maxRent ? Number(maxRent) : undefined,
      furnishing: furnishing ? String(furnishing) : undefined,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      amenities: parsedAmenities,
      search: search ? String(search) : undefined,
      sortBy: (sortBy as any) || 'newest',
      includePending: false
    });

    // Explicit Serialization:
    // General browse list NEVER exposes private owner contact numbers to unauthorized tenants or guests!
    const serializedProperties = properties.map((p) => {
      if (!req.user) return serializePropertyForPublic(p);
      const isOwnerOrAdmin = req.user.role === 'admin' || req.user._id === p.owner;
      return serializePropertyForAuthenticated(p, req.user, {
        hasAcceptedEnquiry: isOwnerOrAdmin
      });
    });

    res.json({
      success: true,
      count: serializedProperties.length,
      isAuthenticated: Boolean(req.user),
      properties: serializedProperties
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch properties' });
  }
});

// Get Property Details by ID (Strict Privacy Enforced:
// Owner contact number is revealed ONLY if the requesting user is the owner, an admin,
// or a tenant whose enquiry for this specific property has been ACCEPTED by the owner.)
apiRouter.get('/properties/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const property = await dbStore.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property listing not found.' });
    }

    // Only approved listings are visible to guests / general users
    const isOwnerOrAdmin = req.user && (req.user.role === 'admin' || req.user._id === property.owner);
    if (property.moderationStatus !== 'approved' && !isOwnerOrAdmin) {
      return res.status(404).json({ success: false, message: 'Property listing is pending moderation review.' });
    }

    let hasAccepted = false;
    let userEnquiryStatus: string | undefined = undefined;

    if (req.user) {
      if (isOwnerOrAdmin) {
        hasAccepted = true;
      } else {
        hasAccepted = await dbStore.hasAcceptedEnquiry(property._id, req.user._id);
        const userEnq = await dbStore.getEnquiryForUserAndProperty(property._id, req.user._id);
        userEnquiryStatus = userEnq ? userEnq.status : 'none';
      }
    }

    const serialized = req.user
      ? serializePropertyForAuthenticated(property, req.user, {
          hasAcceptedEnquiry: hasAccepted,
          userEnquiryStatus
        })
      : serializePropertyForPublic(property);

    res.json({
      success: true,
      isAuthenticated: Boolean(req.user),
      property: serialized
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch property' });
  }
});

// Upload Property Images from User's Device (Owner & Admin only)
apiRouter.post('/upload', requireAuth, requireRole('owner', 'admin'), (req: Request, res: Response) => {
  uploadMiddleware.array('images', 8)(req, res, async (err: any) => {
    if (err) {
      const isMulterError = err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT';
      return res.status(400).json({
        success: false,
        message: isMulterError
          ? (err.code === 'LIMIT_FILE_SIZE' ? 'Image file size exceeds the 5MB limit.' : 'Maximum 8 photographs allowed per upload.')
          : err.message || 'File upload validation failed.'
      });
    }

    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided. Please choose images from your device.'
      });
    }

    try {
      const results = await Promise.all(files.map((file) => processUploadedFile(file)));
      const urls = results.map((r) => r.url);

      res.status(200).json({
        success: true,
        message: `Successfully processed ${results.length} image${results.length > 1 ? 's' : ''}.`,
        urls,
        images: results
      });
    } catch (uploadError: any) {
      res.status(500).json({
        success: false,
        message: uploadError.message || 'Error processing uploaded images.'
      });
    }
  });
});

// Create Property (Owner only)
apiRouter.post('/properties', requireAuth, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      propertyType,
      rent,
      deposit,
      city,
      locality,
      address,
      furnishing,
      bedrooms,
      bathrooms,
      amenities,
      images,
      availability
    } = req.body;

    if (!title || !description || !propertyType || !rent || !city || !locality || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields (title, description, property type, rent, city, locality, address).'
      });
    }

    // Requirement 2: Strict Madhya Pradesh city validation
    if (!isMPCity(city)) {
      return res.status(400).json({
        success: false,
        message: `Location restricted: "${city}" is not recognized. RentSpace operates exclusively across Madhya Pradesh. Please choose a valid Madhya Pradesh city or district.`
      });
    }

    // Mandatory Requirement: Property images must be uploaded from the user's device
    if (!images || !Array.isArray(images) || images.length === 0 || !images.some((img: string) => img && img.trim())) {
      return res.status(400).json({
        success: false,
        message: 'At least one property image must be uploaded from your device before listing this property.'
      });
    }

    const validImages = images.filter((img: string) => img && typeof img === 'string' && img.trim().length > 0);

    const newProp = await dbStore.createProperty(req.user!, {
      title: title.trim(),
      description: description.trim(),
      propertyType,
      rent: Number(rent),
      deposit: Number(deposit || 0),
      city: city.trim(),
      locality: locality.trim(),
      address: address.trim(),
      furnishing: furnishing || 'semi-furnished',
      bedrooms: Number(bedrooms || 1),
      bathrooms: Number(bathrooms || 1),
      amenities: Array.isArray(amenities) ? amenities : [],
      images: validImages,
      availability: availability || 'available',
      isFeatured: false,
      isVerified: false
    });

    res.status(201).json({
      success: true,
      message: 'Property listing submitted successfully! It has been placed in the moderation queue for review.',
      property: newProp
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create property' });
  }
});

// Update Property (Owner of property or Admin)
apiRouter.put('/properties/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const isAdmin = req.user!.role === 'admin';
    if (req.body.city && !isMPCity(req.body.city)) {
      return res.status(400).json({
        success: false,
        message: `Location restricted: "${req.body.city}" is not in Madhya Pradesh. Please choose a valid Madhya Pradesh city.`
      });
    }

    const updated = await dbStore.updateProperty(req.params.id, req.user!._id, req.body, isAdmin);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }
    res.json({
      success: true,
      message: 'Property updated successfully.',
      property: updated
    });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to update property' });
  }
});

// Delete Property (Admin or Owner of property)
// Requirement 3: Enforce administrator authorization on backend for every delete request.
apiRouter.delete('/properties/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const property = await dbStore.getPropertyById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property listing not found.' });
    }

    const isAdmin = req.user!.role === 'admin';
    const isOwner = property.owner === req.user!._id;

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Security Violation: You do not have permission to delete this listing. Only authenticated administrators or the listing owner can delete properties.'
      });
    }

    const deleted = await dbStore.deleteProperty(req.params.id, req.user!._id, isAdmin);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Property not found or could not be deleted.' });
    }
    res.json({
      success: true,
      message: `Property listing "${property.title}" has been permanently deleted.`
    });
  } catch (error: any) {
    const status = error.message?.includes('Unauthorized') ? 403 : 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to delete property' });
  }
});

// Owner's listings
apiRouter.get('/owner/properties', requireAuth, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const properties = await dbStore.getProperties({
      ownerId: req.user!._id,
      includePending: true
    });
    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch owner properties' });
  }
});

// ==========================================
// 3. ENQUIRIES
// ==========================================

// Submit Enquiry (Tenant or any logged in user)
apiRouter.post('/enquiries', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId, message, moveInDate, preferredDuration, contactPhone } = req.body;
    if (!propertyId || !message) {
      return res.status(400).json({ success: false, message: 'Property ID and message are required.' });
    }

    const enquiry = await dbStore.createEnquiry(req.user!, {
      propertyId,
      message: message.trim(),
      moveInDate,
      preferredDuration,
      contactPhone
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully! The property owner has been notified.',
      enquiry
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit enquiry' });
  }
});

// Tenant's Enquiries
apiRouter.get('/tenant/enquiries', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const enquiries = await dbStore.getEnquiriesForTenant(req.user!._id);
    res.json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch enquiries' });
  }
});

// Owner's Received Enquiries
apiRouter.get('/owner/enquiries', requireAuth, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const enquiries = await dbStore.getEnquiriesForOwner(req.user!._id);
    res.json({
      success: true,
      count: enquiries.length,
      enquiries
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch owner enquiries' });
  }
});

// Update Enquiry Status (Owner only)
apiRouter.patch('/enquiries/:id/status', requireAuth, requireRole('owner', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, ownerNotes } = req.body;
    const allowedStatuses = ['pending', 'accepted', 'rejected', 'new', 'contacted', 'in_progress', 'closed'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Valid status required (${allowedStatuses.join(', ')}).`
      });
    }

    const isAdmin = req.user!.role === 'admin';
    const updated = await dbStore.updateEnquiryStatus(req.params.id, req.user!._id, status, ownerNotes, isAdmin);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enquiry not found.' });
    }

    let statusMsg = `Enquiry status updated to ${status}.`;
    if (status === 'accepted') {
      statusMsg = 'Enquiry accepted! Your contact number is now visible to this tenant.';
    } else if (status === 'rejected') {
      statusMsg = 'Enquiry declined. Your contact number remains private.';
    }

    res.json({
      success: true,
      message: statusMsg,
      enquiry: updated
    });
  } catch (error: any) {
    const statusCode = error.message?.includes('Unauthorized') ? 403 : 500;
    res.status(statusCode).json({ success: false, message: error.message || 'Failed to update enquiry status' });
  }
});

// ==========================================
// 4. SAVED / BOOKMARKED PROPERTIES
// ==========================================

// Get Tenant's Saved Properties
apiRouter.get('/saved', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const properties = await dbStore.getSavedProperties(req.user!._id);
    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch saved properties' });
  }
});

// Toggle Save Property
apiRouter.post('/saved/:propertyId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await dbStore.toggleSaveProperty(req.user!._id, req.params.propertyId);
    res.json({
      success: true,
      saved: result.saved,
      message: result.saved ? 'Property added to saved favorites.' : 'Property removed from saved favorites.'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to toggle saved property' });
  }
});

// Check if Property is Saved
apiRouter.get('/saved/check/:propertyId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const saved = await dbStore.isPropertySaved(req.user!._id, req.params.propertyId);
    res.json({ success: true, saved });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==========================================
// 5. REVIEWS & RATINGS
// ==========================================

// Get Reviews for Property
apiRouter.get('/properties/:id/reviews', async (req: Request, res: Response) => {
  try {
    const reviews = await dbStore.getReviewsForProperty(req.params.id);
    res.json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reviews' });
  }
});

// Add Review (Tenant/User)
apiRouter.post('/properties/:id/reviews', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide both rating (1-5) and comment.' });
    }

    const review = await dbStore.addReview(req.user!, req.params.id, Number(rating), comment);
    res.status(201).json({
      success: true,
      message: 'Review submitted successfully. Thank you for your feedback!',
      review
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to submit review' });
  }
});

// ==========================================
// 6. REPORTS (FLAG SUSPICIOUS LISTING)
// ==========================================

apiRouter.post('/properties/:id/report', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { reason, details } = req.body;
    if (!reason || !details) {
      return res.status(400).json({ success: false, message: 'Reason and details are required to report a listing.' });
    }

    const report = await dbStore.createReport(req.user!, req.params.id, reason, details);
    res.status(201).json({
      success: true,
      message: 'Report submitted for review by the admin team. Thank you for keeping RentSpace safe.',
      report
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to submit report' });
  }
});

// ==========================================
// 7. ADMIN ENDPOINTS
// ==========================================

// Dashboard Statistics
apiRouter.get('/admin/stats', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const stats = await dbStore.getAdminStats();
    res.json({
      success: true,
      stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch admin stats' });
  }
});

// All Properties for Moderation
apiRouter.get('/admin/properties', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { moderationStatus } = req.query;
    const properties = await dbStore.getProperties({
      moderationStatus: moderationStatus ? String(moderationStatus) : undefined,
      includePending: true
    });
    res.json({
      success: true,
      count: properties.length,
      properties
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch properties' });
  }
});

// Moderate Property (Approve / Reject)
apiRouter.patch('/admin/properties/:id/moderate', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, feedback, isFeatured, isVerified } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "approved" or "rejected".' });
    }

    const property = await dbStore.moderateProperty(req.params.id, status, feedback, isFeatured, isVerified);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found.' });
    }

    res.json({
      success: true,
      message: `Property ${status === 'approved' ? 'approved' : 'rejected'} successfully.`,
      property
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to moderate property' });
  }
});

// All Users Management
apiRouter.get('/admin/users', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const users = await dbStore.getAllUsers();
    // Exclude passwordHash for security
    const sanitized = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt
    }));

    res.json({
      success: true,
      count: sanitized.length,
      users: sanitized
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch users' });
  }
});

// Suspend / Activate User
apiRouter.patch('/admin/users/:id/status', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['active', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be "active" or "suspended".' });
    }

    const updated = await dbStore.updateUserStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({
      success: true,
      message: `User account has been ${status}.`,
      user: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        status: updated.status
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update user status' });
  }
});

// View Reported Listings
apiRouter.get('/admin/reports', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const reports = await dbStore.getReports();
    res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch reports' });
  }
});

// Update Report Status
apiRouter.patch('/admin/reports/:id/status', requireAuth, requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { status, adminNotes } = req.body;
    if (!status || !['pending', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be pending, reviewed, or resolved.' });
    }

    const updated = await dbStore.updateReportStatus(req.params.id, status, adminNotes);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    res.json({
      success: true,
      message: `Report marked as ${status}.`,
      report: updated
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to update report status' });
  }
});

// Admin Reset Demo Data
apiRouter.post('/admin/reset-demo-data', requireAuth, requireRole('admin'), (req: AuthRequest, res: Response) => {
  dbStore.seedDefaultData();
  res.json({
    success: true,
    message: 'Demo properties and accounts reset to pristine seed state.'
  });
});
