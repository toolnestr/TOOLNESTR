# ─────────────────────────────────────────────────────────────
#  AirShare — Phase 2 live smoke test
#  1. In terminal A:  cd C:\Users\ADNAN\Desktop\TOOLNESTR
#     $env:CLOUDFLARE_API_TOKEN = "<token>"   # only needed for remote resources
#     npx wrangler dev --config wrangler-airshare.jsonc --local --port 8799 `
#        --var RATE_LIMIT_MAX_FAILS:3 RATE_LIMIT_WINDOW_SECONDS:60 PRESENCE_TTL_SECONDS:15 MAX_FILE_BYTES:26214400
#  2. In terminal B:  powershell -ExecutionPolicy Bypass -File airshare\smoke-test.ps1
# ─────────────────────────────────────────────────────────────
$ErrorActionPreference = 'Stop'
$base = 'http://127.0.0.1:8799/api'
function Show($label, $obj) { Write-Host "`n== $label ==" -ForegroundColor Cyan; $obj | ConvertTo-Json -Depth 6 }

# 1) Create a PIN-protected room
$create = Invoke-RestMethod -Method Post -Uri "$base/room" -ContentType 'application/json' `
  -Body (@{ pin = '1234'; max_devices = 5; ttl_seconds = 3600 } | ConvertTo-Json)
Show 'CREATE ROOM (expect 201, has_pin=true)' $create
$code = $create.room.code
$pinHeaders = @{ 'X-Room-Pin' = '1234' }

# 2) GET without PIN → expect 401
try { Invoke-RestMethod -Uri "$base/room/$code" -Method Get } catch { Write-Host "`n== GET no PIN (expect 401) ==" -ForegroundColor Cyan; Write-Host $_.Exception.Response.StatusCode.value__ }

# 3) GET with PIN → expect 200
Show 'GET ROOM with PIN' (Invoke-RestMethod -Uri "$base/room/$code" -Headers $pinHeaders)

# 4) Heartbeat two devices
Invoke-RestMethod -Method Post -Uri "$base/room/$code/heartbeat" -Headers $pinHeaders -ContentType 'application/json' -Body (@{ device_id='dev-A'; label='Laptop' } | ConvertTo-Json) | Out-Null
Show 'HEARTBEAT dev-B (expect 2 present)' (Invoke-RestMethod -Method Post -Uri "$base/room/$code/heartbeat" -Headers $pinHeaders -ContentType 'application/json' -Body (@{ device_id='dev-B'; label='Phone' } | ConvertTo-Json))

# 5) Add a text item + a link item
$item = Invoke-RestMethod -Method Post -Uri "$base/room/$code/item" -Headers $pinHeaders -ContentType 'application/json' -Body (@{ kind='text'; content='hello world'; device_id='dev-A' } | ConvertTo-Json)
Show 'ADD TEXT ITEM' $item
Show 'ADD LINK ITEM' (Invoke-RestMethod -Method Post -Uri "$base/room/$code/item" -Headers $pinHeaders -ContentType 'application/json' -Body (@{ kind='link'; content='https://example.com'; device_id='dev-B' } | ConvertTo-Json))

# 6) GET room → expect 2 items, 2 present
Show 'GET ROOM (expect items=2, presence=2)' (Invoke-RestMethod -Uri "$base/room/$code" -Headers $pinHeaders)

# 7) Delete the text item
Invoke-RestMethod -Method Delete -Uri "$base/room/$code/item/$($item.item.id)" -Headers $pinHeaders | Out-Null
Show 'GET ROOM after delete (expect items=1)' (Invoke-RestMethod -Uri "$base/room/$code" -Headers $pinHeaders)

# 8) Rate limit: 4 bad-PIN joins (limit=3) → last should be 429
Write-Host "`n== RATE LIMIT (bad PIN x4, limit=3) ==" -ForegroundColor Cyan
for ($i=1; $i -le 4; $i++) {
  try { Invoke-RestMethod -Uri "$base/room/$code" -Headers @{ 'X-Room-Pin'='0000' } | Out-Null; "  $i -> 200 (unexpected)" }
  catch { "  $i -> $($_.Exception.Response.StatusCode.value__)" }
}
Write-Host "`nDone." -ForegroundColor Green
