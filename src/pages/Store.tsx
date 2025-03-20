
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock product data
const mockProducts = [
  { 
    id: 1, 
    name: 'Spa Day Package', 
    store: 'Serenity Spa', 
    price: 120, 
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2940&auto=format&fit=crop'
  },
  { 
    id: 2, 
    name: 'Fine Dining Experience', 
    store: 'Gourmet Restaurant', 
    price: 150, 
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=2940&auto=format&fit=crop' 
  },
  { 
    id: 3, 
    name: 'Wine Tasting Tour', 
    store: 'Vineyard Ventures', 
    price: 80, 
    image: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=2940&auto=format&fit=crop' 
  },
  { 
    id: 4, 
    name: 'Photography Session', 
    store: 'Capture Moments', 
    price: 200, 
    image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?q=80&w=2932&auto=format&fit=crop' 
  },
  { 
    id: 5, 
    name: 'Cooking Class', 
    store: 'Culinary Arts', 
    price: 90, 
    image: 'https://images.unsplash.com/photo-1556909114-44e3e9699e2b?q=80&w=2940&auto=format&fit=crop' 
  },
  { 
    id: 6, 
    name: 'Adventure Day Trip', 
    store: 'Wild Expeditions', 
    price: 140, 
    image: 'https://images.unsplash.com/photo-1533130061792-64b345e4a833?q=80&w=2940&auto=format&fit=crop' 
  },
];

const Store = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = mockProducts.filter(
      product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.store.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section with Search */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gifty-100/40 to-white z-0"></div>
          <div className="absolute top-1/4 -left-64 w-96 h-96 bg-gifty-300/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 -right-64 w-96 h-96 bg-gifty-500/20 rounded-full filter blur-3xl"></div>
          
          <div className="container-custom relative z-10">
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gifty-600 to-gifty-800">
                Discover Perfect Gift Experiences
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Search for unique services and products to gift to your loved ones
              </p>
              
              <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                <Input
                  type="text"
                  placeholder="Search for experiences, stores or services..."
                  className="w-full px-5 py-6 text-lg rounded-full shadow-soft focus:shadow-hover transition-all duration-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-gifty-500 hover:bg-gifty-600 rounded-full p-3"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </div>
        </section>
        
        {/* Products Grid */}
        <section className="py-16 bg-white">
          <div className="container-custom">
            <h2 className="text-3xl font-display font-semibold mb-8 text-center">
              {filteredProducts.length > 0 
                ? 'Available Experiences' 
                : 'No experiences found'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id}
                  className="group"
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-soft transition-all duration-300 hover:shadow-hover hover:-translate-y-1">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-display font-medium text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-gifty-500 mb-2">{product.store}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">${product.price}</span>
                        <span className="text-sm text-gray-500">Gift Voucher</span>
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
