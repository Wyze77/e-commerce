# VAUX — E-Commerce Frontend

A clean, editorial e-commerce frontend built with React + Vite. No backend — data served from a static JSON file.

## Stack
- **React 18** + **Vite 5**
- **React Router v6**
- **CSS Modules** (scoped styles, zero runtime overhead)
- **Context + useReducer** for global state
- **localStorage** for cart + wishlist persistence

## Project Structure

```
vaux-shop/
├── public/
│   └── products.json          # 18 products across 4 categories
├── src/
│   ├── components/
│   │   ├── Filters.jsx        # Category/price/color/size filters
│   │   ├── Navbar.jsx         # Responsive nav with cart+wishlist counts
│   │   ├── ProductCard.jsx    # Card with hover image switch
│   │   ├── QuantitySelector.jsx
│   │   └── Toast.jsx          # Slide-in notifications
│   ├── context/
│   │   └── StoreContext.jsx   # Cart, wishlist, toast reducer
│   ├── hooks/
│   │   └── useProducts.js     # Fetch+cache products.json
│   ├── pages/
│   │   ├── Home.jsx           # Hero, categories, featured
│   │   ├── Shop.jsx           # Filtered/sorted product grid
│   │   ├── ProductDetail.jsx  # Gallery, variants, add to cart
│   │   ├── Cart.jsx           # Items, qty, summary
│   │   ├── Wishlist.jsx       # Saved items, move to cart
│   │   └── NotFound.jsx       # 404
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css              # Design tokens + global styles
└── index.html
```

## Quick Start

```bash
# 1. Copy the project folder, then install dependencies
cd vaux-shop
npm install

# 2. Start dev server
npm run dev
# → http://localhost:5173

# 3. Build for production
npm run build
npm run preview
```

> **No configuration needed.** `products.json` is served from `/public` by Vite automatically.

## Features

| Feature | Details |
|---|---|
| Search | Name, brand, and tag matching |
| Filters | Category, price range, color, size (multi-select) |
| Sort | Newest, Price low→high, Price high→low |
| Product page | Image gallery, color+size picker (stock-aware), qty selector |
| Cart | Unique by product+color+size, qty update, remove, clear |
| Wishlist | Add/remove, one-click move to cart |
| Toasts | Slide-in feedback for all cart/wishlist actions |
| Responsive | Mobile-first, works from 320px → 1440px+ |
| Persistence | Cart + wishlist survive page refresh via localStorage |
