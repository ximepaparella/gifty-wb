import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';
import { CartProvider } from '@/contexts/CartContext';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <CartProvider>
          {component}
        </CartProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('App Component', () => {
  it('renders the main layout', () => {
    renderWithProviders(<App />);
    
    // The Index page should be rendered by default (at path '/')
    expect(screen.getByText('Gifty')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('How it Works')).toBeInTheDocument();
  });
}); 