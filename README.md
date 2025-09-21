# Google Generative AI Exchange Hackathon: OSINT Hub

### 🎯 Problem Statement: Collaborative Intelligence Documentation Platform

OSINT Hub is a comprehensive platform that enables cybersecurity analysts, journalists, and OSINT researchers to collaboratively investigate, document, and refine intelligence in a secure, version-controlled environment. The platform leverages AI to ensure quality and trust by validating merge requests and document credibility before they're accepted.

### 🌟 Core Features

#### **Investigation Management**
- **Case Repositories**: Create and manage investigation repositories with support for public/private visibility
- **Repository Templates**: Pre-built templates for OSINT investigations, threat intelligence, and incident response
- **Fork & Clone**: Fork existing investigations to create derivative cases
- **Repository Statistics**: Track commits, file changes, and collaboration metrics

#### **Document Processing & Storage**
- **Multi-Format Support**: PDF, DOCX, DOC, TXT, Markdown, JSON, CSV file processing
- **Intelligent Text Extraction**: Advanced text extraction using PyMuPDF and Mammoth
- **Document Metadata**: Automatic extraction of creation dates, authors, and file properties
- **File Versioning**: Complete version history with diff tracking for all uploaded documents
- **Batch Upload**: Upload multiple files simultaneously with progress tracking

#### **Collaborative Workflow**
- **Advanced File Editor**: Syntax highlighting, markdown rendering, and JSON formatting
- **File Explorer**: Directory-based navigation with file type icons and metadata display
- **Merge Requests**: Submit proposed changes with detailed diff visualization
- **Code Review System**: Line-by-line commenting and discussion threads
- **Role-Based Permissions**: Admin, analyst, contributor, and viewer roles with granular access control

#### **AI-Powered Intelligence**
- **Document Credibility Analysis**: AI assessment of source reliability and information quality
- **Sensitive Information Detection**: Automatic identification of PII, financial data, and security-sensitive content
- **Merge Request Validation**: Multi-criteria AI evaluation including relevance (0-100), accuracy, completeness
- **Content Improvement Suggestions**: AI-generated recommendations for document enhancement
- **Repository Chatbot**: Interactive AI assistant for querying repository contents and commit history

#### **Version Control & Audit**
- **Git-Style Commit System**: SHA-based commits with parent-child relationships
- **Complete Audit Trail**: Track all user actions, file changes, and system events
- **File History Tracking**: View complete evolution of documents with diff comparisons
- **Branch Management**: Support for multiple investigation branches
- **Commit Graph Visualization**: Visual representation of repository evolution

#### **Security & Compliance**
- **JWT Authentication**: Secure token-based authentication with Clerk integration
- **Repository Access Control**: Fine-grained permissions for private investigations
- **Data Encryption**: Secure storage of sensitive investigation materials
- **Legal Document Validation**: AI-powered authenticity markers and citation quality assessment

## 🏗️ Architecture

### Tech Stack

#### **Frontend**
- **React 18** + **TypeScript** + **Vite** for modern development
- **Tailwind CSS** + **Framer Motion** for responsive UI and animations
- **Lucide React** + **Tabler Icons** for comprehensive iconography
- **React Router DOM** for client-side navigation
- **Clerk React** for authentication and user management
- **React Markdown** for document rendering
- **Radix UI** components for accessible UI primitives

#### **Backend**
- **FastAPI** + **Python 3.12+** for high-performance APIs
- **SQLAlchemy** ORM with **PostgreSQL** database
- **Alembic** for database migrations and versioning
- **Pydantic** for data validation and serialization
- **JWT** authentication with **Clerk** integration

#### **AI & Document Processing**
- **Google Gemini Pro** for advanced content analysis and validation
- **PyMuPDF** for PDF text extraction and metadata parsing
- **Mammoth** for enhanced DOCX document processing
- **Python-DOCX** for Microsoft Word document handling
- **Document Parser Service** for multi-format file processing

#### **File Storage & Processing**
- **Async File Operations** with **aiofiles**
- **Multi-format Support**: PDF, DOCX, DOC, TXT, MD, JSON, CSV
- **Intelligent MIME Type Detection**
- **File Version Management** with complete diff tracking

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  FastAPI Backend │    │  PostgreSQL DB  │
│   (TypeScript)   │◄──►│   (Python)       │◄──►│   (SQLAlchemy)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Google Gemini  │              │
         │              │   AI Service    │              │
         │              └─────────────────┘              │
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Clerk Auth     │    │ Document Parser │    │ File Storage    │
│  Service        │    │   Service       │    │   System        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Enhanced Workflow

