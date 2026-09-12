import { inject, resource } from '@angular/core';
import { patchState, signalStore, withState } from '@ngrx/signals';
import { Events, withEventHandlers } from '@ngrx/signals/events';
import { withResource } from '@angular-architects/ngrx-toolkit';
import { tap } from 'rxjs';
import { AuthEvents } from './auth.events';
import { AUTH_GATEWAY } from './auth.gateway';
import { AuthRequest, AuthResult } from './auth.models';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({ request: null as AuthRequest | null }),
  withResource(
    ({ request }) => {
      const gateway = inject(AUTH_GATEWAY);

      return {
        auth: resource<AuthResult | null, AuthRequest | undefined>({
          params: () => request() ?? undefined,
          loader: async ({ params }) => (params ? gateway.execute(params) : null),
        }),
      };
    },
    { errorHandling: 'previous value' }
  ),
  withEventHandlers((store, events = inject(Events)) => ({
    loginRequested$: events.on(AuthEvents.loginRequested).pipe(
      tap(({ payload }) => patchState(store, { request: payload }))
    ),
    registrationRequested$: events.on(AuthEvents.registrationRequested).pipe(
      tap(({ payload }) => patchState(store, { request: payload }))
    ),
    passwordResetRequested$: events.on(AuthEvents.passwordResetRequested).pipe(
      tap(({ payload }) => patchState(store, { request: payload }))
    ),
    emailVerificationCompleted$: events.on(AuthEvents.emailVerificationCompleted).pipe(
      tap(({ payload }) => patchState(store, { request: payload }))
    ),
    emailVerificationResendRequested$: events.on(AuthEvents.emailVerificationResendRequested).pipe(
      tap(({ payload }) => patchState(store, { request: payload }))
    ),
  }))
);
