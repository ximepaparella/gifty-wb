import api from './base';
import type { Product, Store, Order } from './types';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  getByStore: async (storeId: string): Promise<Product[]> => {
    const response = await api.get(`/products/store/${storeId}`);
    return response.data.data;
  }
};

export const storeService = {
  getAll: async (): Promise<Store[]> => {
    const response = await api.get('/stores');
    return response.data.data;
  },

  getById: async (id: string): Promise<Store> => {
    const response = await api.get(`/stores/${id}`);
    return response.data.data;
  }
};

export const orderService = {
  create: async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    const response = await api.post('/orders', orderData);
    return response.data.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  getByCustomer: async (customerId: string): Promise<Order[]> => {
    const response = await api.get(`/orders/customer/${customerId}`);
    return response.data.data;
  },

  getByVoucherCode: async (code: string): Promise<Order> => {
    const response = await api.get(`/orders/voucher/${code}`);
    return response.data.data;
  },

  redeemVoucher: async (code: string): Promise<Order> => {
    const response = await api.put(`/orders/voucher/${code}/redeem`);
    return response.data.data;
  }
}; 