import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api';
import { UNITS } from '../models';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>Compare Quantities</h2>
      <p>// POST /api/v1/quantities/compare</p>
    </div>

    <div class="card">
      <div class="card-title">
        Select Category <span class="badge badge-post">POST</span>
      </div>

      <div class="form-group" style="margin-bottom:16px">
        <label>Category</label>
        <select [(ngModel)]="category" (change)="onCatChange()">
          <option value="length">Length</option>
          <option value="weight">Weight</option>
          <option value="volume">Volume</option>
          <option value="temperature">Temperature</option>
        </select>
      </div>

      <div class="quantity-builder" style="margin-bottom:12px">
        <label>First Quantity</label>
        <div class="quantity-row">
          <input type="number" [(ngModel)]="val1" placeholder="Value" />
          <select [(ngModel)]="unit1">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>
      </div>

      <div class="divider-label">VS</div>

      <div class="quantity-builder">
        <label>Second Quantity</label>
        <div class="quantity-row">
          <input type="number" [(ngModel)]="val2" placeholder="Value" />
          <select [(ngModel)]="unit2">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>
      </div>

      <button 
        class="btn btn-primary btn-full" 
        (click)="doCompare()" 
        [disabled]="loading">
        Compare →
      </button>

      <!-- Loading -->
      <div *ngIf="loading" class="result-box info show">
        <span class="spinner"></span> Processing...
      </div>

      <!-- Result -->
      <div *ngIf="!loading && hasResult"
           class="result-box show"
           [class.success]="isEqual"
           [class.info]="!isEqual">
        <div class="result-label">Are they equal?</div>
        <div class="result-value">{{ resultText }}</div>
        <div class="result-meta">
          {{ val1 }} {{ unit1 }} vs {{ val2 }} {{ unit2 }}
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
export class CompareComponent implements OnInit {

  category = 'length';

  val1: number | null = null;
  unit1 = '';
  val2: number | null = null;
  unit2 = '';

  units: string[] = [];

  resultText = '';
  isEqual = false;
  hasResult = false;
  error = '';
  loading = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.onCatChange();
  }

  onCatChange() {
    this.units = UNITS[this.category]?.units || [];
    this.unit1 = this.units[0] || '';
    this.unit2 = this.units[0] || '';
  }

  doCompare() {
    this.resultText = '';
    this.error = '';
    this.hasResult = false;
    this.isEqual = false;

    if (this.val1 === null || this.val2 === null) {
      this.error = 'Enter both values';
      return;
    }

    this.loading = true;

    const mType = UNITS[this.category]?.type || 'LengthUnit';

    const body = {
      thisQuantityDTO: {
        value: this.val1,
        unit: this.unit1,
        measurementType: mType
      },
      thatQuantityDTO: {
        value: this.val2,
        unit: this.unit2,
        measurementType: mType
      }
    };

    this.api.post<any>('/api/v1/quantities/compare', body)
      .subscribe({
        next: (data) => {
          console.log("API RESPONSE:", data);

          this.loading = false;

          if (data.error) {
            this.error = data.errorMessage || 'Something went wrong';
            return;
          }

          // ✅ USE resultString (MAIN FIX)
          const result = String(data?.resultString).toLowerCase();

          this.isEqual = result === 'true';

          this.resultText = this.isEqual
            ? '✓ Equal'
            : '✗ Not Equal';

          this.hasResult = true;

          this.cd.detectChanges();
        },

        error: (e) => {
          this.loading = false;
          this.error = e?.error?.message || e.message || 'Something went wrong';
          this.cd.detectChanges();
        }
      });
  }
}