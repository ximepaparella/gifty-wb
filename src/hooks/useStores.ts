import { useState, useEffect } from 'react';
import { storeService } from '../lib/api/services';
import type { Store } from '../lib/api/types';

export const useStores = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const data = await storeService.getAll();
        setStores(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch stores'));
      } finally {
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  return { stores, loading, error };
};

export const useStore = (id: string) => {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await storeService.getById(id);
        setStore(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch store'));
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  return { store, loading, error };
}; 