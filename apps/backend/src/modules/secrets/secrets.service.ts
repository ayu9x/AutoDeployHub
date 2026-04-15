// ============================================
// Secrets Service
// Manages encrypted environment variables
// Uses AES-256 encryption at rest
// ============================================

import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class SecretsService {
  private readonly logger = new Logger(SecretsService.name);
  private readonly encryptionKey: string;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.encryptionKey = this.configService.get('encryption.key') || 'default-key';
  }

  /**
   * Create or update an encrypted secret for a project
   */
  async upsert(projectId: string, key: string, value: string, description?: string) {
    const encryptedValue = this.encrypt(value);

    const secret = await this.prisma.secret.upsert({
      where: {
        projectId_key: { projectId, key },
      },
      create: {
        key,
        value: encryptedValue,
        description,
        projectId,
      },
      update: {
        value: encryptedValue,
        description,
      },
      select: {
        id: true,
        key: true,
        description: true,
        projectId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    this.logger.log(`Secret ${key} upserted for project ${projectId}`);
    return secret;
  }

  /**
   * Get all secrets for a project (values masked)
   */
  async findByProject(projectId: string) {
    const secrets = await this.prisma.secret.findMany({
      where: { projectId },
      select: {
        id: true,
        key: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { key: 'asc' },
    });

    return secrets;
  }

  /**
   * Get decrypted secrets for worker execution
   * Internal use only — never exposed via API
   */
  async getDecryptedSecrets(projectId: string): Promise<Record<string, string>> {
    const secrets = await this.prisma.secret.findMany({
      where: { projectId },
    });

    const decrypted: Record<string, string> = {};
    for (const secret of secrets) {
      decrypted[secret.key] = this.decrypt(secret.value);
    }

    return decrypted;
  }

  /**
   * Delete a secret
   */
  async delete(projectId: string, key: string) {
    const secret = await this.prisma.secret.findUnique({
      where: { projectId_key: { projectId, key } },
    });

    if (!secret) throw new NotFoundException('Secret not found');

    await this.prisma.secret.delete({
      where: { id: secret.id },
    });

    this.logger.log(`Secret ${key} deleted from project ${projectId}`);
  }

  /**
   * Encrypt a value using AES-256
   */
  private encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.encryptionKey).toString();
  }

  /**
   * Decrypt a value
   */
  private decrypt(encryptedValue: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }
}
