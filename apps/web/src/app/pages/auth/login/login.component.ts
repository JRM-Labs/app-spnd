import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthEvents, AuthStore } from 'auth';
import { Dispatcher } from '@ngrx/signals/events';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, CheckboxModule, InputTextModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly dispatcher = inject(Dispatcher);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  protected readonly form = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  constructor() {
    effect(() => {
      if (this.authStore.authValue()?.kind === 'verificationPending') {
        void this.router.navigateByUrl('/auth/verify-email');
      }
    });
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) return;

    this.dispatcher.dispatch(AuthEvents.loginRequested({ kind: 'login', ...this.form.getRawValue() }));
  }
}
