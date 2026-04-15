# ============================================
# IAM Module – Roles & Policies
# ============================================

variable "project_name" { type = string }
variable "environment" { type = string }
variable "eks_cluster_arn" { type = string }
variable "s3_artifacts_arn" { type = string }
variable "s3_logs_arn" { type = string }
variable "eks_oidc_provider" { type = string }

# IRSA role for backend pods to access S3
resource "aws_iam_role" "backend_pod" {
  name = "${var.project_name}-${var.environment}-backend-pod-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Federated = var.eks_oidc_provider }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(var.eks_oidc_provider, "arn:aws:iam::", "")}:sub" = "system:serviceaccount:autodeployhub:backend-sa"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "backend_s3" {
  name = "${var.project_name}-backend-s3-policy"
  role = aws_iam_role.backend_pod.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket",
        ]
        Resource = [
          var.s3_artifacts_arn,
          "${var.s3_artifacts_arn}/*",
          var.s3_logs_arn,
          "${var.s3_logs_arn}/*",
        ]
      },
    ]
  })
}

# IRSA role for worker pods
resource "aws_iam_role" "worker_pod" {
  name = "${var.project_name}-${var.environment}-worker-pod-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Federated = var.eks_oidc_provider }
      Action = "sts:AssumeRoleWithWebIdentity"
      Condition = {
        StringEquals = {
          "${replace(var.eks_oidc_provider, "arn:aws:iam::", "")}:sub" = "system:serviceaccount:autodeployhub:worker-sa"
        }
      }
    }]
  })
}

resource "aws_iam_role_policy" "worker_s3_ecr" {
  name = "${var.project_name}-worker-s3-ecr-policy"
  role = aws_iam_role.worker_pod.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["s3:PutObject", "s3:GetObject", "s3:ListBucket"]
        Resource = [
          var.s3_artifacts_arn, "${var.s3_artifacts_arn}/*",
          var.s3_logs_arn, "${var.s3_logs_arn}/*",
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "ecr:GetAuthorizationToken",
          "ecr:BatchCheckLayerAvailability",
          "ecr:PutImage",
          "ecr:InitiateLayerUpload",
          "ecr:UploadLayerPart",
          "ecr:CompleteLayerUpload",
        ]
        Resource = "*"
      },
    ]
  })
}

output "backend_role_arn" { value = aws_iam_role.backend_pod.arn }
output "worker_role_arn" { value = aws_iam_role.worker_pod.arn }
