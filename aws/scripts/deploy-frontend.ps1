#!/usr/bin/env pwsh
# Script for building and deploying the React frontend to S3 + CloudFront

param(
    [string]$Region = "us-east-1",
    [string]$BucketName,
    [string]$CloudFrontDistributionId,
    [string]$ApiUrl
)

$FRONTEND_DIR = "Frontend-Huancavelica-Alertas-Agricolas"

Write-Host "🎨 Building and deploying React frontend" -ForegroundColor Green

# Check if Node.js is installed
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check if npm is installed
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Error "npm is not installed. Please install npm first."
    exit 1
}

# Navigate to frontend directory
if (-not (Test-Path $FRONTEND_DIR)) {
    Write-Error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
}

Set-Location $FRONTEND_DIR

# Get bucket name and distribution ID from Terraform if not provided
if (-not $BucketName -or -not $CloudFrontDistributionId) {
    Write-Host "🔍 Getting deployment information from Terraform..." -ForegroundColor Yellow
    
    Push-Location "../aws/terraform"
    
    if (-not $BucketName) {
        $BucketName = terraform output -raw s3_bucket_website 2>$null
        if ($BucketName -and $BucketName -match "s3-website") {
            $BucketName = $BucketName -replace "\.s3-website.*", "" -replace "http://", ""
        }
    }
    
    if (-not $CloudFrontDistributionId) {
        # This would need to be added to outputs.tf
        Write-Warning "CloudFront distribution ID not found in Terraform outputs"
    }
    
    if (-not $ApiUrl) {
        $ApiUrl = "http://$(terraform output -raw load_balancer_dns 2>$null)"
    }
    
    Pop-Location
}

# Create environment file with API URL
if ($ApiUrl) {
    Write-Host "🔧 Setting API URL: $ApiUrl" -ForegroundColor Cyan
    "VITE_API_URL=$ApiUrl" | Out-File -FilePath ".env.production" -Encoding UTF8
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm ci

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

# Build the application
Write-Host "🔨 Building React application..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to build React application"
    exit 1
}

# Deploy to S3
if ($BucketName) {
    Write-Host "📤 Uploading to S3 bucket: $BucketName" -ForegroundColor Magenta
    
    aws s3 sync dist/ "s3://$BucketName" --delete --region $Region
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully uploaded to S3" -ForegroundColor Green
    } else {
        Write-Error "❌ Failed to upload to S3"
        exit 1
    }
    
    # Invalidate CloudFront cache
    if ($CloudFrontDistributionId) {
        Write-Host "🔄 Invalidating CloudFront cache..." -ForegroundColor Yellow
        
        aws cloudfront create-invalidation --distribution-id $CloudFrontDistributionId --paths "/*" --region $Region
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ CloudFront cache invalidated" -ForegroundColor Green
        } else {
            Write-Warning "⚠️  Failed to invalidate CloudFront cache"
        }
    }
} else {
    Write-Warning "⚠️  S3 bucket name not found. Please provide -BucketName parameter"
    Write-Host "Built files are available in: $(Get-Location)/dist" -ForegroundColor Cyan
}

# Return to original directory
Set-Location ".."

Write-Host ""
Write-Host "🎉 Frontend deployment completed!" -ForegroundColor Green

if ($BucketName) {
    Write-Host ""
    Write-Host "📋 Frontend Information:" -ForegroundColor Cyan
    Write-Host "S3 Bucket: $BucketName" -ForegroundColor White
    Write-Host "S3 Website URL: http://$BucketName.s3-website-$Region.amazonaws.com" -ForegroundColor White
    
    if ($CloudFrontDistributionId) {
        Write-Host "CloudFront Distribution: $CloudFrontDistributionId" -ForegroundColor White
    }
    
    if ($ApiUrl) {
        Write-Host "API URL: $ApiUrl" -ForegroundColor White
    }
}
