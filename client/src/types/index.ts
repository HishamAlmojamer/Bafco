export interface Category {
  id: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  imageUrl?: string;
  sortOrder: number;
  _count?: { products: number };
  products?: Product[];
}

export interface Product {
  id: number;
  nameAr: string;
  nameEn: string;
  slug: string;
  descriptionAr?: string;
  descriptionEn?: string;
  shortDescAr?: string;
  shortDescEn?: string;
  price: number;
  imageUrl?: string;
  sku?: string;
  barcode?: string;
  unitSize?: string;
  isActive: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
  categoryId?: number;
  category?: Category;

  servingSize?: string;
  calories?: number;
  totalFat?: string;
  saturatedFat?: string;
  transFat?: string;
  cholesterol?: string;
  sodium?: string;
  totalCarbs?: string;
  dietaryFiber?: string;
  sugars?: string;
  protein?: string;
  calcium?: string;
  iron?: string;

  allergenWarningAr?: string;
  allergenWarningEn?: string;
  ingredientsAr?: string;
  ingredientsEn?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  departmentAr: string;
  departmentEn: string;
  locationAr: string;
  locationEn: string;
  typeAr: string;
  typeEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  requirementsAr?: string;
  requirementsEn?: string;
  salaryMin?: number;
  salaryMax?: number;
  status?: string;
  createdAt: string;
}

export interface JobApplication {
  id: number;
  jobId: number;
  fullNameAr: string;
  fullNameEn?: string;
  email: string;
  phone: string;
  coverLetter?: string;
  cvUrl: string;
  portfolioUrl?: string;
  linkedInUrl?: string;
  status: string;
  job?: { titleAr: string; titleEn: string };
  createdAt: string;
}

export interface ContactInquiry {
  id: number;
  type: InquiryType;
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface B2BInquiry {
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  type: InquiryType;
  message: string;
  attachments?: string;
  isRead: boolean;
  createdAt: string;
}

export interface InvestorDocument {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  type: string;
  fileUrl: string;
  year?: number;
  quarter?: number;
  isPublished?: boolean;
  createdAt: string;
}

export interface NewsArticle {
  id: number;
  titleAr: string;
  titleEn: string;
  slug: string;
  excerptAr?: string;
  excerptEn?: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  role: string;
}

export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  product: Product;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  createdAt: string;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  status: string;
  total: number;
  shippingAddress?: string;
  shippingCity?: string;
  shippingPhone?: string;
  shippingEmail?: string;
  deliveryFee?: number;
  notes?: string;
  user?: { id: number; name?: string; email: string; phone?: string };
  createdAt: string;
  updatedAt: string;
}

export type InquiryType = 'GENERAL' | 'DISTRIBUTOR' | 'SUPPLIER' | 'PARTNERSHIP' | 'COMPLAINT';

export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}

export interface ApiError {
  error: string;
}
