# Script opcional: aplicar los cambios sugeridos localmente (NO hace commits)
# Uso: PowerShell desde la carpeta Backend-Huancavelica-Alertas-Agricolas
# ./scripts/patches/prisma-fix/apply_snippets.ps1

Param()

$services = @('notification-service','alert-service','weather-service')
$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path "$root\..\.."
Write-Output "Repo root: $repoRoot"

foreach($s in $services){
  $pkg = Join-Path -Path $repoRoot -ChildPath "services\$s\package.json"
  if(-not (Test-Path $pkg)){
    Write-Warning "package.json not found for $s: $pkg"
    continue
  }
  Write-Output "Patching $pkg"
  $json = Get-Content $pkg -Raw | ConvertFrom-Json
  if(-not $json.dependencies){ $json.dependencies = @{} }
  if(-not $json.dependencies.'@prisma/client'){
    $json.dependencies.'@prisma/client' = '5.22.0'
    $json | ConvertTo-Json -Depth 10 | Out-File -FilePath $pkg -Encoding utf8
    Write-Output "Added @prisma/client@5.22.0 to $s/package.json"
  } else {
    Write-Output "@prisma/client already present in $s/package.json"
  }

  # Dockerfile snippet: insert generate step after the first npm ci line in builder stage
  $dockerfile = Join-Path -Path $repoRoot -ChildPath "services\$s\Dockerfile"
  if(Test-Path $dockerfile){
    $content = Get-Content $dockerfile -Raw
    if($content -match "npx prisma@5.22.0 generate" ){
      Write-Output "Dockerfile of $s already contains prisma generate"
    } else {
      # find "RUN npm ci" line in builder stage and insert snippet after it
      $lines = Get-Content $dockerfile
      $out = @()
      $inserted = $false
      foreach($line in $lines){
        $out += $line
        if(-not $inserted -and $line -match "npm ci"){
          $out += "`n# Prisma client generation (added by patch)"
          $out += "RUN if [ -f ./prisma/schema.prisma ]; then npx prisma@5.22.0 generate --schema=./prisma/schema.prisma || true; elif [ -f /tmp/schema.prisma ]; then npx prisma@5.22.0 generate --schema=/tmp/schema.prisma || true; else echo '[prisma] no schema found, skipping generate'; fi"
          $inserted = $true
        }
      }
      if($inserted){
        $out -join "`n" | Out-File -FilePath $dockerfile -Encoding utf8
        Write-Output "Inserted prisma generate snippet into $s/Dockerfile"
      } else {
        Write-Warning "Could not find 'npm ci' in $s/Dockerfile — please insert snippet manually."
      }
    }
  } else {
    Write-Warning "Dockerfile not found for $s"
  }
}

Write-Output "Patch script finished. Rebuild images after review: docker compose build --no-cache"