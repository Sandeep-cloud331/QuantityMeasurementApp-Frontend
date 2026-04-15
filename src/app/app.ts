import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthComponent } from './auth/auth';
import { HeaderComponent } from './header/header';
import { ConvertComponent } from './convert/convert';
import { CompareComponent } from './compare/compare';
import { ArithmeticComponent } from './arithmetic/arithmetic';
import { HistoryComponent } from './history/history';
import { StatsComponent } from './stats/stats';
import { AuthService } from './auth.service';
import { ToastService, Toast } from './toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AuthComponent,
    HeaderComponent,
    ConvertComponent,
    CompareComponent,
    ArithmeticComponent,
    HistoryComponent,
    StatsComponent
  ],
  template: `
    <!-- Background orbs -->
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>

    <!-- Auth overlay -->
    <app-auth></app-auth>

    <!-- Main app -->
    <div class="app-wrapper" *ngIf="isLoggedIn">
      <app-header></app-header>

      <nav class="nav-tabs">
        <button class="nav-tab" [class.active]="activeTab==='convert'"  (click)="switchTab('convert')">⇄ Convert</button>
        <button class="nav-tab" [class.active]="activeTab==='compare'"  (click)="switchTab('compare')">= Compare</button>
        <button class="nav-tab" [class.active]="activeTab==='add'"      (click)="switchTab('add')">+ Add</button>
        <button class="nav-tab" [class.active]="activeTab==='subtract'" (click)="switchTab('subtract')">− Subtract</button>
        <button class="nav-tab" [class.active]="activeTab==='divide'"   (click)="switchTab('divide')">÷ Divide</button>
        <button class="nav-tab" [class.active]="activeTab==='history'"  (click)="switchTab('history')">📋 History</button>
        <button class="nav-tab" [class.active]="activeTab==='stats'"    (click)="switchTab('stats')">📊 Stats</button>
      </nav>

      <div class="panel" [class.active]="activeTab==='convert'">  <app-convert></app-convert>   </div>
      <div class="panel" [class.active]="activeTab==='compare'">  <app-compare></app-compare>   </div>
      <div class="panel" [class.active]="activeTab==='add'">      <app-arithmetic [op]="'add'"></app-arithmetic>      </div>
      <div class="panel" [class.active]="activeTab==='subtract'"> <app-arithmetic [op]="'subtract'"></app-arithmetic> </div>
      <div class="panel" [class.active]="activeTab==='divide'">   <app-arithmetic [op]="'divide'"></app-arithmetic>   </div>
      <div class="panel" [class.active]="activeTab==='history'">  <app-history></app-history>   </div>
      <div class="panel" [class.active]="activeTab==='stats'">    <app-stats></app-stats>       </div>
    </div>

    <!-- Toast -->
    <div id="toast" [class.show]="toast" [class.success]="toast?.type==='success'" [class.error]="toast?.type==='error'">
      {{ toast?.message }}
    </div>
  `
})
export class App implements OnInit {
  activeTab = 'convert';
  isLoggedIn = false;
  toast: Toast | null = null;

  constructor(private auth: AuthService, private toastSvc: ToastService) {}

  ngOnInit() {
    this.auth.handleGoogleCallback();
    this.auth.isLoggedIn$.subscribe(v => this.isLoggedIn = v);
    this.toastSvc.toast$.subscribe(t => this.toast = t);
  }

  switchTab(tab: string) {
    this.activeTab = tab;
  }
}
