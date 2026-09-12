import { Injectable } from '@angular/core';
import {
  AuthGateway,
  AuthRequest,
  AuthResult,
  AuthUser,
} from 'auth';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  browserLocalPersistence,
  browserSessionPersistence,
  updateProfile,
  reload,
  User,
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { firebaseAuth, functions } from './firebase';

interface ProvisionFamilyResponse {
  familyId: string;
  forwardingAddress: string;
}

@Injectable({ providedIn: 'root' })
export class FirebaseAuthGateway implements AuthGateway {
  async execute(request: AuthRequest): Promise<AuthResult> {
    const auth = this.requireAuth();

    switch (request.kind) {
      case 'login': {
        await setPersistence(
          auth,
          request.rememberMe ? browserLocalPersistence : browserSessionPersistence
        );
        const credential = await signInWithEmailAndPassword(auth, request.email, request.password);
        return this.toUserResult(credential.user);
      }
      case 'register': {
        const credential = await createUserWithEmailAndPassword(auth, request.email, request.password);
        await updateProfile(credential.user, { displayName: request.familyName.trim() });
        await this.sendVerificationEmail(credential.user);
        return { kind: 'verificationPending', user: toAuthUser(credential.user) };
      }
      case 'passwordReset':
        await sendPasswordResetEmail(auth, request.email);
        return { kind: 'passwordResetSent', email: request.email };
      case 'resendEmailVerification': {
        const user = this.requireCurrentUser();
        await this.sendVerificationEmail(user);
        return { kind: 'verificationPending', user: toAuthUser(user) };
      }
      case 'completeEmailVerification':
        return this.provisionVerifiedUser();
    }
  }

  private async provisionVerifiedUser(): Promise<AuthResult> {
    const user = this.requireCurrentUser();
    await reload(user);

    if (!user.emailVerified) {
      return { kind: 'verificationPending', user: toAuthUser(user) };
    }

    const callable = httpsCallable<{ familyName: string }, ProvisionFamilyResponse>(
      this.requireFunctions(),
      'provisionFamily'
    );
    const response = await callable({ familyName: user.displayName?.trim() || 'My household' });

    return {
      kind: 'familyProvisioned',
      user: toAuthUser(user),
      familyId: response.data.familyId,
      forwardingAddress: response.data.forwardingAddress,
    };
  }

  private async sendVerificationEmail(user: User): Promise<void> {
    await sendEmailVerification(user, {
      url: `${window.location.origin}/auth/verify-email`,
    });
  }

  private toUserResult(user: User): AuthResult {
    const mappedUser = toAuthUser(user);
    return user.emailVerified
      ? { kind: 'authenticated', user: mappedUser }
      : { kind: 'verificationPending', user: mappedUser };
  }

  private requireAuth() {
    if (!firebaseAuth) {
      throw new Error('Firebase Auth is not configured for this environment.');
    }

    return firebaseAuth;
  }

  private requireCurrentUser(): User {
    const user = this.requireAuth().currentUser;
    if (!user) {
      throw new Error('Sign in before verifying your email address.');
    }

    return user;
  }

  private requireFunctions() {
    if (!functions) {
      throw new Error('Firebase Functions is not configured for this environment.');
    }

    return functions;
  }
}

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified,
  };
}
