# 🚀 AutoDeployHub – Cloud-Native CI/CD Platform

[![CI](https://github.com/YOUR_USERNAME/AutoDeployHub/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/AutoDeployHub/actions)
[![CD](https://github.com/YOUR_USERNAME/AutoDeployHub/actions/workflows/cd.yml/badge.svg)](https://github.com/YOUR_USERNAME/AutoDeployHub/actions)

A production-ready SaaS CI/CD platform that allows developers to connect repositories, automate builds, run pipelines, and deploy applications to cloud environments with minimal configuration.

![Architecture](https://img.shields.io/badge/Architecture-Microservices-blue)
![AWS](https://img.shields.io/badge/Cloud-AWS-orange)
![Kubernetes](https://img.shields.io/badge/Orchestration-Kubernetes-blue)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Go](https://img.shields.io/badge/Worker-Go-blue)

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Next.js    │────▶│   NestJS     │────▶│  Go Worker  │
│  Dashboard   │     │   Backend    │     │   Engine    │
│  (Frontend)  │     │    (API)     │     │             │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                    ┌──────┴───────┐      ┌──────┴──────┐
                    │  PostgreSQL  │      │    Redis    │
                    │   (RDS)      │      │(ElastiCache)│
                    └──────────────┘      └─────────────┘
                           │
                    ┌──────┴───────┐
                    │    AWS S3    │
                    │ (Artifacts)  │
                    └──────────────┘
```

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI |
| **Backend** | NestJS, TypeScript, Prisma ORM |
| **Worker** | Go 1.22 |
| **Database** | PostgreSQL 15 (AWS RDS) |
| **Cache/Queue** | Redis 7 (AWS ElastiCache) + BullMQ |
| **Storage** | AWS S3 |
| **Container Registry** | AWS ECR |
| **Orchestration** | Kubernetes (AWS EKS) |
| **IaC** | Terraform |
| **CI/CD** | GitHub Actions |
| **Charts** | Helm 3 |

## 📁 Project Structure

```
AutoDeployHub/
├── apps/
│   ├── frontend/          # Next.js dashboard
│   ├── backend/           # NestJS API server
│   └── worker/            # Go pipeline executor
├── packages/
│   └── shared/            # Shared types & constants
├── infra/
│   ├── terraform/         # AWS infrastructure (VPC, EKS, RDS, S3, ECR)
│   ├── helm/              # Helm charts for K8s deployment
│   └── k8s/               # Raw Kubernetes manifests
├── .github/workflows/     # CI/CD pipelines
├── docker-compose.yml     # Local development
└── README.md
```

## ⚡ Features

- **🔐 Authentication** – JWT + GitHub OAuth integration
- **📦 Project Integration** – Connect GitHub repos with webhook auto-setup
- **🔄 CI/CD Pipelines** – YAML-based pipeline config (install → build → test → deploy)
- **🚀 Deployment Targets** – Kubernetes, Docker Registry, Static Hosting
- **📊 Real-time Logs** – WebSocket-powered live log streaming
- **🔁 Auto Deploy** – Trigger on git push, PR, or manual
- **🔑 Secrets Management** – AES-256 encrypted environment variables
- **⏪ Rollback** – One-click deployment rollback
- **🐦 Canary Deployments** – Progressive traffic shifting
- **⚡ Pipeline Caching** – Speed up builds with dependency caching
- **📈 Horizontal Scaling** – HPA for all services based on CPU/queue depth

## 🚀 Deployment Guide (AWS)

### Prerequisites

- AWS CLI configured with appropriate permissions
- Terraform >= 1.5
- kubectl
- Helm 3
- Docker

### Step 1: Provision AWS Infrastructure

```bash
cd infra/terraform

# Initialize Terraform
terraform init

# Review the plan
terraform plan -var-file=environments/dev/terraform.tfvars \
  -var="db_password=YourSecurePassword123!"

# Apply infrastructure
terraform apply -var-file=environments/dev/terraform.tfvars \
  -var="db_password=YourSecurePassword123!"

# Save outputs
terraform output
```

### Step 2: Configure kubectl

```bash
aws eks update-kubeconfig --name autodeployhub-dev --region us-east-1
```

### Step 3: Build & Push Docker Images

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t <ECR_URL>/autodeployhub/frontend:latest ./apps/frontend
docker push <ECR_URL>/autodeployhub/frontend:latest

docker build -t <ECR_URL>/autodeployhub/backend:latest ./apps/backend
docker push <ECR_URL>/autodeployhub/backend:latest

docker build -t <ECR_URL>/autodeployhub/worker:latest ./apps/worker
docker push <ECR_URL>/autodeployhub/worker:latest
```

### Step 4: Deploy with Helm

```bash
helm upgrade --install autodeployhub ./infra/helm/autodeployhub \
  --namespace autodeployhub --create-namespace \
  --set frontend.image.repository=<ECR_URL>/autodeployhub/frontend \
  --set backend.image.repository=<ECR_URL>/autodeployhub/backend \
  --set worker.image.repository=<ECR_URL>/autodeployhub/worker \
  --set backend.env.DATABASE_URL="postgresql://autodeployhub:password@<RDS_ENDPOINT>/autodeployhub" \
  --set backend.env.REDIS_HOST="<ELASTICACHE_ENDPOINT>" \
  --set backend.env.JWT_SECRET="your-jwt-secret" \
  --wait
```

### Step 5: Run Database Migrations

```bash
kubectl exec -it deployment/backend -n autodeployhub -- npx prisma migrate deploy
kubectl exec -it deployment/backend -n autodeployhub -- npx prisma db seed
```

### 🧹 Teardown (Destroy Everything)

```bash
# Delete Helm release
helm uninstall autodeployhub -n autodeployhub

# Destroy all AWS infrastructure
cd infra/terraform
terraform destroy -var-file=environments/dev/terraform.tfvars \
  -var="db_password=YourSecurePassword123!" -auto-approve
```

> ⚠️ This destroys ALL resources including the EKS cluster, RDS, ElastiCache, S3 buckets, and ECR repos. No charges after destroy completes.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/github` | GitHub OAuth |
| GET | `/api/users/me` | Current user profile |
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List projects |
| GET | `/api/projects/:id` | Get project |
| POST | `/api/pipelines/run` | Trigger pipeline |
| GET | `/api/pipelines/:id` | Get pipeline |
| POST | `/api/pipelines/:id/cancel` | Cancel pipeline |
| POST | `/api/pipelines/:id/retry` | Retry pipeline |
| GET | `/api/jobs/:id/logs` | Get job logs |
| POST | `/api/deployments` | Create deployment |
| POST | `/api/deployments/:id/rollback` | Rollback |
| POST | `/api/deployments/:id/promote` | Promote canary |
| POST | `/api/webhooks/github` | GitHub webhook |
| GET | `/api/health` | Health check |

## 🧪 Running Tests

```bash
# Backend unit tests
cd apps/backend && npm test

# Worker tests
cd apps/worker && go test ./...

# All services
npm run test  # from root (via turbo)
```

## 📊 Scalability Design

- **Frontend**: Stateless Next.js pods, HPA scales 2-6 based on CPU
- **Backend**: Stateless NestJS pods, HPA scales 2-8 based on CPU
- **Worker**: Scales 2-10 based on Redis queue depth
- **Database**: RDS with optional read replicas
- **Redis**: ElastiCache with cluster mode support

## 🔐 Security

- Rate limiting (100 req/min per IP)
- Input validation on all endpoints
- AES-256 secrets encryption at rest
- Non-root Docker containers
- VPC network isolation
- Security groups restricting access
- JWT with refresh token rotation
- HMAC webhook signature verification

## 📄 License

MIT License – Built as a resume/portfolio project.
