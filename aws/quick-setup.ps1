#!/usr/bin/env pwsh
# Script de configuración rápida para AWS deployment

Write-Host "🚀 Configuración Rápida de PAT-AH para AWS" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Verificar prerrequisitos
$prerequisites = @()

Write-Host "`n🔍 Verificando prerrequisitos..." -ForegroundColor Yellow

# AWS CLI
if (Get-Command aws -ErrorAction SilentlyContinue) {
    $awsVersion = aws --version 2>$null
    if ($awsVersion) {
        Write-Host "✅ AWS CLI: $($awsVersion.Split(' ')[0])" -ForegroundColor Green
    } else {
        $prerequisites += "AWS CLI"
    }
} else {
    $prerequisites += "AWS CLI"
}

# Terraform
if (Get-Command terraform -ErrorAction SilentlyContinue) {
    $terraformVersion = terraform version 2>$null | Select-String "v\d+\.\d+\.\d+" | ForEach-Object { $_.Matches[0].Value }
    if ($terraformVersion) {
        Write-Host "✅ Terraform: $terraformVersion" -ForegroundColor Green
    } else {
        $prerequisites += "Terraform"
    }
} else {
    $prerequisites += "Terraform"
}

# Docker
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker: $($dockerVersion.Split(' ')[2])" -ForegroundColor Green
    } else {
        $prerequisites += "Docker"
    }
} else {
    $prerequisites += "Docker"
}

# Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        $prerequisites += "Node.js"
    }
} else {
    $prerequisites += "Node.js"
}

if ($prerequisites.Count -gt 0) {
    Write-Host "`n❌ Faltan las siguientes herramientas:" -ForegroundColor Red
    $prerequisites | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host "`n📋 Instrucciones de instalación:" -ForegroundColor Yellow
    Write-Host "- AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor White
    Write-Host "- Terraform: https://terraform.io/downloads" -ForegroundColor White
    Write-Host "- Docker: https://docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host "- Node.js: https://nodejs.org/" -ForegroundColor White
    exit 1
}

# Verificar credenciales AWS
Write-Host "`n🔐 Verificando credenciales AWS..." -ForegroundColor Yellow
$accountId = aws sts get-caller-identity --query Account --output text 2>$null
if ($accountId -and $accountId -ne "null") {
    Write-Host "✅ AWS Account ID: $accountId" -ForegroundColor Green
} else {
    Write-Host "❌ No se pudieron obtener las credenciales AWS" -ForegroundColor Red
    Write-Host "Ejecuta: aws configure" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✅ Todos los prerrequisitos están listos!" -ForegroundColor Green

# Configuración interactiva
Write-Host "`n📋 Configuración del Despliegue" -ForegroundColor Cyan
Write-Host "==============================" -ForegroundColor Cyan

$region = Read-Host "Región AWS (default: us-east-1)"
if (-not $region) { $region = "us-east-1" }

$dbPassword = Read-Host "Contraseña para la base de datos PostgreSQL" -AsSecureString
$dbPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

if ($dbPasswordText.Length -lt 8) {
    Write-Host "❌ La contraseña debe tener al menos 8 caracteres" -ForegroundColor Red
    exit 1
}

# Crear archivo de variables
$tfVarsContent = @"
aws_region  = "$region"
db_password = "$dbPasswordText"
"@

$tfVarsPath = "aws/terraform/terraform.tfvars"
$tfVarsContent | Out-File -FilePath $tfVarsPath -Encoding UTF8

Write-Host "✅ Archivo de variables creado: $tfVarsPath" -ForegroundColor Green

Write-Host "`n🚀 Próximos Pasos:" -ForegroundColor Yellow
Write-Host "=================" -ForegroundColor Yellow
Write-Host "1. Desplegar infraestructura:" -ForegroundColor White
Write-Host "   .\aws\scripts\deploy.ps1 -Plan" -ForegroundColor Cyan
Write-Host "   .\aws\scripts\deploy.ps1 -Apply" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Construir y subir imágenes Docker:" -ForegroundColor White
Write-Host "   .\aws\scripts\build-and-push.ps1 -AccountId $accountId -Region $region -PushImages" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Desplegar frontend:" -ForegroundColor White
Write-Host "   .\aws\scripts\deploy-frontend.ps1 -Region $region" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 Para más información, consulta: aws\README-AWS-DEPLOYMENT.md" -ForegroundColor Green

# Preguntar si quiere continuar con el despliegue
Write-Host "`n¿Quieres continuar con el despliegue automático? (y/N): " -NoNewline -ForegroundColor Yellow
$continue = Read-Host

if ($continue -eq 'y' -or $continue -eq 'Y' -or $continue -eq 'yes') {
    Write-Host "`n🚀 Iniciando despliegue automático..." -ForegroundColor Green
    
    # Ejecutar despliegue
    .\aws\scripts\deploy.ps1 -Apply -Region $region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n📦 Construyendo imágenes Docker..." -ForegroundColor Blue
        .\aws\scripts\build-and-push.ps1 -AccountId $accountId -Region $region -PushImages
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "`n🎨 Desplegando frontend..." -ForegroundColor Magenta
            .\aws\scripts\deploy-frontend.ps1 -Region $region
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n🎉 ¡Despliegue completado exitosamente!" -ForegroundColor Green
                Write-Host "🌐 Tu aplicación estará disponible en unos minutos." -ForegroundColor Cyan
            }
        }
    }
} else {
    Write-Host "`n👍 Configuración completada. Puedes ejecutar los comandos manualmente cuando estés listo." -ForegroundColor Green
}
