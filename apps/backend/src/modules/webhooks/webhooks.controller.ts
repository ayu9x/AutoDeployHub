import { Controller, Post, Headers, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';

@ApiTags('webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('github')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'GitHub webhook endpoint' })
  async handleGithub(
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
    @Body() payload: any,
  ) {
    const result = await this.webhooksService.handleGithubWebhook(
      signature || '',
      event || 'push',
      payload,
    );
    return { success: true, ...result };
  }
}
