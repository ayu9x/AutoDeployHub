# ============================================
# Dev Environment – terraform.tfvars
# Cost-optimized for resume/portfolio demo
# ============================================

aws_region    = "us-east-1"
project_name  = "autodeployhub"
environment   = "dev"

# VPC
vpc_cidr = "10.0.0.0/16"

# EKS – smallest viable cluster
eks_node_instance_type = "t3.medium"
eks_node_desired_size  = 2
eks_node_min_size      = 1
eks_node_max_size      = 3

# RDS – smallest instance
rds_instance_class = "db.t3.micro"
db_username        = "autodeployhub"
# db_password = "SET_VIA_TF_VAR_db_password"

# Redis – smallest instance
redis_node_type = "cache.t3.micro"
