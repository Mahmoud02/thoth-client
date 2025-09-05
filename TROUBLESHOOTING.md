# API Troubleshooting Guide

This guide helps you debug API connection issues with the Thoth backend.

## Quick Diagnosis

1. **Check the API Status widget** on the dashboard - it will show if the backend is reachable
2. **Open browser DevTools** (F12) and check the Console and Network tabs
3. **Look for detailed error messages** in the console

## ✅ CORS Issue Fixed!

**If you see CORS errors**, the solution is already implemented:
- ✅ **Vite proxy configured** to handle CORS automatically
- ✅ **Frontend runs on port 8081** (no conflict with backend)
- ✅ **API requests proxied** through Vite to avoid CORS issues

## Common Issues & Solutions

### 1. Backend Not Running

**Symptoms:**
- API Status shows "Error" with network error
- Console shows "Network error: Unable to connect to http://localhost:8080"

**Solution:**
```bash
# Start the Thoth backend server
# Make sure it's running on port 8080
```

### 2. CORS Issues

**Symptoms:**
- Request appears in Network tab but fails
- Console shows CORS error
- Browser blocks the request

**Solution:**
Configure CORS in your Thoth backend to allow:
- Origin: `http://localhost:8081` (or your frontend URL)
- Methods: `GET, POST, PUT, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization`

### 3. Wrong API Endpoint

**Symptoms:**
- 404 Not Found errors
- API Status shows "Error" with 404

**Solution:**
Check that your backend is running the correct endpoints:
- `GET /api/v1/health` (for health check)
- `GET /api/v1/buckets?namespaceId={id}`
- `POST /api/v1/buckets`

### 4. Port Conflicts

**Symptoms:**
- Connection refused errors
- Backend not starting

**Solution:**
```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill process using port 8080
kill -9 <PID>

# Or use a different port
# Update VITE_API_BASE_URL in .env
```

### 5. Environment Configuration

**Symptoms:**
- Requests going to wrong URL
- API Status shows wrong URL

**Solution:**
Create `.env` file in project root:
```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Debug Steps

### Step 1: Check Backend Health

```bash
# Test if backend is running
curl http://localhost:8080/api/v1/health

# Or test in browser
# Open: http://localhost:8080/api/v1/health
```

### Step 2: Check CORS Configuration

The backend should include these headers:
```
Access-Control-Allow-Origin: http://localhost:8081
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Step 3: Test API Endpoints

```bash
# Test list buckets
curl "http://localhost:8080/api/v1/buckets?namespaceId=1"

# Test create bucket
curl -X POST http://localhost:8080/api/v1/buckets \
  -H "Content-Type: application/json" \
  -d '{"name":"test-bucket","namespaceId":1}'
```

### Step 4: Check Browser Console

1. Open DevTools (F12)
2. Go to Console tab
3. Look for error messages
4. Check Network tab for failed requests

## Debug Information

The app now includes detailed logging. Check the browser console for:

- 🚀 **API Request**: Shows the exact request being made
- 📥 **API Response**: Shows the response from the server
- ❌ **API Error**: Shows detailed error information

## Environment Variables

Create a `.env` file in your project root:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Development settings
VITE_DEV_MODE=true
```

## Backend Requirements

Your Thoth backend should:

1. **Run on port 8080**
2. **Have CORS enabled** for `http://localhost:8081`
3. **Include these endpoints:**
   - `GET /api/v1/health` - Health check
   - `GET /api/v1/buckets?namespaceId={id}` - List buckets
   - `POST /api/v1/buckets` - Create bucket
   - `GET /api/v1/buckets/{id}` - Get bucket
   - `PUT /api/v1/buckets/{id}` - Update bucket
   - `DELETE /api/v1/buckets/{id}` - Delete bucket

## Still Having Issues?

1. **Check the API Status widget** on the dashboard
2. **Look at browser console** for detailed error messages
3. **Verify backend is running** and accessible
4. **Check CORS configuration** in your backend
5. **Ensure correct port numbers** (frontend: 8081, backend: 8080)

## Testing Commands

```bash
# Test frontend
npm run dev

# Test backend connectivity
curl http://localhost:8080/api/v1/health

# Test specific endpoint
curl "http://localhost:8080/api/v1/buckets?namespaceId=1"
```
