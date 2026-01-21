$ErrorActionPreference='Stop'
$Base='http://localhost:3001/api'

Write-Host '--- Health ---'
try{
  $r=Invoke-WebRequest -Uri "$Base/health" -UseBasicParsing -TimeoutSec 10
  Write-Host ("Status: " + $r.StatusCode)
  Write-Host $r.Content
} catch {
  Write-Host "Health check failed: $_"
}

function Do-Req($Method,$Url,$Body){
  Write-Host "`nRequest: $Method $Url"
  $status='N/A'; $content=''; 
  $t = Measure-Command {
    try {
      if($Method -eq 'GET'){
        $res=Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 30 -ErrorAction Stop
      } else {
        if ($Body) { $json = $Body | ConvertTo-Json -Depth 5 } else { $json='{}' }
        $res=Invoke-WebRequest -Uri $Url -UseBasicParsing -Method POST -Body $json -ContentType 'application/json' -TimeoutSec 30 -ErrorAction Stop
      }
      $status = $res.StatusCode
      $content = $res.Content
    } catch {
      $err = $_
      try { $status = $_.Exception.Response.StatusCode.Value__ } catch { $status = 'ERR' }
      $content = $err.ToString()
    }
  }
  Write-Host ("Status: " + $status + " | Time(ms): " + [math]::Round($t.TotalMilliseconds,2))
  return $content
}

Write-Host '--- GET /users ---'
$usersRaw = Do-Req 'GET' "$Base/users"
try{
  $users = $usersRaw | ConvertFrom-Json
  Write-Host ("Users count: " + $users.Count)
  if($users.Count -gt 0){ Write-Host ("First user: " + ($users[0] | ConvertTo-Json -Depth 2)) }
} catch { Write-Host 'Could not parse users JSON' }

Write-Host '--- GET /schedules ---'
$sRaw = Do-Req 'GET' "$Base/schedules"
try{ $s = $sRaw | ConvertFrom-Json; Write-Host ("Visits count: " + $s.Count) } catch { Write-Host 'Could not parse schedules JSON' }

Write-Host '--- GET /reminders/pending ---'
$pRaw = Do-Req 'GET' "$Base/reminders/pending"
$pending = @()
try{ $pending = $pRaw | ConvertFrom-Json; Write-Host ("Pending reminders: " + $pending.Count); if($pending.Count -gt 0){ Write-Host ("First pending: " + ($pending[0] | ConvertTo-Json -Depth 2)) } } catch { Write-Host 'Could not parse pending JSON' }

Write-Host '--- GET /reports/overview ---'
$rRaw = Do-Req 'GET' "$Base/reports/overview"
try{ $rep = $rRaw | ConvertFrom-Json; Write-Host ("Reports overview: " + ($rep | ConvertTo-Json -Depth 3)) } catch { Write-Host 'Could not parse reports JSON' }

if($pending -and $pending.Count -gt 0){
  $id = $pending[0].id
  Write-Host ("--- POST /reminders/$id/send ---")
  $sendRaw = Do-Req 'POST' "$Base/reminders/$id/send"
  try{ $sendRes = $sendRaw | ConvertFrom-Json; Write-Host ("Send response: " + ($sendRes | ConvertTo-Json -Depth 3)) } catch { Write-Host 'Could not parse send response' }
} else { Write-Host 'No pending reminders to send.' }
