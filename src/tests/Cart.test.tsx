import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Cart from '../pages/Cart';
import { CartProvider } from '@/contexts/CartContext';
import { BrowserRouter } from 'react-router-dom';

// Mock the useToast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

// Mock the CartContext
const mockCartContext = {
  items: [],
  totalPrice: 0,
  totalItems: 0,
  removeItem: jest.fn(),
  updateQuantity: jest.fn(),
  addItem: jest.fn(),
  clearCart: jest.fn(),
};

jest.mock('@/contexts/CartContext', () => ({
  ...jest.requireActual('@/contexts/CartContext'),
  useCart: () => mockCartContext,
}));

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <BrowserRouter>
      <CartProvider>
        {component}
      </CartProvider>
    </BrowserRouter>
  );
};

describe('Cart Component', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    mockCartContext.items = [];
    mockCartContext.totalPrice = 0;
    mockCartContext.totalItems = 0;
  });

  it('shows empty cart message when cart is empty', () => {
    renderWithProviders(<Cart />);
    
    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Browse Vouchers')).toBeInTheDocument();
  });

  it('displays cart items and allows quantity updates', () => {
    // Set up cart items for this test
    mockCartContext.items = [
      {
        id: '1',
        name: 'Test Voucher',
        store: 'Test Store',
        price: 10,
        quantity: 1,
        image: 'test.jpg',
      },
    ];
    mockCartContext.totalPrice = 10;
    mockCartContext.totalItems = 1;

    renderWithProviders(<Cart />);
    
    // Check if the item is displayed
    expect(screen.getByText('Test Voucher')).toBeInTheDocument();
    expect(screen.getByText('Test Store')).toBeInTheDocument();
    
    // Find the increase quantity button by its class and icon
    const buttons = screen.getAllByRole('button');
    const increaseButton = buttons.find(button => 
      button.className.includes('border-l') && 
      button.querySelector('svg.lucide-plus')
    );
    
    if (!increaseButton) throw new Error('Could not find increase quantity button');
    
    fireEvent.click(increaseButton);
    expect(mockCartContext.updateQuantity).toHaveBeenCalledWith('1', 2);
  });
}); 