import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ApiService } from '../api';
import { HistoryRecord } from '../models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Operation History</h2>
      <p>// GET /api/v1/quantities/history/...</p>
    </div>

    <div class="card">
      <div class="filter-row">
        <select [(ngModel)]="opFilter" (change)="onOperationChange()">
          <option value="">All Operations</option>
          <option value="COMPARE">COMPARE</option>
          <option value="CONVERT">CONVERT</option>
          <option value="ADD">ADD</option>
          <option value="SUBTRACT">SUBTRACT</option>
          <option value="DIVIDE">DIVIDE</option>
        </select>

        <select [(ngModel)]="typeFilter" (change)="onTypeChange()">
          <option value="">All Types</option>
          <option value="LengthUnit">Length</option>
          <option value="WeightUnit">Weight</option>
          <option value="VolumeUnit">Volume</option>
          <option value="TemperatureUnit">Temperature</option>
        </select>

        <label class="checkbox-label">
          <input type="checkbox" [(ngModel)]="errOnly" (change)="load()" style="width:auto" />
          Errors only
        </label>

        <button class="btn btn-ghost btn-sm" (click)="load()">↺ Refresh</button>
      </div>

      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Operation</th>
              <th>Type</th>
              <th>Input 1</th>
              <th>Input 2</th>
              <th>Result</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngIf="loading">
              <td colspan="7">
                <div class="skeleton" style="margin:10px 0"></div>
              </td>
            </tr>

            <tr *ngFor="let r of records; let i = index">
              <td style="color:var(--text-dim)">{{ i + 1 }}</td>

              <td>
                <span class="op-chip op-{{ r.operation }}">
                  {{ r.operation || '—' }}
                </span>
              </td>

              <td style="color:var(--text-dim)">
                {{ r.thisMeasurementType || '—' }}
              </td>

              <td>{{ fmtQ(r.thisValue, r.thisUnit) }}</td>
              <td>{{ fmtQ(r.thatValue, r.thatUnit) }}</td>

              <td>
                {{
                  r.resultString ||
                  (r.resultValue != null && r.resultUnit
                    ? r.resultValue + ' ' + r.resultUnit
                    : '—')
                }}
              </td>

              <td
                [class.status-ok]="!r.errorMessage"
                [class.status-err]="r.errorMessage"
              >
                {{ r.errorMessage ? '✗ Error' : '✓ OK' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading && records.length === 0" class="empty-state">
        <div class="icon">📭</div>
        <p>No records found</p>
      </div>

      <div *ngIf="error" class="result-box error show" style="margin-top:12px">
        <div class="result-label">Error</div>
        <div class="result-value" style="font-size:13px">
          {{ error }}
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {

  opFilter = '';
  typeFilter = '';
  errOnly = false;

  records: HistoryRecord[] = [];
  loading = false;
  error = '';

  constructor(
    private api: ApiService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.load();
  }

  // Prevent mixing filters
  onOperationChange() {
    this.typeFilter = '';
    this.load();
  }

  onTypeChange() {
    this.opFilter = '';
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';
    this.records = [];

    let path = '';

    if (this.errOnly) {
      path = '/api/v1/quantities/history/errored';
    }
    else if (this.typeFilter) {
      path = `/api/v1/quantities/history/type/${this.typeFilter}`;
    }
    else if (this.opFilter) {
      path = `/api/v1/quantities/history/operation/${this.opFilter}`;
    }
    else {
      path = '/api/v1/quantities/history';
    }

    this.api.get<HistoryRecord[]>(path)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges(); // 🔥 fix
      }))
      .subscribe({
        next: (data) => {
          this.records = data || [];

          // 🔥 Force UI update instantly
          this.cdr.detectChanges();
        },
        error: (e) => {
          this.error = e.message || 'Something went wrong';

          // 🔥 Force UI update instantly
          this.cdr.detectChanges();
        }
      });
  }

  fmtQ(value: any, unit: any): string {
    if (value == null && !unit) return '—';
    return `${value ?? ''} ${unit ?? ''}`.trim() || '—';
  }
}