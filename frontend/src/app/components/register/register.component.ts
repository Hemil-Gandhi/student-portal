import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-dvh flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-3 sm:p-4 md:p-6">
      <div class="w-full max-w-lg mx-auto">
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">

          <div class="bg-gray-900 dark:bg-white p-5 sm:p-6 text-center">
            <div class="w-12 h-12 bg-white/20 dark:bg-gray-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg class="w-6 h-6 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            </div>
            <h1 class="text-xl sm:text-2xl font-bold text-white dark:text-gray-900">Student Portal</h1>
            <p class="mt-1 text-sm text-gray-300 dark:text-gray-500">
              @if (step() === 'form') { Create your account }
              @else if (step() === 'otp') { Verify your email }
              @else { Set your password }
            </p>
          </div>

          <div class="p-4 sm:p-6">

            <div class="flex items-center justify-center gap-2 mb-6">
              <div class="flex items-center gap-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  [class.bg-gray-900]="step() === 'form'"
                  [class.dark:bg-white]="step() === 'form'"
                  [class.text-white]="step() === 'form'"
                  [class.dark:text-gray-900]="step() === 'form'"
                  [class.bg-green-500]="step() === 'otp' || step() === 'password'"
                >
                  @if (step() === 'otp' || step() === 'password') {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  } @else { 1 }
                </div>
                <span class="text-xs font-medium ml-1" [class.text-gray-900]="step() === 'form'" [class.dark:text-white]="step() === 'form'" [class.text-gray-400]="step() !== 'form'">Details</span>
              </div>
              <div class="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"
                [class.bg-green-400]="step() === 'otp' || step() === 'password'"></div>
              <div class="flex items-center gap-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  [class.bg-gray-900]="step() === 'otp'"
                  [class.dark:bg-white]="step() === 'otp'"
                  [class.bg-green-500]="step() === 'password'"
                  [class.bg-gray-200 dark:bg-gray-700]="step() === 'form'"
                  [class.text-gray-500 dark:text-gray-400]="step() === 'form'"
                  [class.text-white dark:text-gray-900]="step() === 'otp' || step() === 'password'"
                >
                  @if (step() === 'password') {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  } @else { 2 }
                </div>
                <span class="text-xs font-medium ml-1"
                  [class.text-gray-900 dark:text-white]="step() === 'otp'"
                  [class.text-green-600 dark:text-green-400]="step() === 'password'"
                  [class.text-gray-400 dark:text-gray-500]="step() === 'form'">Verify</span>
              </div>
              <div class="w-8 h-0.5 bg-gray-200 dark:bg-gray-700"
                [class.bg-green-400]="step() === 'password'"></div>
              <div class="flex items-center gap-1">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold"
                  [class.bg-gray-900]="step() === 'password'"
                  [class.dark:bg-white]="step() === 'password'"
                  [class.bg-gray-200 dark:bg-gray-700]="step() !== 'password'"
                  [class.text-gray-500 dark:text-gray-400]="step() !== 'password'"
                  [class.text-white dark:text-gray-900]="step() === 'password'"
                >3</div>
                <span class="text-xs font-medium ml-1"
                  [class.text-gray-900 dark:text-white]="step() === 'password'"
                  [class.text-gray-400 dark:text-gray-500]="step() !== 'password'">Password</span>
              </div>
            </div>

            @if (error()) {
              <div class="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm flex items-start gap-2">
                <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span>{{ error() }}</span>
              </div>
            }

            @if (step() === 'form') {
              <form (ngSubmit)="sendOtp()" class="space-y-3 sm:space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name <span class="text-red-500">*</span></label>
                  <input type="text" [(ngModel)]="name" name="name" required
                    class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors text-sm sm:text-base"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address <span class="text-red-500">*</span></label>
                  <input type="email" [(ngModel)]="email" name="email" required
                    class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors text-sm sm:text-base"
                    placeholder="your.email@example.com" />
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Student ID</label>
                    <input type="text" [(ngModel)]="studentId" name="studentId"
                      class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors text-sm sm:text-base"
                      placeholder="Student ID" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                    <input type="text" [(ngModel)]="department" name="department"
                      class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors text-sm sm:text-base"
                      placeholder="Department" />
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                  <select [(ngModel)]="year" name="year"
                    class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors appearance-none cursor-pointer text-sm sm:text-base">
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
                <button type="submit" [disabled]="sendingOtp()"
                  class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]">
                  @if (sendingOtp()) {
                    <span class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </span>
                  } @else {
                    Send Verification Code
                  }
                </button>
              </form>
            }

            @if (step() === 'otp') {
              <div class="text-center mb-6">
                <div class="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg class="w-8 h-8 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Enter the 4-digit code sent to</p>
                <p class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-all">{{ email }}</p>
              </div>

              <form (ngSubmit)="verifyOtp()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Verification Code</label>
                  <div class="flex justify-center gap-2 sm:gap-3">
                    @for (i of [0,1,2,3]; track i) {
                      <input
                        #otpInput
                        type="text"
                        inputmode="numeric"
                        maxlength="1"
                        [(ngModel)]="otpDigits[i]"
                        [name]="'otp' + i"
                        (input)="onOtpInput($event, i)"
                        (keydown)="onOtpKeydown($event, i)"
                        (focus)="onOtpFocus($event, i)"
                        class="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-white dark:bg-gray-800 border-2 rounded-xl text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors"
                        [class.border-gray-300]="!focusedIndex() || focusedIndex() !== i"
                        [class.dark:border-gray-600]="!focusedIndex() || focusedIndex() !== i"
                        [class.border-gray-900]="focusedIndex() === i"
                        [class.dark:border-white]="focusedIndex() === i"
                        [class.border-red-400]="otpError()"
                        autocomplete="one-time-code"
                      />
                    }
                  </div>
                  @if (otpError()) {
                    <p class="text-red-500 dark:text-red-400 text-xs text-center mt-2">{{ otpError() }}</p>
                  }
                </div>

                <div class="flex items-center justify-between gap-2">
                  <button type="button" (click)="resendOtp()" [disabled]="resendCooldown() > 0"
                    class="text-sm text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-medium disabled:text-gray-400 dark:disabled:text-gray-600 disabled:cursor-not-allowed transition-colors">
                    @if (resendCooldown() > 0) {
                      Resend in {{ resendCooldown() }}s
                    } @else {
                      Resend Code
                    }
                  </button>
                  <button type="button" (click)="backToForm()" class="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                    Change Email
                  </button>
                </div>

                <button type="submit" [disabled]="verifying() || otpDigits.join('').length !== 4"
                  class="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-semibold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]">
                  @if (verifying()) {
                    <span class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  } @else {
                    Verify Email
                  }
                </button>
              </form>
            }

            @if (step() === 'password') {
              <div class="text-center mb-6">
                <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <p class="text-gray-600 dark:text-gray-400 text-sm">Email verified! Now set your password</p>
                <p class="font-semibold text-gray-900 dark:text-white text-sm sm:text-base break-all">{{ email }}</p>
              </div>

              <form (ngSubmit)="setPassword()" class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Create Password <span class="text-red-500">*</span></label>
                  <input type="password" [(ngModel)]="newPassword" name="newPassword" required minlength="6"
                    class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors text-sm sm:text-base"
                    placeholder="Min 6 characters" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password <span class="text-red-500">*</span></label>
                  <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" required
                    class="w-full px-3 sm:px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none transition-colors text-sm sm:text-base"
                    placeholder="Confirm password" />
                </div>
                @if (passwordError()) {
                  <p class="text-red-500 dark:text-red-400 text-xs">{{ passwordError() }}</p>
                }
                <button type="submit" [disabled]="settingPassword()"
                  class="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base min-h-[44px]">
                  @if (settingPassword()) {
                    <span class="flex items-center justify-center gap-2">
                      <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Setting Password...
                    </span>
                  } @else {
                    Create Account
                  }
                </button>
              </form>
            }

            <div class="mt-6 text-center">
              <p class="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?
                <a routerLink="/login" class="text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 font-semibold ml-1 transition-colors">Sign in</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  step = signal<'form' | 'otp' | 'password'>('form');
  name = '';
  email = '';
  studentId = '';
  department = '';
  year: number | null = null;
  otpDigits = ['', '', '', ''];
  focusedIndex = signal<number | null>(null);
  otpError = signal<string | null>(null);
  sendingOtp = signal(false);
  verifying = signal(false);
  settingPassword = signal(false);
  error = signal<string | null>(null);
  resendCooldown = signal(0);
  private cooldownInterval: any = null;

  // Password fields (step 3)
  newPassword = '';
  confirmPassword = '';
  passwordError = signal<string | null>(null);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  sendOtp(): void {
    if (!this.name || !this.email) {
      this.error.set('Please fill in all required fields');
      return;
    }

    this.sendingOtp.set(true);
    this.error.set(null);

    this.authService.sendOtp(this.email).subscribe({
      next: (res) => {
        this.sendingOtp.set(false);
        this.step.set('otp');
        this.startResendCooldown(res.expiresIn);
        setTimeout(() => {
          const firstInput = document.querySelector('[name="otp0"]') as HTMLInputElement;
          firstInput?.focus();
        }, 100);
      },
      error: (err) => {
        this.sendingOtp.set(false);
        this.error.set(err.error?.message || 'Failed to send OTP. Please try again.');
      }
    });
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    this.otpError.set(null);
    if (input.value && index < 3) {
      const nextInput = document.querySelector(`[name="otp${index + 1}"]`) as HTMLInputElement;
      nextInput?.focus();
    }
  }

  onOtpKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = document.querySelector(`[name="otp${index - 1}"]`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onOtpFocus(event: FocusEvent, index: number): void {
    this.focusedIndex.set(index);
  }

  verifyOtp(): void {
    const otp = this.otpDigits.join('');
    if (otp.length !== 4) {
      this.otpError.set('Please enter the complete 4-digit code');
      return;
    }

    this.verifying.set(true);
    this.error.set(null);
    this.otpError.set(null);

    this.authService.verifyOtp({
      email: this.email,
      otp,
      name: this.name,
      studentId: this.studentId || undefined,
      department: this.department || undefined,
      year: this.year || undefined
    }).subscribe({
      next: (res) => {
        this.verifying.set(false);
        this.step.set('password');
        setTimeout(() => {
          const pwInput = document.querySelector('[name="newPassword"]') as HTMLInputElement;
          pwInput?.focus();
        }, 100);
      },
      error: (err) => {
        this.verifying.set(false);
        const msg = err.error?.message || 'Verification failed';
        if (msg.toLowerCase().includes('otp') || msg.toLowerCase().includes('code')) {
          this.otpError.set(msg);
        } else {
          this.error.set(msg);
        }
      }
    });
  }

  setPassword(): void {
    this.passwordError.set(null);
    this.error.set(null);

    if (!this.newPassword) {
      this.passwordError.set('Please enter a password');
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError.set('Passwords do not match');
      return;
    }

    this.settingPassword.set(true);
    this.authService.setPassword(this.newPassword).subscribe({
      next: () => {
        this.settingPassword.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.settingPassword.set(false);
        this.error.set(err.error?.message || 'Failed to set password');
      }
    });
  }

  resendOtp(): void {
    if (this.resendCooldown() > 0) return;
    this.authService.resendOtp(this.email).subscribe({
      next: (res) => {
        this.otpDigits = ['', '', '', ''];
        this.otpError.set(null);
        this.startResendCooldown(res.expiresIn);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to resend OTP');
      }
    });
  }

  backToForm(): void {
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
    this.step.set('form');
    this.otpDigits = ['', '', ''];
    this.otpError.set(null);
  }

  private startResendCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    if (this.cooldownInterval) clearInterval(this.cooldownInterval);
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown.update(v => {
        if (v <= 1) {
          clearInterval(this.cooldownInterval);
          this.cooldownInterval = null;
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }
}