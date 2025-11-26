# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "pat-ah-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "pat-ah-cluster"
  }
}

# Security Group for ECS Tasks
resource "aws_security_group" "ecs" {
  name_prefix = "pat-ah-ecs-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3001
    to_port         = 3004
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pat-ah-ecs-sg"
  }
}

# Application Load Balancer
resource "aws_security_group" "alb" {
  name_prefix = "pat-ah-alb-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pat-ah-alb-sg"
  }
}

resource "aws_lb" "main" {
  name               = "pat-ah-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id

  enable_deletion_protection = false

  tags = {
    Name = "pat-ah-alb"
  }
}

# ECR Repositories
resource "aws_ecr_repository" "services" {
  for_each = toset([
    "auth-service",
    "users-service", 
    "rest-service",
    "ai-service",
    "ingest-service"
  ])

  name                 = "pat-ah-${each.key}"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name = "pat-ah-${each.key}"
  }
}

# ECS Task Definition for each service
resource "aws_ecs_task_definition" "services" {
  for_each = toset([
    "auth-service",
    "users-service", 
    "rest-service",
    "ai-service"
  ])

  family                   = "pat-ah-${each.key}"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 256
  memory                  = 512
  execution_role_arn      = aws_iam_role.ecs_execution.arn
  task_role_arn          = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = each.key
      image = "${aws_ecr_repository.services[each.key].repository_url}:latest"
      
      portMappings = [
        {
          containerPort = each.key == "auth-service" ? 3001 : (
            each.key == "users-service" ? 3002 : (
              each.key == "rest-service" ? 3003 : 3004
            )
          )
          protocol = "tcp"
        }
      ]

      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = "postgres://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.services[each.key].name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      essential = true
    }
  ])

  tags = {
    Name = "pat-ah-${each.key}"
  }
}

# Ingest Service (background job)
resource "aws_ecs_task_definition" "ingest_service" {
  family                   = "pat-ah-ingest-service"
  requires_compatibilities = ["FARGATE"]
  network_mode            = "awsvpc"
  cpu                     = 512
  memory                  = 1024
  execution_role_arn      = aws_iam_role.ecs_execution.arn
  task_role_arn          = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([
    {
      name  = "ingest-service"
      image = "${aws_ecr_repository.services["ingest-service"].repository_url}:latest"
      
      environment = [
        {
          name  = "NODE_ENV"
          value = "production"
        },
        {
          name  = "DATABASE_URL"
          value = "postgres://${aws_db_instance.main.username}:${var.db_password}@${aws_db_instance.main.endpoint}/${aws_db_instance.main.db_name}"
        }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.services["ingest-service"].name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }

      essential = true
    }
  ])

  tags = {
    Name = "pat-ah-ingest-service"
  }
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "services" {
  for_each = toset([
    "auth-service",
    "users-service", 
    "rest-service",
    "ai-service",
    "ingest-service"
  ])

  name              = "/ecs/pat-ah-${each.key}"
  retention_in_days = 7

  tags = {
    Name = "pat-ah-${each.key}-logs"
  }
}

# ECS Services
resource "aws_ecs_service" "services" {
  for_each = toset([
    "auth-service",
    "users-service", 
    "rest-service",
    "ai-service"
  ])

  name            = "pat-ah-${each.key}"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    security_groups  = [aws_security_group.ecs.id]
    subnets         = aws_subnet.private[*].id
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.services[each.key].arn
    container_name   = each.key
    container_port   = each.key == "auth-service" ? 3001 : (
      each.key == "users-service" ? 3002 : (
        each.key == "rest-service" ? 3003 : 3004
      )
    )
  }

  depends_on = [aws_lb_listener.main]

  tags = {
    Name = "pat-ah-${each.key}"
  }
}

# Target Groups for Load Balancer
resource "aws_lb_target_group" "services" {
  for_each = toset([
    "auth-service",
    "users-service", 
    "rest-service",
    "ai-service"
  ])

  name        = "pat-ah-${each.key}-tg"
  port        = each.key == "auth-service" ? 3001 : (
    each.key == "users-service" ? 3002 : (
      each.key == "rest-service" ? 3003 : 3004
    )
  )
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    interval            = 30
    path                = "/health"
    matcher             = "200"
    port                = "traffic-port"
    protocol            = "HTTP"
  }

  tags = {
    Name = "pat-ah-${each.key}-tg"
  }
}

# Load Balancer Listener
resource "aws_lb_listener" "main" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["rest-service"].arn
  }
}

# Listener Rules for routing
resource "aws_lb_listener_rule" "auth" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["auth-service"].arn
  }

  condition {
    path_pattern {
      values = ["/auth/*"]
    }
  }
}

resource "aws_lb_listener_rule" "users" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["users-service"].arn
  }

  condition {
    path_pattern {
      values = ["/users/*"]
    }
  }
}

resource "aws_lb_listener_rule" "ai" {
  listener_arn = aws_lb_listener.main.arn
  priority     = 300

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.services["ai-service"].arn
  }

  condition {
    path_pattern {
      values = ["/ai/*"]
    }
  }
}
