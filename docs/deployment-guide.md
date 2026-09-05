# DealFlow360 â€” Deployment & Local Operations Guide

## 1. Prerequisites
- Docker Desktop with Docker Compose
- Node.js >= 20.x
- Git

---

## 2. Starting PostgreSQL Container
```powershell
# From the repository root:
docker compose up -d
# Verify database health:
docker compose ps
```

---

## 3. Environment Configuration
Copy `.env.example` to `.env` in both `frontend` and `backend` (never commit `.env` files).

### Backend `.env.example`
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://dealflow_user:dealflow_password@localhost:5432/dealflow360_db
JWT_SECRET=replace_with_super_secret_jwt_key_at_least_32_chars
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env.example`
```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 4. Running the Application Locally
```powershell
# Backend (Terminal 1)
cd backend
npm install
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```
