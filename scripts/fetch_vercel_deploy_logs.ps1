param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
Write-Output "Fetching deployments for project $ProjectId..."

$hdr = @{ Authorization = "Bearer $Token" }

try {
    $deps = Invoke-RestMethod -Uri ("https://api.vercel.com/v6/now/deployments?projectId=$ProjectId") -Headers $hdr -ErrorAction Stop
} catch {
    Write-Error "Failed to list deployments: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $sr = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        Write-Output $sr.ReadToEnd()
    }
    exit 1
}

if (-not $deps.deployments -or $deps.deployments.Count -eq 0) {
    Write-Error "No deployments found for project $ProjectId"
    exit 1
}

$latest = $deps.deployments | Sort-Object -Property created -Descending | Select-Object -First 1
Write-Output "Latest deployment ID: $($latest.uid)  URL: $($latest.url)  State: $($latest.state)"

$uid = $latest.uid

function TryEndpoint($url) {
    Write-Output "Trying $url"
    try {
        $res = Invoke-RestMethod -Uri $url -Headers $hdr -ErrorAction Stop
        Write-Output "Success: $url"
        return $res
    } catch {
        Write-Output "Failed: $($_.Exception.Message)"
        if ($_.Exception.Response -ne $null) {
            $sr = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
            $body = $sr.ReadToEnd()
            Write-Output "Response body:\n$body"
        }
        return $null
    }
}

# Try common endpoints
$candidates = @(
    "https://api.vercel.com/v6/now/deployments/$uid/logs",
    "https://api.vercel.com/v6/now/deployments/$uid/events",
    "https://api.vercel.com/v5/now/deployments/$uid/events",
    "https://api.vercel.com/v8/now/deployments/$uid/events",
    "https://api.vercel.com/v1/now/deployments/$uid/logs",
    "https://api.vercel.com/v1/now/deployments/$uid/events"
)

foreach ($url in $candidates) {
    $r = TryEndpoint $url
    if ($r -ne $null) {
        Write-Output "--- BEGIN LOGS FROM $url ---"
        Write-Output ($r | ConvertTo-Json -Depth 10)
        Write-Output "--- END LOGS ---"
        exit 0
    }
}

Write-Error "Could not retrieve logs from known endpoints."
exit 1
