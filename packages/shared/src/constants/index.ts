// ============================================
// AutoDeployHub Shared Constants
// ============================================

// -- Queue Names --
export const QUEUE_NAMES = {
  PIPELINE: 'pipeline-queue',
  BUILD: 'build-queue',
  DEPLOY: 'deploy-queue',
  NOTIFICATION: 'notification-queue',
} as const;

// -- Redis Channels --
export const REDIS_CHANNELS = {
  PIPELINE_EVENTS: 'pipeline-events',
  JOB_LOGS: 'job-logs',
  BUILD_PROGRESS: 'build-progress',
} as const;

// -- Pipeline Defaults --
export const PIPELINE_DEFAULTS = {
  MAX_RETRIES: 3,
  TIMEOUT_MS: 600000, // 10 minutes
  MAX_PARALLEL_JOBS: 5,
  LOG_BUFFER_SIZE: 1000,
} as const;

// -- Supported Frameworks --
export const SUPPORTED_FRAMEWORKS = {
  'package.json': 'nodejs',
  'requirements.txt': 'python',
  'Pipfile': 'python',
  'go.mod': 'go',
  'Cargo.toml': 'rust',
  'pom.xml': 'java',
  'build.gradle': 'java',
  'Gemfile': 'ruby',
  'composer.json': 'php',
} as const;

// -- Default Pipeline Configs --
export const DEFAULT_PIPELINE_CONFIGS: Record<string, { steps: Array<{ name: string; command: string }> }> = {
  nodejs: {
    steps: [
      { name: 'install', command: 'npm ci' },
      { name: 'build', command: 'npm run build' },
      { name: 'test', command: 'npm test' },
      { name: 'deploy', command: 'echo "Deploy step"' },
    ],
  },
  python: {
    steps: [
      { name: 'install', command: 'pip install -r requirements.txt' },
      { name: 'build', command: 'python setup.py build' },
      { name: 'test', command: 'pytest' },
      { name: 'deploy', command: 'echo "Deploy step"' },
    ],
  },
  go: {
    steps: [
      { name: 'install', command: 'go mod download' },
      { name: 'build', command: 'go build ./...' },
      { name: 'test', command: 'go test ./...' },
      { name: 'deploy', command: 'echo "Deploy step"' },
    ],
  },
} as const;

// -- HTTP Status Codes --
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_ERROR: 500,
} as const;

// -- Pagination --
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
