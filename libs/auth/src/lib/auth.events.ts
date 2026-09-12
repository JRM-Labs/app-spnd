import { type } from '@ngrx/signals';
import { eventGroup } from '@ngrx/signals/events';
import {
  CompleteEmailVerificationRequest,
  LoginRequest,
  PasswordResetRequest,
  RegisterRequest,
  ResendEmailVerificationRequest,
} from './auth.models';

export const AuthEvents = eventGroup({
  source: 'Auth Page',
  events: {
    loginRequested: type<LoginRequest>(),
    registrationRequested: type<RegisterRequest>(),
    passwordResetRequested: type<PasswordResetRequest>(),
    emailVerificationCompleted: type<CompleteEmailVerificationRequest>(),
    emailVerificationResendRequested: type<ResendEmailVerificationRequest>(),
  },
});
