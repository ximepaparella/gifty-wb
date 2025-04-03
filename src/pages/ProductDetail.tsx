import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, Calendar, Gift, Loader2 } from 'lucide-react';
import VoucherFormModal from '@/components/VoucherFormModal';
import { useProduct } from '@/hooks/useProducts';
import { useStore } from '@/hooks/useStores';
import type { Product } from '@/lib/api/types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { product, loading: productLoading, error: productError } = useProduct(id || '');
  const { store, loading: storeLoading, error: storeError } = useStore(product?.storeId || '');

  if (productLoading || storeLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24">
          <div className="container-custom flex items-center justify-center min-h-[60vh]">
            <div className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-gifty-500" />
              <span className="text-lg text-gray-600">Loading product details...</span>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24">
          <div className="container-custom text-center">
            <h2 className="text-2xl text-red-500">Error loading product</h2>
            <p className="text-gray-600">{productError?.message || 'Product not found'}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleBuyNow = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24 pb-16">
        <div className="container-custom">
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="relative h-[400px] md:h-full overflow-hidden">
                <img 
                  src={product.image || '/placeholder.jpg'} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <button 
                  className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-all duration-300"
                  onClick={() => toast({
                    title: "Added to Favorites",
                    description: `${product.name} has been added to your favorites.`,
                    duration: 3000,
                  })}
                >
                  <Heart className="h-6 w-6 text-gifty-500" />
                </button>
              </div>
              
              {/* Product Info */}
              <div className="p-8">
                <div className="flex flex-col h-full">
                  <div className="mb-auto">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2 text-gray-900">{product.name}</h1>
                    <p className="text-lg text-gifty-500 mb-3">{store?.name || 'Loading store...'}</p>
                    
                    <p className="text-gray-700 mb-6">{product.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gifty-500" />
                        <span className="text-gray-700">{store?.address || 'Address not available'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-gifty-500" />
                        <span className="text-gray-700">Valid for 12 months</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift className="h-5 w-5 text-gifty-500" />
                        <span className="text-gray-700">Digital Voucher</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-3xl font-bold text-gray-900">${product.price}</div>
                  </div>
                  
                  <div className="flex justify-center">
                    <Button 
                      className="w-full md:w-auto md:min-w-[200px] bg-gifty-500 hover:bg-gifty-600 text-white"
                      size="lg"
                      onClick={handleBuyNow}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <VoucherFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={{
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image || '/placeholder.jpg',
          store: store?.name || 'Unknown Store',
          storeId: store?._id || product.storeId
        }}
      />
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
