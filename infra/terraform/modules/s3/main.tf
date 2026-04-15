# ============================================
# S3 Module – Object Storage
# ============================================

variable "project_name" { type = string }
variable "environment" { type = string }

resource "aws_s3_bucket" "artifacts" {
  bucket        = "${var.project_name}-${var.environment}-artifacts"
  force_destroy = true # Allow terraform destroy to remove non-empty bucket
  tags          = { Name = "${var.project_name}-artifacts" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration { status = "Enabled" }
}

resource "aws_s3_bucket_lifecycle_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    id     = "expire-old-artifacts"
    status = "Enabled"
    expiration { days = 30 }
  }
}

resource "aws_s3_bucket" "logs" {
  bucket        = "${var.project_name}-${var.environment}-logs"
  force_destroy = true
  tags          = { Name = "${var.project_name}-logs" }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "logs" {
  bucket = aws_s3_bucket.logs.id
  rule {
    id     = "expire-old-logs"
    status = "Enabled"
    expiration { days = 14 }
  }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_public_access_block" "logs" {
  bucket                  = aws_s3_bucket.logs.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "artifacts_bucket_name" { value = aws_s3_bucket.artifacts.id }
output "artifacts_bucket_arn" { value = aws_s3_bucket.artifacts.arn }
output "logs_bucket_name" { value = aws_s3_bucket.logs.id }
output "logs_bucket_arn" { value = aws_s3_bucket.logs.arn }
