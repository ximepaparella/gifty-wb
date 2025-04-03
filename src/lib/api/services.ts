import api from './base';
import { Order, Product, Store, Customer, CreateOrderPayload } from './types';

export const customerService = {
  getOrCreate: async (customerData: { 
    fullName: string; 
    email: string; 
    phoneNumber: string;
    address: string;
    city: string;
    zipCode?: string;
    country: string;
    userId?: string | null;
  }): Promise<Customer> => {
    const response = await api.post<{ data: Customer }>('/customers/get-or-create', customerData);
    return response.data.data;
  },
};

export const orderService = {
  create: async (orderData: CreateOrderPayload): Promise<Order> => {
    const response = await api.post<{ data: Order }>('/orders', orderData);
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get<{ data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  getByCustomer: async (customerId: string): Promise<Order[]> => {
    const response = await api.get<{ data: Order[] }>(`/orders/customer/${customerId}`);
    return response.data.data;
  },

  getByVoucherCode: async (code: string): Promise<Order> => {
    const response = await api.get<{ data: Order }>(`/orders/voucher/${code}`);
    return response.data.data;
  },

  redeemVoucher: async (code: string): Promise<Order> => {
    const response = await api.post<{ data: Order }>(`/orders/voucher/${code}/redeem`);
    return response.data.data;
  }
};

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get<{ data: Product[] }>('/products');
    return response.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get<{ data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  getByStore: async (storeId: string): Promise<Product[]> => {
    const response = await api.get<{ data: Product[] }>(`/products/store/${storeId}`);
    return response.data.data;
  }
};

export const storeService = {
  getAll: async (): Promise<Store[]> => {
    const response = await api.get<{ data: Store[] }>('/stores');
    return response.data.data;
  },

  getById: async (id: string): Promise<Store> => {
    const response = await api.get<{ data: Store }>(`/stores/${id}`);
    return response.data.data;
  }
}; 