# Guía de Despliegue en AWS para PAT-AH

Este documento proporciona una guía completa para desplegar el proyecto PAT-AH (Plataforma de Alertas Tempranas - Agricultura Huancavelica) en Amazon Web Services (AWS).

## Arquitectura de Despliegue

### Servicios AWS Utilizados

- **Amazon ECS con Fargate**: Para los microservicios del backend
- **Amazon RDS (PostgreSQL)**: Base de datos
- **Amazon ECR**: Repositorios de imágenes Docker
- **Application Load Balancer**: Distribución de tráfico
- **Amazon S3**: Alojamiento del frontend React
- **Amazon CloudFront**: CDN para el frontend
- **Amazon VPC**: Red privada virtual
- **AWS IAM**: Gestión de permisos

### Estructura del Proyecto

```
Backend: 5 microservicios en ECS Fargate
├── auth-service (Puerto 3001)
├── users-service (Puerto 3002)
├── rest-service (Puerto 3003)
├── ai-service (Puerto 3004)
└── ingest-service (Tarea background)

Frontend: React SPA en S3 + CloudFront
Database: PostgreSQL en RDS
Load Balancer: ALB con reglas de routing
```

## Prerrequisitos

### 1. Herramientas Necesarias

```powershell
# Instalar AWS CLI
# Descargar desde: https://aws.amazon.com/cli/
aws --version

# Instalar Terraform
# Descargar desde: https://terraform.io/downloads
terraform version

# Instalar Docker Desktop
# Descargar desde: https://docker.com/products/docker-desktop
docker version

# Node.js (para el frontend)
node --version
npm --version
```

### 2. Configuración de AWS

```powershell
# Configurar credenciales de AWS
aws configure

# Verificar configuración
aws sts get-caller-identity
```

### 3. Permisos Requeridos

Su usuario de AWS necesita los siguientes permisos:
- EC2, ECS, ECR (completos)
- RDS (completo)
- S3, CloudFront (completos)
- IAM (crear/editar roles)
- VPC, ELB (completos)

## Despliegue Paso a Paso

### Opción 1: Despliegue Automático con Scripts

#### 1. Clonar y Preparar el Proyecto

```powershell
cd "c:\Users\LAB-USR-LNORTE\Downloads\PAT-AH"
```

#### 2. Desplegar Infraestructura

```powershell
# Crear plan de Terraform
.\aws\scripts\deploy.ps1 -Plan -Region us-east-1

# Aplicar infraestructura (se solicitará contraseña de BD)
.\aws\scripts\deploy.ps1 -Apply -Region us-east-1
```

#### 3. Construir y Subir Imágenes Docker

```powershell
# Obtener ID de cuenta AWS
$accountId = aws sts get-caller-identity --query Account --output text

# Construir y subir imágenes
.\aws\scripts\build-and-push.ps1 -AccountId $accountId -Region us-east-1 -PushImages
```

#### 4. Desplegar Frontend

```powershell
# Construir y subir frontend
.\aws\scripts\deploy-frontend.ps1 -Region us-east-1
```

### Opción 2: Despliegue Manual con Terraform

#### 1. Inicializar Terraform

```powershell
cd aws\terraform
terraform init
```

#### 2. Configurar Variables

```powershell
# Crear archivo terraform.tfvars
@"
aws_region = "us-east-1"
db_password = "tu-password-segura"
"@ | Out-File terraform.tfvars
```

#### 3. Desplegar Infraestructura

```powershell
# Crear plan
terraform plan

# Aplicar cambios
terraform apply
```

#### 4. Construir Imágenes Docker

```powershell
# Volver al directorio raíz
cd ..\..

# Login a ECR
$accountId = aws sts get-caller-identity --query Account --output text
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "$accountId.dkr.ecr.us-east-1.amazonaws.com"

# Construir cada servicio
$services = @("auth-service", "users-service", "rest-service", "ai-service", "ingest-service")

foreach ($service in $services) {
    $imageName = "pat-ah-$service"
    $ecrRepo = "$accountId.dkr.ecr.us-east-1.amazonaws.com/$imageName"
    
    docker build -t $imageName -f "Backend-Huancavelica-Alertas-Agricolas/services/$service/Dockerfile" "Backend-Huancavelica-Alertas-Agricolas"
    docker tag $imageName "$ecrRepo:latest"
    docker push "$ecrRepo:latest"
}
```

#### 5. Actualizar Servicios ECS

```powershell
# Forzar nueva implementación de servicios
aws ecs update-service --cluster pat-ah-cluster --service pat-ah-auth-service --force-new-deployment --region us-east-1
aws ecs update-service --cluster pat-ah-cluster --service pat-ah-users-service --force-new-deployment --region us-east-1
aws ecs update-service --cluster pat-ah-cluster --service pat-ah-rest-service --force-new-deployment --region us-east-1
aws ecs update-service --cluster pat-ah-cluster --service pat-ah-ai-service --force-new-deployment --region us-east-1
```

#### 6. Construir y Subir Frontend

