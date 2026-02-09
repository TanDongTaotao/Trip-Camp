<#
.SYNOPSIS
  Trip-Camp 阶段 1 一键验收脚本（Windows PowerShell 7+）

.DESCRIPTION
  自动验证：
    - GET  /health
    - POST /api/v1/auth/register（user/merchant/admin）
    - POST /api/v1/auth/login（user/merchant/admin）
    - GET  /api/v1/auth/me（无 token / 携带 token）
    - 典型错误用例：重复用户名(409)、非法密码(422)、错误密码(401)

  设计目标：
    - “能一键复跑”：优先复用已运行的后端；如果后端未运行，会尝试自动在 server/ 启动 `npm run start`
    - 输出可读的通过/失败信息；失败会返回非 0 退出码，便于 CI 或手动判断

.EXAMPLE
  # 在仓库根目录执行（推荐）
  pwsh -File .\verify-stage1.ps1

.EXAMPLE
  # 指定 BaseUrl（例如后端跑在不同端口）
  pwsh -File .\verify-stage1.ps1 -BaseUrl http://localhost:3001
#>

[CmdletBinding()]
param(
  [Parameter()]
  [string]$BaseUrl = 'http://localhost:3000',

  [Parameter()]
  [string]$ApiPrefix = '/api/v1',

  [Parameter()]
  [int]$HealthTimeoutSec = 30,

  [Parameter()]
  [switch]$KeepServerRunning
)

$ErrorActionPreference = 'Stop'

function Write-Section([string]$title) {
  Write-Host ''
  Write-Host ('=' * 80) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ('=' * 80) -ForegroundColor DarkGray
}

function Fail([string]$message) {
  Write-Host ("[FAIL] " + $message) -ForegroundColor Red
  throw $message
}

function Pass([string]$message) {
  Write-Host ("[PASS] " + $message) -ForegroundColor Green
}

function Info([string]$message) {
  Write-Host ("[INFO] " + $message) -ForegroundColor DarkGray
}

function Try-ParseJson([string]$content) {
  if ([string]::IsNullOrWhiteSpace($content)) { return $null }
  try { return $content | ConvertFrom-Json } catch { return $null }
}

function Invoke-Http([string]$method, [string]$url, $body = $null, [hashtable]$headers = $null) {
  $args = @{
    Method             = $method
    Uri                = $url
    SkipHttpErrorCheck = $true
  }
  if ($headers) { $args['Headers'] = $headers }
  if ($null -ne $body) {
    $args['ContentType'] = 'application/json'
    $args['Body'] = ($body | ConvertTo-Json -Compress)
  }
  $resp = Invoke-WebRequest @args
  $json = Try-ParseJson $resp.Content
  return [pscustomobject]@{
    StatusCode = [int]$resp.StatusCode
    Content    = $resp.Content
    Json       = $json
  }
}

function Assert-Status([string]$name, $resp, [int]$expected) {
  if ($resp.StatusCode -ne $expected) {
    $details = $resp.Content
    Fail "$name 期望 HTTP $expected，实际 HTTP $($resp.StatusCode)。响应：$details"
  }
  Pass "$name -> HTTP $expected"
}

function Assert-JsonField([string]$name, $json, [string]$fieldPath, [string]$expected) {
  $value = $json
  foreach ($seg in $fieldPath.Split('.')) {
    if ($null -eq $value) { break }
    $value = $value.$seg
  }
  if ($null -eq $value -or [string]$value -ne $expected) {
    $actual = if ($null -eq $value) { '<null>' } else { [string]$value }
    Fail "$name 期望 $fieldPath=$expected，实际 $fieldPath=$actual"
  }
  Pass "$name -> $fieldPath=$expected"
}

function Wait-Health([string]$url, [int]$timeoutSec) {
  $deadline = (Get-Date).AddSeconds($timeoutSec)
  while ((Get-Date) -lt $deadline) {
    try {
      $res = Invoke-RestMethod -Method Get -Uri $url
      if ($res -and $res.ok -eq $true) { return $true }
    } catch {
      Start-Sleep -Milliseconds 400
    }
  }
  return $false
}

