import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class TokensService {
  constructor(private readonly prisma: PrismaService) {}

  async listTokens(userId: string) {
    return this.prisma.apiToken.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        name: true,
        scopes: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
        tokenPrefix: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createToken(userId: string, name: string, scopes: string[], expiresIn?: string) {
    const rawToken = `adh_${crypto.randomBytes(32).toString('hex')}`;
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const tokenPrefix = rawToken.substring(0, 12);

    let expiresAt: Date | null = null;
    if (expiresIn) {
      const days = parseInt(expiresIn.replace('d', ''));
      expiresAt = new Date(Date.now() + days * 86400000);
    }

    const token = await this.prisma.apiToken.create({
      data: {
        userId,
        name,
        tokenHash: hashedToken,
        tokenPrefix,
        scopes,
        expiresAt,
      },
    });

    // Return the raw token only once — it's hashed in DB
    return {
      id: token.id,
      name: token.name,
      token: rawToken, // Only shown once!
      scopes: token.scopes,
      expiresAt: token.expiresAt,
      createdAt: token.createdAt,
    };
  }

  async revokeToken(userId: string, tokenId: string) {
    const token = await this.prisma.apiToken.findFirst({
      where: { id: tokenId, userId },
    });
    if (!token) throw new NotFoundException('Token not found');

    return this.prisma.apiToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });
  }

  async validateToken(rawToken: string) {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const token = await this.prisma.apiToken.findFirst({
      where: { tokenHash: hashedToken, revokedAt: null },
      include: { user: true },
    });

    if (!token) return null;
    if (token.expiresAt && token.expiresAt < new Date()) return null;

    // Update last used
    await this.prisma.apiToken.update({
      where: { id: token.id },
      data: { lastUsedAt: new Date() },
    });

    return token.user;
  }
}