```powershell
cd Frontend-Huancavelica-Alertas-Agricolas

# Obtener URL del Load Balancer
$apiUrl = "http://$(terraform output -raw load_balancer_dns)"
$bucketName = terraform output -raw s3_bucket_website | % { $_ -replace '\.s3-website.*', '' -replace 'http://', '' }

# Configurar variables de entorno
"VITE_API_URL=$apiUrl" | Out-File .env.production

# Instalar dependencias y construir
npm ci
npm run build

# Subir a S3
aws s3 sync dist/ "s3://$bucketName" --delete --region us-east-1

cd ..
```

## Configuración Post-Despliegue

### 1. Migraciones de Base de Datos

Si necesitas ejecutar migraciones de Prisma:

```powershell
# Crear tarea one-time en ECS para migraciones
aws ecs run-task `
  --cluster pat-ah-cluster `
  --task-definition pat-ah-users-service `
  --overrides '{"containerOverrides":[{"name":"users-service","command":["npx","prisma","migrate","deploy"]}]}' `
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx]}" `
  --launch-type FARGATE `
  --region us-east-1
```

### 2. Configurar Dominio Personalizado (Opcional)

```powershell
# 1. Registrar dominio en Route 53 o usar dominio existente
# 2. Crear certificado SSL en ACM
# 3. Actualizar CloudFront para usar dominio personalizado
# 4. Crear registros CNAME en Route 53
```

### 3. Monitoreo y Logs

- **CloudWatch Logs**: `/ecs/pat-ah-*` para logs de servicios
- **CloudWatch Metrics**: Métricas de ECS, RDS, ALB automáticas
- **ECS Console**: Monitoreo de servicios y tareas

## Gestión de Costos

### Estimación de Costos Mensual (us-east-1)

- **ECS Fargate**: ~$30-50 (4 servicios pequeños)
- **RDS t3.micro**: ~$15-20
- **ALB**: ~$20
- **S3 + CloudFront**: ~$5-10
- **Data Transfer**: Variable
- **Total**: ~$70-100/mes

### Optimizaciones de Costo

```powershell
# Usar instancias Spot para entornos de desarrollo
# Configurar Auto Scaling para servicios ECS
# Usar Reserved Instances para RDS en producción
# Configurar lifecycle policies en S3
```

## Monitoreo y Troubleshooting

### Comandos Útiles

```powershell
# Ver estado de servicios ECS
aws ecs describe-services --cluster pat-ah-cluster --services pat-ah-auth-service --region us-east-1

# Ver logs de un servicio
aws logs tail /ecs/pat-ah-auth-service --follow --region us-east-1

# Ver estado de la base de datos
aws rds describe-db-instances --db-instance-identifier pat-ah-database --region us-east-1

# Ver métricas del Load Balancer
aws elbv2 describe-target-health --target-group-arn arn:aws:elasticloadbalancing:us-east-1:xxx:targetgroup/pat-ah-auth-service-tg/xxx
```

### Health Checks

Cada servicio debe implementar un endpoint `/health`:

```javascript
// Ejemplo para Node.js/Express
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'auth-service'
  });
});
```

### Problemas Comunes

1. **Servicios no arrancan**: Verificar logs en CloudWatch
2. **Base de datos no conecta**: Verificar security groups y URL de conexión
3. **Load Balancer unhealthy**: Verificar health check endpoints
4. **Frontend no carga**: Verificar configuración de S3 y CloudFront

## Seguridad

### Recomendaciones

- Usar AWS Secrets Manager para credenciales de BD
- Configurar WAF en CloudFront
- Habilitar VPC Flow Logs
- Usar IAM roles específicos por servicio
- Habilitar encryption en RDS y S3

### Variables de Entorno Seguras

```powershell
# Crear secrets en AWS Secrets Manager
aws secretsmanager create-secret --name "pat-ah/database" --description "Database credentials" --secret-string '{"username":"pat","password":"your-secure-password"}'

# Actualizar task definitions para usar secrets
```

## CI/CD con GitHub Actions

El archivo `.github/workflows/deploy-aws.yml` incluido proporciona:

- Tests automáticos
- Build y push de imágenes Docker
- Despliegue de infraestructura
- Actualización del frontend

### Secretos Requeridos en GitHub

```
AWS_ACCESS_KEY_ID: Tu access key de AWS
AWS_SECRET_ACCESS_KEY: Tu secret key de AWS  
DB_PASSWORD: Contraseña de la base de datos
```

## Destruir Infraestructura

```powershell
# Usando script
.\aws\scripts\deploy.ps1 -Destroy

# Manual con Terraform
cd aws\terraform
terraform destroy
```

⚠️ **Advertencia**: Esto eliminará TODOS los recursos incluyendo la base de datos. Asegúrate de hacer backup si es necesario.

## Soporte

Para problemas específicos:
1. Revisar logs en CloudWatch
2. Verificar configuración en consola AWS
3. Ejecutar `terraform plan` para ver cambios pendientes
4. Contactar al equipo de DevOps

---

## Enlaces Útiles

- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [AWS CLI Reference](https://docs.aws.amazon.com/cli/)
- [Docker Best Practices](https://docs.docker.com/develop/best-practices/)
