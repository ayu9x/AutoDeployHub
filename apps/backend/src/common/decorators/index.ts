// ============================================
// Common Decorators
// ============================================

import { SetMetadata, createParamDecorator, ExecutionContext } from '@nestjs/common';

// Mark a route as public (no auth required)
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// Extract current user from request
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
