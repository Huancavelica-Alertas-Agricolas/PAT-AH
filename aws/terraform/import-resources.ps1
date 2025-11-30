# Script para importar recursos existentes en AWS al state de Terraform
# Ejecutar desde: A:\Proyecto\PAT-AH\aws\terraform
# Requiere: AWS CLI configurado y Terraform inicializado

param(
  [string]$DbPassword = "",
  [switch]$DoPlan
)

Write-Host "Obteniendo account id..."
$accountId = aws sts get-caller-identity --query Account --output text
Write-Host "Account: $accountId"

# Servicios listados en Terraform
$services = @('auth-service','users-service','rest-service','ai-service','ingest-service')

# Importar OIDC provider
Write-Host "\nImportando OIDC provider (si existe)..."
$oidcArn = aws iam list-open-id-connect-providers --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')].Arn" --output text
if ($oidcArn -and $oidcArn -ne 'None') {
  Write-Host "OIDC ARN: $oidcArn"
  terraform import 'aws_iam_openid_connect_provider.github' $oidcArn
} else {
  Write-Host "OIDC provider no encontrado, saltando."
}

# IAM roles
Write-Host "\nImportando IAM roles (si existen)..."
$roles = @('pat-ah-ecs-execution-role','pat-ah-ecs-task-role','pat-ah-github-actions-role')
foreach ($r in $roles) {
  try {
    $roleArn = aws iam get-role --role-name $r --query 'Role.Arn' --output text 2>$null
    if ($LASTEXITCODE -eq 0 -and $roleArn -and $roleArn -ne 'None') {
      Write-Host "Importando role $r"
      switch ($r) {
        'pat-ah-ecs-execution-role' { terraform import aws_iam_role.ecs_execution $r }
        'pat-ah-ecs-task-role' { terraform import aws_iam_role.ecs_task $r }
        'pat-ah-github-actions-role' { terraform import aws_iam_role.github_actions $r }
      }
    } else {
      Write-Host "Role $r no encontrado, saltando."
    }
  } catch {
    Write-Host ("Error importando {0}: {1}" -f $r, $_)
  }
}

# ECR repositories
Write-Host "\nImportando ECR repositories existentes..."
foreach ($s in $services) {
  $repoName = "pat-ah-$s"
  try {
    aws ecr describe-repositories --repository-names $repoName --query 'repositories[0].repositoryName' --output text > $null 2>&1
    if ($LASTEXITCODE -eq 0) {
      Write-Host "Importando ECR $repoName"
      $addr = 'aws_ecr_repository.services["' + $s + '"]'
      terraform import $addr $repoName
    } else {
      Write-Host "Repositorio $repoName no existe, saltando."
    }
  } catch {
    Write-Host ("Error chequeando {0}: {1}" -f $repoName, $_)
  }
}

# CloudWatch Log Groups
Write-Host "\nImportando CloudWatch Log Groups /ecs/pat-ah-* ..."
foreach ($s in $services) {
  $lg = "/ecs/pat-ah-$s"
  try {
    $exists = aws logs describe-log-groups --log-group-name-prefix $lg --query "logGroups[?logGroupName=='$lg'].logGroupName | [0]" --output text 2>$null
    if ($exists -and $exists -ne "None") {
      Write-Host "Importando Log Group $lg"
      $addr = 'aws_cloudwatch_log_group.services["' + $s + '"]'
      terraform import $addr $lg
    } else {
      Write-Host "Log Group $lg no encontrado, saltando."
    }
  } catch {
    Write-Host ("Error comprobando {0}: {1}" -f $lg, $_)
  }
}

# Load Balancer
Write-Host "\nImportando Load Balancer (pat-ah-alb) si existe..."
$lbArn = aws elbv2 describe-load-balancers --names pat-ah-alb --query 'LoadBalancers[0].LoadBalancerArn' --output text 2>$null
if ($lbArn -and $lbArn -ne "None") {
  Write-Host "Importando ALB: $lbArn"
  terraform import aws_lb.main $lbArn
} else {
  Write-Host "ALB pat-ah-alb no encontrado, saltando."
}

# Target Groups
Write-Host "\nImportando Target Groups (si existen)..."
foreach ($s in $services) {
  $tgName = "pat-ah-$s-tg"
  try {
    $tgArn = aws elbv2 describe-target-groups --names $tgName --query 'TargetGroups[0].TargetGroupArn' --output text 2>$null
    if ($tgArn -and $tgArn -ne "None") {
      Write-Host "Importando TG $tgName -> $tgArn"
      $addr = 'aws_lb_target_group.services["' + $s + '"]'
      terraform import $addr $tgArn
    } else {
      Write-Host "Target group $tgName no encontrado, saltando."
    }
  } catch {
    Write-Host ("Error buscando {0}: {1}" -f $tgName, $_)
  }
}

# DB subnet group
Write-Host "\nImportando DB subnet group (pat-ah-db-subnet-group) si existe..."
try {
  $dbsg = aws rds describe-db-subnet-groups --db-subnet-group-name pat-ah-db-subnet-group --query 'DBSubnetGroups[0].DBSubnetGroupName' --output text 2>$null
  if ($dbsg -and $dbsg -ne "None") {
    terraform import aws_db_subnet_group.main pat-ah-db-subnet-group
    Write-Host "Importado pat-ah-db-subnet-group"
  } else {
    Write-Host "DB subnet group no encontrado, saltando."
  }
} catch {
  Write-Host ("Error comprobando DB subnet group: {0}" -f $_)
}

# S3 frontend bucket
Write-Host "\nImportando S3 frontend bucket (si existe con prefijo pat-ah-frontend-*)..."
try {
  $bucket = aws s3api list-buckets --query "Buckets[?starts_with(Name, 'pat-ah-frontend-')].Name | [0]" --output text 2>$null
  if ($bucket -and $bucket -ne "None") {
    Write-Host "Importando S3 bucket $bucket"
    terraform import aws_s3_bucket.frontend $bucket
  } else {
    Write-Host "No se encontró bucket pat-ah-frontend-*, saltando."
  }
} catch {
  Write-Host ("Error comprobando S3 bucket: {0}" -f $_)
}

Write-Host "\nIMPORTS finalizados — ahora ejecuta 'terraform plan' para validar el estado."
if ($DoPlan) {
  if ($DbPassword -ne "") {
    terraform plan -var "db_password=$DbPassword"
  } else {
    terraform plan
  }
}
