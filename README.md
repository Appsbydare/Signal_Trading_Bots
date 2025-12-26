# 🤖 Signal Trading Bot - Web Platform

A comprehensive Next.js web platform for managing and distributing automated trading bot licenses with integrated payment processing, admin dashboard, and customer support.

## 🚀 Features

- **License Management System** - Generate, validate, and manage trading bot licenses
- **Payment Integration** - Stripe and cryptocurrency payment support
- **Admin Dashboard** - Comprehensive admin panel for managing users, licenses, and content
- **Customer Portal** - User-friendly portal for license activation and management
- **Support System** - Integrated ticketing system and live chat support
- **Content Management** - Dynamic FAQ, news, and promotional content management
- **SEO Optimized** - Built-in SEO features with sitemap generation
- **Responsive Design** - Modern, mobile-friendly UI with Tailwind CSS

## 📋 Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- PostgreSQL database (via Supabase)
- Stripe account for payment processing
- MT5 trading platform (for bot integration)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd signal_trading_bots
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret

   # JWT
   JWT_SECRET=your_jwt_secret

   # Admin
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD_HASH=your_bcrypt_hash
   ```

4. **Set up the database**
   
   Run the SQL migrations in order:
   ```bash
   # Execute files in database/ folder in your PostgreSQL database
   # 1. license-schema.sql
   # 2. database/001_add_license_security_columns.sql
   # 3. database/002_create_validation_log_table.sql
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
signal_trading_bots/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/             # Admin dashboard pages
│   │   ├── api/               # API routes
│   │   ├── portal/            # Customer portal
│   │   └── ...                # Public pages (home, products, etc.)
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility functions and configurations
│   └── data/                  # Static data and content
├── public/                    # Static assets served by Next.js
│   ├── images/               # Public images
│   ├── fonts/                # Custom fonts
│   └── docs/                 # Public documentation
├── docs/                      # Project documentation
│   ├── planning/             # Planning documents and requirements
│   ├── specs/                # Technical specifications
│   ├── images/               # Documentation screenshots
│   └── notes/                # Development notes
├── database/                  # Database schemas and migrations
│   ├── migrations/           # SQL migration files
│   └── *.sql                 # Schema files
├── assets/                    # Source assets (logos, icons, etc.)
├── broker_logos/             # Trading broker logos
├── data/                      # Application data (JSON files)
└── sample_csv/               # Sample data files

```

## 🔑 Key Technologies

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL (Supabase)
- **Authentication:** JWT with bcrypt
- **Payments:** Stripe API
- **Animation:** Framer Motion
- **PDF Generation:** jsPDF
- **QR Codes:** qrcode.react

## 📚 Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get started quickly
- **[API Endpoints](docs/specs/API_ENDPOINTS.md)** - API documentation
- **[Payment System Plan](docs/planning/PAYMENT_SYSTEM_PLAN.txt)** - Payment integration details
- **[SEO Plan](docs/planning/seo_plan.md)** - SEO strategy and implementation
- **[Product Specifications](docs/Mini%20Bot%20V13.1_spec_sheet.pdf)** - Trading bot specifications

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Deploy to Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com):

1. Push your code to GitHub
2. Import your repository to Vercel
3. Configure environment variables
4. Deploy!

See [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔐 Security Features

- License key encryption and validation
- Secure password hashing with bcrypt
- JWT-based authentication
- Rate limiting on API endpoints
- Validation logging for security auditing
- Environment variable protection

## 🎨 Admin Features

- User and license management
- Content management (FAQs, news, help videos)
- Support ticket system
- Analytics and reporting
- Promotional image management
- Agent management

## 🛡️ License

This project is proprietary software. All rights reserved.

## 📞 Support

For support inquiries, please use:
- **Live Chat:** Available on the website
- **Support Tickets:** Through the admin portal
- **Email:** Contact through the website contact form

## 🔄 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Quality

- ESLint configured for Next.js
- TypeScript for type safety
- Organized folder structure
- Component-based architecture

---

**Built with ❤️ using Next.js and modern web technologies**
