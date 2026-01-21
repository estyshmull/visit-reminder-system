# סקריפט בדיקה לאינטגרציה עם ימות המשיח
# הרץ מתיקיית backend: .\test-yemot.ps1

$baseUrl = "http://localhost:3001/api/reminders"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "בדיקת אינטגרציה עם ימות המשיח" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. בדיקת משתני סביבה
Write-Host "1️⃣  בודק משתני סביבה..." -ForegroundColor Yellow
try {
    $env = Invoke-RestMethod -Uri "$baseUrl/debug/env" -Method Get
    Write-Host "   ✅ YEMOT_PHONE: $($env.YEMOT_PHONE)" -ForegroundColor Green
    Write-Host "   ✅ YEMOT_PASSWORD: $($env.YEMOT_PASSWORD)" -ForegroundColor Green
    Write-Host "   ✅ YEMOT_API_BASE: $($env.YEMOT_API_BASE)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# 2. בדיקת קונפיגורציה
Write-Host "`n2️⃣  בודק קונפיגורציה..." -ForegroundColor Yellow
try {
    $config = Invoke-RestMethod -Uri "$baseUrl/yemot/config" -Method Get
    Write-Host "   ✅ טלפון: $($config.phone)" -ForegroundColor Green
    Write-Host "   ✅ סיסמה: $($config.password)" -ForegroundColor Green
    Write-Host "   ✅ URL: $($config.apiBaseUrl)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# 3. בדיקת חיבור לימות המשיח
Write-Host "`n3️⃣  בודק חיבור לימות המשיח..." -ForegroundColor Yellow
try {
    $test = Invoke-RestMethod -Uri "$baseUrl/yemot/test" -Method Get
    if ($test.success) {
        Write-Host "   ✅ החיבור תקין!" -ForegroundColor Green
        Write-Host "   📝 הודעה: $($test.message)" -ForegroundColor Cyan
    } else {
        Write-Host "   ❌ החיבור נכשל: $($test.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
}

Start-Sleep -Seconds 1

# 4. שליחת הודעת בדיקה (אופציונלי - השאר מוערם)
Write-Host "`n4️⃣  שליחת הודעת בדיקה..." -ForegroundColor Yellow
$sendTestMessage = Read-Host "האם לשלוח הודעת בדיקה? (כן/לא)"

if ($sendTestMessage -eq "כן" -or $sendTestMessage -eq "yes" -or $sendTestMessage -eq "y") {
    $phoneNumber = Read-Host "הזן מספר טלפון לבדיקה (לדוגמה: 0501234567)"
    
    if ($phoneNumber) {
        try {
            $body = @{
                phoneNumber = $phoneNumber
                message = "שלום, זוהי הודעת בדיקה ממערכת ניהול המבקרים. אם קיבלת הודעה זו, המערכת עובדת בהצלחה. תודה."
            } | ConvertTo-Json

            $result = Invoke-RestMethod -Uri "$baseUrl/yemot/test-voice" -Method Post -Body $body -ContentType "application/json"
            
            if ($result.success) {
                Write-Host "   ✅ ההודעה נשלחה בהצלחה!" -ForegroundColor Green
                Write-Host "   📝 תגובה: $($result.message)" -ForegroundColor Cyan
            } else {
                Write-Host "   ❌ שליחת ההודעה נכשלה: $($result.error)" -ForegroundColor Red
            }
        } catch {
            Write-Host "   ❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ⏭️  דילגנו על שליחת הודעת בדיקה" -ForegroundColor Gray
}

# 5. קבלת מבקרים עם טלפון
Write-Host "`n5️⃣  בודק מבקרים עם מספר טלפון..." -ForegroundColor Yellow
try {
    $visitors = Invoke-RestMethod -Uri "$baseUrl/visitors-with-phone" -Method Get
    Write-Host "   ✅ נמצאו $($visitors.Count) מבקרים עם מספר טלפון" -ForegroundColor Green
    if ($visitors.Count -gt 0) {
        Write-Host "`n   רשימת מבקרים:" -ForegroundColor Cyan
        $visitors | ForEach-Object {
            Write-Host "   📞 $($_.name) - $($_.phone)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "   ❌ שגיאה: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "הבדיקה הסתיימה!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
