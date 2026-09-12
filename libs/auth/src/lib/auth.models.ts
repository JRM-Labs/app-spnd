export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
}

export interface LoginRequest {
  kind: 'login';
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  kind: 'register';
  familyName: string;
  email: string;
  password: string;
}

export interface PasswordResetRequest {
  kind: 'passwordReset';
  email: string;
}

export interface CompleteEmailVerificationRequest {
  kind: 'completeEmailVerification';
}

export interface ResendEmailVerificationRequest {
  kind: 'resendEmailVerification';
}

export type AuthRequest =
  | LoginRequest
  | RegisterRequest
  | PasswordResetRequest
  | CompleteEmailVerificationRequest
  | ResendEmailVerificationRequest;

export interface AuthenticatedResult {
  kind: 'authenticated';
  user: AuthUser;
}

export interface VerificationPendingResult {
  kind: 'verificationPending';
  user: AuthUser;
}

export interface PasswordResetSentResult {
  kind: 'passwordResetSent';
  email: string;
}

export interface FamilyProvisionedResult {
  kind: 'familyProvisioned';
  user: AuthUser;
  familyId: string;
  forwardingAddress: string;
}

export type AuthResult =
  | AuthenticatedResult
  | VerificationPendingResult
  | PasswordResetSentResult
  | FamilyProvisionedResult;
