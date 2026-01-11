param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ErrorActionPreference = 'Stop'
Write-Output "Creating Vercel project 'kibeimobile-rdc-web'..."

$body = @{ 
    name = 'kibeimobile-rdc-web'
    rootDirectory = 'apps/web'
    framework = 'nextjs'
    installCommand = 'cd ../..; npm ci --no-audit --no-fund'
    buildCommand = 'cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web'
    outputDirectory = '.next'
    gitRepository = @{ type = 'github'; repo = 'gexpress833-del/kibeimobile-rdc' }
}

$json = $body | ConvertTo-Json -Depth 6

try {
    $r = Invoke-RestMethod -Uri 'https://api.vercel.com/v9/projects' -Method Post -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } -Body $json
} catch {
    Write-Error "Failed to create project: $($_.Exception.Message)"
    exit 1
}

Write-Output "Project created: $($r.id) ($($r.name))"
$projectId = $r.id

Write-Output "Adding public environment variables..."
$envs = @(
    @{ key = 'NEXT_PUBLIC_API_URL'; value = 'https://kibeimobile-rdc-api.vercel.app'; target = @('production') },
    @{ key = 'NEXT_PUBLIC_WEB_URL'; value = 'https://kibeimobile-rdc-web.vercel.app'; target = @('production') },
    @{ key = 'NODE_ENV'; value = 'production'; target = @('production') }
)

foreach ($e in $envs) {
    $b = $e | ConvertTo-Json -Depth 4
    try {
        $res = Invoke-RestMethod -Uri "https://api.vercel.com/v9/projects/$projectId/env" -Method Post -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } -Body $b
        Write-Output "Added env: $($res.key)"
    } catch {
        Write-Error "Failed to add env $($e.key): $($_.Exception.Message)"
    }
}

Write-Output 'Script finished.'
