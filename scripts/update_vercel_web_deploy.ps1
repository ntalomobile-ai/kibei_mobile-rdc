param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'

Write-Output "================================================"
Write-Output "Mise à jour des settings Vercel et déploiement"
Write-Output "================================================"
Write-Output ""

# Étape 1: Mettre à jour les settings du projet
Write-Output "[1/2] Mise à jour des settings du projet $ProjectId..."

$body = @{ 
    installCommand = 'cd ../..; npm ci --no-audit --no-fund'
    buildCommand = 'cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web'
    outputDirectory = '.next'
    rootDirectory = 'apps/web'
} | ConvertTo-Json -Depth 6

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v9/projects/$ProjectId" `
        -Method PATCH `
        -Headers @{ 
            Authorization = "Bearer $Token"
            'Content-Type' = 'application/json' 
        } `
        -Body $body `
        -ErrorAction Stop
    
    Write-Output "✓ Settings mis à jour avec succès"
    Write-Output "  - Install Command: $($response.installCommand)"
    Write-Output "  - Build Command: $($response.buildCommand)"
    Write-Output "  - Root Directory: $($response.rootDirectory)"
    Write-Output ""
} catch {
    Write-Error "✗ Échec de la mise à jour des settings: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Output "Réponse de l'API: $responseBody"
    }
    exit 1
}

# Étape 2: Lancer un nouveau déploiement via CLI
Write-Output "[2/2] Lancement du déploiement en production avec Vercel CLI..."
Write-Output ""

# Naviguer vers le dossier web
$originalLocation = Get-Location
$webPath = Join-Path $PSScriptRoot ".." "apps" "web"
$webPath = Resolve-Path $webPath -ErrorAction SilentlyContinue

if (-not $webPath) {
    Write-Warning "⚠ Dossier apps/web non trouvé. Tentative depuis la racine du projet..."
    $webPath = Join-Path $PSScriptRoot ".." "web"
    $webPath = Resolve-Path $webPath -ErrorAction SilentlyContinue
}

if ($webPath) {
    Set-Location $webPath
    Write-Output "Dossier de travail: $webPath"
} else {
    Write-Warning "⚠ Impossible de trouver le dossier web. Déploiement depuis: $originalLocation"
}

try {
    Write-Output "Lancement du déploiement..."
    Write-Output ""
    
    # Utiliser la CLI Vercel
    $env:VERCEL_TOKEN = $Token
    $deployOutput = & npx --yes vercel --token=$Token --prod --yes --force 2>&1 | Tee-Object -Variable cliOutput
    
    if ($LASTEXITCODE -eq 0) {
        Write-Output ""
        Write-Output "✓ Déploiement lancé avec succès!"
        Write-Output ""
        # Extraire l'URL du déploiement si disponible dans la sortie
        foreach ($line in $cliOutput) {
            if ($line -match 'https://.*\.vercel\.app') {
                Write-Output "URL du déploiement: $line"
            }
        }
    } else {
        Write-Warning "⚠ Le déploiement CLI a rencontré une erreur (code: $LASTEXITCODE)"
        Write-Output ""
        Write-Output "Sortie du CLI:"
        $cliOutput | Write-Output
        Write-Output ""
        Write-Output "Note: Si vous avez une erreur de permissions, assurez-vous que:"
        Write-Output "  1. Le token Vercel a les bonnes permissions"
        Write-Output "  2. Votre compte Git est ajouté à l'équipe Vercel"
        Write-Output ""
        Write-Output "Vous pouvez aussi déployer manuellement depuis apps/web avec:"
        Write-Output "  cd apps/web"
        Write-Output "  npx vercel --token=$Token --prod --yes"
    }
} catch {
    Write-Error "✗ Échec du déploiement CLI: $($_.Exception.Message)"
    Write-Output ""
    Write-Output "Vous pouvez déployer manuellement avec:"
    Write-Output "  cd apps/web (ou web)"
    Write-Output "  npx vercel --token=$Token --prod --yes"
} finally {
    Set-Location $originalLocation
}

Write-Output ""
Write-Output "================================================"
Write-Output "Terminé!"
Write-Output "================================================"

