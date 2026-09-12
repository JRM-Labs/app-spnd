import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthEvents, AuthStore } from 'auth';
import { Dispatcher } from '@ngrx/signals/events';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-verify-email',
  imports: [RouterLink, ButtonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent {
  private readonly dispatcher = inject(Dispatcher);
  protected readonly authStore = inject(AuthStore);

  protected checkVerification(): void {
    this.dispatcher.dispatch(AuthEvents.emailVerificationCompleted({ kind: 'completeEmailVerification' }));
  }

  protected resend(): void {
    this.dispatcher.dispatch(AuthEvents.emailVerificationResendRequested({ kind: 'resendEmailVerification' }));
  }
}
