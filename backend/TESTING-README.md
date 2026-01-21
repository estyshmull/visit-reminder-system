# Visit Reminder System - API Testing Suite

This folder contains comprehensive API testing scripts for the Visit Reminder System backend.

## 🎯 Testing Scripts Overview

### 1. PowerShell Script (`test-api-powershell.ps1`) - **RECOMMENDED for Windows**

**Best option for Windows users!** Native PowerShell script with colored output and detailed reporting.

```powershell
# Run the script
.\test-api-powershell.ps1
```

**Features:**
- ✅ Native Windows PowerShell (no dependencies)
- 🎨 Colored output for easy reading
- 📊 Detailed success/failure reporting
- 🔐 Automatic token extraction and usage
- ⚡ Fast execution

### 2. Bash Script (`test-api.sh`) - For Linux/Mac/WSL

Unix-style script with curl for comprehensive API testing.

```bash
# Make executable and run
chmod +x test-api.sh
./test-api.sh
```

### 3. REST Client File (`api-tests.http`) - For VS Code

Interactive API testing using VS Code REST Client extension.

1. Install "REST Client" extension in VS Code
2. Open `api-tests.http`
3. Click "Send Request" above each test

### 4. Node.js Script (`test-api.js`) - Programmatic Testing

Advanced testing with JSON report generation.

```bash
# Install dependencies first
npm install axios colors

# Or use the helper command
npm run install-deps

# Run tests
node test-api.js
```

**Features:**
- 📋 Generates `test-results.json` report
- 🔄 Programmatically reusable
- 📊 Detailed analytics

## 🚀 Quick Start

### Option A: PowerShell (Recommended)
```powershell
# Navigate to backend folder
cd backend

# Run PowerShell script
.\test-api-powershell.ps1
```

### Option B: Node.js
```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install axios colors

# Run tests
node test-api.js
```

## 📋 What Gets Tested

### ✅ Authentication & Authorization
- Health check endpoint (public)
- Test user creation
- Login and token generation
- Protected endpoints access control
- Invalid token rejection

### 👥 Users Management
- Get all users
- Get specific user
- Create new user
- Update user
- Delete user

### 📅 Schedules & Visits
- Get schedules
- Create schedule
- Get visits
- Create visit

### 🔔 Reminders & Reports
- Get reminders
- Get reports overview

### 🔒 Security Testing
- Access without authentication (should fail)
- Access with invalid token (should fail)
- Role-based access control

## 📊 Expected Results

After running any script, you should see output like:

```
🚀 Visit Reminder System API Testing Script
===============================================

Step 1: Health Check
Testing: Health Check... ✅ PASS (200)

Step 2: Create Test User
Testing: Create Test User... ✅ PASS (200)

Step 3: Login and Get Token
Testing: User Login... ✅ PASS (200)
   Token received: eyJhbGciOiJIUzI1NiIsInR5c...

Step 4: Test Protected Endpoints
Testing: Get All Users... ✅ OK (200)
Testing: Get Specific User... ⚠️  NOT FOUND (404)
Testing: Create User... ⚠️  NOT IMPLEMENTED (501)
...

📊 API Testing Report
=====================
✅ Passed: 8
❌ Failed: 2
⚠️  Partial: 5

Success Rate: 53%
```

## 🛠 Troubleshooting

### Common Issues

1. **Server not running**
   ```
   Error: connect ECONNREFUSED 127.0.0.1:3001
   ```
   **Solution:** Make sure the NestJS server is running:
   ```bash
   cd backend
   npm run start:dev
   ```

2. **No token received**
   ```
   ❌ No token received! Cannot test protected endpoints.
   ```
   **Solution:** Check if the login endpoint is properly implemented and returning `access_token`

3. **All endpoints return 401**
   ```
   ⚠️  AUTH ISSUE (401)
   ```
   **Solution:** JWT authentication might not be fully implemented

### Debug Mode

For more detailed output, you can modify the scripts to show full responses:

- **PowerShell**: Uncomment the response output lines
- **Node.js**: Run with verbose logging
- **REST Client**: Responses are shown automatically

## 🔧 Script Customization

### Adding New Tests

To add tests for new endpoints, modify any script and add:

```javascript
// Node.js example
await testEndpoint('GET', '/new-endpoint', null, null, 'Test New Endpoint', true);
```

```powershell
# PowerShell example
Test-EndpointFlexible -Method "GET" -Endpoint "/new-endpoint" -Description "Test New Endpoint" -UseAuth $true
```

### Changing Test Data

Modify the test data objects in the scripts:

```javascript
const loginData = {
  email: 'your-test@example.com',
  password: 'YourTestPassword!'
};
```

## 📁 Generated Files

- `test-results.json` - Detailed test results (Node.js script only)
- Console output with colored status indicators
- Token values for manual testing

## 🎯 Next Steps

1. **Run a test script** to see current API status
2. **Review failing tests** to identify unimplemented features
3. **Use generated token** for manual testing in Swagger UI
4. **Implement missing endpoints** based on test results

## 💡 Tips

- **Use PowerShell script** for quickest results on Windows
- **Use REST Client** for interactive testing during development
- **Use Node.js script** for automated testing and reporting
- **Check Swagger UI** at http://localhost:3001/api/docs for manual testing
- **Keep server running** during tests for best performance