1. **Repository Creation**: Users create case repositories with templates and visibility settings
2. **Document Upload**: Multi-format files are processed, analyzed, and stored with metadata
3. **AI Content Analysis**: Documents undergo credibility assessment and sensitive information detection
4. **Collaborative Editing**: Contributors can fork, edit, and submit merge requests
5. **AI Validation Pipeline**: Merge requests are evaluated for relevance, accuracy, and quality
6. **Review & Integration**: Approved changes are merged with complete audit trails
7. **Version Management**: All changes tracked with git-style commits and file versioning
8. **Interactive Querying**: AI chatbot provides intelligent repository content exploration

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
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/osint_platform

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Google AI Integration
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_GEMINI_MODEL=gemini-pro

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB in bytes
UPLOAD_DIRECTORY=uploads
ALLOWED_EXTENSIONS=.pdf,.docx,.doc,.txt,.md,.json,.csv

# Server Configuration
DEBUG=True
HOST=0.0.0.0
PORT=8000

# Security
JWT_SECRET_KEY=your_jwt_secret_key_here
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

## 📁 Project Structure

```
osinthub/
├── src/                         # React frontend application
│   ├── components/              # React component library
│   │   ├── CreateRepository/    # Repository creation modal
│   │   │   └── CreateRepositoryModal.tsx
│   │   ├── Files/               # File management components
│   │   │   ├── FileEditor.tsx   # Advanced file editor with syntax highlighting
│   │   │   └── FileExplorer.tsx # Directory-style file browser
│   │   ├── Layout/              # Application layout components
│   │   │   ├── Header.tsx       # Main navigation header
│   │   │   └── LandingNavbar.tsx # Landing page navigation
│   │   ├── magicui/             # Animated UI components
│   │   │   ├── border-beam.tsx  # Animated border effects
│   │   │   ├── hyper-text.tsx   # Text animation effects
│   │   │   └── spinning-text.tsx # Rotating text animations
│   │   ├── MergeRequest/        # Collaboration workflow
│   │   │   ├── DiffViewer.tsx   # Side-by-side diff visualization
│   │   │   ├── MergeRequestCard.tsx # MR summary cards
│   │   │   ├── MergeRequestDetail.tsx # Detailed MR view
│   │   │   └── MergeRequestList.tsx # MR listing page
│   │   ├── Repository/          # Repository management
│   │   │   ├── dottMap.tsx      # Commit graph visualization
│   │   │   ├── RepositoryCard.tsx # Repository summary cards
│   │   │   ├── RepositoryList.tsx # Repository listing
│   │   │   └── RepositoryView.tsx # Detailed repository view
│   │   └── ui/                  # Reusable UI components
│   │       ├── card.tsx         # Card containers
│   │       ├── dashboard-layout.tsx # Dashboard layout wrapper
│   │       ├── feature-section.tsx # Feature showcase
│   │       ├── footer.tsx       # Site footer
│   │       ├── gradient-button.tsx # Animated buttons
│   │       ├── hero-section.tsx # Landing hero section
│   │       ├── navbar.tsx       # Navigation component
│   │       ├── product-showcase-section.tsx # Product demos
│   │       ├── stats-section.tsx # Statistics display
│   │       ├── testimonials.tsx # User testimonials
│   │       └── use-case.tsx     # Use case examples
│   ├── data/                    # Application data
│   │   └── mockData.ts          # Sample data for development
│   ├── lib/                     # Utility libraries
│   │   ├── border-beam.tsx      # Border animation utilities
│   │   └── utils.ts             # Common utility functions
│   ├── pages/                   # Application pages
│   │   ├── DashboardPage.tsx    # Main dashboard interface
│   │   └── LandingPage.tsx      # Public landing page
│   ├── services/                # API integration layer
│   │   └── api.ts               # HTTP client and API methods
│   └── types/                   # TypeScript type definitions
│       └── index.ts             # Application type definitions
├── backend/                     # FastAPI backend application
│   ├── routers/                 # API route handlers
│   │   ├── __init__.py          # Router module initialization
│   │   ├── files.py             # File management endpoints
│   │   ├── merge_requests.py    # Merge request workflow APIs
│   │   ├── repositories.py      # Repository CRUD operations
│   │   ├── upload_file.py       # File upload and processing
│   │   └── users.py             # User management endpoints
│   ├── alembic/                 # Database migration system
│   │   ├── env.py               # Alembic environment configuration
│   │   ├── script.py.mako       # Migration script template
│   │   └── versions/            # Database migration files
│   ├── main.py                  # FastAPI application entry point
│   ├── models.py                # SQLAlchemy database models
│   ├── schemas.py               # Pydantic data validation schemas
│   ├── auth.py                  # Authentication and authorization
│   ├── database.py              # Database connection and session management
│   ├── ai_service.py            # Google Gemini AI integration
│   ├── document_parser.py       # Multi-format document processing
│   ├── audit.py                 # Audit logging system
│   ├── requirements.txt         # Python dependencies
│   └── alembic.ini              # Alembic configuration
├── public/                      # Static assets
│   └── Dashboard.png            # Dashboard screenshot
├── package.json                 # Node.js dependencies and scripts
├── vite.config.ts               # Vite build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── eslint.config.js             # ESLint linting rules
├── postcss.config.js            # PostCSS configuration
├── components.json              # UI component configuration
├── index.html                   # Application HTML template
├── STRUCTURE.md                 # Detailed project structure
└── README.md                    # Project documentation
```

