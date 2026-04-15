// ============================================
// Auth Service
// Handles user registration, login, JWT
// token generation, and GitHub OAuth flow
// ============================================

import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

export interface TokenPayload {
  sub: string;
  email: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user with email and password
   */
  async register(email: string, password: string, name?: string): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password with bcrypt (10 salt rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        name: name || email.split('@')[0],
        passwordHash,
      },
    });

    this.logger.log(`New user registered: ${user.id}`);
    return this.generateTokens(user.id, user.email);
  }

  /**
   * Authenticate user with email and password
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User logged in: ${user.id}`);
    return this.generateTokens(user.id, user.email);
  }

  /**
   * Handle GitHub OAuth callback
   * Creates or updates user from GitHub profile
   */
  async handleGithubAuth(profile: any, accessToken: string): Promise<AuthTokens> {
    const githubId = profile.id.toString();
    const email = profile.emails?.[0]?.value || `${profile.username}@github.com`;
    const name = profile.displayName || profile.username;
    const avatarUrl = profile.photos?.[0]?.value;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { githubId },
    });

    if (!user) {
      // Check if email already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        // Link GitHub to existing account
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: { githubId, githubToken: accessToken, avatarUrl },
        });
      } else {
        // Create new user
        user = await this.prisma.user.create({
          data: {
            email,
            name,
            githubId,
            githubToken: accessToken,
            avatarUrl,
          },
        });
      }
      this.logger.log(`GitHub user created/linked: ${user.id}`);
    } else {
      // Update token on each login
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { githubToken: accessToken, avatarUrl },
      });
    }

    return this.generateTokens(user.id, user.email);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.generateTokens(user.id, user.email);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Validate user exists by ID (used by JWT strategy)
   */
  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        githubId: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  /**
   * Generate access and refresh token pair
   */
  private generateTokens(userId: string, email: string): AuthTokens {
    const payload: TokenPayload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiration') || '7d',
    });

    return { accessToken, refreshToken };
  }
}
