// ============================================
// S3 Storage Module
// Provides AWS S3 integration for artifacts
// and log storage
// ============================================

import { Module, Global } from '@nestjs/common';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