## 🔧 Development

### Frontend Development

#### **Component Architecture**
- **Modular Design**: Feature-based component organization with clear separation of concerns
- **TypeScript Integration**: Full type safety with custom interfaces for Repository, MergeRequest, and File entities
- **State Management**: React hooks for local state with optimistic updates
- **Styling System**: Tailwind CSS utility classes with custom design tokens
- **Animation Framework**: Framer Motion for smooth transitions and micro-interactions

#### **Key Frontend Features**
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Dark Theme**: Consistent dark mode design optimized for extended use
- **Real-time Updates**: Live file editing with syntax highlighting
- **Advanced File Explorer**: Directory tree navigation with file type icons
- **Diff Visualization**: Side-by-side code comparison with highlighting
- **Modal Systems**: Context-aware dialogs for repository creation and file operations

### Backend Development

#### **API Architecture**
- **RESTful Design**: Clean endpoint structure following REST principles
- **FastAPI Features**: Automatic OpenAPI documentation with request/response validation
- **Database Integration**: SQLAlchemy ORM with relationship management
- **Authentication Layer**: JWT-based auth with role-based access control
- **File Processing Pipeline**: Multi-format document parsing with metadata extraction

#### **AI Integration Services**
- **Document Analysis**: Content credibility scoring with detailed feedback
- **Merge Request Validation**: Multi-criteria evaluation (relevance, accuracy, completeness)
- **Sensitive Data Detection**: Automatic identification of PII and confidential information
- **Content Improvement**: AI-generated suggestions for document enhancement
- **Repository Chatbot**: Interactive query system for repository exploration

### Enhanced Database Schema

#### **Core Entities**
- **Users**: Account management with role-based permissions (admin, analyst, contributor, viewer)
- **Repositories**: Investigation cases with privacy settings, fork relationships, and templates
- **Files**: Document storage with full version history and metadata extraction
- **Merge Requests**: Collaboration workflow with AI validation status and scoring
- **Comments**: Line-by-line code review with threaded discussions

#### **Advanced Features**
- **File Versioning**: Complete history tracking with diff generation
- **Commit System**: Git-style commits with SHA hashes and parent relationships
- **Audit Trail**: Comprehensive logging of all user actions and system events
- **Repository Collaborators**: Fine-grained permission management
- **AI Validation Results**: Detailed scoring and feedback storage

## 🤖 Enhanced AI Integration

### Google Gemini Pro Features

#### **Document Processing & Analysis**
- **Multi-Format Content Extraction**: Advanced text extraction from PDF, DOCX, DOC, and other formats
- **Credibility Assessment**: Comprehensive analysis of source reliability, bias detection, and authenticity markers
- **Content Quality Scoring**: Numerical scoring (0-100) for document completeness and information value
- **Citation Analysis**: Evaluation of source attribution and reference quality
- **Metadata Enrichment**: Automatic extraction of author information, creation dates, and document properties

