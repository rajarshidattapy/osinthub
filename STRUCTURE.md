# OSINT Hub - Code Structure Documentation

This document provides detailed documentation of the backend and frontend code architecture, components, and implementation details.

## 📁 Backend Architecture

### Core Modules

#### `main.py` - Application Entry Point
- **Purpose**: FastAPI application initialization and configuration
- **Key Features**:
  - CORS middleware configuration
  - Router registration
  - Health check endpoint
  - Environment-based configuration

#### `database.py` - Database Configuration
- **Purpose**: SQLAlchemy database connection and session management
- **Key Features**:
  - PostgreSQL connection setup
  - Session factory configuration
  - Dependency injection for database sessions

#### `models.py` - Database Models
- **Purpose**: SQLAlchemy ORM models for all database entities
- **Key Models**:
  - `User`: User accounts with role-based permissions
  - `Repository`: Investigation case repositories
  - `RepositoryFile`: Intelligence documents and content
  - `MergeRequest`: Proposed changes with AI validation
  - `FileChange`: Detailed change tracking
  - `Comment`: Discussion and feedback
  - `AuditEntry`: Complete audit trail

#### `auth.py` - Authentication & Authorization
- **Purpose**: JWT token validation and role-based access control
- **Key Features**:
  - Clerk JWT token verification
  - Role-based permission decorators
  - User session management
  - Permission validation middleware

#### `ai_service.py` - AI Integration Service
- **Purpose**: Google Gemini AI integration for content validation
- **Key Features**:
  - Merge request validation
  - Content summarization
  - Duplicate detection
  - Quality scoring and feedback

### API Routers

#### `routers/repositories.py`
- **Endpoints**:
  - `POST /` - Create new repository
  - `GET /` - List repositories with filters
  - `GET /{id}` - Get repository details
  - `PUT /{id}` - Update repository
  - `DELETE /{id}` - Delete repository
  - `POST /{id}/fork` - Fork repository
  - `POST /{id}/collaborators` - Manage collaborators

#### `routers/merge_requests.py`
- **Endpoints**:
  - `POST /` - Create merge request with AI validation
  - `GET /` - List merge requests with filters
  - `GET /{id}` - Get merge request details
  - `PUT /{id}` - Update merge request
  - `POST /{id}/merge` - Merge approved request
  - `POST /{id}/close` - Close merge request
  - `POST /{id}/validate` - Trigger AI validation

#### `routers/files.py`
- **Endpoints**:
  - `POST /` - Upload new file
  - `GET /` - List repository files
  - `GET /{id}` - Get file content
  - `PUT /{id}` - Update file content
  - `DELETE /{id}` - Delete file
  - `POST /{id}/versions` - Create file version

#### `routers/users.py`
- **Endpoints**:
  - `GET /` - List users
  - `GET /{id}` - Get user profile
  - `PUT /{id}` - Update user profile
  - `POST /{id}/roles` - Update user roles

### Data Schemas (`schemas.py`)

#### Request/Response Models
- **Repository Schemas**: Create, update, and response models
- **Merge Request Schemas**: Complete merge request lifecycle
- **File Schemas**: File operations and metadata
- **User Schemas**: User management and profiles
- **Validation**: Pydantic validation rules and constraints

## 🎨 Frontend Architecture

### Core Application (`src/App.tsx`)

#### State Management
- **View State**: Manages current application view (repositories, merge requests, etc.)
- **Selected Items**: Tracks selected repository and merge request
- **Modal State**: Controls create repository modal visibility

#### Navigation Flow
1. **Repositories View**: Main dashboard showing all repositories
2. **Repository View**: Individual repository details and files
3. **Merge Requests View**: List of all merge requests
4. **Merge Request Detail**: Detailed view of specific merge request

### Component Architecture

#### Layout Components (`src/components/Layout/`)

##### `Header.tsx`
- **Purpose**: Main navigation and user interface header
- **Features**:
  - Search functionality
  - User notifications
  - Settings access
  - Brand logo and navigation

#### Repository Components (`src/components/Repository/`)

##### `RepositoryList.tsx`
- **Purpose**: Display grid of available repositories
- **Features**:
  - Repository cards in grid layout
  - Create repository button
  - Search and filtering
  - Responsive design

##### `RepositoryCard.tsx`
- **Purpose**: Individual repository display card
- **Features**:
  - Repository metadata display
  - Fork and collaboration info
  - Privacy status indicators
  - Action buttons

##### `RepositoryView.tsx`
- **Purpose**: Detailed repository view with files
- **Features**:
  - File explorer
  - Repository information
  - Action buttons (fork, merge requests)
  - File management interface

##### `CreateRepositoryModal.tsx`
- **Purpose**: Modal for creating new repositories
- **Features**:
  - Form validation
  - Privacy settings
  - Description and metadata
  - Submit handling

#### Merge Request Components (`src/components/MergeRequest/`)

##### `MergeRequestList.tsx`
- **Purpose**: List all merge requests
- **Features**:
  - Filtering by status
  - Search functionality
  - Status indicators
  - Navigation to details

##### `MergeRequestCard.tsx`
- **Purpose**: Individual merge request display
- **Features**:
  - Request metadata
  - AI validation status
  - Author information
  - Status indicators

##### `MergeRequestDetail.tsx`
- **Purpose**: Detailed merge request view
- **Features**:
  - Complete request information
  - File changes and diffs
  - Comments and discussion
  - Action buttons

