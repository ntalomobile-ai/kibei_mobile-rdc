param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
$e = @{ key = 'NEXT_PUBLIC_API_URL'; value = 'https://kibeimobile-rdc-api.vercel.app'; target = @('production'); type = 'encrypted' }
$json = $e | ConvertTo-Json -Depth 4
Write-Output "Posting env to project $ProjectId..."
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
