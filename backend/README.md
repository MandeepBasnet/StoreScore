# StoreScore Backend

Node.js/Express backend for the StoreScore application, providing API integration with the StoreScore platform.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your StoreScore API credentials

### Running the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will start on `http://localhost:5000` (or the PORT specified in `.env`)

## 📁 Project Structure

```
backend/
├── config/              # Configuration files
│   └── api.config.js   # API configuration
├── controllers/         # Request handlers
│   ├── kpi.controller.js
│   └── performance.controller.js
├── middleware/          # Express middleware
│   └── auth.middleware.js
├── routes/             # API routes
│   ├── index.js
│   ├── kpi.routes.js
│   └── performance.routes.js
├── services/           # Business logic & external APIs
│   └── storeScoreAPI.js
├── utils/              # Utility functions
│   ├── errorHandler.js
│   ├── logger.js
│   └── validators.js
├── .env                # Environment variables (not in git)
├── .env.example        # Environment variables template
├── .gitignore
├── package.json
└── server.js           # Application entry point
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `API_BASE_URL` | StoreScore API base URL | Yes |
| `CLIENT_ID` | StoreScore API client ID | Yes |
| `CLIENT_SECRET` | StoreScore API client secret | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |

## 📡 API Endpoints

### Health Check
- `GET /api/health` - Server health check

### KPI Endpoints
- `POST /api/kpi` - Submit KPI data
- `GET /api/kpi` - Get all KPI entries (with optional filters)
- `GET /api/kpi/:id` - Get specific KPI entry
- `PUT /api/kpi/:id` - Update KPI entry
- `DELETE /api/kpi/:id` - Delete KPI entry

### Performance Endpoints
- `GET /api/performance/overview` - Get performance dashboard data
- `GET /api/performance/trends` - Get performance trends
- `GET /api/performance/comparison` - Get store comparison data

## 🔐 Authentication

The backend uses OAuth2 client credentials flow to authenticate with the StoreScore API. Authentication is handled automatically by the `storeScoreAPI` service, which:

1. Obtains an access token using client credentials
2. Caches the token until expiry
3. Automatically refreshes expired tokens
4. Injects the token into all API requests

## 🛠️ Development

### Testing the API

Test the health check endpoint:
```bash
curl http://localhost:5000/api/health
```

### Error Handling

The application uses custom error classes for consistent error handling:
- `ValidationError` (400) - Invalid input data
- `AuthenticationError` (401) - Authentication failures
- `NotFoundError` (404) - Resource not found
- `APIError` (500) - General API errors

## 📝 Notes

- All routes are automatically protected with authentication middleware
- API responses follow a consistent format with `success`, `data`, and `error` fields
- Request/response logging is handled by the logger utility
- CORS is enabled for frontend integration

## 🔗 Integration with Frontend

The backend is designed to work with the StoreScore React frontend. Update the frontend's API base URL to point to this backend server (e.g., `http://localhost:5000/api`).