#### **Merge Request Intelligence**
- **Multi-Criteria Validation**: Assessment across relevance, accuracy, completeness, and duplication dimensions
- **Content Similarity Detection**: Identification of redundant or duplicate information
- **Legal/Ethical Screening**: Detection of sensitive information and privacy concerns
- **Source Quality Evaluation**: Analysis of information sources and their credibility
- **Improvement Suggestions**: Actionable recommendations for content enhancement

#### **Interactive Repository Assistant**
- **Natural Language Querying**: Ask questions about repository contents in plain English
- **Commit History Analysis**: Intelligent exploration of project evolution and changes
- **File Content Search**: Semantic search across all repository documents
- **Cross-Reference Detection**: Identification of related information across multiple files
- **Investigation Insights**: AI-generated summaries and analysis of case progression

### AI Validation Pipeline

#### **Automated Workflow**
1. **Initial Screening**: Basic content analysis and format validation
2. **Credibility Analysis**: Source reliability and bias assessment
3. **Relevance Scoring**: Context-aware evaluation of content fit
4. **Quality Assessment**: Completeness and accuracy verification
5. **Sensitivity Check**: Detection of confidential or sensitive information
6. **Final Recommendation**: Automated approval, rejection, or manual review suggestion

#### **Advanced Features**
- **Streaming Responses**: Real-time AI feedback with progressive content analysis
- **Context-Aware Analysis**: Repository-specific evaluation considering investigation focus
- **Multi-Language Support**: Content analysis across different languages
- **Historical Learning**: Improved accuracy based on previous validation decisions
- **Custom Scoring Models**: Adjustable validation criteria for different investigation types

## 🔐 Security Features

- **Role-Based Access Control**: Granular permissions for different user types
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured cross-origin resource sharing
- **Input Validation**: Comprehensive request validation with Pydantic
- **Audit Logging**: Complete trail of all user actions

## 🧪 Testing & Quality Assurance

### Frontend Testing

```bash
# Install development dependencies
npm install

# Run TypeScript type checking
npm run type-check

# Run ESLint for code quality
npm run lint

# Build production bundle for testing
npm run build
```

### Backend Testing

```bash
# Install test dependencies
pip install pytest pytest-asyncio pytest-cov httpx

# Run comprehensive test suite
pytest

# Run tests with coverage reporting
pytest --cov=. --cov-report=html

# Run specific test categories
pytest tests/test_repositories.py
pytest tests/test_ai_service.py
pytest tests/test_document_parser.py
```

### Integration Testing

```bash
# Test file upload and processing
pytest tests/integration/test_file_upload.py

# Test AI validation pipeline
pytest tests/integration/test_ai_validation.py

# Test merge request workflow
pytest tests/integration/test_merge_requests.py
```

### Performance Testing

```bash
# Load testing with multiple file uploads
pytest tests/performance/test_bulk_upload.py

# AI service response time testing
pytest tests/performance/test_ai_latency.py

# Database query optimization testing
pytest tests/performance/test_db_queries.py
```

## 📚 Enhanced API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for comprehensive interactive API documentation.

### Core API Endpoints

#### **Repository Management**
- `POST /api/repositories` - Create new investigation repository with template support
- `GET /api/repositories` - List repositories with privacy and collaboration filtering
- `GET /api/repositories/{id}` - Get detailed repository information
- `PUT /api/repositories/{id}` - Update repository metadata and settings
- `DELETE /api/repositories/{id}` - Remove repository (owner only)
- `POST /api/repositories/{id}/fork` - Fork repository for derivative investigations

#### **File Operations**
- `POST /api/upload/{repository_id}` - Upload single file with AI analysis
- `POST /api/batch-upload/{repository_id}` - Upload multiple files simultaneously
- `GET /api/download/{file_id}` - Download file with access control
- `GET /api/files/{repository_id}` - List all files in repository
- `GET /api/file/{file_id}/versions` - Get complete file version history
- `PUT /api/files/{file_id}` - Update file content with versioning

