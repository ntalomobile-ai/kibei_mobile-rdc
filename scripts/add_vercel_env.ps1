param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$true)]
    [string]$ProjectId,
    [Parameter(Mandatory=$true)]
    [string]$Key,
    [Parameter(Mandatory=$true)]
    [string]$Value,
    [string]$Target = 'production'
)

$ErrorActionPreference = 'Stop'
$e = @{ key = $Key; value = $Value; target = @($Target); type = 'encrypted' }
$json = $e | ConvertTo-Json -Depth 4
Write-Output "Posting env $Key to project $ProjectId..."
try {
    $res = Invoke-RestMethod -Uri ("https://api.vercel.com/v9/projects/$ProjectId/env") -Method Post -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } -Body $json -ErrorAction Stop
    Write-Output "OK: $($res.key)"
} catch {
    if ($_.Exception.Response -ne $null) {
        $sr = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        $body = $sr.ReadToEnd()
        Write-Output 'ERROR BODY:'
        Write-Output $body
    } else {
        Write-Output 'ERROR MSG:'
        Write-Output $_.Exception.Message
    }
    exit 1
}
