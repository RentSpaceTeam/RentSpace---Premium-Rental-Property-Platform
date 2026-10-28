import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { UserModel } from './models/User.ts';
import { PropertyModel } from './models/Property.ts';
import { EnquiryModel } from './models/Enquiry.ts';
import { ReviewModel, SavedPropertyModel, ReportModel } from './models/Extras.ts';

export interface UserData {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'tenant' | 'owner' | 'admin';
  phone?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface PropertyData {
  _id: string;
  title: string;
  description: string;
  propertyType: 'pg' | 'shared_room' | 'private_room' | 'studio' | 'flat';
  rent: number;
  deposit: number;
  city: string;
  locality: string;
  address: string;
  furnishing: 'unfurnished' | 'semi-furnished' | 'fully-furnished';
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  availability: 'available' | 'rented' | 'under_maintenance';
  owner: string;
  ownerName?: string;
  ownerPhone?: string;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationFeedback?: string;
  isFeatured: boolean;
  isVerified: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryData {
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
  status: 'pending' | 'accepted' | 'rejected' | 'new' | 'contacted' | 'in_progress' | 'closed';
  ownerNotes?: string;
  ownerPhone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewData {
  _id: string;
  property: string;
  tenant: string;
  tenantName: string;
  tenantAvatar?: string;
  rating: number;
  comment: string;
  status: 'active' | 'hidden' | 'flagged';
  createdAt: string;
  updatedAt: string;
}

export interface SavedPropertyData {
  _id: string;
  user: string;
  property: string;
  createdAt: string;
}

export interface ReportData {
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
  updatedAt: string;
}

export class DatabaseStore {
  private users: UserData[] = [];
  private properties: PropertyData[] = [];
  private enquiries: EnquiryData[] = [];
  private reviews: ReviewData[] = [];
  private savedProperties: SavedPropertyData[] = [];
  private reports: ReportData[] = [];
  public isMongoConnected = false;

  constructor() {
    this.seedDefaultData();
  }

  public isMongoActive(): boolean {
    return this.isMongoConnected && mongoose.connection.readyState === 1;
  }

  public getStorageMode(): 'mongodb' | 'in-memory-preview' {
    return this.isMongoActive() ? 'mongodb' : 'in-memory-preview';
  }

  private docToUser(doc: any): UserData {
    return {
      _id: doc._id?.toString() || doc.id,
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role,
      phone: doc.phone || '',
      avatar: doc.avatar || '',
      status: doc.status || 'active',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }

  private docToProperty(doc: any): PropertyData {
    return {
      _id: doc._id?.toString() || doc.id,
      title: doc.title,
      description: doc.description,
      propertyType: doc.propertyType,
      rent: doc.rent,
      deposit: doc.deposit || 0,
      city: doc.city,
      locality: doc.locality,
      address: doc.address || '',
      furnishing: doc.furnishing || 'semi-furnished',
      bedrooms: doc.bedrooms || 1,
      bathrooms: doc.bathrooms || 1,
      amenities: doc.amenities || [],
      images: doc.images || [],
      availability: doc.availability || 'available',
      owner: doc.owner?.toString() || doc.owner,
      ownerName: doc.ownerName || '',
      ownerPhone: doc.ownerPhone || '',
      moderationStatus: doc.moderationStatus || 'approved',
      moderationFeedback: doc.moderationFeedback || '',
      isFeatured: Boolean(doc.isFeatured),
      isVerified: Boolean(doc.isVerified),
      averageRating: doc.averageRating || 0,
      reviewCount: doc.reviewCount || 0,
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }

  private docToEnquiry(doc: any): EnquiryData {
    return {
      _id: doc._id?.toString() || doc.id,
      tenant: doc.tenant?.toString() || doc.tenant,
      tenantName: doc.tenantName || '',
      tenantEmail: doc.tenantEmail || '',
      tenantPhone: doc.tenantPhone || '',
      property: doc.property?.toString() || doc.property,
      propertyTitle: doc.propertyTitle || '',
      propertyCity: doc.propertyCity || '',
      propertyRent: doc.propertyRent || 0,
      propertyImage: doc.propertyImage || '',
      owner: doc.owner?.toString() || doc.owner,
      message: doc.message,
      moveInDate: doc.moveInDate || '',
      preferredDuration: doc.preferredDuration || '',
      status: doc.status || 'new',
      ownerNotes: doc.ownerNotes || '',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }

  private docToReview(doc: any): ReviewData {
    return {
      _id: doc._id?.toString() || doc.id,
      property: doc.property?.toString() || doc.property,
      tenant: doc.tenant?.toString() || doc.tenant,
      tenantName: doc.tenantName || '',
      tenantAvatar: doc.tenantAvatar || '',
      rating: doc.rating,
      comment: doc.comment,
      status: doc.status || 'active',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }

  private docToReport(doc: any): ReportData {
    return {
      _id: doc._id?.toString() || doc.id,
      property: doc.property?.toString() || doc.property,
      propertyTitle: doc.propertyTitle || '',
      reportedBy: doc.reportedBy?.toString() || doc.reportedBy,
      reporterEmail: doc.reporterEmail || '',
      reason: doc.reason,
      details: doc.details,
      status: doc.status || 'pending',
      adminNotes: doc.adminNotes || '',
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || new Date().toISOString()),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || new Date().toISOString())
    };
  }

  /**
   * Sync default initial dataset to MongoDB Atlas if the live database is empty.
   */
  public async syncInitialDataToMongo(): Promise<void> {
    if (!this.isMongoActive()) return;

    try {
      const userCount = await UserModel.countDocuments();
      if (userCount === 0) {
        console.log('[RentSpace DB] Seeding initial dataset into MongoDB Atlas...');
        for (const u of this.users) {
          await UserModel.create(u);
        }
        for (const p of this.properties) {
          await PropertyModel.create(p);
        }
        for (const e of this.enquiries) {
          await EnquiryModel.create(e);
        }
        for (const r of this.reviews) {
          await ReviewModel.create(r);
        }
        for (const s of this.savedProperties) {
          await SavedPropertyModel.create(s);
        }
        console.log('[RentSpace DB] Initial dataset successfully synced into MongoDB Atlas!');
      }
    } catch (err: any) {
      console.warn('[RentSpace DB] Initial sync warning:', err.message);
    }
  }

  public seedDefaultData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('Password@123', salt);

    // Initial users
    this.users = [
      {
        _id: 'usr_tenant_1',
        name: 'Aarav Sharma',
        email: 'tenant@rentspace.com',
        passwordHash: demoPasswordHash,
        role: 'tenant',
        phone: '+91 98765 43210',
        avatar: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'usr_owner_1',
        name: 'Rajesh Verma',
        email: 'owner@rentspace.com',
        passwordHash: demoPasswordHash,
        role: 'owner',
        phone: '+91 98111 22334',
        avatar: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'usr_owner_2',
        name: 'Priya Mehra',
        email: 'priya.landlord@rentspace.com',
        passwordHash: demoPasswordHash,
        role: 'owner',
        phone: '+91 97222 33445',
        avatar: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'usr_admin_1',
        name: 'RentSpace Platform Admin',
        email: 'admin@rentspace.com',
        passwordHash: demoPasswordHash,
        role: 'admin',
        phone: '+91 99999 00000',
        avatar: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Initial curated properties
    this.properties = [
      {
        _id: 'prop_1',
        title: 'Skyline Heights Sunlit Studio Apartment',
        description: 'A designer sunlit studio apartment in the heart of Vijay Nagar, Indore. Features hardwood light oak flooring, modular kitchen, large floor-to-ceiling windows, and smart electronic security. Ideal for working professionals and tech founders looking for privacy and comfort.',
        propertyType: 'studio',
        rent: 24000,
        deposit: 48000,
        city: 'Indore',
        locality: 'Vijay Nagar',
        address: 'Scheme No 54, Near Meghdoot Garden, Vijay Nagar',
        furnishing: 'fully-furnished',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['High-Speed WiFi', 'Air Conditioning', 'Power Backup', 'Lift', '24/7 Security', 'RO Water Purifier', 'Washing Machine'],
        images: [
          '/src/assets/images/property_studio_apartment_1792498408044.jpg',
          '/src/assets/images/modern_luxury_penthouse_1792564120919.jpg',
          '/src/assets/images/modern_facade_building_1792564135075.jpg'
        ],
        availability: 'available',
        owner: 'usr_owner_1',
        ownerName: 'Rajesh Verma',
        ownerPhone: '+91 98111 22334',
        moderationStatus: 'approved',
        moderationFeedback: 'Approved after verification of address and title deed.',
        isFeatured: true,
        isVerified: true,
        averageRating: 4.8,
        reviewCount: 14,
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'prop_2',
        title: 'Zenith Executive PG for Students & Professionals',
        description: 'Contemporary executive PG suite located 5 minutes from DB City Mall and coaching hubs in MP Nagar, Bhopal. Includes dedicated study desk, high-speed fiber internet, housekeeping 6 days a week, and chef-prepared meals.',
        propertyType: 'pg',
        rent: 14500,
        deposit: 15000,
        city: 'Bhopal',
        locality: 'MP Nagar Zone II',
        address: 'Plot 42, Behind DB City Mall, MP Nagar',
        furnishing: 'fully-furnished',
        bedrooms: 1,
        bathrooms: 1,
        amenities: ['High-Speed WiFi', 'Nutritious Meals Included', 'Air Conditioning', 'Housekeeping', 'CCTV Security', 'Gym Access', 'Power Backup'],
        images: [
          '/src/assets/images/property_pg_accommodation_1792498407710.jpg',
          '/src/assets/images/property_shared_room_1792498408810.jpg',
          '/src/assets/images/modern_facade_building_1792564135075.jpg'
        ],
        availability: 'available',
        owner: 'usr_owner_2',
        ownerName: 'Priya Mehra',
        ownerPhone: '+91 97222 33445',
        moderationStatus: 'approved',
        moderationFeedback: 'PG registration verified.',
        isFeatured: true,
        isVerified: true,
        averageRating: 4.7,
        reviewCount: 22,
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'prop_3',
        title: 'Verdant Greens 2BHK Designer Flat',
        description: 'Spectacular, airy 2BHK residence with marble center table, large private balcony with tranquil green canopy views, cross-ventilation, and dedicated covered car parking. Quiet residential gated community in Palasia, Indore.',
        propertyType: 'flat',
        rent: 36000,
        deposit: 70000,
        city: 'Indore',
        locality: 'Palasia',
        address: 'Old Palasia, Near Industry House, AB Road',
        furnishing: 'fully-furnished',
        bedrooms: 2,
        bathrooms: 2,
        amenities: ['Covered Parking', 'Swimming Pool', 'Gym Access', '24/7 Security', 'Balcony', 'Power Backup', 'Gas Pipeline'],
        images: [
          '/src/assets/images/property_luxury_flat_1792498408260.jpg',
          '/src/assets/images/hero_rental_home_1792498408215.jpg'
        ],
        availability: 'available',
        owner: 'usr_owner_1',
        ownerName: 'Rajesh Verma',
        ownerPhone: '+91 98111 22334',
        moderationStatus: 'approved',
        moderationFeedback: 'Verified owner documentation.',
        isFeatured: true,
        isVerified: true,
        averageRating: 4.9,
        reviewCount: 9,
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        _id: 'prop_4',
        title: 'Civil Lines Heritage 3BHK Luxury Residence',
        description: 'Immaculately furnished high-rise flat with panoramic views, modular Italian kitchen, marble center table, and clubhouse membership in Civil Lines, Jabalpur. Ideal for executives or families.',
        propertyType: 'flat',
        rent: 55000,
        deposit: 120000,
        city: 'Jabalpur',
        locality: 'Civil Lines',
        address: 'Near High Court, Civil Lines',
        furnishing: 'fully-furnished',
        bedrooms: 3,
        bathrooms: 3,
        amenities: ['Covered Parking', 'Gated Security', 'Swimming Pool', 'Gym Access', 'Power Backup', 'Balcony', 'Lift'],
        images: [
          '/src/assets/images/modern_luxury_penthouse_1792564120919.jpg',
          '/src/assets/images/modern_facade_building_1792564135075.jpg',
          '/src/assets/images/property_luxury_flat_1792498408260.jpg'
        ],
        availability: 'available',
        owner: 'usr_owner_2',
        ownerName: 'Priya Mehra',
        ownerPhone: '+91 97222 33445',
        moderationStatus: 'approved',
        moderationFeedback: 'Approved after verification.',
        isFeatured: true,
        isVerified: true,
        averageRating: 4.9,
        reviewCount: 18,
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Initial enquiries
    this.enquiries = [
      {
        _id: 'enq_1',
        tenant: 'usr_tenant_1',
        tenantName: 'Aarav Sharma',
        tenantEmail: 'tenant@rentspace.com',
        tenantPhone: '+91 98765 43210',
        property: 'prop_1',
        propertyTitle: 'Skyline Heights Sunlit Studio Apartment',
        propertyCity: 'Indore',
        propertyRent: 24000,
        propertyImage: '/src/assets/images/property_studio_apartment_1792498408044.jpg',
        owner: 'usr_owner_1',
        message: 'Hello Mr. Verma, I am moving to Indore next month for work. Is the apartment available for move-in from the 1st? Would like to schedule an in-person walkthrough this weekend.',
        moveInDate: '2026-11-01',
        preferredDuration: '11 months',
        status: 'new',
        ownerNotes: '',
        createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Initial reviews
    this.reviews = [
      {
        _id: 'rev_1',
        property: 'prop_1',
        tenant: 'usr_tenant_1',
        tenantName: 'Aarav Sharma',
        tenantAvatar: '',
        rating: 5,
        comment: 'Exceptional place to live. The natural sunlight, modern fittings, and quiet environment make remote work effortless.',
        status: 'active',
        createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Initial saved properties
    this.savedProperties = [
      {
        _id: 'saved_1',
        user: 'usr_tenant_1',
        property: 'prop_1',
        createdAt: new Date().toISOString()
      }
    ];

    this.reports = [];
  }

  // --- Users ---
  public async findUserByEmail(email: string): Promise<UserData | null> {
    const normalized = email.toLowerCase().trim();
    if (this.isMongoActive()) {
      try {
        const doc = await UserModel.findOne({ email: normalized }).lean();
        if (doc) return this.docToUser(doc);
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo findUserByEmail fallback:', err.message);
      }
    }
    return this.users.find((u) => u.email.toLowerCase() === normalized) || null;
  }

  public async findUserById(id: string): Promise<UserData | null> {
    if (this.isMongoActive()) {
      try {
        const doc = await UserModel.findById(id).lean();
        if (doc) return this.docToUser(doc);
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo findUserById fallback:', err.message);
      }
    }
    return this.users.find((u) => u._id === id) || null;
  }

  public async createUser(data: Omit<UserData, '_id' | 'createdAt' | 'updatedAt' | 'status'>): Promise<UserData> {
    const normalizedEmail = data.email.toLowerCase().trim();
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    if (this.isMongoActive()) {
      try {
        const doc = await UserModel.create({
          _id: id,
          ...data,
          email: normalizedEmail,
          status: 'active'
        });
        const user = this.docToUser(doc.toObject());
        this.users.push(user);
        return user;
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo createUser fallback:', err.message);
      }
    }

    const newUser: UserData = {
      _id: id,
      ...data,
      email: normalizedEmail,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.users.push(newUser);
    return newUser;
  }

  public async getAllUsers(): Promise<UserData[]> {
    if (this.isMongoActive()) {
      try {
        const docs = await UserModel.find({}).sort({ createdAt: -1 }).lean();
        return docs.map((d) => this.docToUser(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getAllUsers fallback:', err.message);
      }
    }
    return [...this.users];
  }

  public async updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<UserData | null> {
    if (this.isMongoActive()) {
      try {
        const doc = await UserModel.findByIdAndUpdate(userId, { status }, { new: true }).lean();
        if (doc) {
          const user = this.docToUser(doc);
          const idx = this.users.findIndex((u) => u._id === userId);
          if (idx > -1) this.users[idx] = user;
          return user;
        }
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo updateUserStatus fallback:', err.message);
      }
    }

    const user = this.users.find((u) => u._id === userId);
    if (!user) return null;
    user.status = status;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  public async updateUserProfile(userId: string, data: { name?: string; phone?: string; avatar?: string }): Promise<UserData | null> {
    if (this.isMongoActive()) {
      try {
        const doc = await UserModel.findByIdAndUpdate(userId, { $set: data }, { new: true }).lean();
        if (doc) {
          const user = this.docToUser(doc);
          const idx = this.users.findIndex((u) => u._id === userId);
          if (idx > -1) this.users[idx] = user;
          return user;
        }
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo updateUserProfile fallback:', err.message);
      }
    }

    const user = this.users.find((u) => u._id === userId);
    if (!user) return null;
    if (data.name) user.name = data.name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.avatar !== undefined) user.avatar = data.avatar;
    user.updatedAt = new Date().toISOString();
    return user;
  }

  // --- Properties ---
  public async getProperties(filters: {
    city?: string;
    locality?: string;
    propertyType?: string;
    minRent?: number;
    maxRent?: number;
    furnishing?: string;
    bedrooms?: number;
    amenities?: string[];
    search?: string;
    sortBy?: 'newest' | 'rent_low' | 'rent_high' | 'rating';
    ownerId?: string;
    moderationStatus?: string;
    includePending?: boolean;
  }): Promise<PropertyData[]> {
    if (this.isMongoActive()) {
      try {
        const query: any = {};

        if (filters.ownerId) {
          query.owner = filters.ownerId;
        } else if (!filters.includePending) {
          query.moderationStatus = 'approved';
        }

        if (filters.moderationStatus && filters.moderationStatus !== 'all') {
          query.moderationStatus = filters.moderationStatus;
        }

        if (filters.city && filters.city !== 'all') {
          query.city = { $regex: new RegExp(filters.city, 'i') };
        }

        if (filters.locality) {
          query.locality = { $regex: new RegExp(filters.locality, 'i') };
        }

        if (filters.propertyType && filters.propertyType !== 'all') {
          query.propertyType = filters.propertyType;
        }

        if (filters.furnishing && filters.furnishing !== 'all') {
          query.furnishing = filters.furnishing;
        }

        if (filters.bedrooms && filters.bedrooms > 0) {
          query.bedrooms = { $gte: filters.bedrooms };
        }

        if (filters.minRent !== undefined && filters.minRent > 0) {
          query.rent = { ...(query.rent || {}), $gte: filters.minRent };
        }

        if (filters.maxRent !== undefined && filters.maxRent > 0) {
          query.rent = { ...(query.rent || {}), $lte: filters.maxRent };
        }

        if (filters.amenities && filters.amenities.length > 0) {
          query.amenities = { $all: filters.amenities };
        }

        if (filters.search) {
          const sRegex = new RegExp(filters.search, 'i');
          query.$or = [
            { title: sRegex },
            { city: sRegex },
            { locality: sRegex },
            { description: sRegex }
          ];
        }

        let sortOption: any = { createdAt: -1 };
        if (filters.sortBy === 'rent_low') sortOption = { rent: 1 };
        else if (filters.sortBy === 'rent_high') sortOption = { rent: -1 };
        else if (filters.sortBy === 'rating') sortOption = { averageRating: -1 };

        const docs = await PropertyModel.find(query).sort(sortOption).lean();
        return docs.map((d) => this.docToProperty(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getProperties fallback:', err.message);
      }
    }

    // In-memory fallback
    let result = [...this.properties];

    if (filters.ownerId) {
      result = result.filter((p) => p.owner === filters.ownerId);
    } else if (!filters.includePending) {
      result = result.filter((p) => p.moderationStatus === 'approved');
    }

    if (filters.moderationStatus && filters.moderationStatus !== 'all') {
      result = result.filter((p) => p.moderationStatus === filters.moderationStatus);
    }

    if (filters.city && filters.city !== 'all') {
      result = result.filter((p) => p.city.toLowerCase().includes(filters.city!.toLowerCase()));
    }

    if (filters.locality) {
      result = result.filter((p) => p.locality.toLowerCase().includes(filters.locality!.toLowerCase()));
    }

    if (filters.propertyType && filters.propertyType !== 'all') {
      result = result.filter((p) => p.propertyType === filters.propertyType);
    }

    if (filters.furnishing && filters.furnishing !== 'all') {
      result = result.filter((p) => p.furnishing === filters.furnishing);
    }

    if (filters.bedrooms && filters.bedrooms > 0) {
      result = result.filter((p) => p.bedrooms >= filters.bedrooms!);
    }

    if (filters.minRent !== undefined && filters.minRent > 0) {
      result = result.filter((p) => p.rent >= filters.minRent!);
    }

    if (filters.maxRent !== undefined && filters.maxRent > 0) {
      result = result.filter((p) => p.rent <= filters.maxRent!);
    }

    if (filters.amenities && filters.amenities.length > 0) {
      result = result.filter((p) =>
        filters.amenities!.every((reqAmenity) =>
          p.amenities.some((a) => a.toLowerCase().includes(reqAmenity.toLowerCase()))
        )
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (filters.sortBy === 'rent_low') {
      result.sort((a, b) => a.rent - b.rent);
    } else if (filters.sortBy === 'rent_high') {
      result.sort((a, b) => b.rent - a.rent);
    } else if (filters.sortBy === 'rating') {
      result.sort((a, b) => b.averageRating - a.averageRating);
    } else {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }

  public async getPropertyById(id: string): Promise<PropertyData | null> {
    if (this.isMongoActive()) {
      try {
        const doc = await PropertyModel.findById(id).lean();
        if (doc) return this.docToProperty(doc);
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getPropertyById fallback:', err.message);
      }
    }
    return this.properties.find((p) => p._id === id) || null;
  }

  public async createProperty(
    owner: UserData,
    data: Omit<PropertyData, '_id' | 'owner' | 'ownerName' | 'ownerPhone' | 'createdAt' | 'updatedAt' | 'averageRating' | 'reviewCount' | 'moderationStatus'>
  ): Promise<PropertyData> {
    const id = 'prop_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    if (this.isMongoActive()) {
      try {
        const doc = await PropertyModel.create({
          _id: id,
          ...data,
          owner: owner._id,
          ownerName: owner.name,
          ownerPhone: owner.phone || '',
          moderationStatus: 'pending',
          moderationFeedback: 'Listing submitted for review.',
          averageRating: 0,
          reviewCount: 0
        });
        const prop = this.docToProperty(doc.toObject());
        this.properties.unshift(prop);
        return prop;
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo createProperty fallback:', err.message);
      }
    }

    const newProperty: PropertyData = {
      _id: id,
      ...data,
      owner: owner._id,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      moderationStatus: 'pending',
      moderationFeedback: 'Listing submitted for review.',
      averageRating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.properties.unshift(newProperty);
    return newProperty;
  }

  public async updateProperty(
    propertyId: string,
    ownerId: string,
    data: Partial<PropertyData>,
    isAdmin = false
  ): Promise<PropertyData | null> {
    if (this.isMongoActive()) {
      try {
        const prop = await PropertyModel.findById(propertyId);
        if (!prop) return null;
        if (!isAdmin && prop.owner !== ownerId) {
          throw new Error('Unauthorized: You can only update your own property listings.');
        }
        Object.assign(prop, data);
        await prop.save();
        const updated = this.docToProperty(prop.toObject());
        const idx = this.properties.findIndex((p) => p._id === propertyId);
        if (idx > -1) this.properties[idx] = updated;
        return updated;
      } catch (err: any) {
        if (err.message?.includes('Unauthorized')) throw err;
        console.warn('[RentSpace Store] Mongo updateProperty fallback:', err.message);
      }
    }

    const property = this.properties.find((p) => p._id === propertyId);
    if (!property) return null;
    if (!isAdmin && property.owner !== ownerId) {
      throw new Error('Unauthorized: You can only update your own property listings.');
    }

    Object.assign(property, data, { updatedAt: new Date().toISOString() });
    return property;
  }

  public async deleteProperty(propertyId: string, ownerId: string, isAdmin = false): Promise<boolean> {
    if (this.isMongoActive()) {
      try {
        const prop = await PropertyModel.findById(propertyId);
        if (!prop) return false;
        if (!isAdmin && prop.owner !== ownerId) {
          throw new Error('Unauthorized: You can only delete your own property listings.');
        }
        await PropertyModel.findByIdAndDelete(propertyId);
        await EnquiryModel.deleteMany({ property: propertyId });
        await SavedPropertyModel.deleteMany({ property: propertyId });
        await ReviewModel.deleteMany({ property: propertyId });
        await ReportModel.deleteMany({ property: propertyId });

        this.properties = this.properties.filter((p) => p._id !== propertyId);
        return true;
      } catch (err: any) {
        if (err.message?.includes('Unauthorized')) throw err;
        console.warn('[RentSpace Store] Mongo deleteProperty fallback:', err.message);
      }
    }

    const index = this.properties.findIndex((p) => p._id === propertyId);
    if (index === -1) return false;
    const property = this.properties[index];
    if (!isAdmin && property.owner !== ownerId) {
      throw new Error('Unauthorized: You can only delete your own property listings.');
    }
    this.properties.splice(index, 1);
    this.enquiries = this.enquiries.filter((e) => e.property !== propertyId);
    this.savedProperties = this.savedProperties.filter((s) => s.property !== propertyId);
    this.reviews = this.reviews.filter((r) => r.property !== propertyId);
    return true;
  }

  public async moderateProperty(
    propertyId: string,
    status: 'approved' | 'rejected',
    feedback?: string,
    isFeatured?: boolean,
    isVerified?: boolean
  ): Promise<PropertyData | null> {
    if (this.isMongoActive()) {
      try {
        const updateData: any = { moderationStatus: status };
        if (feedback !== undefined) updateData.moderationFeedback = feedback;
        if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
        if (isVerified !== undefined) updateData.isVerified = isVerified;

        const doc = await PropertyModel.findByIdAndUpdate(propertyId, updateData, { new: true }).lean();
        if (doc) {
          const updated = this.docToProperty(doc);
          const idx = this.properties.findIndex((p) => p._id === propertyId);
          if (idx > -1) this.properties[idx] = updated;
          return updated;
        }
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo moderateProperty fallback:', err.message);
      }
    }

    const property = this.properties.find((p) => p._id === propertyId);
    if (!property) return null;
    property.moderationStatus = status;
    if (feedback !== undefined) property.moderationFeedback = feedback;
    if (isFeatured !== undefined) property.isFeatured = isFeatured;
    if (isVerified !== undefined) property.isVerified = isVerified;
    property.updatedAt = new Date().toISOString();
    return property;
  }

  // --- Enquiries ---
  public async createEnquiry(
    tenant: UserData,
    data: {
      propertyId: string;
      message: string;
      moveInDate?: string;
      preferredDuration?: string;
      contactPhone?: string;
    }
  ): Promise<EnquiryData> {
    const property = await this.getPropertyById(data.propertyId);
    if (!property) throw new Error('Property not found');

    const id = 'enq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    if (this.isMongoActive()) {
      try {
        const doc = await EnquiryModel.create({
          _id: id,
          tenant: tenant._id,
          tenantName: tenant.name,
          tenantEmail: tenant.email,
          tenantPhone: data.contactPhone || tenant.phone || '',
          property: property._id,
          propertyTitle: property.title,
          propertyCity: property.city,
          propertyRent: property.rent,
          propertyImage: property.images[0] || '',
          owner: property.owner,
          message: data.message,
          moveInDate: data.moveInDate || '',
          preferredDuration: data.preferredDuration || '',
          status: 'pending',
          ownerNotes: ''
        });
        const enquiry = this.docToEnquiry(doc.toObject());
        this.enquiries.unshift(enquiry);
        return enquiry;
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo createEnquiry fallback:', err.message);
      }
    }

    const newEnquiry: EnquiryData = {
      _id: id,
      tenant: tenant._id,
      tenantName: tenant.name,
      tenantEmail: tenant.email,
      tenantPhone: data.contactPhone || tenant.phone || '',
      property: property._id,
      propertyTitle: property.title,
      propertyCity: property.city,
      propertyRent: property.rent,
      propertyImage: property.images[0] || '',
      owner: property.owner,
      message: data.message,
      moveInDate: data.moveInDate,
      preferredDuration: data.preferredDuration,
      status: 'pending',
      ownerNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.enquiries.unshift(newEnquiry);
    return newEnquiry;
  }

  /**
   * Check if a tenant has an ACCEPTED enquiry for a specific property.
   * This is the security authorization check for revealing owner contact phone numbers.
   */
  public async hasAcceptedEnquiry(propertyId: string, tenantId: string): Promise<boolean> {
    if (this.isMongoActive()) {
      try {
        const exists = await EnquiryModel.exists({
          property: propertyId,
          tenant: tenantId,
          status: 'accepted'
        });
        if (exists) return true;
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo hasAcceptedEnquiry fallback:', err.message);
      }
    }
    return this.enquiries.some(
      (e) => e.property === propertyId && e.tenant === tenantId && e.status === 'accepted'
    );
  }

  /**
   * Get tenant's latest enquiry for a specific property to display privacy/request state.
   */
  public async getEnquiryForUserAndProperty(propertyId: string, tenantId: string): Promise<EnquiryData | null> {
    if (this.isMongoActive()) {
      try {
        const doc = await EnquiryModel.findOne({ property: propertyId, tenant: tenantId })
          .sort({ createdAt: -1 })
          .lean();
        if (doc) return this.docToEnquiry(doc);
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getEnquiryForUserAndProperty fallback:', err.message);
      }
    }
    return (
      this.enquiries
        .filter((e) => e.property === propertyId && e.tenant === tenantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] || null
    );
  }

  public async getEnquiriesForTenant(tenantId: string): Promise<EnquiryData[]> {
    let list: EnquiryData[] = [];
    if (this.isMongoActive()) {
      try {
        const docs = await EnquiryModel.find({ tenant: tenantId }).sort({ createdAt: -1 }).lean();
        list = docs.map((d) => this.docToEnquiry(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getEnquiriesForTenant fallback:', err.message);
        list = this.enquiries
          .filter((e) => e.tenant === tenantId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } else {
      list = this.enquiries
        .filter((e) => e.tenant === tenantId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Strict privacy rule: Only attach ownerPhone if status is explicitly 'accepted'!
    // For pending, rejected, or other statuses, owner phone remains hidden (undefined).
    for (const enq of list) {
      if (enq.status === 'accepted') {
        const prop = await this.getPropertyById(enq.property);
        if (prop && prop.ownerPhone) {
          enq.ownerPhone = prop.ownerPhone;
        } else {
          const owner = await this.findUserById(enq.owner);
          if (owner && owner.phone) enq.ownerPhone = owner.phone;
        }
      } else {
        enq.ownerPhone = undefined;
      }
    }

    return list;
  }

  public async getEnquiriesForOwner(ownerId: string): Promise<EnquiryData[]> {
    if (this.isMongoActive()) {
      try {
        const docs = await EnquiryModel.find({ owner: ownerId }).sort({ createdAt: -1 }).lean();
        return docs.map((d) => this.docToEnquiry(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getEnquiriesForOwner fallback:', err.message);
      }
    }
    return this.enquiries
      .filter((e) => e.owner === ownerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async updateEnquiryStatus(
    enquiryId: string,
    ownerId: string,
    status: 'pending' | 'accepted' | 'rejected' | 'new' | 'contacted' | 'in_progress' | 'closed',
    ownerNotes?: string,
    isAdmin = false
  ): Promise<EnquiryData | null> {
    if (this.isMongoActive()) {
      try {
        const enquiry = await EnquiryModel.findById(enquiryId);
        if (!enquiry) return null;
        if (!isAdmin && enquiry.owner !== ownerId) {
          throw new Error('Unauthorized: You can only update enquiries for your own properties.');
        }
        enquiry.status = status;
        if (ownerNotes !== undefined) enquiry.ownerNotes = ownerNotes;
        await enquiry.save();
        const updated = this.docToEnquiry(enquiry.toObject());
        const idx = this.enquiries.findIndex((e) => e._id === enquiryId);
        if (idx > -1) this.enquiries[idx] = updated;
        return updated;
      } catch (err: any) {
        if (err.message?.includes('Unauthorized')) throw err;
        console.warn('[RentSpace Store] Mongo updateEnquiryStatus fallback:', err.message);
      }
    }

    const enquiry = this.enquiries.find((e) => e._id === enquiryId);
    if (!enquiry) return null;
    if (!isAdmin && enquiry.owner !== ownerId) {
      throw new Error('Unauthorized: You can only update enquiries for your own properties.');
    }
    enquiry.status = status;
    if (ownerNotes !== undefined) enquiry.ownerNotes = ownerNotes;
    enquiry.updatedAt = new Date().toISOString();
    return enquiry;
  }

  // --- Saved Properties ---
  public async getSavedProperties(userId: string): Promise<PropertyData[]> {
    if (this.isMongoActive()) {
      try {
        const saved = await SavedPropertyModel.find({ user: userId }).lean();
        const propIds = saved.map((s) => s.property);
        const docs = await PropertyModel.find({ _id: { $in: propIds } }).lean();
        return docs.map((d) => this.docToProperty(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getSavedProperties fallback:', err.message);
      }
    }
    const saved = this.savedProperties.filter((s) => s.user === userId);
    const propIds = new Set(saved.map((s) => s.property));
    return this.properties.filter((p) => propIds.has(p._id));
  }

  public async toggleSaveProperty(userId: string, propertyId: string): Promise<{ saved: boolean }> {
    if (this.isMongoActive()) {
      try {
        const existing = await SavedPropertyModel.findOne({ user: userId, property: propertyId });
        if (existing) {
          await SavedPropertyModel.findByIdAndDelete(existing._id);
          this.savedProperties = this.savedProperties.filter(
            (s) => !(s.user === userId && s.property === propertyId)
          );
          return { saved: false };
        } else {
          await SavedPropertyModel.create({
            _id: 'sav_' + Date.now(),
            user: userId,
            property: propertyId
          });
          this.savedProperties.push({
            _id: 'sav_' + Date.now(),
            user: userId,
            property: propertyId,
            createdAt: new Date().toISOString()
          });
          return { saved: true };
        }
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo toggleSaveProperty fallback:', err.message);
      }
    }

    const existingIndex = this.savedProperties.findIndex(
      (s) => s.user === userId && s.property === propertyId
    );
    if (existingIndex > -1) {
      this.savedProperties.splice(existingIndex, 1);
      return { saved: false };
    } else {
      this.savedProperties.push({
        _id: 'sav_' + Date.now(),
        user: userId,
        property: propertyId,
        createdAt: new Date().toISOString()
      });
      return { saved: true };
    }
  }

  public async isPropertySaved(userId: string, propertyId: string): Promise<boolean> {
    if (this.isMongoActive()) {
      try {
        const count = await SavedPropertyModel.countDocuments({ user: userId, property: propertyId });
        return count > 0;
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo isPropertySaved fallback:', err.message);
      }
    }
    return this.savedProperties.some((s) => s.user === userId && s.property === propertyId);
  }

  // --- Reviews ---
  public async getReviewsForProperty(propertyId: string): Promise<ReviewData[]> {
    if (this.isMongoActive()) {
      try {
        const docs = await ReviewModel.find({ property: propertyId, status: 'active' })
          .sort({ createdAt: -1 })
          .lean();
        return docs.map((d) => this.docToReview(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getReviewsForProperty fallback:', err.message);
      }
    }
    return this.reviews
      .filter((r) => r.property === propertyId && r.status === 'active')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async addReview(tenant: UserData, propertyId: string, rating: number, comment: string): Promise<ReviewData> {
    const property = await this.getPropertyById(propertyId);
    if (!property) throw new Error('Property not found');

    if (this.isMongoActive()) {
      try {
        const existing = await ReviewModel.findOne({ property: propertyId, tenant: tenant._id });
        if (existing) {
          throw new Error('You have already submitted a review for this property.');
        }

        const id = 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        const doc = await ReviewModel.create({
          _id: id,
          property: propertyId,
          tenant: tenant._id,
          tenantName: tenant.name,
          tenantAvatar: tenant.avatar || '',
          rating: Math.min(5, Math.max(1, rating)),
          comment: comment.trim(),
          status: 'active'
        });

        // Recalculate average rating
        const activeReviews = await ReviewModel.find({ property: propertyId, status: 'active' }).lean();
        const totalRating = activeReviews.reduce((sum, r) => sum + r.rating, 0);
        const reviewCount = activeReviews.length;
        const averageRating = Number((totalRating / activeReviews.length).toFixed(1));

        await PropertyModel.findByIdAndUpdate(propertyId, { reviewCount, averageRating });

        const review = this.docToReview(doc.toObject());
        this.reviews.unshift(review);
        return review;
      } catch (err: any) {
        if (err.message?.includes('already submitted')) throw err;
        console.warn('[RentSpace Store] Mongo addReview fallback:', err.message);
      }
    }

    const existing = this.reviews.find((r) => r.property === propertyId && r.tenant === tenant._id);
    if (existing) {
      throw new Error('You have already submitted a review for this property.');
    }

    const newReview: ReviewData = {
      _id: 'rev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      property: propertyId,
      tenant: tenant._id,
      tenantName: tenant.name,
      tenantAvatar: tenant.avatar || '',
      rating: Math.min(5, Math.max(1, rating)),
      comment: comment.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reviews.unshift(newReview);

    const activeReviews = this.reviews.filter((r) => r.property === propertyId && r.status === 'active');
    const totalRating = activeReviews.reduce((sum, r) => sum + r.rating, 0);
    property.reviewCount = activeReviews.length;
    property.averageRating = Number((totalRating / activeReviews.length).toFixed(1));

    return newReview;
  }

  // --- Reports ---
  public async createReport(
    reporter: UserData,
    propertyId: string,
    reason: ReportData['reason'],
    details: string
  ): Promise<ReportData> {
    const property = await this.getPropertyById(propertyId);
    if (!property) throw new Error('Property not found');

    const id = 'rep_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    if (this.isMongoActive()) {
      try {
        const doc = await ReportModel.create({
          _id: id,
          property: propertyId,
          propertyTitle: property.title,
          reportedBy: reporter._id,
          reporterEmail: reporter.email,
          reason,
          details,
          status: 'pending'
        });
        const rep = this.docToReport(doc.toObject());
        this.reports.unshift(rep);
        return rep;
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo createReport fallback:', err.message);
      }
    }

    const newReport: ReportData = {
      _id: id,
      property: propertyId,
      propertyTitle: property.title,
      reportedBy: reporter._id,
      reporterEmail: reporter.email,
      reason,
      details,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.reports.unshift(newReport);
    return newReport;
  }

  public async getReports(): Promise<ReportData[]> {
    if (this.isMongoActive()) {
      try {
        const docs = await ReportModel.find({}).sort({ createdAt: -1 }).lean();
        return docs.map((d) => this.docToReport(d));
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getReports fallback:', err.message);
      }
    }
    return [...this.reports].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async updateReportStatus(reportId: string, status: ReportData['status'], adminNotes?: string): Promise<ReportData | null> {
    if (this.isMongoActive()) {
      try {
        const updateData: any = { status };
        if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
        const doc = await ReportModel.findByIdAndUpdate(reportId, updateData, { new: true }).lean();
        if (doc) {
          const rep = this.docToReport(doc);
          const idx = this.reports.findIndex((r) => r._id === reportId);
          if (idx > -1) this.reports[idx] = rep;
          return rep;
        }
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo updateReportStatus fallback:', err.message);
      }
    }

    const report = this.reports.find((r) => r._id === reportId);
    if (!report) return null;
    report.status = status;
    if (adminNotes !== undefined) report.adminNotes = adminNotes;
    report.updatedAt = new Date().toISOString();
    return report;
  }

  // --- Admin Stats ---
  public async getAdminStats() {
    if (this.isMongoActive()) {
      try {
        const [
          totalUsers,
          tenants,
          owners,
          totalProperties,
          approvedProperties,
          pendingProperties,
          totalEnquiries,
          pendingReports
        ] = await Promise.all([
          UserModel.countDocuments(),
          UserModel.countDocuments({ role: 'tenant' }),
          UserModel.countDocuments({ role: 'owner' }),
          PropertyModel.countDocuments(),
          PropertyModel.countDocuments({ moderationStatus: 'approved' }),
          PropertyModel.countDocuments({ moderationStatus: 'pending' }),
          EnquiryModel.countDocuments(),
          ReportModel.countDocuments({ status: 'pending' })
        ]);

        return {
          totalUsers,
          tenants,
          owners,
          totalProperties,
          approvedProperties,
          pendingProperties,
          totalEnquiries,
          pendingReports
        };
      } catch (err: any) {
        console.warn('[RentSpace Store] Mongo getAdminStats fallback:', err.message);
      }
    }

    const totalUsers = this.users.length;
    const tenants = this.users.filter((u) => u.role === 'tenant').length;
    const owners = this.users.filter((u) => u.role === 'owner').length;
    const totalProperties = this.properties.length;
    const approvedProperties = this.properties.filter((p) => p.moderationStatus === 'approved').length;
    const pendingProperties = this.properties.filter((p) => p.moderationStatus === 'pending').length;
    const totalEnquiries = this.enquiries.length;
    const pendingReports = this.reports.filter((r) => r.status === 'pending').length;

    return {
      totalUsers,
      tenants,
      owners,
      totalProperties,
      approvedProperties,
      pendingProperties,
      totalEnquiries,
      pendingReports
    };
  }
}

export const dbStore = new DatabaseStore();