#### **Merge Request Workflow**
- `POST /api/merge-requests` - Submit merge request with AI validation
- `GET /api/merge-requests` - List merge requests with filtering options
- `GET /api/merge-requests/{id}` - Get detailed merge request with AI analysis
- `POST /api/merge-requests/{id}/validate` - Trigger AI re-validation
- `POST /api/merge-requests/{id}/merge` - Merge approved request
- `POST /api/merge-requests/{id}/comments` - Add review comments

#### **AI Services**
- `POST /api/ai/validate-merge-request` - Advanced merge request validation
- `POST /api/ai/analyze-document` - Document credibility analysis
- `POST /api/ai/detect-sensitive-info` - Sensitive information scanning
- `POST /api/ai/repository-chat` - Interactive repository assistant
- `GET /api/ai/repository-chat/stream` - Streaming chat responses

#### **User & Collaboration**
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user information
- `POST /api/repositories/{id}/collaborators` - Add repository collaborators
- `GET /api/repositories/{id}/collaborators` - List repository team members
- `PUT /api/repositories/{id}/collaborators/{user_id}` - Update collaborator permissions

#### **Audit & Analytics**
- `GET /api/audit/repository/{id}` - Get repository audit trail
- `GET /api/audit/user/{id}` - Get user activity history
- `GET /api/analytics/repository/{id}` - Repository statistics and insights
- `GET /api/commits/{repository_id}` - Get commit history with graph data

## 🚀 Production Deployment

### Frontend Deployment

```bash
# Build optimized production bundle
npm run build

# The dist/ folder contains the production-ready static files
# Deploy to your preferred hosting service:
# - Vercel: vercel --prod
# - Netlify: netlify deploy --prod --dir=dist
# - AWS S3: aws s3 sync dist/ s3://your-bucket-name
# - GitHub Pages: Deploy dist/ folder
```

### Backend Deployment

#### **Docker Deployment**

```bash
# Build Docker image
docker build -t osinthub-backend .

# Run with environment variables
docker run -p 8000:8000 \
  -e DATABASE_URL=your_production_db_url \
  -e GOOGLE_API_KEY=your_api_key \
  -e CLERK_SECRET_KEY=your_clerk_key \
  osinthub-backend

# Or use Docker Compose
docker-compose up -d
```

#### **Traditional Deployment**

```bash
# Install production dependencies
pip install -r requirements.txt

# Set production environment variables
export DEBUG=False
export DATABASE_URL=your_production_db_url
export GOOGLE_API_KEY=your_google_api_key
export CLERK_SECRET_KEY=your_clerk_secret

# Run database migrations
alembic upgrade head

# Start with production ASGI server
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4

# Or use Gunicorn for better production performance
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

#### **Cloud Platform Deployment**

**AWS Deployment:**
```bash
# Deploy to AWS Lambda with Serverless Framework
serverless deploy

# Or deploy to AWS ECS
aws ecs update-service --cluster osinthub --service osinthub-backend
```

**Google Cloud Platform:**
```bash
# Deploy to Google App Engine
gcloud app deploy

# Or deploy to Google Cloud Run
gcloud run deploy osinthub-backend --source .
```

**Azure Deployment:**
```bash
# Deploy to Azure App Service
az webapp up --name osinthub-backend
```

### Production Environment Configuration

```env
# Production Environment Variables
DEBUG=False
DATABASE_URL=postgresql://prod_user:secure_password@db-host:5432/osinthub_prod
GOOGLE_API_KEY=your_production_google_api_key
CLERK_SECRET_KEY=your_production_clerk_key
JWT_SECRET_KEY=your_secure_jwt_secret
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
MAX_FILE_SIZE=52428800  # 50MB for production
UPLOAD_DIRECTORY=/var/uploads
REDIS_URL=redis://redis-host:6379/0  # For caching and sessions
```

### Production Monitoring

```bash
# Health check endpoint
curl https://api.yourdomain.com/health

# Metrics and monitoring
curl https://api.yourdomain.com/metrics

# Log aggregation with structured logging
tail -f /var/log/osinthub/app.log | jq .
```

### Security Hardening

- **HTTPS/TLS**: Enforce SSL certificates for all connections
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input sanitization and validation
- **File Upload Security**: Virus scanning and file type validation
- **Database Security**: Connection encryption and access controls
- **Environment Secrets**: Use secure secret management services



