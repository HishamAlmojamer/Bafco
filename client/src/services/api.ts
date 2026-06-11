import axios, { AxiosError } from 'axios';
import type {
  Product,
  Category,
  Job,
  JobApplication,
  ContactInquiry,
  B2BInquiry,
  InvestorDocument,
  NewsArticle,
  Cart,
  Order,
  PaginatedResponse,
} from '../types';

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err: AxiosError<{ error: string }>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(err);
  }
);

function getErrorMessage(err: unknown): string {
  if (err instanceof AxiosError && err.response?.data) {
    const data = err.response.data as Record<string, unknown>;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.message === 'string') return data.message;
  }
  if (err instanceof Error) return err.message;
  return 'An unexpected error occurred';
}

function handleError(err: unknown): never {
  throw new Error(getErrorMessage(err));
}

// Auth
export const auth = {
  login: async (email: string, password: string) => {
    try {
      const { data } = await http.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      return data;
    } catch (err) { handleError(err); }
  },
  register: async (email: string, password: string, name?: string, phone?: string) => {
    try {
      const { data } = await http.post('/auth/register', { email, password, name, phone });
      localStorage.setItem('token', data.token);
      return data;
    } catch (err) { handleError(err); }
  },
  me: async () => {
    try {
      const { data } = await http.get('/auth/me');
      return data.user;
    } catch (err) { handleError(err); }
  },
  logout: () => localStorage.removeItem('token'),
};

// Products
export const products = {
  list: async (params?: { q?: string; category?: string; minPrice?: number; maxPrice?: number; skip?: number; take?: number }) => {
    try {
      const { data } = await http.get<PaginatedResponse<Product>>('/products', { params });
      return data;
    } catch (err) { handleError(err); }
  },
  get: async (slug: string) => {
    try {
      const { data } = await http.get<{ item: Product }>(`/products/${slug}`);
      return data.item;
    } catch (err) { handleError(err); }
  },
  create: async (formData: FormData) => {
    try {
      const { data } = await http.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.item;
    } catch (err) { handleError(err); }
  },
  update: async (id: number, formData: FormData) => {
    try {
      const { data } = await http.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.item;
    } catch (err) { handleError(err); }
  },
  delete: async (id: number) => {
    try {
      await http.delete(`/products/${id}`);
    } catch (err) { handleError(err); }
  },
};

// Categories
export const categories = {
  list: async () => {
    try {
      const { data } = await http.get<{ items: Category[] }>('/categories');
      return data.items;
    } catch (err) { handleError(err); }
  },
  get: async (slug: string) => {
    try {
      const { data } = await http.get<{ item: Category }>(`/categories/${slug}`);
      return data.item;
    } catch (err) { handleError(err); }
  },
  create: async (payload: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data } = await http.post<{ item: Category }>('/categories', payload);
      return data.item;
    } catch (err) { handleError(err); }
  },
  update: async (id: number, payload: Partial<Category>) => {
    try {
      const { data } = await http.put<{ item: Category }>(`/categories/${id}`, payload);
      return data.item;
    } catch (err) { handleError(err); }
  },
  delete: async (id: number) => {
    try {
      await http.delete(`/categories/${id}`);
    } catch (err) { handleError(err); }
  },
};

