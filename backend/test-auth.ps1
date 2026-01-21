# Test Auth API - עבור AdminUser
$baseUrl = "http://localhost:3001/api"

Write-Host "=== בדיקת Auth עם AdminUser ===" -ForegroundColor Cyan

# 1. יצירת מנהל ראשון
Write-Host "`n1. יצירת מנהל ראשון במערכת" -ForegroundColor Yellow
$setupBody = @{
    username = "admin"
    password = "Admin123!"
    fullName = "מנהל ראשי"
} | ConvertTo-Json

try {
    $setupResponse = Invoke-RestMethod -Uri "$baseUrl/auth/setup-first-admin" `
        -Method Post `
        -ContentType "application/json" `
        -Body $setupBody
    Write-Host "✓ מנהל נוצר בהצלחה:" -ForegroundColor Green
    $setupResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "✗ שגיאה ביצירת מנהל:" -ForegroundColor Red
    $_.Exception.Message
}

# 2. התחברות עם המנהל
Write-Host "`n2. התחברות למערכת" -ForegroundColor Yellow
$loginBody = @{
    username = "admin"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    Write-Host "✓ התחברות הצליחה:" -ForegroundColor Green
    $loginResponse | ConvertTo-Json -Depth 3
    
    $token = $loginResponse.access_token
    Write-Host "`nToken שמור למשתנה `$token" -ForegroundColor Cyan
} catch {
    Write-Host "✗ שגיאה בהתחברות:" -ForegroundColor Red
    $_.Exception.Message
}

# 3. ניסיון התחברות שגוי
Write-Host "`n3. בדיקת התחברות עם סיסמה שגויה" -ForegroundColor Yellow
$wrongLoginBody = @{
    username = "admin"
    password = "wrong_password"
} | ConvertTo-Json

try {
    $wrongResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $wrongLoginBody
    Write-Host "✗ לא אמור להצליח!" -ForegroundColor Red
} catch {
    Write-Host "✓ נכשל כצפוי - סיסמה שגויה נדחתה" -ForegroundColor Green
}

# 4. ניסיון ליצור מנהל שני (אמור להיכשל)
Write-Host "`n4. ניסיון ליצור מנהל שני (אמור להיכשל)" -ForegroundColor Yellow
$secondAdminBody = @{
    username = "admin2"
    password = "Admin456!"
    fullName = "מנהל שני"
} | ConvertTo-Json

try {
    $secondResponse = Invoke-RestMethod -Uri "$baseUrl/auth/setup-first-admin" `
        -Method Post `
        -ContentType "application/json" `
        -Body $secondAdminBody
    Write-Host "✗ לא אמור להצליח!" -ForegroundColor Red
} catch {
    Write-Host "✓ נכשל כצפוי - כבר קיימים מנהלים במערכת" -ForegroundColor Green
}

Write-Host "`n=== בדיקות Auth הושלמו ===" -ForegroundColor Cyan
