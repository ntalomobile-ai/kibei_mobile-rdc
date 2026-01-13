param(
    [Parameter(Mandatory=$false)]
    [string]$Token = $env:VERCEL_TOKEN,
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "prj_vhniZezvPgM5gJ2nZVkh88Bp5KxT"
)

if (-not $Token) {
    Write-Error "Token Vercel non fourni. Utilisez -Token 'xxx' ou definissez VERCEL_TOKEN"
    exit 1
}

$ErrorActionPreference = 'Stop'

Write-Output "Recherche du dernier deploiement pour le projet $ProjectId..."
Write-Output ""

try {
    $deployments = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v6/deployments?projectId=$ProjectId&limit=1" `
        -Headers @{ Authorization = "Bearer $Token" } `
        -ErrorAction Stop
    
    if ($deployments.deployments.Count -eq 0) {
        Write-Output "Aucun deploiement trouve"
        exit 0
    }
    
    $latest = $deployments.deployments[0]
    
    Write-Output "Dernier deploiement:"
    Write-Output "  ID: $($latest.uid)"
    Write-Output "  URL: $($latest.url)"
    Write-Output "  State: $($latest.state)"
    Write-Output "  Created: $($latest.createdAt)"
    Write-Output "  Target: $($latest.target)"
    Write-Output ""
    
    if ($latest.state -eq "ERROR" -or $latest.state -eq "BUILDING") {
        Write-Output "Recuperation des logs..."
        Write-Output ""
        
        $events = Invoke-RestMethod `
            -Uri "https://api.vercel.com/v2/deployments/$($latest.uid)/events" `
            -Headers @{ Authorization = "Bearer $Token" } `
            -ErrorAction Stop
        
        Write-Output "=== LOGS DU DEPLOIEMENT ==="
        Write-Output ""
        foreach ($event in $events) {
            if ($event.payload -and $event.payload.text) {
                Write-Output $event.payload.text
            }
        }
        
        Write-Output ""
        Write-Output "=== FIN DES LOGS ==="
        Write-Output ""
        Write-Output "URL complete: https://vercel.com/kibeimobile-rdc-web/$($latest.uid)"
    }
    
} catch {
    Write-Error "Erreur: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Output "Reponse: $responseBody"
    }
}


