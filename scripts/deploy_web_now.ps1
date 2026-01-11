param(
    [Parameter(Mandatory=$false)]
    [string]$Token = $env:VERCEL_TOKEN
)

if (-not $Token) {
    Write-Error "Token Vercel non fourni. Utilisez -Token 'xxx' ou definissez la variable d'environnement VERCEL_TOKEN"
    exit 1
}

$ErrorActionPreference = 'Stop'

Write-Output "================================================"
Write-Output "Deploiement KiBei Web sur Vercel"
Write-Output "================================================"
Write-Output ""

# Etape 1: Chercher le projet existant ou creer un nouveau
Write-Output "[1/3] Recherche du projet Vercel..."
$projectName = 'kibeimobile-rdc-web'
$projectId = $null

try {
    $projects = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v9/projects" `
        -Headers @{ Authorization = "Bearer $Token" } `
        -ErrorAction Stop
    
    $existingProject = $projects.projects | Where-Object { $_.name -eq $projectName }
    
    if ($existingProject) {
        $projectId = $existingProject.id
        Write-Output "OK: Projet trouve: $projectName (ID: $projectId)"
        Write-Output ""
    } else {
        Write-Output "Projet '$projectName' non trouve. Creation du projet..."
        Write-Output ""
        
        $body = @{ 
            name = $projectName
            rootDirectory = 'apps/web'
            framework = 'nextjs'
            installCommand = 'cd ../..; npm ci --no-audit --no-fund'
            buildCommand = 'cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web'
            outputDirectory = '.next'
        } | ConvertTo-Json -Depth 6
        
        $newProject = Invoke-RestMethod `
            -Uri 'https://api.vercel.com/v9/projects' `
            -Method Post `
            -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } `
            -Body $body `
            -ErrorAction Stop
        
        $projectId = $newProject.id
        Write-Output "OK: Projet cree: $projectName (ID: $projectId)"
        Write-Output ""
        
        Write-Output "Ajout des variables d'environnement..."
        $envs = @(
            @{ key = 'NEXT_PUBLIC_API_URL'; value = 'https://kibeimobile-rdc-api.vercel.app'; target = @('production') },
            @{ key = 'NEXT_PUBLIC_WEB_URL'; value = 'https://kibeimobile-rdc-web.vercel.app'; target = @('production') },
            @{ key = 'NODE_ENV'; value = 'production'; target = @('production') }
        )
        
        foreach ($e in $envs) {
            $b = $e | ConvertTo-Json -Depth 4
            try {
                $res = Invoke-RestMethod `
                    -Uri "https://api.vercel.com/v9/projects/$projectId/env" `
                    -Method Post `
                    -Headers @{ Authorization = "Bearer $Token"; 'Content-Type' = 'application/json' } `
                    -Body $b `
                    -ErrorAction SilentlyContinue
                Write-Output "  OK: Variable ajoutee: $($e.key)"
            } catch {
                Write-Output "  Variable $($e.key) deja existante ou erreur"
            }
        }
        Write-Output ""
    }
} catch {
    Write-Error "Erreur lors de la recherche/creation du projet: $($_.Exception.Message)"
    if ($_.Exception.Response -ne $null) {
        $reader = New-Object System.IO.StreamReader ($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Output "Reponse de l'API: $responseBody"
    }
    exit 1
}

# Etape 2: Mettre a jour les settings du projet
Write-Output "[2/3] Mise a jour des settings du projet..."
$body = @{ 
    installCommand = 'cd ../..; npm ci --no-audit --no-fund'
    buildCommand = 'cd ../..; npm ci --no-audit --no-fund; npm run build --filter=kibei-web'
    outputDirectory = '.next'
    rootDirectory = 'apps/web'
} | ConvertTo-Json -Depth 6

try {
    $response = Invoke-RestMethod `
        -Uri "https://api.vercel.com/v9/projects/$projectId" `
        -Method PATCH `
        -Headers @{ 
            Authorization = "Bearer $Token"
            'Content-Type' = 'application/json' 
        } `
        -Body $body `
        -ErrorAction Stop
    
    Write-Output "OK: Settings mis a jour avec succes"
    Write-Output ""
} catch {
    Write-Warning "Impossible de mettre a jour les settings: $($_.Exception.Message)"
    Write-Output ""
}

# Etape 3: Lancer le deploiement
Write-Output "[3/3] Lancement du deploiement en production..."
Write-Output ""

$originalLocation = Get-Location
$webPath = Join-Path $PSScriptRoot ".." "apps" "web"
$webPath = Resolve-Path $webPath -ErrorAction SilentlyContinue

if (-not $webPath) {
    Write-Warning "Dossier apps/web non trouve. Tentative depuis la racine..."
    $webPath = Join-Path $PSScriptRoot ".." "web"
    $webPath = Resolve-Path $webPath -ErrorAction SilentlyContinue
}

if ($webPath) {
    Set-Location $webPath
    Write-Output "Dossier de travail: $webPath"
} else {
    Write-Warning "Impossible de trouver le dossier web. Deploiement depuis: $originalLocation"
}

try {
    Write-Output "Lancement du deploiement avec Vercel CLI..."
    Write-Output ""
    
    $env:VERCEL_TOKEN = $Token
    $deployOutput = & npx --yes vercel --token=$Token --prod --yes --force 2>&1 | Tee-Object -Variable cliOutput
    
    if ($LASTEXITCODE -eq 0) {
        Write-Output ""
        Write-Output "DEPLOIEMENT LANCE AVEC SUCCES!"
        Write-Output ""
        
        $urlFound = $false
        foreach ($line in $cliOutput) {
            if ($line -match '(https://[^\s]+\.vercel\.app)') {
                Write-Output "URL du deploiement: $($matches[1])"
                $urlFound = $true
            }
        }
        
        if (-not $urlFound) {
            Write-Output "URL de production: https://$projectName.vercel.app"
        }
        
        Write-Output ""
        Write-Output "Suivez le deploiement sur:"
        Write-Output "   https://vercel.com/$projectName"
        Write-Output ""
    } else {
        Write-Warning "Le deploiement CLI a rencontre une erreur (code: $LASTEXITCODE)"
        Write-Output ""
        Write-Output "Sortie du CLI:"
        $cliOutput | Write-Output
        Write-Output ""
        Write-Output "Vous pouvez aussi deployer manuellement avec:"
        Write-Output "   cd apps/web"
        Write-Output "   npx vercel --token=$Token --prod --yes"
        Write-Output ""
    }
} catch {
    Write-Error "Echec du deploiement CLI: $($_.Exception.Message)"
    Write-Output ""
    Write-Output "Vous pouvez deployer manuellement avec:"
    Write-Output "   cd apps/web"
    Write-Output "   npx vercel --token=$Token --prod --yes"
} finally {
    Set-Location $originalLocation
}

Write-Output ""
Write-Output "================================================"
Write-Output "Termine!"
Write-Output "================================================"

