import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div id="auth-overlay" [class.hidden]="isLoggedIn">
      <div class="auth-card">
        <div class="auth-title">MeasureKit</div>
        <div class="auth-subtitle">// Quantity Measurement API</div>

        <div class="auth-tabs">
          <button class="auth-tab" [class.active]="tab==='login'" (click)="tab='login'">Login</button>
          <button class="auth-tab" [class.active]="tab==='signup'" (click)="tab='signup'">Sign Up</button>
        </div>

        <!-- LOGIN -->
        <div *ngIf="tab==='login'">
          <div class="form-group" style="margin-bottom:14px">
            <label>Username</label>
            <input type="text" [(ngModel)]="loginUser" placeholder="your_username" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="loginPass" placeholder="••••••••" />
          </div>

          <button class="btn btn-primary btn-full" (click)="doLogin()">Login →</button>

          <div *ngIf="loginError" class="result-box error show" style="margin-top:12px">
            <div class="result-label">Error</div>
            <div class="result-value" style="font-size:14px">{{ loginError }}</div>
          </div>
        </div>

        <!-- SIGNUP -->
        <div *ngIf="tab==='signup'">
          <div class="form-group" style="margin-bottom:14px">
            <label>Username</label>
            <input type="text" [(ngModel)]="signupUser" placeholder="choose_username" />
          </div>

          <div class="form-group" style="margin-bottom:14px">
            <label>Email</label>
            <input type="email" [(ngModel)]="signupEmail" placeholder="you@example.com" />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="signupPass" placeholder="••••••••" />
          </div>

          <button class="btn btn-primary btn-full" (click)="doSignup()">Create Account →</button>

          <div class="oauth-divider"><span>or</span></div>

          <button class="btn btn-google btn-full" (click)="doGoogleLogin()">
            <svg width="18" height="18" viewBox="0 0 48 48" style="vertical-align:middle;margin-right:8px">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign up with Google
          </button>

          <div *ngIf="signupMsg"
               class="result-box show"
               [class.success]="signupOk"
               [class.error]="!signupOk"
               style="margin-top:12px">
            <div class="result-label">{{ signupOk ? 'Success' : 'Error' }}</div>
            <div class="result-value" style="font-size:14px">{{ signupMsg }}</div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthComponent {

  tab: 'login' | 'signup' = 'login';

  loginUser = '';
  loginPass = '';
  loginError = '';

  signupUser = '';
  signupPass = '';
  signupEmail = '';
  signupMsg = '';
  signupOk = false;

  isLoggedIn = false;

  constructor(private auth: AuthService, private toast: ToastService) {
    this.auth.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
  }

  doLogin() {
    this.loginError = '';

    if (!this.loginUser || !this.loginPass) {
      this.loginError = 'Username and password required';
      return;
    }

    this.auth.login(this.loginUser, this.loginPass).subscribe({
      next: (res: any) => {
        // backend returns JSON → store session
        this.auth.saveSession(res.token, res.username);
      },
      error: (e) => {
        this.loginError = e.error?.message || 'Login failed';
      }
    });
  }

  doSignup() {
    this.signupMsg = '';

    if (!this.signupUser || !this.signupPass || !this.signupEmail) {
      this.signupMsg = 'All fields are required';
      this.signupOk = false;
      return;
    }

    this.auth.signup(this.signupUser, this.signupPass, this.signupEmail).subscribe({
      next: (res: any) => {
        this.signupMsg = res.message || 'Registration successful';
        this.signupOk = true;

        // auto login after signup
        this.auth.saveSession(res.token, res.username);

        setTimeout(() => this.tab = 'login', 1200);
      },
      error: (e) => {
        this.signupMsg = e.error?.message || 'Signup failed';
        this.signupOk = false;
      }
    });
  }

  doGoogleLogin() {
    window.location.href = 'http://localhost:8080/oauth2/authorization/google';
  }
}