# Loan Eligibility API

A production-ready loan eligibility verification system with integrated salary verification and credit bureau mock services.

## Links

- **GitHub Repository**: https://github.com/tkgeorgexani/Loan-Eligibility-API.git
- **Live API URL**: https://loan-eligibility-api-5pcw.onrender.com/
- **API Documentation**: https://loan-eligibility-api-5pcw.onrender.com/api-docs

-----------------------------------------------------------------------------------------------------------------

## Table of Contents

- [Overview](#overview)
- [Mock Endpoints Design](#mock-endpoints-design)
- [Tech Stack & Rationale](#tech-stack--rationale)
- [Features](#features)
- [How to Run Locally](#how-to-run-locally)
- [API Endpoints](#api-endpoints)
- [Deployment Guide](#deployment-guide)
- [Future Improvements](#future-improvements)

-----------------------------------------------------------------------------------------------------------------

## Overview

This API provides a complete loan eligibility verification system that integrates with mock external services (Salary Verification and Credit Bureau) to make real-time lending decisions based on configurable business rules.

**Key Eligibility Criteria:**
- Monthly salary must be ≥ 3x monthly loan repayment
- Credit score must be ≥ 600
- No active defaults allowed
- Maximum 3 active loans permitted

-----------------------------------------------------------------------------------------------------------------

## Mock Endpoints Design

### Architecture Decision

The mock services are designed to **simulate realistic external API behavior** while being fully self-contained within the application. This approach provides:

1. **Realistic Response Patterns**: Services return data structures that mirror real-world salary verification and credit bureau APIs
2. **Failure Simulation**: Built-in handling for "not found" scenarios (applicants without records)
3. **Data Persistence**: PostgreSQL storage ensures consistent responses across requests
4. **Extensibility**: Easy to swap with real external APIs by updating service layer

### Salary Verification Service

**Purpose**: Verifies employment and income information

**Endpoint**: `GET /api/mock/salary/:nationalId`

**Realistic Return Data**:
```json
{
  "found": true,
  "monthlySalary": 150000,
  "employer": "Tech Corp Ltd",
  "employmentStatus": "PERMANENT"
}
```

**Design Rationale**:
- Real salary verification APIs typically return employment status, employer details, and verified income
- The service handles "not found" cases by returning `found: false` with default values
- Employment status enum (`PERMANENT`, `CONTRACT`, `PROBATION`) mirrors real HR systems
- Stored in database to simulate external system's persistent records

**Failure Handling**:
- Unknown national IDs return `found: false` with zero salary
- Database errors are caught and returned as service unavailable
- The loan service treats "not found" as automatic rejection

### Credit Bureau Service

**Purpose**: Provides credit history and risk assessment

**Endpoint**: `GET /api/mock/credit/:nationalId`

**Realistic Return Data**:
```json
{
  "found": true,
  "creditScore": 750,
  "activeLoans": 2,
  "hasDefaults": false,
  "totalDebt": 85000
}
```

**Design Rationale**:
- Mirrors real credit bureaus (e.g., Experian, TransUnion) which provide:
  - Credit score (300-850 range)
  - Number of active credit accounts
  - Default/delinquency flags
  - Total outstanding debt
- Conservative default: Unknown applicants are flagged with `hasDefaults: true` (fail-safe approach)
- Score ranges align with industry standards

**Failure Handling**:
- Missing records default to worst-case scenario (score 0, has defaults)
- This ensures the system errs on the side of caution
- Database failures propagate as 500 errors with clear messages

### Data Management Endpoints

Both services include `POST` endpoints to add/update mock data:

**POST** `/api/mock/salary`
```json
{
  "nationalId": "ID123456789",
  "monthlySalary": 150000,
  "employer": "Tech Corp",
  "employmentStatus": "PERMANENT"
}
```

**POST** `/api/mock/credit`
```json
{
  "nationalId": "ID123456789",
  "creditScore": 750,
  "activeLoans": 2,
  "hasDefaults": false,
  "totalDebt": 85000
}
```

These allow easy testing of different scenarios without database access.

-----------------------------------------------------------------------------------------------------------------

## Tech Stack & Rationale

I have selected a robust key technology stack to ensure the application is secure, scalable, and maintainable. The choices reflect industry standards for building reliable financial systems.

# Core Technologies

1. ### Node.js + Express
  - *Purpose*: Backend framework
  - *Why Chosen*: Fast, lightweight, excellent for APIs. Large ecosystem and easy deployment
2. ### PostgreSQL
  - *Purpose*: Database
  - *Why Chosen*: ACID compliance for financial data, excellent JSON support, free tier on cloud platforms
3. ### Joi
  - *Purpose*: Input validation
  - *Why Chosen*: Declarative schema validation, prevents injection attacks, clear error messages
4. ### Swagger/OpenAPI
  - *Purpose*: API documentation
  - *Why Chosen*: Auto-generated interactive docs, industry standard, aids testing
5. ### Helmet
  - *Purpose*: Security headers
  - *Why Chosen*: Production-ready security defaults (XSS, clickjacking protection)
6. ### CORS
  - *Purpose*: Cross-origin requests
  - *Why Chosen*: Enables frontend integration while maintaining security
7. ### Morgan
  - *Purpose*: HTTP logging
  - *Why Chosen*: Request/response logging for debugging and monitoring

## Architecture Decisions

1. **Service Layer Pattern**: Business logic separated from routes for testability and reusability
2. **Database-Backed Mocks**: More realistic than in-memory data, survives restarts, enables complex queries
3. **Environment-Based Configuration**: Easy to adjust rules (credit score threshold, salary multiplier) without code changes
4. **Centralized Error Handling**: Consistent error responses across all endpoints
5. **Validation Middleware**: Request validation happens before business logic, improving security and UX


## Features

- **Loan Application Processing**: Submit and evaluate loan applications with real-time decisions
- **Salary Verification Mock**: Realistic employment and income verification
- **Credit Bureau Mock**: Credit score, loan history, and default checking
- **Configurable Business Rules**: Adjust eligibility criteria via environment variables
- **PostgreSQL Database (Neon)**: Persistent storage for applications and mock data
- **Swagger Documentation**: Interactive API testing interface
- **Comprehensive Error Handling**: Detailed error messages with proper HTTP status codes
- **Request Validation**: Joi schemas prevent invalid data
- **Security Headers**: Helmet.js protection against common vulnerabilities
- **Application History**: Track all loan applications by national ID
- **Pre-seeded Test Data**: 5 test profiles covering approval/rejection scenarios

-----------------------------------------------------------------------------------------------------------------

##  How to Run Locally

### Prerequisites

- **Node.js** 16+ ([Download](https://nodejs.org/))
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

### Step-by-Step Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/tkgeorgexani/Loan-Eligibility-API.git
   cd Loan-Eligibility-API
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```
3. **Configure Environment Variables**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/loan_eligibility
   
   # Business Rules (configurable)
   MIN_CREDIT_SCORE=600
   MAX_ACTIVE_LOANS=3
   SALARY_MULTIPLIER=3
   ```

   Replace `username` and `password` with your PostgreSQL credentials.


4. **Run Database Migrations**
   
   This creates tables and seeds test data:
   ```bash
   npm run migrate
   ```

   You should see:
   ```
   - Created loan_applications table
   - Created mock_salary_data table
   - Created mock_credit_data table
   - Seeded 5 test profiles
   ```

6. **Start the Development Server**
   ```bash
   npm run dev
   ```

   Server will start on `http://localhost:3000`

7. **Verify Installation**
   
   Open your browser and visit:
   - **API Docs**: http://localhost:3000/api-docs
   - **Health Check**: http://localhost:3000/api/health 

8. **Test the API**
   
   Using curl:
   ```bash
   curl -X POST http://localhost:3000/api/loans/apply \
     -H "Content-Type: application/json" \
     -d '{
       "nationalId": "ID123456789",
       "loanAmount": 50000,
       "termMonths": 12
     }'
   ```

   Or use the Swagger UI at `/api-docs` for interactive testing.

-----------------------------------------------------------------------------------------------------------------

##  API Endpoints

### Core Loan Endpoints

#### Apply for Loan
**POST** `/api/loans/apply`

Evaluates loan eligibility by checking salary and credit bureau data.

**Request Body**:
```json
{
  "nationalId": "ID123456789",
  "loanAmount": 50000,
  "termMonths": 12
}
```

**Success Response** (200):
```json
{
  "applicationId": "LA-1702345678901-ABC123",
  "eligible": true,
  "decision": {
    "approved": true,
    "reasons": [],
    "details": {
      "monthlySalary": 150000,
      "monthlyRepayment": 4442.44,
      "creditScore": 750,
      "activeLoans": 1,
      "hasDefaults": false
    }
  }
}
```

**Rejection Response** (200):
```json
{
  "applicationId": "LA-1702345678902-XYZ789",
  "eligible": false,
  "decision": {
    "approved": false,
    "reasons": [
      "Credit score below minimum (550 < 600)",
      "Has active defaults"
    ],
    "details": {
      "monthlySalary": 80000,
      "monthlyRepayment": 4442.44,
      "creditScore": 550,
      "activeLoans": 2,
      "hasDefaults": true
    }
  }
}
```

#### Get Application History
**GET** `/api/loans/history/:nationalId`

Returns all loan applications for a given national ID.

**Response**:
```json
{
  "nationalId": "ID123456789",
  "applications": [
    {
      "applicationId": "LA-1702345678901-ABC123",
      "loanAmount": 50000,
      "termMonths": 12,
      "eligible": true,
      "approved": true,
      "appliedAt": "2024-12-09T10:30:00.000Z"
    }
  ]
}
```

### Mock Service Endpoints

#### Salary Verification

**GET** `/api/mock/salary/:nationalId`

Returns salary information for a national ID.

**POST** `/api/mock/salary`

Add/update salary record:
```json
{
  "nationalId": "ID999888777",
  "monthlySalary": 120000,
  "employer": "Example Corp",
  "employmentStatus": "PERMANENT"
}
```

#### Credit Bureau

**GET** `/api/mock/credit/:nationalId`

Returns credit history for a national ID.

**POST** `/api/mock/credit`

Add/update credit record:
```json
{
  "nationalId": "ID999888777",
  "creditScore": 680,
  "activeLoans": 1,
  "hasDefaults": false,
  "totalDebt": 45000
}
```

### Documentation

**Interactive API Docs**: `/api-docs`

Swagger UI with all endpoints, schemas, and try-it-out functionality.

-----------------------------------------------------------------------------------------------------------------

## Deployment Guide

### Deploying to Render (Recommended)

Render offers free PostgreSQL and web service hosting, perfect for this project.

#### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **PostgreSQL**
3. Configure:
   - **Name**: `loan-eligibility-db`
   - **Database**: `loan_eligibility`
   - **User**: (auto-generated)
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. Copy the **Internal Database URL** (starts with `postgresql://`)

#### Step 2: Create Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `loan-eligibility-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Step 3: Set Environment Variables

In the web service settings, add:

```env
NODE_ENV=production
DATABASE_URL=<paste-internal-database-url-from-step-1>
MIN_CREDIT_SCORE=600
MAX_ACTIVE_LOANS=3
SALARY_MULTIPLIER=3
```

#### Step 4: Deploy

1. Click **Create Web Service**
2. Render will automatically:
   - Clone your repo
   - Install dependencies
   - Start the server
3. Once deployed, click **Shell** and run:
   ```bash
   npm run migrate
   ```
   This creates tables and seeds test data.

#### Step 5: Test

Your API will be live at: `https://loan-eligibility-api.onrender.com`

Test with:
```bash
curl https://loan-eligibility-api.onrender.com/api-docs
```
 
-----------------------------------------------------------------------------------------------------------------


## Future Improvements
 
Given more time, here's what I would enhance:
 
### 1. **Authentication & Authorization** (High Priority)
- Implement JWT-based authentication
- Role-based access control (applicant, loan officer, admin)
- API key authentication for mock service endpoints
- Rate limiting per user/API key
 
**Why**: Production loan systems need strict access controls and audit trails.
 
 
### 2. **Advanced Business Logic**
- Debt-to-income ratio calculation
- Loan affordability assessment based on expenses
- Risk-based pricing (interest rate adjustment)
- Loan amount limits based on salary brackets
- Graduated approval (partial loan amounts)
 
### 3. **User Experience**
- Simple frontend dashboard for testing
- Real-time application status updates
- Email notifications
- PDF loan agreement generation
- Multi-language support
 
**Why**: Makes the system more accessible to non-technical users.
 
### 4. **Data Analytics**
- Application approval/rejection metrics
- Average processing time tracking
- Most common rejection reasons
- Salary and credit score distributions
- Trend analysis over time
 
**Why**: Business insights for improving lending criteria.
 
   
## Author
 
**Thokozani George***
- GitHub: [@tkgeorgexani](https://github.com/tkgeorgexani)
- Email: thokozanigeorgee@gmail.com

 