# RDS PostgreSQL Database
resource "aws_db_subnet_group" "main" {
  name       = "pat-ah-db-subnet-group"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "PAT-AH DB subnet group"
  }
}

resource "aws_security_group" "rds" {
  name_prefix = "pat-ah-rds-"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.ecs.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "pat-ah-rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "pat-ah-database"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = "pat_ah"
  username = "pat"
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"

  skip_final_snapshot = true
  deletion_protection = false

  tags = {
    Name = "pat-ah-database"
  }
}
