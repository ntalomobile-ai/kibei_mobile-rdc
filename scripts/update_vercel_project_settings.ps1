param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
Write-Output "Updating Vercel project settings for $ProjectId..."

$body = @{ 
    installCommand = 'cd ../..; npm ci --no-audit --no-fund'
    buildCommand = 'cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web'
    rootDirectory = 'apps/web'
    outputDirectory = '.next'
}

$json = $body | ConvertTo-Json -Depth 6

try {
    $r = Invoke-RestMethod -Uri ("https://api.vercel.com/v9/projects/$ProjectId") -Method Patch -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } -Body $json -ErrorAction Stop
    Write-Output "Updated project settings: $($r.id)"
    Write-Output (ConvertTo-Json $r -Depth 4)
} catch {
    Write-Error "Failed to update project settings: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $sr = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        Write-Output 'Response body:'
        Write-Output $sr.ReadToEnd()
    }
    exit 1
}
