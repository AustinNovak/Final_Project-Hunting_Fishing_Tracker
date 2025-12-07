# Final_Project-Hunting_Fishing_Tracker

A REST API for logging outdoor trips (hunting/fishing), tracking species caught, and managing users.  
Built using **Node.js**, **Express**, and **Sequelize (SQLite)**.  
Includes full CRUD for Users, Trips, and Species.

---

## Features

- User management (create, register, update, delete)
- Trip logging with weather, gear, notes, and location
- Species logged per trip (quantity, measurement, notes)
- Sequelize ORM with SQLite database
- Isolated test database using Jest + Supertest
- Clear and structured API routes across `/api/users`, `/api/trips`, `/api/species`
- Works locally and deployable to Render/Heroku

---

## Tech Stack

- **Node.js + Express**
- **SQLite + Sequelize**
- **Jest + Supertest**
- **bcryptjs** (for password hashing)
- **cors**
- **dotenv**

---

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <your_repo_url>
cd <project_folder>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create a .env File
Create a `.env` file in the project root:
```
NODE_ENV=development
PORT=3000
DB_NAME=final_project.db
JWT_SECRET=dev-secret
JWT_EXPIRES_IN=24h
```
Do NOT commit this file.

### 4. Initialize Database
These scripts run database sync and seeding.
```bash
npm run setup     # create database without forcing reset
npm run seed      # force reset database and reseed
```

### 5. Start the Server
```bash
npm start
```
Server will run on:
```
http://localhost:3000
```

---

## Running Tests
A separate test database (`test_final_project.db`) is automatically created and cleaned.

Run the test suite:
```bash
npm test
```
All tests use Supertest and do not touch your main DB.

---

## Database Models

### User
| Field    | Type    |
|----------|---------|
| id       | integer |
| name     | string  |
| email    | string  |
| password | string  |

A User has many Trips.

### Trip
| Field    | Type                        |
|----------|-----------------------------|
| id       | integer                     |
| date     | string                      |
| location | string                      |
| type     | string (fishing, hunting, etc.) |
| weather  | string                      |
| notes    | string                      |
| gear     | string                      |
| userId   | FK to User                  |

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

## API Endpoints

**Base URL:**
```
http://localhost:3000
```

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

### Users API

#### POST /api/users/register
Create a new user.

**Body:**
```json
{
  "name": "Austin",
  "email": "austin@example.com",
  "password": "pass123"
}
```

**Success: 201**
```json
{
  "id": 1,
  "name": "Austin",
  "email": "austin@example.com"
}
```

#### POST /api/users
Admin-style create user (same as register).

#### GET /api/users
Returns a list of all users.

#### GET /api/users/:id
Returns a user with all trips included.

**Success Example:**
```json
{
  "id": 1,
  "name": "Austin",
  "email": "austin@example.com",
  "Trips": [
    { "id": 3, "location": "Test Lake", "..." }
  ]
}
```

#### PUT /api/users/:id
Update user fields.

**Body Example:**
```json
{ "name": "Updated Name" }
```

#### DELETE /api/users/:id
Deletes a user.

---

### Trips API

#### GET /api/trips
Returns all trips with User info populated.

#### GET /api/trips/:id
Returns one trip, including Species entries.

#### POST /api/trips
**Required fields:**
- date
- location
- type
- userId

**Example Body:**
```json
{
  "date": "2025-07-01",
  "location": "Test Lake",
  "type": "fishing",
  "weather": "Calm",
  "notes": "Great day",
  "gear": "Rod + Reel",
  "userId": 1
}
```

**Success:**
```json
{
  "id": 3,
  "date": "2025-07-01",
  "location": "Test Lake",
  "type": "fishing",
  "weather": "Calm",
  "notes": "Great day",
  "gear": "Rod + Reel",
  "userId": 1,
  "createdAt": "...",
  "updatedAt": "..."
}
```

#### PUT /api/trips/:id
Update any trip fields.

#### DELETE /api/trips/:id
Delete trip.

---

### Species API

#### GET /api/species
List all species logs.

#### GET /api/species/:id
Return a single species record.

#### POST /api/species
**Required fields:**
- speciesName
- tripId

**Optional:**
- quantity
- measurement
- notes

**Example Body:**
```json
{
  "speciesName": "Largemouth Bass",
  "quantity": 2,
  "measurement": "1.5 lbs",
  "notes": "Caught near dock",
  "tripId": 3
}
```

**Success:**
```json
{
  "id": 10,
  "speciesName": "Largemouth Bass",
  "quantity": 2,
  "measurement": "1.5 lbs",
  "notes": "Caught near dock",
  "tripId": 3
}
```

#### PUT /api/species/:id
Update species record.

#### DELETE /api/species/:id
Delete species record.

---

## Example cURL Commands

### Create User
```bash
curl -X POST http://localhost:3000/api/users/register \
-H "Content-Type: application/json" \
-d '{"name":"Austin","email":"a@a.com","password":"1234"}'
```

### Create Trip
```bash
curl -X POST http://localhost:3000/api/trips \
-H "Content-Type: application/json" \
-d '{"date":"2025-07-01","location":"Test Lake","type":"fishing","userId":1}'
```

### Create Species
```bash
curl -X POST http://localhost:3000/api/species \
-H "Content-Type: application/json" \
-d '{"speciesName":"Bass","tripId":1}'
```