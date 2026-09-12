import { Component, effect, inject } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthEvents, AuthStore } from 'auth';
import { Dispatcher } from '@ngrx/signals/events';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, ButtonModule, InputTextModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly dispatcher = inject(Dispatcher);
  private readonly router = inject(Router);
  protected readonly authStore = inject(AuthStore);

  protected readonly form = this.formBuilder.group(
    {
      familyName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch }
  );

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

    const { familyName, email, password } = this.form.getRawValue();
    this.dispatcher.dispatch(AuthEvents.registrationRequested({ kind: 'register', familyName, email, password }));
  }
}

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const { password, confirmPassword } = control.value as { password?: string; confirmPassword?: string };
  return password === confirmPassword ? null : { passwordMismatch: true };
}
