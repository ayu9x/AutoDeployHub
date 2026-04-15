# ============================================
# AutoDeployHub – Terraform Main Configuration
# AWS Infrastructure for CI/CD Platform
# Uses us-east-1 with cost-optimized settings
# for resume/portfolio demonstration
# ============================================

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Remote backend (uncomment for production)
  # backend "s3" {
  #   bucket         = "autodeployhub-terraform-state"
  #   key            = "infrastructure/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "AutoDeployHub"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}

# ---- VPC Module ----
module "vpc" {
  source = "./modules/vpc"

  project_name = var.project_name
  environment  = var.environment
  vpc_cidr     = var.vpc_cidr
}

# ---- EKS Module ----
module "eks" {
  source = "./modules/eks"

  project_name      = var.project_name
  environment       = var.environment
  vpc_id            = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_instance_type = var.eks_node_instance_type
  node_desired_size  = var.eks_node_desired_size
  node_min_size      = var.eks_node_min_size
  node_max_size      = var.eks_node_max_size
}

# ---- RDS Module ----
module "rds" {
  source = "./modules/rds"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  instance_class     = var.rds_instance_class
  db_name            = "autodeployhub"
  db_username        = var.db_username
  db_password        = var.db_password
  eks_security_group_id = module.eks.node_security_group_id
}

# ---- ElastiCache Module ----
module "elasticache" {
  source = "./modules/elasticache"

  project_name       = var.project_name
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  node_type          = var.redis_node_type
  eks_security_group_id = module.eks.node_security_group_id
}

# ---- S3 Module ----
module "s3" {
  source = "./modules/s3"

  project_name = var.project_name
  environment  = var.environment
}

# ---- ECR Module ----
module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
  environment  = var.environment
}

# ---- IAM Module ----
module "iam" {
  source = "./modules/iam"

  project_name       = var.project_name
  environment        = var.environment
  eks_cluster_arn    = module.eks.cluster_arn
  s3_artifacts_arn   = module.s3.artifacts_bucket_arn
  s3_logs_arn        = module.s3.logs_bucket_arn
  eks_oidc_provider  = module.eks.oidc_provider_arn
}
