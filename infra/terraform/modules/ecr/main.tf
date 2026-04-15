# ============================================
# ECR Module – Container Registry
# ============================================

variable "project_name" { type = string }
variable "environment" { type = string }

resource "aws_ecr_repository" "frontend" {
  name                 = "${var.project_name}/frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "${var.project_name}-frontend" }
}

resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}/backend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "${var.project_name}-backend" }
}

resource "aws_ecr_repository" "worker" {
  name                 = "${var.project_name}/worker"
  image_tag_mutability = "MUTABLE"
  force_delete         = true

  image_scanning_configuration { scan_on_push = true }
  tags = { Name = "${var.project_name}-worker" }
}

# Lifecycle policy to keep only last 10 images
resource "aws_ecr_lifecycle_policy" "cleanup" {
  for_each   = toset(["frontend", "backend", "worker"])
  repository = "${var.project_name}/${each.key}"

  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep last 10 images"
      selection = {
        tagStatus   = "any"
        countType   = "imageCountMoreThan"
        countNumber = 10
      }
      action = { type = "expire" }
    }]
  })

  depends_on = [
    aws_ecr_repository.frontend,
    aws_ecr_repository.backend,
    aws_ecr_repository.worker,
  ]
}

output "frontend_repository_url" { value = aws_ecr_repository.frontend.repository_url }
output "backend_repository_url" { value = aws_ecr_repository.backend.repository_url }
output "worker_repository_url" { value = aws_ecr_repository.worker.repository_url }
