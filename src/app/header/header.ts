import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header>
      <div class="logo">
        <div class="logo-icon">⚗️</div>
        <div class="logo-text">Measure<span>Kit</span></div>
      </div>
      <div class="header-right">
        <div class="user-badge">
          <div class="dot"></div>
          <span>{{ user || '—' }}</span>
        </div>
        <button id="logout-btn" (click)="logout()">Logout</button>
      </div>
    </header>
  `
})
export class HeaderComponent {
  user: string | null = null;
  constructor(private auth: AuthService) {
    this.auth.user$.subscribe(u => this.user = u);
  }
  logout() { this.auth.logout(); }
}
