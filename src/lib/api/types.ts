export interface Product {
  _id: string;
  storeId: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  storeName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Store {
  _id: string;
  name: string;
  ownerId: string;
  email: string;
  phone: string;
  address: string;
  logo: string;
  social: {
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    others: Array<{
      name: string;
      url: string;
      _id: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode?: string;
  country: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Order {
  _id: string;
  customerId: string;
  paymentDetails: {
    paymentId: string;
    paymentStatus: string;
    paymentEmail: string;
    amount: number;
    provider: string;
  };
  voucher: {
    storeId: string;
    productId: string;
    expirationDate: string;
    senderName: string;
    senderEmail: string;
    receiverName: string;
    receiverEmail: string;
    message?: string;
    template?: string;
    code?: string;
    isRedeemed?: boolean;
    redeemedAt?: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export type VoucherTemplate = 'template1' | 'template2' | 'template3' | 'template4' | 'template5';

export interface CreateOrderPayload {
  customerId: string;
  paymentDetails: {
    paymentId: string;
    paymentStatus: string;
    paymentEmail: string;
    amount: number;
    provider: string;
  };
  voucher: {
    storeId: string;
    productId: string;
    expirationDate: string;
    senderName: string;
    senderEmail: string;
    receiverName: string;
    receiverEmail: string;
    message?: string;
    template: VoucherTemplate;
  };
} 