##### `DiffViewer.tsx`
- **Purpose**: Display file changes and differences
- **Features**:
  - Side-by-side diff view
  - Line-by-line change highlighting
  - Addition/deletion indicators
  - Context-aware diff display

#### File Components (`src/components/Files/`)

##### `FileExplorer.tsx`
- **Purpose**: Navigate repository file structure
- **Features**:
  - Tree view navigation
  - File type indicators
  - Search functionality
  - Context menus

##### `FileEditor.tsx`
- **Purpose**: Edit file contents
- **Features**:
  - Syntax highlighting
  - Auto-save functionality
  - Version history
  - Change tracking

### Data Layer

#### Types (`src/types/index.ts`)
- **User Interface**: User profiles and roles
- **Repository Interface**: Repository structure and metadata
- **File Interface**: File content and metadata
- **Merge Request Interface**: Complete merge request lifecycle
- **AI Validation Interface**: AI assessment results

#### Services (`src/services/api.ts`)
- **HTTP Client**: Axios-based API client
- **Endpoint Definitions**: All backend API endpoints
- **Request/Response Handling**: Data transformation and error handling
- **Authentication**: Token management and headers

#### Mock Data (`src/data/mockData.ts`)
- **Sample Repositories**: Example repository data
- **Sample Merge Requests**: Example merge request data
- **Sample Users**: Example user profiles
- **Development Data**: Mock data for development and testing

### Styling & UI

#### Tailwind CSS Configuration
- **Custom Colors**: OSINT Hub brand colors
- **Component Classes**: Reusable utility classes
- **Responsive Design**: Mobile-first responsive utilities
- **Dark Theme**: Consistent dark mode styling

#### Icon System
- **Lucide React**: Modern, customizable icons
- **Icon Usage**: Consistent icon implementation across components
- **Icon Theming**: Icon color and size management

## 🔄 Data Flow

### Frontend to Backend Communication

1. **User Action**: User interacts with UI component
2. **State Update**: Component state is updated
3. **API Call**: Service layer makes HTTP request to backend
4. **Backend Processing**: FastAPI processes request with validation
5. **Database Operation**: SQLAlchemy performs database operations
6. **AI Validation**: Google Gemini processes content if applicable
7. **Response**: Structured response sent back to frontend
8. **UI Update**: Frontend updates based on response

### AI Validation Flow

1. **Merge Request Creation**: User submits merge request
2. **Content Analysis**: AI service analyzes request content
3. **Validation Processing**: Gemini evaluates relevance and quality
4. **Result Storage**: Validation results stored in database
5. **Status Update**: Merge request status updated based on AI decision
6. **User Notification**: User informed of validation results

## 🛡️ Security Implementation

### Authentication Flow
1. **Clerk Integration**: JWT token generation and validation
2. **Token Verification**: Backend validates tokens with Clerk API
3. **User Resolution**: Database lookup for user information
4. **Session Management**: User session maintained across requests

### Authorization System
1. **Role Definitions**: Admin, Analyst, Contributor, Viewer roles
2. **Permission Decorators**: Route-level permission checking
3. **Resource Ownership**: Owner-based access control
4. **Collaboration Permissions**: Repository-level collaboration rules

### Data Validation
1. **Input Sanitization**: Pydantic schema validation
2. **SQL Injection Prevention**: SQLAlchemy parameterized queries
3. **XSS Protection**: Frontend input sanitization
4. **CSRF Protection**: Token-based request validation

## 🧪 Testing Strategy

### Backend Testing
- **Unit Tests**: Individual function and class testing
- **Integration Tests**: API endpoint testing
- **Database Tests**: Model and migration testing
- **AI Service Tests**: Mock AI service testing

### Frontend Testing
- **Component Tests**: Individual React component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user workflow testing
- **Accessibility Tests**: Screen reader and keyboard navigation

## 📊 Performance Considerations

### Backend Optimization
- **Database Indexing**: Optimized database queries
- **Connection Pooling**: Efficient database connection management
- **Caching**: Redis-based caching for frequently accessed data
- **Async Processing**: Non-blocking AI validation calls

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Tree shaking and minification
- **Image Optimization**: Optimized image loading
- **State Management**: Efficient state updates and re-renders

## 🔧 Development Workflow

### Code Organization
- **Feature-Based Structure**: Components organized by feature
- **Shared Components**: Reusable UI components
- **Utility Functions**: Common helper functions
- **Type Definitions**: Centralized TypeScript interfaces

### Development Tools
- **ESLint**: Code quality and style enforcement
- **Prettier**: Code formatting consistency
- **TypeScript**: Type safety and development experience
- **Vite**: Fast development server and build tool

### Deployment Pipeline
- **Frontend Build**: Vite production build process
- **Backend Deployment**: FastAPI production server setup
- **Database Migration**: Alembic migration management
- **Environment Configuration**: Environment-specific settings

## 🚀 Future Architecture Considerations

### Scalability
- **Microservices**: Potential service decomposition
- **Load Balancing**: Horizontal scaling strategies
- **Database Sharding**: Multi-database architecture
- **CDN Integration**: Content delivery optimization

### Advanced Features
- **Real-time Updates**: WebSocket integration
- **Advanced AI**: More sophisticated content analysis
- **Mobile Apps**: Native mobile applications
- **API Gateway**: Centralized API management

### Integration Capabilities
- **External Tools**: OSINT tool integrations
- **Data Sources**: External intelligence feeds
- **Analytics**: Advanced usage analytics
- **Reporting**: Automated report generation
