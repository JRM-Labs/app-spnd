import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthEvents, AuthStore } from 'auth';
import { Dispatcher } from '@ngrx/signals/events';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly dispatcher = inject(Dispatcher);
  protected readonly authStore = inject(AuthStore);

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.dispatcher.dispatch(AuthEvents.passwordResetRequested({
      kind: 'passwordReset',
      ...this.form.getRawValue(),
    }));
  }
}
