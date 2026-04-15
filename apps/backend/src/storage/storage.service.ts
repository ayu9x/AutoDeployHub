// ============================================
// S3 Storage Service
// Handles file uploads, downloads, and
// presigned URL generation for AWS S3
// ============================================

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3: S3Client;
  private readonly artifactsBucket: string;
  private readonly logsBucket: string;

  constructor(private configService: ConfigService) {
    this.s3 = new S3Client({
      region: this.configService.get('aws.region'),
      credentials: {
        accessKeyId: this.configService.get('aws.accessKeyId') || '',
        secretAccessKey: this.configService.get('aws.secretAccessKey') || '',
      },
    });

    this.artifactsBucket = this.configService.get('aws.s3.artifactsBucket') || 'autodeployhub-artifacts';
    this.logsBucket = this.configService.get('aws.s3.logsBucket') || 'autodeployhub-logs';
  }

  /**
   * Upload a build artifact to S3
   */
  async uploadArtifact(
    projectId: string,
    pipelineId: string,
    fileName: string,
    body: Buffer | Readable | string,
    contentType: string = 'application/octet-stream',
  ): Promise<string> {
    const key = `projects/${projectId}/pipelines/${pipelineId}/artifacts/${fileName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.artifactsBucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        ServerSideEncryption: 'AES256',
      }),
    );

    this.logger.log(`Artifact uploaded: ${key}`);
    return key;
  }

  /**
   * Upload pipeline logs to S3 for persistence
   */
  async uploadLogs(
    jobId: string,
    logs: string,
  ): Promise<string> {
    const key = `jobs/${jobId}/logs.txt`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.logsBucket,
        Key: key,
        Body: logs,
        ContentType: 'text/plain',
        ServerSideEncryption: 'AES256',
      }),
    );

    this.logger.log(`Logs uploaded for job: ${jobId}`);
    return key;
  }

  /**
   * Get a presigned URL for downloading an artifact
   * URL expires in 1 hour by default
   */
  async getArtifactUrl(key: string, expiresIn: number = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.artifactsBucket,
      Key: key,
    });

    return getSignedUrl(this.s3, command, { expiresIn });
  }

  /**
   * Get logs content for a job
   */
  async getLogs(jobId: string): Promise<string> {
    const key = `jobs/${jobId}/logs.txt`;

    try {
      const response = await this.s3.send(
        new GetObjectCommand({
          Bucket: this.logsBucket,
          Key: key,
        }),
      );

      return await response.Body?.transformToString() || '';
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return '';
      }
      throw error;
    }
  }

  /**
   * List all artifacts for a pipeline
   */
  async listArtifacts(projectId: string, pipelineId: string) {
    const prefix = `projects/${projectId}/pipelines/${pipelineId}/artifacts/`;

    const response = await this.s3.send(
      new ListObjectsV2Command({
        Bucket: this.artifactsBucket,
        Prefix: prefix,
      }),
    );

    return (response.Contents || []).map((obj) => ({
      key: obj.Key,
      size: obj.Size,
      lastModified: obj.LastModified,
    }));
  }

  /**
   * Delete all artifacts for a pipeline
   */
  async deleteArtifacts(projectId: string, pipelineId: string): Promise<void> {
    const artifacts = await this.listArtifacts(projectId, pipelineId);

    await Promise.all(
      artifacts.map((artifact) =>
        this.s3.send(
          new DeleteObjectCommand({
            Bucket: this.artifactsBucket,
            Key: artifact.key,
          }),
        ),
      ),
    );

    this.logger.log(`Artifacts deleted for pipeline: ${pipelineId}`);
  }
}
