export interface User {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  displayName?: string;
  photoURL?: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  sku: string;
  images: string[];
  categoryId: string;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  address: {
    fullName: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentIntentId?: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percent' | 'flat';
  value: number;
  expiryDate: string;
  isActive: boolean;
}

export interface Media {
  id: string;
  url: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: any[];
  status: 'draft' | 'published';
  seo: {
    title?: string;
    description?: string;
  };
  createdAt: string;
}

export interface Menu {
  id: string;
  name: string;
  items: {
    label: string;
    path: string;
    children?: any[];
  }[];
}
