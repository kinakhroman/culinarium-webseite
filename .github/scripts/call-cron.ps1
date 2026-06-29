<#
  Ruft einen geschützten Cron-Endpunkt der Website auf – robust gegen Server-Wackler.
  Nutzt PowerShells Invoke-WebRequest (.NET-TLS), weil Hostingers WAF Requests vom
  Standard-curl auf GitHub-Runnern mit leerem HTTP 400 ablehnt (Ausfall 24.–26.06.).
  Gleicher Aufruf per PowerShell/Browser geht durch.

  Aufruf:  pwsh call-cron.ps1 -Label "<Label>" -Url "<URL>"
  Erwartet: Umgebungsvariable API_KEY (= MENU_API_KEY, von GitHub maskiert)

  Verhalten: 4 Versuche mit Backoff (20/40/80 s). Nur 2xx = Erfolg. 401 bricht
  sofort ab. Sonst Exit 1 → GitHub-Run wird rot (Fehlermail). Kein stilles "grün".
#>
param(
  [Parameter(Mandatory = $true)][string]$Label,
  [Parameter(Mandatory = $true)][string]$Url
)

$ErrorActionPreference = 'Stop'
$key = $env:API_KEY
if ([string]::IsNullOrWhiteSpace($key)) {
  Write-Error "API_KEY (MENU_API_KEY) ist nicht gesetzt."
  exit 1
}

$headers = @{
  'x-api-key' = $key
  'Accept'    = 'application/json'
}
$attempts   = 4
$sleepBase  = 20
$maxTimeSec = 90

for ($i = 1; $i -le $attempts; $i++) {
  Write-Host "[$Label] Versuch $i/$attempts -> $Url"
  $code = 0
  try {
    $resp = Invoke-WebRequest -Uri $Url -Method POST -Headers $headers `
      -TimeoutSec $maxTimeSec -SkipHttpErrorCheck -UserAgent 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124.0 Safari/537.36'
    $code = [int]$resp.StatusCode
    $body = $resp.Content
  } catch {
    Write-Host "[$Label] Verbindungsfehler: $($_.Exception.Message)"
    $code = 0
  }

  Write-Host "[$Label] HTTP $code"
  if ($body) { Write-Host ($body.Substring(0, [Math]::Min(800, $body.Length))) }

  if ($code -ge 200 -and $code -lt 300) {
    Write-Host "[$Label] OK Erfolg."
    exit 0
  }
  if ($code -eq 401) {
    Write-Host "[$Label] 401 Nicht autorisiert - MENU_API_KEY pruefen. Abbruch."
    exit 1
  }

  if ($i -lt $attempts) {
    $wait = $sleepBase * [Math]::Pow(2, $i - 1)
    Write-Host "[$Label] HTTP $code - warte ${wait}s und versuche erneut ..."
    Start-Sleep -Seconds $wait
  }
}

Write-Host "[$Label] Nach $attempts Versuchen gescheitert (letzter HTTP $code)."
exit 1
