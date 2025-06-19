# Сompany Dashboard App
**Main stack**: frontend: React (JS), HTML, CSS; backend: Express.js, PostgreSQL

## Setup and Installation

### Prerequisites

- Node.js
- npm
- PostgreSQL

### Backend Setup

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Vitaliy-Mazurenko/Dashboard-App.git
   cd Dashboard-App/server

   ```
2. **Install backend dependencies**:

   ```bash
   npm install
   ```
3. **Create a database by name: dashboard (I use pgAgmin4)**.
4. **To run migrations that create tables in a PostgreSQL database in Node.js**

   ```bash
   npm run migrate
   ```

4. **Create a super Admin or change the user role to SuperAdmin**.
5. **After creating users, you can insert company data. To add companies to the PostgreSQL database directly through pgAdmin 4, you will need to run SQL queries.**
```
CREATE TABLE IF NOT EXISTS "Companies" (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    capital DECIMAL(18, 2) NOT NULL DEFAULT 0,
    logo VARCHAR(255),
    location VARCHAR(255),
    "ownerId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```
```
INSERT INTO "Companies" (name, service, capital, logo, location, "ownerId") VALUES
('Apple', 'technology', 2500000000000.00, NULL, 'USA', 1),
('Microsoft', 'software', 3000000000000.00, NULL, 'USA', 2),
('Amazon', 'e-commerce', 1800000000000.00, NULL, 'USA', 3),
('Google (Alphabet Inc.)', 'internet services', 2200000000000.00, NULL, 'USA', 4),
('Samsung', 'electronics', 500000000000.00, NULL, 'South Korea', 5),
('Toyota', 'automotive', 250000000000.00, NULL, 'Japan', 1),
('ExxonMobil', 'energy', 400000000000.00, NULL, 'USA', 1),
('ICBC', 'banking', 300000000000.00, NULL, 'China', 2),
('Johnson & Johnson', 'pharmaceuticals', 150000000000.00, NULL, 'USA', 2),
('BMW', 'automotive', 100000000000.00, NULL, 'Germany', 1),
('McDonald''s', 'food service', 200000000000.00, NULL, 'USA', 3),
('Nike', 'sportswear', 180000000000.00, NULL, 'USA', 3),
('FedEx', 'logistics', 60000000000.00, NULL, 'USA', 1),
('Mitsubishi', 'industry and finance', 150000000000.00, NULL, 'Japan', 4),
('Wix', 'web development', 8000000000.00, NULL, 'Israel', 4),
('Ubisoft', 'video games', 5000000000.00, NULL, 'France', 1),
('Magento', 'e-commerce platforms', 3000000000.00, NULL, 'USA', 4),
('Amadeus', 'travel technology', 40000000000.00, NULL, 'Spain', 5),
('Admixer', 'ad tech', 100000000.00, NULL, 'Ukraine', 1),
('Tesla', 'electric vehicles and energy', 600000000000.00, NULL, 'USA', 5)
```
6. **Start the backend server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to the `client` directory**:

   ```bash
   cd ../client
   ```

2. **Install frontend dependencies**:

   ```bash
   npm install
   ```

3. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

   ### Usage

- Open your browser and navigate to `http://localhost:5173/` to see the application.
- The backend server will run on `http://localhost:5000`.
   