#!/usr/bin/env pwsh
# Script for deploying the application to AWS using Terraform

param(
    [string]$Region = "us-east-1",
    [string]$DBPassword,
    [switch]$Plan = $false,
    [switch]$Apply = $false,
    [switch]$Destroy = $false
)

if (-not $DBPassword -and ($Apply -or $Plan)) {
    $securePwd = Read-Host "Enter database password" -AsSecureString
    $DBPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePwd))
}

$TERRAFORM_DIR = "aws/terraform"

Write-Host "🚀 PAT-AH AWS Deployment Script" -ForegroundColor Green
Write-Host "Region: $Region" -ForegroundColor Cyan

# Check if Terraform is installed
if (-not (Get-Command terraform -ErrorAction SilentlyContinue)) {
    Write-Error "Terraform is not installed or not in PATH. Please install Terraform first."
    exit 1
}

# Check if AWS CLI is installed and configured
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) {
    Write-Error "AWS CLI is not installed or not in PATH. Please install and configure AWS CLI first."
    exit 1
}

# Test AWS credentials
Write-Host "🔐 Checking AWS credentials..." -ForegroundColor Yellow
$accountId = aws sts get-caller-identity --query Account --output text 2>$null
if (-not $accountId) {
    Write-Error "AWS credentials not configured. Please run 'aws configure' first."
    exit 1
}
Write-Host "✅ AWS Account ID: $accountId" -ForegroundColor Green

# Navigate to Terraform directory
Set-Location $TERRAFORM_DIR

# Initialize Terraform
Write-Host "🔧 Initializing Terraform..." -ForegroundColor Yellow
terraform init

if ($LASTEXITCODE -ne 0) {
    Write-Error "Terraform initialization failed"
    exit 1
}

# Set Terraform variables
$env:TF_VAR_aws_region = $Region
if ($DBPassword) {
    $env:TF_VAR_db_password = $DBPassword
}

if ($Plan) {
    Write-Host "📋 Creating Terraform plan..." -ForegroundColor Blue
    terraform plan -out=tfplan
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Terraform plan created successfully!" -ForegroundColor Green
        Write-Host "Review the plan above and run with -Apply to deploy." -ForegroundColor Yellow
    }
}

if ($Apply) {
    Write-Host "🚀 Applying Terraform configuration..." -ForegroundColor Magenta
    
    if (Test-Path "tfplan") {
        terraform apply tfplan
    } else {
        terraform apply -auto-approve
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🎉 Infrastructure deployed successfully!" -ForegroundColor Green
        
        # Show outputs
        Write-Host ""
        Write-Host "📊 Deployment Information:" -ForegroundColor Cyan
        terraform output
        
        Write-Host ""
        Write-Host "📝 Next Steps:" -ForegroundColor Yellow
        Write-Host "1. Build and push Docker images: .\scripts\build-and-push.ps1 -AccountId $accountId -PushImages"
        Write-Host "2. Build and upload frontend: .\scripts\deploy-frontend.ps1"
        Write-Host "3. Run database migrations if needed"
    }
}

if ($Destroy) {
    Write-Host "⚠️  Destroying infrastructure..." -ForegroundColor Red
    $confirm = Read-Host "Are you sure you want to destroy the infrastructure? (yes/no)"
    
    if ($confirm -eq "yes") {
        terraform destroy -auto-approve
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Infrastructure destroyed successfully!" -ForegroundColor Green
        }
    } else {
        Write-Host "Destruction cancelled." -ForegroundColor Yellow
    }
}

# Return to original directory
Set-Location "../.."

if (-not $Plan -and -not $Apply -and -not $Destroy) {
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host ".\deploy.ps1 -Plan                     # Create deployment plan"
    Write-Host ".\deploy.ps1 -Apply                    # Deploy infrastructure"
    Write-Host ".\deploy.ps1 -Destroy                  # Destroy infrastructure"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "-Region <region>                       # AWS region (default: us-east-1)"
    Write-Host "-DBPassword <password>                 # Database password"
}
