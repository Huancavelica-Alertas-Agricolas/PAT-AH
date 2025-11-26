# Quick setup script for PAT-AH AWS deployment (clean ASCII version)

Write-Host "Configuracion rapida de PAT-AH para AWS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Check prerequisites
$prerequisites = @()

Write-Host "`nVerificando prerrequisitos..." -ForegroundColor Yellow

if (Get-Command aws -ErrorAction SilentlyContinue) {
    Write-Host "AWS CLI: instalado" -ForegroundColor Green
} else {
    $prerequisites += 'AWS CLI'
}

if (Get-Command terraform -ErrorAction SilentlyContinue) {
    Write-Host "Terraform: instalado" -ForegroundColor Green
} else {
    $prerequisites += 'Terraform'
}

if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Docker: instalado" -ForegroundColor Green
} else {
    $prerequisites += 'Docker'
}

if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "Node.js: instalado" -ForegroundColor Green
} else {
    $prerequisites += 'Node.js'
}

if ($prerequisites.Count -gt 0) {
    Write-Host "`nFaltan las siguientes herramientas:" -ForegroundColor Red
    $prerequisites | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    Write-Host "`nInstalalas antes de continuar:" -ForegroundColor Yellow
    Write-Host " - AWS CLI: https://aws.amazon.com/cli/" -ForegroundColor White
    Write-Host " - Terraform: https://terraform.io/downloads" -ForegroundColor White
    Write-Host " - Docker: https://docker.com/products/docker-desktop" -ForegroundColor White
    Write-Host " - Node.js: https://nodejs.org/" -ForegroundColor White
    exit 1
}

# Check AWS credentials
Write-Host "`nVerificando credenciales AWS..." -ForegroundColor Yellow
$accountId = aws sts get-caller-identity --query Account --output text 2>$null
if ($accountId -and $accountId -ne 'null') {
    Write-Host "AWS Account ID: $accountId" -ForegroundColor Green
} else {
    Write-Host "No se pudieron obtener las credenciales AWS. Ejecuta: aws configure" -ForegroundColor Red
    exit 1
}

# Interactive configuration
Write-Host "`nConfiguracion del despliegue" -ForegroundColor Cyan
$region = Read-Host "Region AWS (ENTER para usar us-east-1)"
if ([string]::IsNullOrWhiteSpace($region)) { $region = 'us-east-1' }

Write-Host "Ingresa una contrasena para la base de datos (minimo 8 caracteres):"
$dbPassword = Read-Host "Contrasena" -AsSecureString
$dbPasswordText = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPassword))

if ($null -eq $dbPasswordText -or $dbPasswordText.Length -lt 8) {
    Write-Host "La contrasena debe tener al menos 8 caracteres." -ForegroundColor Red
    exit 1
}

# Ensure terraform directory exists
$tfDir = Join-Path -Path (Get-Location) -ChildPath 'aws\terraform'
if (-not (Test-Path $tfDir)) { New-Item -ItemType Directory -Path $tfDir -Force | Out-Null }

# Write terraform.tfvars
$tfVarsPath = Join-Path $tfDir 'terraform.tfvars'
$lines = @(
    "aws_region  = `"$region`"",
    "db_password = `"$dbPasswordText`""
)
Set-Content -Path $tfVarsPath -Value $lines -Encoding UTF8
Write-Host "Archivo de variables creado: $tfVarsPath" -ForegroundColor Green

Write-Host "`nProximos pasos:" -ForegroundColor Yellow
Write-Host "1) Revisar plan de Terraform: .\aws\scripts\deploy.ps1 -Plan -Region $region" -ForegroundColor Cyan
Write-Host "2) Aplicar infraestructura:    .\aws\scripts\deploy.ps1 -Apply -Region $region" -ForegroundColor Cyan
Write-Host "3) Construir y subir imagenes: .\aws\scripts\build-and-push.ps1 -AccountId $accountId -Region $region -PushImages" -ForegroundColor Cyan
Write-Host "4) Desplegar frontend:         .\aws\scripts\deploy-frontend.ps1 -Region $region" -ForegroundColor Cyan

# Ask to run terraform plan now
$runPlan = Read-Host "Deseas ejecutar 'terraform plan' ahora? (y/N)"
if ($runPlan -match '^[yY](es)?$') {
    Write-Host "Ejecutando: .\aws\scripts\deploy.ps1 -Plan -Region $region" -ForegroundColor Green
    try {
        .\aws\scripts\deploy.ps1 -Plan -Region $region -DBPassword $dbPasswordText
    } catch {
        Write-Host "Error al ejecutar el script de despliegue: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Configuracion completada. Ejecuta los comandos cuando quieras." -ForegroundColor Green
}
