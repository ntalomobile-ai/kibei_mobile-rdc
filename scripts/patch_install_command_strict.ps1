param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
Write-Output "Patching project $ProjectId installCommand to a stricter sequence..."

$body = @{ 
    installCommand = 'cd ../..; npm cache clean --force; npm ci --no-audit --no-fund'
    buildCommand = 'cd ../..; npm cache clean --force; npm ci --no-audit --no-fund; npm run build --filter=kibei-web'
    rootDirectory = 'apps/web'
    outputDirectory = '.next'
}

$json = $body | ConvertTo-Json -Depth 6

try {
    $r = Invoke-RestMethod -Uri ("https://api.vercel.com/v9/projects/$ProjectId") -Method Patch -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } -Body $json -ErrorAction Stop
    Write-Output "Patched: $($r.id)"
} catch {
    Write-Error "Patch failed: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $sr = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        Write-Output $sr.ReadToEnd()
    }
    exit 1
}
