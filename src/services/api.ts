import { User, Property, Enquiry, Review, Report, AdminStats } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('rentspace_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({ message: 'Server communication error' }));

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
}

export const api = {
  // System Health
  getHealth: () => request<{ success: boolean; storageMode: string; mongoConnected: boolean; project: string }>('/health'),

  // Auth
  register: (payload: { name: string; email: string; password: string; role: 'tenant' | 'owner'; phone?: string }) =>
    request<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getMe: () => request<{ success: boolean; user: User }>('/auth/me'),

  updateProfile: (payload: { name?: string; phone?: string; avatar?: string }) =>
    request<{ success: boolean; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Properties
  getProperties: (filters: Record<string, any> = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== 'all') {
        params.append(k, String(v));
      }
    });
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ success: boolean; count: number; properties: Property[] }>(`/properties${query}`);
  },

  getPropertyById: (id: string) =>
    request<{ success: boolean; property: Property; isAuthenticated?: boolean }>(`/properties/${id}`),

  createProperty: (data: Partial<Property>) =>
    request<{ success: boolean; message: string; property: Property }>('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateProperty: (id: string, data: Partial<Property>) =>
    request<{ success: boolean; message: string; property: Property }>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteProperty: (id: string) =>
    request<{ success: boolean; message: string }>(`/properties/${id}`, {
      method: 'DELETE'
    }),

  getOwnerProperties: () =>
    request<{ success: boolean; count: number; properties: Property[] }>('/owner/properties'),

  // Device File Upload for Owners
  uploadImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });

    const token = localStorage.getItem('rentspace_token');
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });

    const data = await res.json().catch(() => ({ message: 'Server upload error' }));
    if (!res.ok) {
      throw new Error(data.message || `Upload failed with status ${res.status}`);
    }
    return data as {
      success: boolean;
      message: string;
      urls: string[];
      images: { url: string; originalName: string; size: number; mimeType: string; storage: string }[];
    };
  },

  // Enquiries
  createEnquiry: (data: { propertyId: string; message: string; moveInDate?: string; preferredDuration?: string; contactPhone?: string }) =>
    request<{ success: boolean; message: string; enquiry: Enquiry }>('/enquiries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getTenantEnquiries: () =>
    request<{ success: boolean; count: number; enquiries: Enquiry[] }>('/tenant/enquiries'),

  getOwnerEnquiries: () =>
    request<{ success: boolean; count: number; enquiries: Enquiry[] }>('/owner/enquiries'),

  updateEnquiryStatus: (id: string, status: string, ownerNotes?: string) =>
    request<{ success: boolean; message: string; enquiry: Enquiry }>(`/enquiries/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ownerNotes })
    }),

  // Saved Properties
  getSavedProperties: () =>
    request<{ success: boolean; count: number; properties: Property[] }>('/saved'),

  toggleSaveProperty: (propertyId: string) =>
    request<{ success: boolean; saved: boolean; message: string }>(`/saved/${propertyId}`, {
      method: 'POST'
    }),

  checkIsSaved: (propertyId: string) =>
    request<{ success: boolean; saved: boolean }>(`/saved/check/${propertyId}`),

  // Reviews
  getPropertyReviews: (propertyId: string) =>
    request<{ success: boolean; count: number; reviews: Review[] }>(`/properties/${propertyId}/reviews`),

  addReview: (propertyId: string, rating: number, comment: string) =>
    request<{ success: boolean; message: string; review: Review }>(`/properties/${propertyId}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment })
    }),

  // Reports
  createReport: (propertyId: string, reason: string, details: string) =>
    request<{ success: boolean; message: string; report: Report }>(`/properties/${propertyId}/report`, {
      method: 'POST',
      body: JSON.stringify({ reason, details })
    }),

  // Admin
  getAdminStats: () =>
    request<{ success: boolean; stats: AdminStats }>('/admin/stats'),

  getAdminProperties: (moderationStatus?: string) => {
    const q = moderationStatus ? `?moderationStatus=${moderationStatus}` : '';
    return request<{ success: boolean; count: number; properties: Property[] }>(`/admin/properties${q}`);
  },

  moderateProperty: (id: string, payload: { status: 'approved' | 'rejected'; feedback?: string; isFeatured?: boolean; isVerified?: boolean }) =>
    request<{ success: boolean; message: string; property: Property }>(`/admin/properties/${id}/moderate`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    }),

  getAdminUsers: () =>
    request<{ success: boolean; count: number; users: User[] }>('/admin/users'),

  updateUserStatus: (userId: string, status: 'active' | 'suspended') =>
    request<{ success: boolean; message: string; user: User }>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }),

  getAdminReports: () =>
    request<{ success: boolean; count: number; reports: Report[] }>('/admin/reports'),

  updateReportStatus: (reportId: string, status: string, adminNotes?: string) =>
    request<{ success: boolean; message: string; report: Report }>(`/admin/reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes })
    }),

  resetDemoData: () =>
    request<{ success: boolean; message: string }>('/admin/reset-demo-data', {
      method: 'POST'
    })
};