// Careers
export const careers = {
  listJobs: async (params?: { department?: string; type?: string; skip?: number; take?: number }) => {
    try {
      const { data } = await http.get<PaginatedResponse<Job>>('/careers/jobs', { params });
      return data;
    } catch (err) { handleError(err); }
  },
  getJob: async (slug: string) => {
    try {
      const { data } = await http.get<{ item: Job }>(`/careers/jobs/${slug}`);
      return data.item;
    } catch (err) { handleError(err); }
  },
  apply: async (formData: FormData) => {
    try {
      const { data } = await http.post('/careers/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.item;
    } catch (err) { handleError(err); }
  },
  listApplications: async (params?: { jobId?: number; status?: string; skip?: number; take?: number }) => {
    try {
      const { data } = await http.get<PaginatedResponse<JobApplication & { job: { titleAr: string; titleEn: string } }>>('/careers/applications', { params });
      return data;
    } catch (err) { handleError(err); }
  },
  updateApplicationStatus: async (id: number, status: string) => {
    try {
      const { data } = await http.patch<{ item: JobApplication }>(`/careers/applications/${id}/status`, { status });
      return data.item;
    } catch (err) { handleError(err); }
  },
  adminListJobs: async (params?: { skip?: number; take?: number }) => {
    try {
      const { data } = await http.get<PaginatedResponse<Job>>('/careers/admin/jobs', { params });
      return data;
    } catch (err) { handleError(err); }
  },
  adminCreateJob: async (payload: Record<string, unknown>) => {
    try {
      const { data } = await http.post<{ item: Job }>('/careers/admin/jobs', payload);
      return data.item;
    } catch (err) { handleError(err); }
  },
  adminUpdateJob: async (id: number, payload: Record<string, unknown>) => {
    try {
      const { data } = await http.put<{ item: Job }>(`/careers/admin/jobs/${id}`, payload);
      return data.item;
    } catch (err) { handleError(err); }
  },
};

// Contact
export const contact = {
  sendInquiry: async (payload: Omit<ContactInquiry, 'id' | 'isRead' | 'createdAt'>) => {
    try {
      const { data } = await http.post('/contact/inquiry', payload);
      return data.item;
    } catch (err) { handleError(err); }
  },
  sendB2B: async (formData: FormData) => {
    try {
      const { data } = await http.post('/contact/b2b', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.item;
    } catch (err) { handleError(err); }
  },
  listInquiries: async () => {
    try {
      const { data } = await http.get<{ contact: ContactInquiry[]; b2b: B2BInquiry[] }>('/contact/inquiries');
      return data;
    } catch (err) { handleError(err); }
  },
  markInquiryRead: async (id: number, type: 'contact' | 'b2b') => {
    try {
      const { data } = await http.patch<{ ok: boolean }>(`/contact/inquiries/${id}/read`, null, { params: { type } });
      return data.ok;
    } catch (err) { handleError(err); }
  },
};

// Cart
export const cart = {
  get: async () => {
    try {
      const { data } = await http.get<Cart>('/cart');
      return data;
    } catch (err) { handleError(err); }
  },
  addItem: async (productId: number, quantity = 1) => {
    try {
      const { data } = await http.post<Cart>('/cart/items', { productId, quantity });
      return data;
    } catch (err) { handleError(err); }
  },
  updateItem: async (itemId: number, quantity: number) => {
    try {
      const { data } = await http.put<Cart>(`/cart/items/${itemId}`, { quantity });
      return data;
    } catch (err) { handleError(err); }
  },
  removeItem: async (itemId: number) => {
    try {
      const { data } = await http.delete<Cart>(`/cart/items/${itemId}`);
      return data;
    } catch (err) { handleError(err); }
  },
};

// Orders
export const orders = {
  create: async (notes?: string) => {
    try {
      const { data } = await http.post<{ item: Order }>('/orders', { notes });
      return data.item;
    } catch (err) { handleError(err); }
  },
  list: async () => {
    try {
      const { data } = await http.get<{ items: Order[] }>('/orders');
      return data.items;
    } catch (err) { handleError(err); }
  },
  get: async (id: number) => {
    try {
      const { data } = await http.get<{ item: Order }>(`/orders/${id}`);
      return data.item;
    } catch (err) { handleError(err); }
  },
  updateStatus: async (id: number, status: string) => {
    try {
      const { data } = await http.put<{ item: Order }>(`/orders/${id}/status`, { status });
      return data.item;
    } catch (err) { handleError(err); }
  },
};

// Investors
export const investors = {
  listDocuments: async (params?: { type?: string; year?: number }) => {
    try {
      const { data } = await http.get<{ items: InvestorDocument[] }>('/investors/documents', { params });
      return data.items;
    } catch (err) { handleError(err); }
  },
  listNews: async (params?: { category?: string; skip?: number; take?: number }) => {
    try {
      const { data } = await http.get<PaginatedResponse<NewsArticle>>('/investors/news', { params });
      return data;
    } catch (err) { handleError(err); }
  },
};