$serverProcess = $null
try {
  Write-Section "0) 检查后端健康状态"

  $healthUrl = "$BaseUrl/health"
  $healthOk = $false
  try {
    $health = Invoke-RestMethod -Method Get -Uri $healthUrl
    if ($health -and $health.ok -eq $true) { $healthOk = $true }
  } catch {
    $healthOk = $false
  }

  if (-not $healthOk) {
    Info "未检测到运行中的后端，将尝试在 server/ 启动：npm run start"

    $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '.')).Path
    $serverDir = Join-Path $repoRoot 'server'
    if (-not (Test-Path $serverDir)) {
      Fail "找不到 server 目录：$serverDir"
    }

    $outFile = Join-Path $env:TEMP "trip-camp-server-start-$PID.out.log"
    $errFile = Join-Path $env:TEMP "trip-camp-server-start-$PID.err.log"

    $serverProcess = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", "npm", "run", "start") -WorkingDirectory $serverDir -PassThru -WindowStyle Hidden -RedirectStandardOutput $outFile -RedirectStandardError $errFile
    Info "已启动后端进程 PID=$($serverProcess.Id)"

    if (-not (Wait-Health -url $healthUrl -timeoutSec $HealthTimeoutSec)) {
      $outText = if (Test-Path $outFile) { Get-Content $outFile -Raw } else { '' }
      $errText = if (Test-Path $errFile) { Get-Content $errFile -Raw } else { '' }
      Fail "等待 /health 超时（${HealthTimeoutSec}s）。stdout：$outText`nstderr：$errText"
    }
  }

  $health2 = Invoke-Http -method 'GET' -url $healthUrl
  Assert-Status 'GET /health' $health2 200
  if ($health2.Json -and $health2.Json.ok -eq $true) {
    Pass "GET /health -> ok=true"
  } else {
    Fail "GET /health 未返回 { ok: true }，响应：$($health2.Content)"
  }

  Write-Section "1) /auth/me（无 token）应返回 401"
  $meNoToken = Invoke-Http -method 'GET' -url "$BaseUrl$ApiPrefix/auth/me"
  Assert-Status 'GET /auth/me (no token)' $meNoToken 401
  Assert-JsonField 'GET /auth/me (no token)' $meNoToken.Json 'code' 'UNAUTHORIZED'

  Write-Section "2) 注册三角色（user/merchant/admin）"
  $ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
  $pw = 'Passw0rd!'

  $uUser = "stage1_user_$ts"
  $uMer  = "stage1_merchant_$ts"
  $uAdm  = "stage1_admin_$ts"

  $regUser = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/register" -body @{ username = $uUser; password = $pw; role = 'user' }
  Assert-Status 'POST /auth/register (user)' $regUser 200
  Assert-JsonField 'POST /auth/register (user)' $regUser.Json 'user.role' 'user'

  $regMer = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/register" -body @{ username = $uMer; password = $pw; role = 'merchant' }
  Assert-Status 'POST /auth/register (merchant)' $regMer 200
  Assert-JsonField 'POST /auth/register (merchant)' $regMer.Json 'user.role' 'merchant'

  $regAdm = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/register" -body @{ username = $uAdm; password = $pw; role = 'admin' }
  if ($regAdm.StatusCode -eq 403) {
    Fail "POST /auth/register (admin) 被禁止（403）。请检查 server/.env：ALLOW_ADMIN_REGISTER=true（或确保 NODE_ENV != production）。响应：$($regAdm.Content)"
  }
  Assert-Status 'POST /auth/register (admin)' $regAdm 200
  Assert-JsonField 'POST /auth/register (admin)' $regAdm.Json 'user.role' 'admin'

  Write-Section "3) 注册错误用例"
  $dup = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/register" -body @{ username = $uUser; password = $pw; role = 'user' }
  Assert-Status 'POST /auth/register duplicate' $dup 409
  Assert-JsonField 'POST /auth/register duplicate' $dup.Json 'code' 'USERNAME_TAKEN'

  $badPwd = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/register" -body @{ username = "bad_$ts"; password = '1'; role = 'user' }
  Assert-Status 'POST /auth/register invalid password' $badPwd 422
  Assert-JsonField 'POST /auth/register invalid password' $badPwd.Json 'code' 'VALIDATION_ERROR'

  Write-Section "4) 登录三角色（user/merchant/admin）"
  $loginUser = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/login" -body @{ username = $uUser; password = $pw }
  Assert-Status 'POST /auth/login (user)' $loginUser 200
  Assert-JsonField 'POST /auth/login (user)' $loginUser.Json 'user.role' 'user'

  $loginMer = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/login" -body @{ username = $uMer; password = $pw }
  Assert-Status 'POST /auth/login (merchant)' $loginMer 200
  Assert-JsonField 'POST /auth/login (merchant)' $loginMer.Json 'user.role' 'merchant'

  $loginAdm = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/login" -body @{ username = $uAdm; password = $pw }
  Assert-Status 'POST /auth/login (admin)' $loginAdm 200
  Assert-JsonField 'POST /auth/login (admin)' $loginAdm.Json 'user.role' 'admin'

  Write-Section "5) 登录错误用例（错误密码 -> 401）"
  $wrong = Invoke-Http -method 'POST' -url "$BaseUrl$ApiPrefix/auth/login" -body @{ username = $uUser; password = 'wrong' }
  Assert-Status 'POST /auth/login wrong password' $wrong 401
  Assert-JsonField 'POST /auth/login wrong password' $wrong.Json 'code' 'UNAUTHORIZED'

  Write-Section "6) /auth/me（携带 token）应返回正确 role"
  $meUser = Invoke-Http -method 'GET' -url "$BaseUrl$ApiPrefix/auth/me" -headers @{ Authorization = ('Bearer ' + $loginUser.Json.token) }
  Assert-Status 'GET /auth/me (user token)' $meUser 200
  Assert-JsonField 'GET /auth/me (user token)' $meUser.Json 'user.role' 'user'

  $meMer = Invoke-Http -method 'GET' -url "$BaseUrl$ApiPrefix/auth/me" -headers @{ Authorization = ('Bearer ' + $loginMer.Json.token) }
  Assert-Status 'GET /auth/me (merchant token)' $meMer 200
  Assert-JsonField 'GET /auth/me (merchant token)' $meMer.Json 'user.role' 'merchant'

  $meAdm = Invoke-Http -method 'GET' -url "$BaseUrl$ApiPrefix/auth/me" -headers @{ Authorization = ('Bearer ' + $loginAdm.Json.token) }
  Assert-Status 'GET /auth/me (admin token)' $meAdm 200
  Assert-JsonField 'GET /auth/me (admin token)' $meAdm.Json 'user.role' 'admin'

  Write-Section "✅ 阶段 1 后端验收通过"
  Pass "所有检查项通过（health/auth/register/login/me/错误用例）"
  exit 0
} catch {
  Write-Host ''
  Write-Host '❌ 阶段 1 后端验收失败' -ForegroundColor Red
  Write-Host ($_.Exception.Message) -ForegroundColor Red
  exit 1
} finally {
  if ($serverProcess -and -not $KeepServerRunning) {
    try {
      Info "停止自动启动的后端进程 PID=$($serverProcess.Id)"
      Stop-Process -Id $serverProcess.Id -Force -ErrorAction SilentlyContinue
    } catch {}
  }
}

