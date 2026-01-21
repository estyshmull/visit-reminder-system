# Visit Reminder System API Testing Script (PowerShell)
# =======================================================

# Configuration
$BaseUrl = "http://localhost:3001/api"
$Token = ""
$Passed = 0
$Failed = 0
$Partial = 0

# Colors (if supported)
$Colors = @{
    Red = "Red"
    Green = "Green"
    Yellow = "Yellow"
    Blue = "Cyan"
    White = "White"
}

function Write-ColoredLine {
    param($Message, $Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [int]$ExpectedStatus,
        [string]$Description,
        [bool]$UseAuth = $false
    )
    
    Write-Host "Testing: $Description... " -NoNewline
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
        }
        
        if ($UseAuth -and $Token) {
            $headers['Authorization'] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Data -and $Data -ne "") {
            $params['Body'] = $Data
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $status = $response.StatusCode
        
        if ($status -eq $ExpectedStatus) {
            Write-ColoredLine "PASS ($status)" $Colors.Green
            $script:Passed++
            
            # Extract token from login response
            if ($Endpoint -eq "/auth/login" -and ($status -eq 200 -or $status -eq 201)) {
                try {
                    $responseBody = $response.Content | ConvertFrom-Json
                    if ($responseBody.access_token) {
                        $script:Token = $responseBody.access_token
                        Write-ColoredLine "   Token received: $($Token.Substring(0, [Math]::Min(20, $Token.Length)))..." $Colors.Blue
                    }
                } catch {
                    Write-Host "   Could not parse token from response"
                }
            }
            
            return $true
        } else {
            Write-ColoredLine "❌ FAIL (Expected: $ExpectedStatus, Got: $status)" $Colors.Red
            Write-Host "   Response: $($response.Content)"
            $script:Failed++
            return $false
        }
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        
        if ($statusCode -eq $ExpectedStatus) {
            Write-ColoredLine "✅ PASS ($statusCode)" $Colors.Green
            $script:Passed++
            return $true
        } else {
            Write-ColoredLine "❌ ERROR ($statusCode)" $Colors.Red
            Write-Host "   Error: $($_.Exception.Message)"
            $script:Failed++
            return $false
        }
    }
}

function Test-EndpointFlexible {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = "",
        [string]$Description,
        [bool]$UseAuth = $false
    )
    
    Write-Host "Testing: $Description... " -NoNewline
    
    try {
        $headers = @{
            'Content-Type' = 'application/json'
        }
        
        if ($UseAuth -and $Token) {
            $headers['Authorization'] = "Bearer $Token"
        }
        
        $params = @{
            Uri = "$BaseUrl$Endpoint"
            Method = $Method
            Headers = $headers
            UseBasicParsing = $true
        }
        
        if ($Data -and $Data -ne "") {
            $params['Body'] = $Data
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $status = $response.StatusCode
        
        switch ($status) {
            {$_ -in @(200, 201)} {
                Write-ColoredLine "✅ OK ($status)" $Colors.Green
                $script:Passed++
            }
            default {
                Write-ColoredLine "⚠️  UNEXPECTED ($status)" $Colors.Yellow
                $script:Partial++
                Write-Host "   Response: $($response.Content)"
            }
        }
    }
    catch {
        $statusCode = 0
        $errorResponse = ""
        
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorResponse = $reader.ReadToEnd()
            } catch {}
        }
        
        switch ($statusCode) {
            {$_ -in @(401, 403)} {
                Write-ColoredLine "⚠️  AUTH ISSUE ($statusCode)" $Colors.Yellow
                $script:Partial++
            }
            404 {
                Write-ColoredLine "⚠️  NOT FOUND ($statusCode)" $Colors.Yellow
                $script:Partial++
            }
            {$_ -in @(500, 501, 502, 503)} {
                Write-ColoredLine "❌ SERVER ERROR ($statusCode)" $Colors.Red
                $script:Failed++
            }
            default {
                Write-ColoredLine "❌ ERROR ($statusCode)" $Colors.Red
                $script:Failed++
            }
        }
        
        if ($errorResponse) {
            Write-Host "   Response: $errorResponse"
        } else {
            Write-Host "   Error: $($_.Exception.Message)"
        }
    }
}

# Main Testing Flow
Write-ColoredLine "Visit Reminder System API Testing Script" $Colors.Blue
Write-ColoredLine "===============================================" $Colors.Blue
Write-Host ""

Write-ColoredLine "Step 1: Health Check" $Colors.Yellow
Test-Endpoint -Method "GET" -Endpoint "/health" -ExpectedStatus 200 -Description "Health Check"
Write-Host ""

Write-ColoredLine "Step 2: Create Test User" $Colors.Yellow
Test-Endpoint -Method "POST" -Endpoint "/auth/create-test-user" -ExpectedStatus 201 -Description "Create Test User"
Write-Host ""

