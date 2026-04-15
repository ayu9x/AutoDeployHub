// ============================================
// AutoDeployHub Shared Types
// Core type definitions used across all services
// ============================================

// -- User Types --
export interface User {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  githubId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  email: string;
  name?: string;
  password?: string;
  githubId?: string;
  githubToken?: string;
  avatarUrl?: string;
}

// -- Project Types --
export interface Project {
  id: string;
  name: string;
  description: string | null;
  repoUrl: string;
  repoBranch: string;
  repoProvider: string;
  framework: string | null;
  autoDetected: boolean;
  pipelineConfig: PipelineConfig | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectCreateInput {
  name: string;
  description?: string;
  repoUrl: string;
  repoBranch?: string;
}

// -- Pipeline Types --
export interface Pipeline {
  id: string;
  number: number;
  status: PipelineStatus;
  trigger: TriggerType;
  branch: string;
  commitHash: string | null;
  commitMsg: string | null;
  config: PipelineConfig;
  startedAt: Date | null;
  finishedAt: Date | null;
  duration: number | null;
  projectId: string;
  triggeredBy: string;
  createdAt: Date;
}

export interface PipelineConfig {
  steps: PipelineStep[];
  cache?: CacheConfig;
  env?: Record<string, string>;
}

export interface PipelineStep {
  name: string;
  command?: string;
  script?: string;
  parallel?: boolean;
  timeout?: number;
  retries?: number;
  condition?: string;
}

export interface CacheConfig {
  key: string;
  paths: string[];
}

// -- Job Types --
export interface Job {
  id: string;
  name: string;
  step: number;
  status: JobStatus;
  command: string | null;
  exitCode: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  duration: number | null;
  retryCount: number;
  maxRetries: number;
  cacheKey: string | null;
  pipelineId: string;
  createdAt: Date;
}

// -- Deployment Types --
export interface Deployment {
  id: string;
  version: string;
  status: DeploymentStatus;
  target: DeploymentTarget;
  targetUrl: string | null;
  environment: string;
  metadata: Record<string, unknown> | null;
  canary: boolean;
  canaryWeight: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  rolledBackAt: Date | null;
  projectId: string;
  pipelineId: string;
  deployedBy: string;
  createdAt: Date;
}

// -- Log Types --
export interface LogEntry {
  id: string;
  line: number;
  content: string;
  level: LogLevel;
  timestamp: Date;
  jobId: string;
}

// -- Secret Types --
export interface Secret {
  id: string;
  key: string;
  projectId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SecretCreateInput {
  key: string;
  value: string;
}

// -- Enums --
export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export enum PipelineStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum JobStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  SKIPPED = 'SKIPPED',
}

export enum DeploymentStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  DEPLOYED = 'DEPLOYED',
  FAILED = 'FAILED',
  ROLLED_BACK = 'ROLLED_BACK',
}

export enum DeploymentTarget {
  KUBERNETES = 'KUBERNETES',
  DOCKER_REGISTRY = 'DOCKER_REGISTRY',
  STATIC_HOSTING = 'STATIC_HOSTING',
}

export enum TriggerType {
  PUSH = 'PUSH',
  PULL_REQUEST = 'PULL_REQUEST',
  MANUAL = 'MANUAL',
  SCHEDULE = 'SCHEDULE',
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

// -- WebSocket Event Types --
export enum WsEvent {
  PIPELINE_STATUS = 'pipeline:status',
  JOB_STATUS = 'job:status',
  JOB_LOG = 'job:log',
  BUILD_PROGRESS = 'build:progress',
}

export interface WsPipelineStatusPayload {
  pipelineId: string;
  projectId: string;
  status: PipelineStatus;
  startedAt?: Date;
  finishedAt?: Date;
  duration?: number;
}

export interface WsJobStatusPayload {
  jobId: string;
  pipelineId: string;
  status: JobStatus;
  step: number;
  exitCode?: number;
}

export interface WsJobLogPayload {
  jobId: string;
  pipelineId: string;
  line: number;
  content: string;
  level: LogLevel;
  timestamp: Date;
}

export interface WsBuildProgressPayload {
  pipelineId: string;
  projectId: string;
  progress: number; // 0-100
  currentStep: string;
}

// -- Queue Job Types --
export interface QueueJobData {
  pipelineId: string;
  projectId: string;
  jobId: string;
  step: PipelineStep;
  repoUrl: string;
  branch: string;
  commitHash: string;
  secrets: Record<string, string>;
  cacheKey?: string;
}

// -- API Response Types --
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
  statusCode: number;
  errors?: Record<string, string[]>;
}
