import { InjectionToken } from '@angular/core';
import { AuthRequest, AuthResult } from './auth.models';

export interface AuthGateway {
  execute(request: AuthRequest): Promise<AuthResult>;
}

export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY', {
  providedIn: 'root',
  factory: () => ({
    execute: async () => {
      throw new Error('No Firebase Auth gateway has been configured.');
    },
  }),
});
