# Script simplificado de instalación
Write-Host "🤖 Instalando dependencias esenciales del microservicio de IA" -ForegroundColor Cyan

# Instalar dependencias básicas una por una
$basicDeps = @(
    "@types/node",
    "@types/multer", 
    "multer",
    "xlsx",
    "axios"
)

foreach ($dep in $basicDeps) {
    Write-Host "📦 Instalando $dep..." -ForegroundColor Yellow
    try {
        npm install $dep --legacy-peer-deps
        Write-Host "   ✅ $dep instalado" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Error instalando $dep" -ForegroundColor Red
    }
}

# Crear directorios
Write-Host "📁 Creando directorios..." -ForegroundColor Yellow
$dirs = @("uploads", "trained-models")
foreach ($dir in $dirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Creado $dir" -ForegroundColor Green
    }
}

Write-Host "✅ Instalación básica completa" -ForegroundColor Green
