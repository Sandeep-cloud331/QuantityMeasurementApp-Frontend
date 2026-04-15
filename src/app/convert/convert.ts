import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api';
import { UNITS } from '../models';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-convert',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Unit Conversion</h2>
      <p>// POST /api/v1/quantities/convert</p>
    </div>

    <div class="card">
      <div class="card-title">
        Input Quantity <span class="badge badge-post">POST</span>
      </div>

      <div class="form-grid" style="margin-bottom:16px">
        <div class="form-group">
          <label>Category</label>
          <select [(ngModel)]="category" (change)="onCatChange()">
            <option value="length">Length</option>
            <option value="weight">Weight</option>
            <option value="volume">Volume</option>
            <option value="temperature">Temperature</option>
          </select>
        </div>

        <div class="form-group">
          <label>Value</label>
          <input type="number" [(ngModel)]="value" placeholder="e.g. 100" />
        </div>
      </div>

      <div class="form-grid">
        <div class="form-group">
          <label>From Unit</label>
          <select [(ngModel)]="fromUnit">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>

        <div class="form-group">
          <label>To Unit</label>
          <select [(ngModel)]="toUnit">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>
      </div>

      <button 
        class="btn btn-primary btn-full" 
        (click)="doConvert()" 
        [disabled]="loading">
        Convert →
      </button>

      <!-- Loading -->
      <div *ngIf="loading" class="result-box info show">
        <span class="spinner"></span> Processing...
      </div>

      <!-- Result -->
      <div *ngIf="!loading && hasResult" class="result-box success show">
        <div class="result-label">Result</div>
        <div class="result-value">{{ result }}</div>
        <div class="result-meta">
          {{ value }} {{ fromUnit }} → {{ toUnit }}
        </div>
      </div>

      <!-- Error -->
      <div *ngIf="!loading && error" class="result-box error show">
        <div class="result-label">Error</div>
        <div class="result-value">{{ error }}</div>
      </div>
    </div>
  `
})
export class ConvertComponent implements OnInit {

  category = 'length';
  value: number | null = null;
  fromUnit = '';
  toUnit = '';
  units: string[] = [];

  result = '';
  hasResult = false;
  error = '';
  loading = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.onCatChange();
  }

  onCatChange() {
    this.units = UNITS[this.category]?.units || [];
    this.fromUnit = this.units[0] || '';
    this.toUnit = this.units[1] || this.units[0] || '';
  }

  doConvert() {
    this.result = '';
    this.error = '';
    this.hasResult = false;

    if (this.value === null || isNaN(Number(this.value))) {
      this.error = 'Enter a valid number';
      return;
    }

    this.loading = true;

    const mType = UNITS[this.category]?.type || 'LengthUnit';

    const body = {
      thisQuantityDTO: {
        value: this.value,
        unit: this.fromUnit,
        measurementType: mType
      },
      thatQuantityDTO: {
        value: this.value,
        unit: this.toUnit,
        measurementType: mType
      }
    };

    console.log("CALLING API...");

    this.api.post<any>('/api/v1/quantities/convert', body)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cd.detectChanges(); // ensure UI updates
        })
      )
      .subscribe({
        next: (data) => {
          console.log("API RESPONSE:", data);

          if (data.error) {
            this.error = data.errorMessage || 'Something went wrong';
            return;
          }

          const value = data?.resultValue;
          const unit = data?.resultUnit;
          const str = data?.resultString;

          // ✅ FIXED RESULT HANDLING
          if (value !== null && value !== undefined) {
            this.result = unit ? `${value} ${unit}` : `${value}`;
          } else if (str) {
            this.result = str;
          } else {
            this.result = 'No result returned';
          }

          this.hasResult = true;
        },

        error: (e) => {
          console.error("API ERROR:", e);
          this.error = e?.error?.message || e.message || 'Something went wrong';
        }
      });
  }
}