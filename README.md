# Gifty - Gift Voucher Platform

A modern web application for creating and managing digital gift vouchers for small businesses.

## Features

- 🎨 Beautiful voucher templates with customization options
- 💳 Multiple payment methods integration (Stripe, PayPal, Mercado Pago)
- 📱 Responsive design for all devices
- 🔒 Secure checkout process
- 📧 Instant email delivery of vouchers
- 🛍️ User-friendly store interface
- 🛒 Shopping cart functionality
- 📊 Order tracking and management

## Documentation

For detailed technical documentation about the platform's flows, implementation details, and architecture, please refer to our [Technical Documentation](./documentation.md). The documentation includes:

- Complete flow descriptions for voucher purchase and store management
- Technical implementation details
- Data models and API structures
- Security considerations
- Performance optimizations
- Future enhancement plans

## Tech Stack

- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Router
- React Query
- Axios
- Lucide Icons
- React Hook Form
- Zod
- Sonner (Toasts)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gifty-wb.git
cd gifty-wb
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:8080`.

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # Shadcn UI components
│   └── templates/     # Voucher template components
├── contexts/          # React context providers
├── hooks/             # Custom React hooks
├── lib/              # Utilities and API services
│   ├── api/          # API integration
│   └── utils/        # Helper functions
├── pages/            # Application pages/routes
└── types/            # TypeScript type definitions
```

## Features in Detail

### Voucher Creation
- Multiple template designs
- Customizable messages and styling
- Preview functionality
- Sender and recipient information

### Shopping Cart
- Add/remove items
- Quantity adjustment
- Price calculations
- Order summary

### Checkout Process
- Multi-step form
- Customer information collection
- Payment method selection
- Order review
- Success/Error handling

### Store Management
- Product listing
- Product details
- Store information
- Social media integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
