# Kumar Inventory Search Application

> **Production-ready** full-stack inventory search system for Hero MotoCorp price lists.  
> Spring Boot 3 + React 18 + MySQL 8 + JWT Auth + Docker

---

## Table of Contents
1. [Architecture](#architecture)
2. [Project Structure](#project-structure)
3. [Quick Start (Local Development)](#quick-start)
4. [Default Credentials](#default-credentials)
5. [API Reference](#api-reference)
6. [File Purpose Guide](#file-purpose-guide)
7. [Deployment — Vercel + Railway](#deployment)
8. [AWS Deployment Guide](#aws-deployment)
9. [Environment Variables](#environment-variables)

---

## Architecture

```
React Frontend (Vercel / Nginx)
        ↓  HTTPS + JWT
Spring Boot REST API (Railway / Render / AWS EC2)
        ↓  JPA / JDBC
MySQL Database (Railway / AWS RDS)
```

---

## Project Structure

```
Kumar/
├── backend/                          ← Spring Boot 3 (Java 21)
│   ├── src/main/java/com/kumar/inventory/
│   │   ├── InventoryApplication.java
│   │   ├── config/                   ← SecurityConfig, CorsConfig, OpenApiConfig, DataInitializer
│   │   ├── controller/               ← AuthController, InventoryController, UploadController, DashboardController
│   │   ├── dto/                      ← Request & Response DTOs
│   │   ├── entity/                   ← User, InventoryItem, UploadHistory, LoginHistory, InventoryBackup
│   │   ├── exception/                ← GlobalExceptionHandler, custom exceptions
│   │   ├── repository/               ← Spring Data JPA repositories
│   │   ├── security/                 ← JWT filter, token provider, UserDetailsService
│   │   └── service/                  ← AuthService, ExcelService, InventoryService, BackupService, DashboardService, ExcelExportService
│   ├── src/main/resources/
│   │   └── application.yml           ← Main config (environment-variable driven)
│   ├── Dockerfile
│   └── pom.xml
│
├── frontend/                         ← React 18 + Vite + Material UI v5
│   ├── src/
│   │   ├── api/                      ← Axios instance + all endpoint functions
│   │   ├── auth/                     ← AuthContext, ProtectedRoute
│   │   ├── components/               ← InventoryGrid, UploadDialog, Navbar, StatsCards, etc.
│   │   ├── hooks/                    ← useDebounce
│   │   ├── pages/                    ← LoginPage, AdminDashboard, EmployeeDashboard
│   │   └── theme/                    ← MUI dark theme
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
├── docker-compose.yml                ← Full local stack
├── .github/workflows/                ← CI/CD pipelines
│   ├── backend-ci.yml
│   └── frontend-ci.yml
└── STOCK UPDATE.xlsx                 ← Source data file
```

---

## Quick Start

### Prerequisites
- Java 21 (e.g., Eclipse Temurin)
- Maven 3.9+
- Node.js 20+
- MySQL 8 (or use Docker Compose)
- Git

### Option A: Using Docker Compose (Recommended)

```bash
# Start everything (MySQL + Backend + Frontend)
docker-compose up --build

# Access:
#   Frontend  → http://localhost:3000
#   Backend   → http://localhost:8080
#   Swagger   → http://localhost:8080/swagger-ui.html
```

### Option B: Manual Local Development

**1. Start MySQL**
```bash
# Using Docker for MySQL only:
docker run -d --name mysql_dev -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=inventory_db -p 3306:3306 mysql:8.3
```

**2. Start Backend**
```bash
cd backend
mvn spring-boot:run
# API → http://localhost:8080
# Swagger → http://localhost:8080/swagger-ui.html
```

**3. Start Frontend**
```bash
cd frontend
npm install
npm run dev
# App → http://localhost:5173
```

---

## Default Credentials

> ⚠️ **Change these immediately in production!**

| Username | Password | Role |
|---|---|---|
| `admin` | `Admin@123` | ADMIN |
| `employee` | `Employee@123` | EMPLOYEE |

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → returns JWT |
| POST | `/api/auth/refresh` | Public | Refresh access token |
| GET | `/api/inventory/search` | Any | Paginated search |
| GET | `/api/inventory/export` | Any | Export results to .xlsx |
| POST | `/api/upload/excel` | ADMIN | Upload & replace inventory |
| GET | `/api/dashboard/stats` | ADMIN | Dashboard statistics |
| GET | `/api/dashboard/upload-history` | ADMIN | Upload audit log |
| GET | `/api/dashboard/login-history` | ADMIN | Login audit log |

**Search Query Parameters:**
```
GET /api/inventory/search?keyword=Deluxe&page=0&size=25&sortBy=modelDescription&sortDir=asc
```

---

## File Purpose Guide

### Backend

| File | Purpose |
|---|---|
| `InventoryApplication.java` | Spring Boot entry point |
| `SecurityConfig.java` | Spring Security 6, JWT, RBAC, CORS |
| `JwtTokenProvider.java` | JWT token generation & validation (jjwt 0.12) |
| `JwtAuthenticationFilter.java` | Reads Bearer token from every request |
| `CustomUserDetailsService.java` | Loads users from DB for Spring Security |
| `DataInitializer.java` | Seeds default admin & employee on first startup |
| `InventoryItem.java` | JPA entity — 18 typed columns from Excel |
| `ExcelService.java` | Apache POI Excel parser — skips rows 1-2, reads headers from row 3, imports data from row 4+ |
| `BackupService.java` | Copies current inventory to `inventory_backup` table before replacing |
| `InventoryService.java` | Paginated case-insensitive search with sorting |
| `ExcelExportService.java` | Generates styled .xlsx export from search results |
| `DashboardService.java` | Aggregates stats (record count, upload history, login history) |
| `GlobalExceptionHandler.java` | Uniform JSON error responses for all exceptions |

### Frontend

| File | Purpose |
|---|---|
| `theme/theme.js` | MUI dark navy theme with blue accent |
| `api/axios.js` | Axios instance with JWT interceptor & auto-refresh |
| `api/endpoints.js` | All API call functions in one place |
| `auth/AuthContext.jsx` | React context for auth state (login/logout/tokens) |
| `auth/ProtectedRoute.jsx` | Route guard — redirects unauthenticated users |
| `pages/LoginPage.jsx` | Glassmorphism login card with animated background |
| `pages/AdminDashboard.jsx` | Admin home — stats cards, upload, history tables |
| `pages/EmployeeDashboard.jsx` | Employee home — search + inventory grid |
| `components/InventoryGrid.jsx` | Full data table with search, sort, pagination, highlight, export |
| `components/RowDetailDialog.jsx` | Full-record popup when clicking a row |
| `components/UploadDialog.jsx` | Drag-and-drop Excel uploader with progress |
| `components/Navbar.jsx` | Top nav with role-based Upload button |
| `hooks/useDebounce.js` | 400ms debounce for search input |
| `nginx.conf` | Nginx config for SPA routing + API proxy |

---

## Deployment

### Vercel + Railway + MySQL (Railway)

#### Step 1 — MySQL on Railway
1. Create a free Railway project → **Add MySQL** plugin
2. Note the `DATABASE_URL`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLHOST`, `MYSQLPORT`

#### Step 2 — Spring Boot on Railway
1. Push the `backend/` folder to GitHub
2. In Railway → **New Service → GitHub Repo**
3. Set environment variables:
   ```
   DB_URL=jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
   DB_USERNAME=<MYSQLUSER>
   DB_PASSWORD=<MYSQLPASSWORD>
   JWT_SECRET=<generate-a-strong-64-char-secret>
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   PORT=8080
   ```
4. Railway auto-detects Dockerfile and builds

#### Step 3 — React on Vercel
1. Push the entire project to GitHub
2. Import in Vercel → set **Root Directory** to `frontend`
3. Set environment variable:
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
4. Deploy!

---

## AWS Deployment Guide

### Option A: EC2 + RDS + CloudFront (Production-grade)

```
CloudFront (HTTPS CDN)
    ↓
S3 (React static files)     EC2 (Spring Boot + Docker)
                                    ↓
                             RDS MySQL (Multi-AZ)
```

**Steps:**
1. **RDS** → Create MySQL 8 instance (db.t3.micro free tier)
2. **EC2** → t3.small, install Docker, pull image from GHCR
3. **S3** → `aws s3 sync dist/ s3://your-bucket --delete`
4. **CloudFront** → Distribution pointing to S3, custom error page for SPA
5. **ALB** → Application Load Balancer → EC2 (with HTTPS via ACM certificate)

**Docker on EC2:**
```bash
# Pull and run backend
docker pull ghcr.io/yourorg/inventory-backend:latest
docker run -d -p 8080:8080 \
  -e DB_URL=jdbc:mysql://your-rds.amazonaws.com:3306/inventory_db \
  -e DB_USERNAME=admin \
  -e DB_PASSWORD=yourpassword \
  -e JWT_SECRET=yoursecret \
  -e CORS_ALLOWED_ORIGINS=https://your-cloudfront.net \
  ghcr.io/yourorg/inventory-backend:latest
```

### Option B: ECS Fargate (Serverless containers)
- Use `docker-compose.yml` adapted for ECS with `ecs-cli compose`
- RDS for MySQL, ECR for images

---

## Environment Variables

### Backend

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | `jdbc:mysql://localhost:3306/inventory_db...` | Full JDBC URL |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `root` | MySQL password |
| `JWT_SECRET` | (weak default) | **Must change in production** — 64+ char base64 string |
| `PORT` | `8080` | Server port |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated allowed origins |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | Backend API base URL |

---

## Excel Upload Workflow

```
Admin uploads STOCK UPDATE.xlsx
    ↓
ExcelService opens workbook
    ↓
Skips Row 1 (title) and Row 2 (column numbers)
    ↓
Reads column headers from Row 3
    ↓
Imports data rows 4 → 163+ into Java objects
    ↓
BackupService copies ALL current inventory_items → inventory_backup (with batch ID)
    ↓
Deletes all inventory_items (TRUNCATE via deleteAllInBatch)
    ↓
Batch-saves new items → inventory_items
    ↓
Saves UploadHistory record (status=SUCCESS, recordsImported=N)
    ↓
Returns { recordsImported: N, fileName, sheetName, uploadedAt }
```

---

*Generated by Antigravity AI — Kumar Inventory v1.0.0*