Write-ColoredLine "Step 3: Login and Get Token" $Colors.Yellow
$loginData = '{"email":"test@example.com","password":"Test123!"}'
Test-Endpoint -Method "POST" -Endpoint "/auth/login" -Data $loginData -ExpectedStatus 201 -Description "User Login"
Write-Host ""

if (-not $Token) {
    Write-ColoredLine "❌ No token received! Cannot test protected endpoints." $Colors.Red
    exit 1
}

Write-ColoredLine "Step 4: Test Protected Endpoints" $Colors.Yellow

# Users endpoints
Test-EndpointFlexible -Method "GET" -Endpoint "/users" -Description "Get All Users" -UseAuth $true
Test-EndpointFlexible -Method "GET" -Endpoint "/users/test-user-123" -Description "Get Specific User" -UseAuth $true
Test-EndpointFlexible -Method "POST" -Endpoint "/users" -Data '{"name":"New User","email":"new@example.com"}' -Description "Create User" -UseAuth $true
Test-EndpointFlexible -Method "PATCH" -Endpoint "/users/test-user-123" -Data '{"name":"Updated User"}' -Description "Update User" -UseAuth $true
Test-EndpointFlexible -Method "DELETE" -Endpoint "/users/test-user-123" -Description "Delete User" -UseAuth $true

Write-Host ""

Write-ColoredLine "Step 5: Test Other Module Endpoints" $Colors.Yellow

Test-EndpointFlexible -Method "GET" -Endpoint "/schedules" -Description "Get Schedules" -UseAuth $true
Test-EndpointFlexible -Method "POST" -Endpoint "/schedules" -Data '{"userId":"test-user-123","scheduledAt":"2026-01-15T10:00:00Z"}' -Description "Create Schedule" -UseAuth $true
Test-EndpointFlexible -Method "GET" -Endpoint "/visits" -Description "Get Visits" -UseAuth $true
Test-EndpointFlexible -Method "POST" -Endpoint "/visits" -Data '{"userId":"test-user-123","date":"2026-01-15"}' -Description "Create Visit" -UseAuth $true
Test-EndpointFlexible -Method "GET" -Endpoint "/reminders" -Description "Get Reminders" -UseAuth $true
Test-EndpointFlexible -Method "GET" -Endpoint "/reports/overview" -Description "Get Reports Overview" -UseAuth $true

Write-Host ""

Write-ColoredLine "Step 6: Security Tests" $Colors.Yellow

# Test without token
Write-Host "Testing: Access without token... " -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/users" -Method GET -Headers @{'Content-Type'='application/json'} -UseBasicParsing -ErrorAction Stop
    Write-ColoredLine "❌ FAIL (Should be blocked, got $($response.StatusCode))" $Colors.Red
    $Failed++
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -eq 401) {
        Write-ColoredLine "✅ PASS (Properly blocked)" $Colors.Green
        $Passed++
    } else {
        Write-ColoredLine "❌ FAIL (Should return 401, got $statusCode)" $Colors.Red
        $Failed++
    }
}

# Test with invalid token
Write-Host "Testing: Access with invalid token... " -NoNewline
try {
    $headers = @{
        'Content-Type' = 'application/json'
        'Authorization' = 'Bearer invalid-token-12345'
    }
    $response = Invoke-WebRequest -Uri "$BaseUrl/users" -Method GET -Headers $headers -UseBasicParsing -ErrorAction Stop
    Write-ColoredLine "❌ FAIL (Should reject invalid token, got $($response.StatusCode))" $Colors.Red
    $Failed++
} catch {
    $statusCode = [int]$_.Exception.Response.StatusCode
    if ($statusCode -eq 401) {
        Write-ColoredLine "✅ PASS (Invalid token rejected)" $Colors.Green
        $Passed++
    } else {
        Write-ColoredLine "❌ FAIL (Should return 401, got $statusCode)" $Colors.Red
        $Failed++
    }
}

Write-Host ""

# Final Report
Write-ColoredLine "API Testing Report" $Colors.Blue
Write-ColoredLine "=====================" $Colors.Blue
Write-ColoredLine "Passed: $Passed" $Colors.Green
Write-ColoredLine "Failed: $Failed" $Colors.Red
Write-ColoredLine "Partial: $Partial" $Colors.Yellow
Write-Host ""

$Total = $Passed + $Failed + $Partial
if ($Total -gt 0) {
    $SuccessRate = [math]::Round(($Passed / $Total) * 100, 1)
    Write-Host "Success Rate: $SuccessRate%"
}

Write-Host ""
Write-ColoredLine "Swagger UI available at: http://localhost:3001/api/docs" $Colors.Blue
Write-ColoredLine "Token for manual testing: $Token" $Colors.Blue