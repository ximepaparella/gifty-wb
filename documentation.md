# Gifty - Technical Documentation

This document provides detailed information about the implemented flows and technical aspects of the Gifty platform.

## Core Flows

### 1. Voucher Purchase Flow

#### 1.1 Product Selection
- User browses the store page
- Selects a voucher product
- Views product details including price, description, and store information

#### 1.2 Voucher Customization
- Opens voucher customization modal
- Fills in required information:
  - Sender's name and email
  - Recipient's name and email
  - Personal message
  - Template selection
- Preview functionality shows real-time template rendering
- Validation ensures all required fields are properly filled

#### 1.3 Cart Management
- Add voucher to cart
- View cart contents
- Adjust quantities
- Remove items
- View order summary with total price
- Proceed to checkout

#### 1.4 Checkout Process
The checkout process is implemented as a multi-step form:

1. **Customer Information Step**
   - Collects personal details:
     - Full name
     - Email address
     - Phone number
     - Shipping address
     - City
     - Zip code
     - Country
   - Validates all required fields
   - Email format validation
   - Phone number validation (minimum 7 digits)
   - Address validation

2. **Payment Method Selection**
   - Available payment methods:
     - Stripe (credit/debit cards)
     - PayPal
     - Mercado Pago
   - Clear visual indicators for selection
   - Payment method specific instructions

3. **Order Review**
   - Displays order summary:
     - Item details
     - Quantity
     - Price
     - Total amount
   - Shows customer information
   - Shows selected payment method
   - Option to go back and modify
   - Complete order button

4. **Order Processing**
   - Creates/retrieves customer record
   - Processes payment (mock implementation)
   - Creates order record
   - Generates voucher
   - Handles success/failure scenarios

### 2. Store Management Flow

#### 2.1 Store Information
- Store details display
- Social media integration
- Contact information
- Store policies

#### 2.2 Product Management
- Product listing
- Product details
- Image handling
- Price management

### 3. Error Handling

#### 3.1 Form Validation
- Real-time validation
- Error message display
- Field-specific validation rules
- Custom validation messages

#### 3.2 API Error Handling
- Network error handling
- API response validation
- User-friendly error messages
- Error state management

#### 3.3 Payment Error Handling
- Payment processing errors
- Transaction failure handling
- Recovery options
- User notification

## Technical Implementation Details

### 1. State Management
- React Context for cart management
- Local state for form handling
- React Query for API state management

### 2. API Integration
- RESTful API endpoints
- Axios for HTTP requests
- Request/response interceptors
- Error handling middleware

### 3. Form Handling
- Multi-step form implementation
- Form state management
- Validation rules
- Error handling

### 4. Payment Integration
- Payment gateway integration
- Payment method handling
- Transaction processing
- Payment status tracking

### 5. Routing
- React Router v6
- Protected routes
- Route parameters
- Navigation handling

### 6. UI Components
- Reusable component library
- Responsive design
- Accessibility features
- Loading states

## Data Models

### Customer
```typescript
interface Customer {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  userId?: string;
}
```

### Order
```typescript
interface Order {
  _id: string;
  customerId: string;
  paymentDetails: {
    paymentId: string;
    status: string;
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
    message?: string;
    template: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}
```

### Store
```typescript
interface Store {
  _id: string;
  name: string;
  description?: string;
  address: string;
  email: string;
  phone: string;
  logo?: string;
  social: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    youtube?: string;
    others?: Array<{
      name: string;
      url: string;
    }>;
  };
}
```

## Security Considerations

1. **Input Validation**
   - Server-side validation
   - Client-side validation
   - XSS prevention
   - SQL injection prevention

2. **Payment Security**
   - Secure payment processing
   - PCI compliance considerations
   - Encryption of sensitive data

3. **API Security**
   - Authentication
   - Authorization
   - Rate limiting
   - CORS configuration

## Performance Optimization

1. **Code Splitting**
   - Route-based code splitting
   - Component lazy loading
   - Dynamic imports

2. **Caching**
   - API response caching
   - React Query caching
   - Browser caching

3. **Image Optimization**
   - Lazy loading
   - Responsive images
   - Image compression

## Future Enhancements

1. **Authentication System**
   - User registration
   - Login/logout
   - Password recovery
   - Social login

2. **Advanced Features**
   - Voucher tracking
   - Analytics dashboard
   - Email notifications
   - PDF generation

3. **Integration Possibilities**
   - Additional payment gateways
   - CRM integration
   - Marketing tools
   - Analytics platforms 