# Guntur Civic Portal — Jan Seva

A full-stack MERN grievance management system for Guntur, Andhra Pradesh.  
Citizens report civic issues → Admin assigns to departments & officers → Officers resolve and submit proof.

---

## Colour Palette

| Name     | Hex       | Usage                          |
|----------|-----------|--------------------------------|
| Cream    | `#F0F1EB` | Page background                |
| Tan      | `#A78966` | Accents, sidebar links         |
| Olive    | `#B1A175` | Officer portal accents         |
| Terra    | `#A24A3D` | Primary CTA buttons, admin     |
| Charcoal | `#414048` | Sidebar, dark surfaces         |

---

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18 + Vite + Tailwind CSS          |
| Backend   | Node.js + Express.js                    |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT (jsonwebtoken) + bcryptjs           |
| File Upload | Multer + exifr (GPS extraction)       |
| Email OTP | Nodemailer (Gmail)                      |

---

## Project Structure

```
civic_portal/
├── backend/
│   ├── config/db.js
│   ├── middleware/auth.js        ← JWT middleware
│   ├── middleware/upload.js      ← Multer file upload
│   ├── models/
│   │   ├── User.js               ← Citizen model
│   │   ├── Admin.js
│   │   ├── Officer.js
│   │   ├── Department.js
│   │   └── Complaint.js
│   ├── routes/
│   │   ├── auth.js               ← Register, Login (3 portals), OTP
│   │   ├── complaints.js         ← Citizen CRUD
│   │   ├── admin.js              ← Admin management
│   │   ├── officer.js            ← Officer workflow
│   │   └── departments.js
│   ├── seed/seed.js              ← Seeds depts, admin, officers
│   ├── server.js
│   └── .env.example
└── frontend/
    └── src/
        ├── contexts/AuthContext.jsx
        ├── services/api.js          ← Axios instance + interceptors
        ├── components/
        │   ├── Sidebar.jsx
        │   ├── StatusBadge.jsx
        │   └── ProtectedRoute.jsx
        └── pages/
            ├── Landing.jsx
            ├── citizen/  (Register, Login, Dashboard, Submit, Detail)
            ├── admin/    (Login, Dashboard, ComplaintsList, Detail, Officers)
            └── officer/  (Login, Dashboard, ComplaintDetail)
```

---

## Setup & Run

### 1. Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, and optional MAIL_* for email OTP
npm run seed          # Seeds 6 departments, admin account, 8 sample officers
npm run dev           # Starts on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev           # Starts on http://localhost:5173
```

---

## Default Login Credentials (after seed)

### Admin
| Field | Value |
|-------|-------|
| URL | http://localhost:5173/admin/login |
| Email | admin@gunturcorporation.in |
| Password | Admin@123 |

### Officers (8 seeded)
| Email | Department | Password |
|-------|------------|----------|
| officer.apspdcl1@guntur.in | APSPDCL | Officer@123 |
| officer.apspdcl2@guntur.in | APSPDCL | Officer@123 |
| officer.roads1@guntur.in | GMC Roads | Officer@123 |
| officer.roads2@guntur.in | GMC Roads | Officer@123 |
| officer.sanitation1@guntur.in | GMC Sanitation | Officer@123 |
| officer.water1@guntur.in | GWSSB | Officer@123 |
| officer.animal1@guntur.in | Animal Husbandry | Officer@123 |
| officer.rnb1@guntur.in | R&B Dept. | Officer@123 |

---

## Departments (Guntur-specific)

| Department | Short Name | Handles |
|------------|------------|---------|
| AP Southern Power Distribution Co. Ltd. | APSPDCL | Street lights, power, electrical hazards |
| GMC Roads Division | GMC Roads | Potholes, footpaths, road damage |
| GMC Sanitation Division | GMC Sanitation | Garbage, waste, public toilets |
| Guntur Water Supply & Sewerage Board | GWSSB | Water, drainage, sewage, manholes |
| Animal Husbandry & Veterinary Dept. | Animal Husbandry | Stray dogs/cattle, dead animals |
| AP Roads & Buildings Department | R&B Dept. | State highways, bridges, traffic signals |

---

## Issue Categories (13)

1. Broken / Non-functioning Street Light  
2. Pothole / Road Damage  
3. Garbage Accumulation on Road  
4. Stray Dogs / Animals Menace  
5. Water Supply Disruption  
6. Sewage / Drainage Overflow  
7. Open Manhole Cover  
8. Fallen Tree Blocking Road  
9. Damaged Footpath / Sidewalk  
10. Traffic Signal Malfunction  
11. Illegal Encroachment on Public Property  
12. Electrical Hazard / Exposed Wiring  
13. Other (describe below)

---

## Complaint Lifecycle

```
Citizen submits → pending
Admin assigns dept + officer → assigned
Officer starts work → in_progress
Officer resolves + uploads proof → resolved
Admin can also reject → rejected
```

---

## Key Features

- **JWT Authentication** for 3 separate portals (Citizen, Admin, Officer)
- **OTP Email Verification** on citizen registration (prints to console if email not configured)
- **GPS Geotag Extraction** — exifr reads lat/lng from uploaded photo EXIF data
- **Browser GPS Capture** — one-click location from device GPS
- **Photo Upload** — multer, up to 3 images per complaint + 3 resolution proof photos
- **Auto-generated Tracking ID** — format `GNT-00001`
- **Status Timeline** — full audit trail on every complaint
- **Role-based Routing** — each portal has its own protected routes
- **Admin Stats Dashboard** — breakdown by status, category, department
- **Department-filtered Officer Assignment** — selecting a department only shows its officers
- **Pagination** on admin complaints list
- **Responsive UI** with Tailwind CSS

---

## Email OTP (Optional)

Set `MAIL_USER` and `MAIL_PASS` (Gmail App Password) in `.env`.  
If not set, OTPs are printed to the server console — fine for development.

---

## Deployment Notes

- **Backend**: Render, Railway, or any Node.js host
- **Frontend**: Vercel (set `VITE_API_URL` and update vite proxy / axios baseURL)
- **Database**: MongoDB Atlas (free tier works fine)
- **File Storage**: For production, replace local Multer storage with Cloudinary or AWS S3
