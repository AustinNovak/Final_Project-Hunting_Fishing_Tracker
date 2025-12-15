# Final_Project-Hunting_Fishing_Tracker

**Live API URL (Render):** https://final-project-hunting-fishing-tracker.onrender.com

A production-ready RESTful API for logging outdoor trips (hunting and fishing), tracking species caught, and managing users with JWT-based authentication, role-based authorization, and ownership enforcement.

Built with **Node.js**, **Express**, and **Sequelize (SQLite)**. Includes full CRUD, search & filtering endpoints, automated testing, and cloud deployment.

---

## Features

- JWT authentication (register, login, logout)
- Protected routes with ownership enforcement
- Role-based authorization (`user`, `admin`)
- Trip logging with date, location, type, weather, gear, and notes
- Species tracking per trip
- Search & filter endpoints (advanced functionality)
- Sequelize ORM with SQLite
- Isolated Jest + Supertest test database
- Deployed to Render (production-ready)

---

## Tech Stack

- **Node.js + Express**
- **Sequelize ORM**
- **SQLite**
- **JWT** (jsonwebtoken)
- **bcryptjs**
- **cors**
- **dotenv**
- **Jest + Supertest**

---

## Installation & Local Setup

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd Final_Project-Hunting_Fishing_Tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create `.env` File

Create a `.env` file in the project root:
```
NODE_ENV=development
PORT=3000
DB_NAME=final_project.db
JWT_SECRET=dev-secret
JWT_EXPIRES_IN=24h
```

⚠️ **Do NOT commit `.env`**

### 4. Start Server
```bash
npm start
```

Server runs at:
```
http://localhost:3000
```

---

## Running Tests

A separate SQLite test database is automatically created and destroyed.
```bash
npm test
```

✔ All tests run with Supertest  
✔ No impact to production or dev database

---

## Authentication Guide

### Register

**POST /api/auth/register**

**Body:**
```json
{
  "name": "Austin",
  "email": "austin@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Austin",
  "email": "austin@example.com"
}
```

### Login

**POST /api/auth/login**

**Body:**
```json
{
  "email": "austin@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "JWT_TOKEN_HERE"
}
```

### Logout

**POST /api/auth/logout**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

ℹ️ Logout is client-side token invalidation.

---

## Authorization Rules

| Role  | Permissions                              |
|-------|------------------------------------------|
| User  | CRUD only on their own trips & species   |
| Admin | Access to all trips & species            |

**All protected routes require:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## API Endpoints

### Health Check

**GET /health**

Returns server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

---

### 🎣 Trips API

#### Get Trips (Protected)

**GET /api/trips**

Returns:
- **Admin** → all trips
- **User** → only their trips

#### Search / Filter Trips (Advanced Feature)

**GET /api/trips/search**

**Query Params:**
- `type=fishing|hunting`
- `startDate=YYYY-MM-DD`
- `endDate=YYYY-MM-DD`

**Example:**
```
/api/trips/search?type=fishing
```

#### Get Trip by ID

**GET /api/trips/:id**

Ownership enforced.

#### Get Full Trip (Trip + Species)

**GET /api/trips/:id/full**

Returns trip with all associated species.

#### Create Trip

**POST /api/trips**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "date": "2025-07-01",
  "location": "Test Lake",
  "type": "fishing",
  "weather": "Clear",
  "notes": "Great day",
  "gear": "Rod & Reel"
}
```

**Success (201):**
```json
{
  "id": 3,
  "date": "2025-07-01",
  "location": "Test Lake",
  "type": "fishing",
  "weather": "Clear",
  "notes": "Great day",
  "gear": "Rod & Reel",
  "userId": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Update Trip

**PUT /api/trips/:id**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body Example:**
```json
{
  "weather": "Partly Cloudy",
  "notes": "Updated notes"
}
```

#### Delete Trip

**DELETE /api/trips/:id**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

### 🐟 Species API

#### Get Species (Protected)

**GET /api/species**

Returns species from trips the user owns.

#### Search Species (Advanced Feature)

**GET /api/species/search?name=bass**

**Query Params:**
- `name` - Search by species name (partial match)

#### Get Species by ID

**GET /api/species/:id**

Ownership enforced.

#### Create Species

**POST /api/species**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body:**
```json
{
  "speciesName": "Largemouth Bass",
  "quantity": 2,
  "measurement": "1.5 lbs",
  "notes": "Caught near dock",
  "tripId": 1
}
```

**Success (201):**
```json
{
  "id": 10,
  "speciesName": "Largemouth Bass",
  "quantity": 2,
  "measurement": "1.5 lbs",
  "notes": "Caught near dock",
  "tripId": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### Update Species

**PUT /api/species/:id**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Body Example:**
```json
{
  "quantity": 3,
  "measurement": "2.0 lbs"
}
```

#### Delete Species

**DELETE /api/species/:id**

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 🗄 Database Models

### User
| Field    | Type    |
|----------|---------|
| id       | integer |
| name     | string  |
| email    | string  |
| password | string  |
| role     | string  |

A User has many Trips.

### Trip
| Field    | Type                              |
|----------|-----------------------------------|
| id       | integer                           |
| date     | string                            |
| location | string                            |
| type     | string (fishing, hunting, etc.)   |
| weather  | string                            |
| notes    | string                            |
| gear     | string                            |
| userId   | FK to User                        |

A Trip has many Species.

### Species
| Field        | Type       |
|--------------|------------|
| id           | integer    |
| speciesName  | string     |
| quantity     | integer    |
| measurement  | string     |
| notes        | string     |
| tripId       | FK to Trip |

---

## 🚀 Deployment (Render)

- **Platform:** Render
- **Environment:** Production
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Database:** SQLite (resets on redeploy)
- **Environment variables:** Set via Render dashboard

**Live URL:** https://final-project-hunting-fishing-tracker.onrender.com

---

## 🧪 Example cURL Commands

### Register User
```bash
curl -X POST https://final-project-hunting-fishing-tracker.onrender.com/api/auth/register \
-H "Content-Type: application/json" \
-d '{"name":"Austin","email":"austin@example.com","password":"password123"}'
```

### Login
```bash
curl -X POST https://final-project-hunting-fishing-tracker.onrender.com/api/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"austin@example.com","password":"password123"}'
```

### Create Trip
```bash
curl -X POST https://final-project-hunting-fishing-tracker.onrender.com/api/trips \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"date":"2025-07-01","location":"Test Lake","type":"fishing","weather":"Clear","notes":"Great day","gear":"Rod & Reel"}'
```

### Create Species
```bash
curl -X POST https://final-project-hunting-fishing-tracker.onrender.com/api/species \
-H "Content-Type: application/json" \
-H "Authorization: Bearer <JWT_TOKEN>" \
-d '{"speciesName":"Largemouth Bass","quantity":2,"measurement":"1.5 lbs","notes":"Caught near dock","tripId":1}'
```

### Search Trips
```bash
curl -X GET "https://final-project-hunting-fishing-tracker.onrender.com/api/trips/search?type=fishing" \
-H "Authorization: Bearer <JWT_TOKEN>"
```

---

## ✅ Submission Checklist

- ✔ GitHub Repository
- ✔ Render Deployment URL
- ✔ README Documentation
- ✔ Postman Collection

---

## 👤 Author

**Austin Novak**  
Final Project – Hunting and/or Fishing Tracker