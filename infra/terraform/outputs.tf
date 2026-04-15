# ============================================
# Terraform Outputs
# ============================================

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "EKS cluster name"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "EKS cluster API endpoint"
  value       = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = module.rds.endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.elasticache.endpoint
}

output "ecr_frontend_url" {
  description = "ECR repository URL for frontend"
  value       = module.ecr.frontend_repository_url
}

output "ecr_backend_url" {
  description = "ECR repository URL for backend"
  value       = module.ecr.backend_repository_url
}

output "ecr_worker_url" {
  description = "ECR repository URL for worker"
  value       = module.ecr.worker_repository_url
}

output "s3_artifacts_bucket" {
  description = "S3 artifacts bucket name"
  value       = module.s3.artifacts_bucket_name
}

output "s3_logs_bucket" {
  description = "S3 logs bucket name"
  value       = module.s3.logs_bucket_name
}

output "database_url" {
  description = "PostgreSQL connection string (without password)"
  value       = "postgresql://${var.db_username}:***@${module.rds.endpoint}/autodeployhub"
  sensitive   = true
}
