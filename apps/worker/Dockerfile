# ============================================
# Worker Dockerfile – Go multi-stage build
# ============================================

FROM golang:1.22-alpine AS builder

RUN apk add --no-cache git

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /worker ./cmd/worker

# Production
FROM alpine:3.19

RUN apk add --no-cache ca-certificates git docker-cli && \
    addgroup -S worker && adduser -S worker -G worker

COPY --from=builder /worker /usr/local/bin/worker

USER worker
CMD ["worker"]
