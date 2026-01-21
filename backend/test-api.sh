#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Configuration
BASE_URL="http://localhost:3001/api"
TOKEN=""
PASSED=0
FAILED=0
PARTIAL=0

echo -e "${BLUE}🚀 Visit Reminder System API Testing Script${NC}"
echo -e "${BLUE}===============================================${NC}"
echo ""

# Function to make API calls and check responses
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local description=$5
    local auth_header=$6
    
    echo -n "Testing: $description... "
    
    if [ -n "$auth_header" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    # Split response and status code
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} ($status)"
        ((PASSED++))
        
        # Special handling for login to extract token
        if [[ "$endpoint" == "/auth/login" && "$status" == "200" ]]; then
            TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
            if [ -n "$TOKEN" ]; then
                echo -e "   ${BLUE}Token received: ${TOKEN:0:20}...${NC}"
            fi
        fi
        
        return 0
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $status)"
        echo -e "   Response: $body"
        ((FAILED++))
        return 1
    fi
}

# Function to test without expecting specific status
test_endpoint_flexible() {
    local method=$1
    local endpoint=$2
    local data=$3
    local description=$4
    local auth_header=$5
    
    echo -n "Testing: $description... "
    
    if [ -n "$auth_header" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $TOKEN" \
            -d "$data" 2>/dev/null)
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null)
    fi
    
    body=$(echo "$response" | head -n -1)
    status=$(echo "$response" | tail -n 1)
    
    case $status in
        200|201)
            echo -e "${GREEN}✅ OK${NC} ($status)"
            ((PASSED++))
            ;;
        401|403)
            echo -e "${YELLOW}⚠️  AUTH ISSUE${NC} ($status)"
            ((PARTIAL++))
            ;;
        404)
            echo -e "${YELLOW}⚠️  NOT FOUND${NC} ($status)"
            ((PARTIAL++))
            ;;
        500|501|502|503)
            echo -e "${RED}❌ SERVER ERROR${NC} ($status)"
            ((FAILED++))
            ;;
        *)
            echo -e "${YELLOW}⚠️  UNEXPECTED${NC} ($status)"
            ((PARTIAL++))
            ;;
    esac
    
    # Show response for non-200 status
    if [[ "$status" != "200" && "$status" != "201" ]]; then
        echo -e "   Response: $body"
    fi
}

echo -e "${YELLOW}Step 1: Health Check${NC}"
test_endpoint "GET" "/health" "" "200" "Health Check"
echo ""

echo -e "${YELLOW}Step 2: Create Test User${NC}"
test_endpoint "POST" "/auth/create-test-user" "" "200" "Create Test User"
echo ""

echo -e "${YELLOW}Step 3: Login and Get Token${NC}"
login_data='{"email":"test@example.com","password":"Test123!"}'
test_endpoint "POST" "/auth/login" "$login_data" "200" "User Login"
echo ""

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No token received! Cannot test protected endpoints.${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 4: Test Protected Endpoints${NC}"

# Users endpoints
test_endpoint_flexible "GET" "/users" "" "Get All Users" "auth"
test_endpoint_flexible "GET" "/users/test-user-123" "" "Get Specific User" "auth"
test_endpoint_flexible "POST" "/users" '{"name":"New User","email":"new@example.com"}' "Create User" "auth"
test_endpoint_flexible "PATCH" "/users/test-user-123" '{"name":"Updated User"}' "Update User" "auth"
test_endpoint_flexible "DELETE" "/users/test-user-123" "" "Delete User" "auth"

echo ""

# Other module endpoints
echo -e "${YELLOW}Step 5: Test Other Module Endpoints${NC}"

test_endpoint_flexible "GET" "/schedules" "" "Get Schedules" "auth"
test_endpoint_flexible "POST" "/schedules" '{"userId":"test-user-123","scheduledAt":"2026-01-15T10:00:00Z"}' "Create Schedule" "auth"
test_endpoint_flexible "GET" "/visits" "" "Get Visits" "auth"
test_endpoint_flexible "POST" "/visits" '{"userId":"test-user-123","date":"2026-01-15"}' "Create Visit" "auth"
test_endpoint_flexible "GET" "/reminders" "" "Get Reminders" "auth"
test_endpoint_flexible "GET" "/reports/overview" "" "Get Reports Overview" "auth"

echo ""

echo -e "${YELLOW}Step 6: Security Tests${NC}"

# Test without token
echo -n "Testing: Access without token... "
response=$(curl -s -w "\n%{http_code}" -X "GET" "$BASE_URL/users" -H "Content-Type: application/json" 2>/dev/null)
status=$(echo "$response" | tail -n 1)
if [ "$status" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Properly blocked)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (Should return 401, got $status)"
    ((FAILED++))
fi

# Test with invalid token
echo -n "Testing: Access with invalid token... "
response=$(curl -s -w "\n%{http_code}" -X "GET" "$BASE_URL/users" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer invalid-token-12345" 2>/dev/null)
status=$(echo "$response" | tail -n 1)
if [ "$status" = "401" ]; then
    echo -e "${GREEN}✅ PASS${NC} (Invalid token rejected)"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC} (Should return 401, got $status)"
    ((FAILED++))
fi

echo ""

# Final Report
echo -e "${BLUE}📊 API Testing Report${NC}"
echo -e "${BLUE}=====================${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Partial: $PARTIAL${NC}"
echo ""

TOTAL=$((PASSED + FAILED + PARTIAL))
if [ $TOTAL -gt 0 ]; then
    SUCCESS_RATE=$(($PASSED * 100 / $TOTAL))
    echo -e "Success Rate: $SUCCESS_RATE%"
fi

echo ""
echo -e "${BLUE}💡 Swagger UI available at: http://localhost:3001/api/docs${NC}"
echo -e "${BLUE}💡 Token for manual testing: $TOKEN${NC}"