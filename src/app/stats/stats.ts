import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { finalize, filter } from 'rxjs/operators';
import { ApiService } from '../api';
import { OPERATIONS } from '../models';

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Operation Stats</h2>
      <p>// GET /api/v1/quantities/count/{{ '{operation}' }}</p>
    </div>

    <div class="stats-row">
      <div *ngFor="let s of stats; let i = index" class="stat-chip">
        <div *ngIf="s.loading" class="val skeleton" style="height:28px;width:60px;margin-bottom:6px"></div>
        <div *ngIf="!s.loading" class="val" [style.color]="colors[i]">{{ s.count }}</div>
        <div class="lbl">{{ s.op }}</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">
        Lookup Count <span class="badge badge-get">GET</span>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>Operation</label>
          <select [(ngModel)]="selectedOp">
            <option *ngFor="let op of ops" [value]="op">{{ op }}</option>
          </select>
        </div>

        <div style="display:flex;align-items:flex-end">
          <button class="btn btn-primary" style="width:100%" (click)="doCount()">
            Fetch Count →
          </button>
        </div>
      </div>

      <div *ngIf="countLoading" class="result-box info show">
        <span class="spinner"></span> Processing...
      </div>

      <div *ngIf="countResult !== null && !countLoading" class="result-box info show">
        <div class="result-label">Count</div>
        <div class="result-value">{{ countResult }}</div>
        <div class="result-meta">
          Total successful {{ selectedOp }} operations
        </div>
      </div>

      <div *ngIf="countError && !countLoading" class="result-box error show">
        <div class="result-label">Error</div>
        <div class="result-value" style="font-size:14px">
          {{ countError }}
        </div>
      </div>
    </div>
  `
})
export class StatsComponent implements OnInit {

  ops = OPERATIONS;
  colors = ['var(--accent3)', 'var(--accent)', 'var(--success)', 'var(--accent2)', '#ffc864'];

  stats: { op: string; count: any; loading: boolean }[] = [];

  selectedOp = 'COMPARE';
  countResult: any = null;
  countError = '';
  countLoading = false;

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadStats();

    // 🔥 Reload stats whenever user navigates to this page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadStats();
      });
  }

  // 🔥 Reusable method for loading all stats
  loadStats() {
    this.stats = this.ops.map(op => ({
      op,
      count: '—',
      loading: true
    }));

    this.ops.forEach((op, i) => {
      this.api.get<any>(`/api/v1/quantities/count/${op}`)
        .pipe(finalize(() => {
          this.stats[i].loading = false;
          this.cdr.detectChanges(); // ensure skeleton stops
        }))
        .subscribe({
          next: (data) => {
            this.stats[i].count = data ?? '—';
            this.cdr.detectChanges(); // instant UI update
          },
          error: () => {
            this.stats[i].count = 'ERR';
            this.cdr.detectChanges();
          }
        });
    });
  }

  // 🔥 Fetch single operation count
  doCount() {
    this.countResult = null;
    this.countError = '';
    this.countLoading = true;

    this.api.get<any>(`/api/v1/quantities/count/${this.selectedOp}`)
      .pipe(finalize(() => {
        this.countLoading = false;
        this.cdr.detectChanges(); // stop loader instantly
      }))
      .subscribe({
        next: (data) => {
          this.countResult = data;
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.countError = e.message || 'Something went wrong';
          this.cdr.detectChanges();
        }
      });
  }
}