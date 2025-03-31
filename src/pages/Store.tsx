import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useStores } from '@/hooks/useStores';
import type { Product } from '@/lib/api/types';

const Store = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { products = [], loading: productsLoading, error: productsError } = useProducts();
  const { stores = [], loading: storesLoading, error: storesError } = useStores();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Combine products with store information
  useEffect(() => {
    if (Array.isArray(products) && Array.isArray(stores)) {
      const productsWithStore = products.map(product => {
        const store = stores.find(s => s.id === product.storeId);
        return {
          ...product,
          storeName: store?.name || 'Unknown Store'
        };
      });
      setFilteredProducts(productsWithStore);
    }
  }, [products, stores]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!Array.isArray(products) || !Array.isArray(stores)) {
      return;
    }
    
    const productsWithStore = products.map(product => {
      const store = stores.find(s => s.id === product.storeId);
      return {
        ...product,
        storeName: store?.name || 'Unknown Store'
      };
    });

    const filtered = productsWithStore.filter(
      product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.storeName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  if (productsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24">
          <div className="container-custom text-center">
            <h2 className="text-2xl text-red-500">Error loading products</h2>
            <p className="text-gray-600">{productsError.message}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <section className="py-16">
          <div className="container-custom">
            <h1 className="text-4xl font-display font-bold mb-8 text-center">
              {productsLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading experiences...</span>
                </div>
              ) : (
                'Available Experiences'
              )}
            </h1>

            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
              <div className="flex gap-4">
                <Input
                  type="text"
                  placeholder="Search experiences or stores..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={productsLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>

            <h2 className="text-3xl font-display font-semibold mb-8 text-center">
              {productsLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Loading experiences...</span>
                </div>
              ) : filteredProducts.length > 0 ? (
                'Available Experiences'
              ) : (
                'No experiences found'
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <Link 
                  to={`/product/${product._id}`} 
                  key={product._id}
                  className="group"
                >
                  <div className="bg-card rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      <img
                        src={product.image || '/placeholder.jpg'}
                        alt={product.name}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-gifty-500 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gifty-500">
                          ${product.price}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {product.storeName}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Store;
