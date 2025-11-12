# Script de instalación del Microservicio de IA
# Para ejecutar: powershell -ExecutionPolicy Bypass -File install-ai.ps1

Write-Host "🤖 INSTALANDO MICROSERVICIO DE IA" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Verificar que estamos en el directorio correcto
$currentDir = Get-Location
Write-Host "📁 Directorio actual: $currentDir" -ForegroundColor Yellow

# Verificar si existe package.json
if (Test-Path "package.json") {
    Write-Host "✅ package.json encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ package.json no encontrado. Asegúrate de estar en el directorio del backend." -ForegroundColor Red
    exit 1
}

# Crear directorios necesarios
Write-Host "📂 Creando directorios necesarios..." -ForegroundColor Yellow
$directories = @("uploads", "trained-models", "scripts", "examples")

foreach ($dir in $directories) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "   ✅ Creado: $dir" -ForegroundColor Green
    } else {
        Write-Host "   ⏭️ Ya existe: $dir" -ForegroundColor Gray
    }
}

# Instalar dependencias
Write-Host "📦 Instalando dependencias de Node.js..." -ForegroundColor Yellow
try {
    & node --version
    Write-Host "   ✅ Node.js detectado" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Node.js no encontrado. Por favor instala Node.js primero." -ForegroundColor Red
    exit 1
}

# Instalar dependencias principales
$dependencies = @(
    "multer",
    "xlsx", 
    "axios",
    "ml-regression-simple-linear",
    "ml-regression-multivariate-linear",
    "ml-matrix",
    "ml-stat",
    "@tensorflow/tfjs-node",
    "csv-parser"
)

$devDependencies = @(
    "@types/multer"
)

Write-Host "📥 Instalando dependencias principales..." -ForegroundColor Yellow
foreach ($dep in $dependencies) {
    try {
        Write-Host "   Installing $dep..." -ForegroundColor Gray -NoNewline
        $process = Start-Process -FilePath "npm" -ArgumentList "install", $dep -Wait -PassThru -WindowStyle Hidden
        if ($process.ExitCode -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Error instalando $dep" -ForegroundColor Red
    }
}

Write-Host "📥 Instalando dependencias de desarrollo..." -ForegroundColor Yellow
foreach ($dep in $devDependencies) {
    try {
        Write-Host "   Installing $dep..." -ForegroundColor Gray -NoNewline
        $process = Start-Process -FilePath "npm" -ArgumentList "install", "--save-dev", $dep -Wait -PassThru -WindowStyle Hidden
        if ($process.ExitCode -eq 0) {
            Write-Host " ✅" -ForegroundColor Green
        } else {
            Write-Host " ❌" -ForegroundColor Red
        }
    } catch {
        Write-Host " ❌ Error instalando $dep" -ForegroundColor Red
    }
}

# Verificar archivo .env
Write-Host "⚙️ Verificando configuración..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ Archivo .env encontrado" -ForegroundColor Green
} else {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "   ✅ Archivo .env creado desde .env.example" -ForegroundColor Green
        Write-Host "   ⚠️ Recuerda configurar OPENWEATHER_API_KEY en .env" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ No se encontró .env ni .env.example" -ForegroundColor Red
    }
}

# Compilar TypeScript
Write-Host "🔨 Compilando TypeScript..." -ForegroundColor Yellow
try {
    $process = Start-Process -FilePath "npx" -ArgumentList "tsc" -Wait -PassThru -WindowStyle Hidden
    if ($process.ExitCode -eq 0) {
        Write-Host "   ✅ Compilación exitosa" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Advertencias en la compilación" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Error en la compilación" -ForegroundColor Red
}

# Mostrar resumen
Write-Host "`n🎉 INSTALACIÓN COMPLETADA" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "📚 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Configurar OPENWEATHER_API_KEY en el archivo .env" -ForegroundColor White
Write-Host "2. Ejecutar: npm run start:dev" -ForegroundColor White
Write-Host "3. Probar el endpoint: http://localhost:3001/ai/health" -ForegroundColor White
Write-Host ""
Write-Host "📖 Documentación disponible en:" -ForegroundColor Cyan
Write-Host "   - AI_MICROSERVICE_README.md" -ForegroundColor White
Write-Host "   - examples/ai-client-example.js" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Comandos útiles:" -ForegroundColor Cyan
Write-Host "   npm run start:dev     - Iniciar en modo desarrollo" -ForegroundColor White
Write-Host "   npm run build         - Compilar para producción" -ForegroundColor White
Write-Host "   npm run start:prod    - Iniciar en modo producción" -ForegroundColor White

# Verificar instalación
Write-Host "`n🔍 Verificando instalación..." -ForegroundColor Yellow
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

$requiredDeps = @("multer", "xlsx", "axios", "ml-matrix", "@tensorflow/tfjs-node")
$missingDeps = @()

foreach ($dep in $requiredDeps) {
    if (-not ($packageJson.dependencies.$dep -or $packageJson.devDependencies.$dep)) {
        $missingDeps += $dep
    }
}

if ($missingDeps.Count -eq 0) {
    Write-Host "✅ Todas las dependencias principales están instaladas" -ForegroundColor Green
} else {
    Write-Host "⚠️ Dependencias faltantes: $($missingDeps -join ', ')" -ForegroundColor Yellow
    Write-Host "💡 Intenta ejecutar: npm install $($missingDeps -join ' ')" -ForegroundColor Cyan
}

Write-Host "`n🚀 ¡El microservicio de IA está listo para usar!" -ForegroundColor Green
