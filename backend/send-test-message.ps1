# Test Voice Message Script
# Run this in a separate terminal while the server is running

Write-Host "`nSending test voice message to 0556727386..." -ForegroundColor Yellow

$body = @{
    phoneNumber = "0556727386"
    message = "Shalom, this is a test message from the visitor management system. If you received this message, the system is working successfully. Thank you and goodbye."
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/api/reminders/yemot/test-voice" `
        -Method Post `
        -Body $body `
        -ContentType "application/json; charset=utf-8"
    
    Write-Host "`nServer Response:" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 5 | Write-Host
    
    if ($response.success) {
        Write-Host "`nMessage sent successfully!" -ForegroundColor Green
        Write-Host "The phone should receive a call soon..." -ForegroundColor Cyan
    } else {
        Write-Host "`nError: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "`nError sending request:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nMake sure the server is running on http://localhost:3001" -ForegroundColor Yellow
}

Write-Host ""
