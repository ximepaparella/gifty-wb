import { useState } from 'react';
import { orderService } from '../lib/api/services';
import type { Order } from '../lib/api/types';

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderService.create(orderData);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create order'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrderById = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderService.getById(id);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch order'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getOrdersByCustomer = async (customerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const orders = await orderService.getByCustomer(customerId);
      return orders;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch customer orders'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const redeemVoucher = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      const order = await orderService.redeemVoucher(code);
      return order;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to redeem voucher'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createOrder,
    getOrderById,
    getOrdersByCustomer,
    redeemVoucher
  };
}; 