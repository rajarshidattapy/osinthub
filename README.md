# OSINT Hub: for Google Gen AI Exchange Hackathon


### 🎯 Problem Statement: Generative AI for Demystifying Legal Documents

OSINT Hub enables cybersecurity analysts, journalists, and OSINT researchers to collaboratively investigate, document, and refine intelligence in a secure, version controlled environment. The platform uses AI to ensure quality and trust by validating merge requests before they're accepted.

### Core Features

- **Case Repositories**: Create and manage investigation repositories for storing intelligence files
- **Collaborative Editing**: Fork repositories, make edits, and submit merge requests
- **AI-Powered Validation**: Google Gemini evaluates changes for relevance, accuracy, and duplication
- **Version Control**: Track all changes with comprehensive audit trails
- **Role-Based Access**: Granular permissions for different user roles
- **Modern UI**: Clean, GitHub-inspired interface built with React and Tailwind CSS

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: FastAPI + Python 3.12+ + SQLAlchemy
- **Database**: PostgreSQL with Alembic migrations
- **Authentication**: Clerk (JWT-based)
- **AI Integration**: Google Gemini API for content validation
- **Styling**: Tailwind CSS + Lucide React icons

### System Flow

1. Users create case repositories for investigations
2. Contributors fork repositories and make edits
3. Merge requests are submitted with proposed changes
4. Google Gemini AI validates changes for quality and relevance
5. Only AI-approved changes are merged; others require manual review
6. Complete audit trail maintained for all operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+
- PostgreSQL 12+
- Google Cloud API key for Gemini

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Set up environment variables
cp env.example .env
# Edit .env with your actual values

# Run database migrations
alembic upgrade head

# Start the server
python main.py
```

The backend API will be available at `http://localhost:8000`

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/osint_platform

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Google AI
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_GEMINI_MODEL=gemini-pro

# Server
DEBUG=True
HOST=0.0.0.0
PORT=8000
```

## 📁 Project Structure

```
osinthub/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── types/          # TypeScript type definitions
│   │   ├── services/       # API service layer
│   │   └── data/           # Mock data and utilities
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # FastAPI backend
│   ├── routers/            # API route handlers
│   ├── models.py           # Database models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── ai_service.py       # Google Gemini integration
│   └── requirements.txt
└── README.md
```

## 🔧 Development

### Frontend Development

- **Component Structure**: Modular React components with TypeScript
- **State Management**: React hooks for local state
- **Styling**: Tailwind CSS utility classes
- **Routing**: React Router for navigation
- **Authentication**: Clerk integration for user management

### Backend Development

- **API Design**: RESTful endpoints with FastAPI
- **Database**: SQLAlchemy ORM with PostgreSQL
- **Authentication**: JWT-based auth with Clerk
- **AI Integration**: Google Gemini API for content validation
- **Validation**: Pydantic schemas for request/response validation

### Database Schema

- **Users**: User accounts and role management
- **Repositories**: Investigation cases and metadata
- **Files**: Intelligence documents and content
- **Merge Requests**: Proposed changes and AI validation results
- **Audit Trail**: Complete history of all operations

## 🤖 AI Integration

### Google Gemini Features

- **Merge Request Validation**: Assesses relevance and quality of proposed changes
- **Content Summarization**: Generates concise summaries of intelligence documents
- **Duplicate Detection**: Identifies potential duplicate or redundant content
- **Quality Scoring**: Provides numerical scores for content relevance (0-100)

### AI Validation Process

1. **Content Analysis**: Gemini analyzes merge request content and context
2. **Relevance Scoring**: Evaluates how well changes fit the target repository
3. **Quality Assessment**: Checks for logical structure and completeness
4. **Issue Detection**: Identifies potential problems or concerns
5. **Recommendations**: Suggests improvements or alternatives

## 🔐 Security Features

- **Role-Based Access Control**: Granular permissions for different user types
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with Pydantic
- **Audit Logging**: Complete trail of all user actions

## 🧪 Testing

### Frontend Testing

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check
```

### Backend Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

## 📚 API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation powered by FastAPI's automatic OpenAPI generation.

### Key Endpoints

- `POST /api/repositories` - Create new investigation repository
- `POST /api/merge-requests` - Submit merge request with AI validation
- `POST /api/merge-requests/{id}/validate` - Trigger AI validation
- `POST /api/merge-requests/{id}/merge` - Merge approved request
- `GET /api/files` - Access repository files and content

## 🚀 Deployment

### Frontend Deployment

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to your hosting service
```

### Backend Deployment

```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment variables
export DEBUG=False
export DATABASE_URL=your_production_db_url

# Run with production server
uvicorn main:app --host 0.0.0.0 --port 8000
```



