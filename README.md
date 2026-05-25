# Prabha Signs and Stickers – Deployment Notes

## Conversation Log (Saved for Reference)

The following is a summary of the recent troubleshooting conversation that helped resolve deployment issues on Render and Vercel. It is captured here for future reference.

---

### Issue Encountered
- **Render Port‑scan timeout**: "Port scan timeout reached, failed to detect open port 5000 from PORT environment variable. Bind your service to port 5000 or update the PORT environment variable to the correct port."

### Root Cause
- The backend `.env` file forced `PORT=5000`, overriding Render’s dynamically assigned port.
- Dockerfile exposed only `EXPOSE 5000`, limiting Render’s health‑check.

### Fix Implemented
1. **Removed static `PORT` variable** from `backend/.env`.
2. **Updated Dockerfile**:
   ```Dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --omit=dev
   COPY . .

   FROM node:20-alpine
   WORKDIR /app
   COPY --from=builder /app .
   ENV NODE_ENV=production
   EXPOSE 0-65535   # allow any Render‑assigned port
   CMD ["node", "server.js"]
   ```
3. **Committed & pushed** the changes to GitHub.
4. **Redeployed** the service on Render – health‑check now passes.
5. **Configured Vercel** environment variable `VITE_API_URL` to point to the new Render backend URL.

### Verification Steps
- After redeploy, Render logs show `Server running on port <dynamic_port>`.
- Vercel preview works; API calls succeed (checked via Network tab).

---

### Additional Notes
- The backend `server.js` already falls back to port `5000` if `process.env.PORT` is not set, which is safe for local development.
- Vercel environment variables require the `VITE_` prefix to be exposed to the client bundle.
- Remember to keep the `.env` file out of version control (added to `.gitignore`).

---

*This README entry was automatically added on 2026‑05‑23 to preserve the troubleshooting workflow.*

---

## Building a Sticker Shop Website

### Project Overview
- **Purpose:** A full‑stack e‑commerce platform where users can browse, customize, and purchase stickers and signage.
- **Stack:**
  - Frontend: Vite (React/Vanilla) + TailwindCSS (optional) for a responsive UI.
  - Backend: Express.js + MongoDB Atlas for product catalog, orders, and user authentication.
  - Image storage: Cloudinary (already configured).
  - Deployment: Render (backend) + Vercel (frontend).

### Key Features
1. **Product Catalog** – List stickers with images, prices, and categories.
2. **Search & Filters** – Text search, category filter, and price range slider.
3. **Cart & Checkout** – Add items to a cart, view summary, and place an order.
4. **Admin Dashboard** – Manage products, update inventory, and view orders (admin user already seeded).
5. **Responsive Design** – Works on mobile, tablet, and desktop.
6. **Payment Integration (optional)** – Stripe or PayPal sandbox can be added later.

### Directory Layout
```
project-root/
├─ backend/            # Express API
│   ├─ models/        # Mongoose schemas (Product, Order, User, Admin)
│   ├─ routes/        # API routes
│   ├─ Dockerfile      # Render deployment
│   └─ .env            # Secrets (MongoDB, Cloudinary)
├─ src/                # Frontend source (Vite)
│   ├─ components/    # UI components (ProductCard, Cart, Navbar)
│   ├─ pages/        # Pages (Home, Shop, Checkout, Admin)
│   └─ vite.config.ts
├─ Dockerfile          # Frontend (nginx) for Vercel optional
└─ README.md          # Documentation
```

### Development Workflow
1. **Clone repo**
   ```bash
   git clone https://github.com/Govind-13/Prabha-Signs-and-Stickers.git
   cd Prabha-Signs-and-Stickers
   ```
2. **Backend**
   ```bash
   cd backend
   cp .env.example .env   # fill in MongoDB URI & Cloudinary keys
   npm install
   npm run dev            # runs on localhost:5000 (or $PORT)
   ```
3. **Frontend**
   ```bash
   cd ..
   npm install            # installs Vite dependencies
   npm run dev            # opens http://localhost:5173
   ```
4. **Testing** – Use Postman or the UI to create products, place orders, and verify admin routes.
5. **Deploy** – Follow the deployment notes already documented (Render for backend, Vercel for frontend). Ensure `VITE_API_URL` points to the Render service URL.

### Extending the Shop
- **User Authentication** – Add JWT‑based login/register endpoints.
- **Reviews & Ratings** – New `Review` model linked to products.
- **Analytics** – Integrate Google Analytics or Plausible for traffic insights.
- **CI/CD** – Set up GitHub Actions to lint, test, and auto‑deploy on push.

---

*This section was added to guide future developers on how to expand the repository into a full‑featured sticker shop.*
