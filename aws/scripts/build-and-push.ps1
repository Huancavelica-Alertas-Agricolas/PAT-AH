#!/usr/bin/env pwsh
# Script for building and pushing Docker images to ECR

param(
    [string]$Region = "us-east-1",
    [string]$AccountId,
    [switch]$PushImages = $false
)

if (-not $AccountId) {
    Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
    $AccountId = (aws sts get-caller-identity --query Account --output text)
    if (-not $AccountId) {
        Write-Error "Failed to get AWS Account ID. Make sure you're authenticated with AWS CLI."
        exit 1
    }
}

$ECR_BASE_URL = "$AccountId.dkr.ecr.$Region.amazonaws.com"
$SERVICES = @("auth-service", "users-service", "rest-service", "ai-service", "ingest-service")

Write-Host "🏗️  Building and pushing Docker images to ECR" -ForegroundColor Green
Write-Host "Account ID: $AccountId" -ForegroundColor Cyan
Write-Host "Region: $Region" -ForegroundColor Cyan
Write-Host "ECR Base URL: $ECR_BASE_URL" -ForegroundColor Cyan

# Login to ECR
Write-Host "🔐 Logging in to ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $ECR_BASE_URL

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to login to ECR"
    exit 1
}

# Build and push each service
foreach ($service in $SERVICES) {
    $imageName = "pat-ah-$service"
    $imageTag = "$ECR_BASE_URL/${imageName}:latest"
    
    Write-Host "🔨 Building $service..." -ForegroundColor Blue
    
    # Resolve paths relative to the script location so the script can be run from any CWD
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $repoRoot = Resolve-Path (Join-Path $scriptDir "..\..") | Select-Object -ExpandProperty Path
    $backendPath = Join-Path $repoRoot "Backend-Huancavelica-Alertas-Agricolas"

    if (-not (Test-Path $backendPath)) {
        Write-Error "Backend path not found: $backendPath"
        continue
    }

    $dockerfilePath = Join-Path $backendPath "services\$service\Dockerfile"

    # Build the image
    docker build -t $imageName -f $dockerfilePath $backendPath
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to build $service"
        continue
    }
    
    # Tag the image
    docker tag $imageName $imageTag
    
    if ($PushImages) {
        Write-Host "📤 Pushing $service to ECR..." -ForegroundColor Magenta
        docker push $imageTag
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Successfully pushed $service" -ForegroundColor Green
        } else {
            Write-Error "❌ Failed to push $service"
        }
    } else {
        Write-Host "🏷️  Tagged $service as $imageTag (use -PushImages to push)" -ForegroundColor Cyan
    }
}

Write-Host "🎉 Build process completed!" -ForegroundColor Green

if (-not $PushImages) {
    Write-Host ""
    Write-Host "To push images to ECR, run:" -ForegroundColor Yellow
    Write-Host ".\build-and-push.ps1 -AccountId $AccountId -Region $Region -PushImages" -ForegroundColor White
}
