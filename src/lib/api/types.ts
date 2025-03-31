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
  description: string;
  logo: string;
  address: string;
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
    message: string;
    template: string;
  };
  createdAt: string;
  updatedAt: string;
  __v: number;
} 