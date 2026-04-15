// ============================================
// GitHub OAuth Strategy
// ============================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get('github.clientId'),
      clientSecret: configService.get('github.clientSecret'),
      callbackURL: configService.get('github.callbackUrl'),
      scope: ['user:email', 'repo', 'admin:repo_hook'],
    });
  }

  async validate(
    accessToken: string,
    _refreshToken: string,
    profile: any,
  ) {
    return {
      accessToken,
      profile,
    };
  }
}
