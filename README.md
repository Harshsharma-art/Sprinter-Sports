# Sprinter Sports - E-commerce with Admin Panel

Complete sports equipment e-commerce website with admin panel and Node.js backend.

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
npm start
```

The API will run on http://localhost:3001

### 3. Open Main Website
Open `index.html` in your browser - products will load from the API

### 4. Open Admin Panel
Open `admin/index.html` in your browser

**Admin Credentials:**
- Email: `admin@sprinter.com`
- Password: `admin123`

## Features

### Main Website
- Dynamic product loading from API
- Best Sellers and New Arrivals sections
- Categories carousel
- Flash sale countdown
- Customer testimonials
- Fully responsive design

### Admin Panel
- Secure JWT authentication
- Dashboard with stats overview
- Product management (CRUD operations)
- Price updates
- Inventory management
- Real-time updates to main website

## API Endpoints

### Public
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product

### Protected (requires JWT token)
- `POST /api/auth/login` - Admin login
- `POST /api/products` - Add new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `PATCH /api/products/:id/price` - Update price only
- `PATCH /api/products/:id/stock` - Update stock only

## Testing Flow

1. Start backend: `npm start`
2. Open admin panel → login with credentials
3. Add a new product → save
4. Refresh main website → new product appears ✅
5. Change a price in admin → refresh main site ✅
6. Delete a product → gone from main site ✅

## File Structure
```
sprinter-sports/
├── index.html          # Main storefront
├── styles.css          # Main styles
├── script.js           # Main JS (API connected)
├── backend/
│   ├── server.js       # Express server
│   ├── db.js           # Database operations
│   ├── routes/
│   │   ├── auth.js     # Authentication
│   │   └── products.js # Product CRUD
│   ├── middleware/
│   │   └── auth.js     # JWT verification
│   └── data/
│       └── products.json # Product database
├── admin/
│   ├── index.html      # Admin panel UI
│   ├── styles.css      # Admin styles
│   └── script.js       # Admin logic
├── package.json
└── .env                # Environment variables
```

## Security
- JWT tokens expire after 8 hours
- All admin routes protected with JWT middleware
- Passwords stored in environment variables
- CORS enabled for local development
