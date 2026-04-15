import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../api';
import { UNITS } from '../models';

@Component({
  selector: 'app-arithmetic',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="section-header">
      <h2>{{ title }}</h2>
      <p>// POST /api/v1/quantities/{{ op }}</p>
    </div>

    <div class="card">
      <div class="card-title">Input <span class="badge badge-post">POST</span></div>

      <div class="form-group" style="margin-bottom:16px">
        <label>Category</label>
        <select [(ngModel)]="category" (change)="onCatChange()">
          <option value="length">Length</option>
          <option value="weight">Weight</option>
          <option value="volume">Volume</option>
        </select>
      </div>

      <div class="quantity-builder" style="margin-bottom:12px">
        <label>{{ label1 }}</label>
        <div class="quantity-row">
          <input type="number" [(ngModel)]="val1" placeholder="Value" />
          <select [(ngModel)]="unit1">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>
      </div>

      <div class="divider-label">{{ symbol }}</div>

      <div class="quantity-builder" style="margin-bottom:16px">
        <label>{{ label2 }}</label>
        <div class="quantity-row">
          <input type="number" [(ngModel)]="val2" placeholder="Value" />
          <select [(ngModel)]="unit2">
            <option *ngFor="let u of units" [value]="u">{{ u }}</option>
          </select>
        </div>
      </div>

      <button 
        class="btn btn-primary btn-full" 
        (click)="doOp()" 
        [disabled]="loading">
        {{ btnLabel }} →
      </button>

      <!-- Loading -->
      <div *ngIf="loading" class="result-box info show">
        <span class="spinner"></span> Processing...
      </div>

      <!-- Result -->
      <div *ngIf="!loading && result" class="result-box success show">
        <div class="result-label">{{ resultLabel }}</div>
        <div class="result-value">{{ result }}</div>
        <div class="result-meta">
          {{ val1 }} {{ unit1 }} {{ symbol }} {{ val2 }} {{ unit2 }}
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
export class ArithmeticComponent implements OnInit {

  @Input() op: 'add' | 'subtract' | 'divide' = 'add';

  get title() {
    return {
      add: 'Add Quantities',
      subtract: 'Subtract Quantities',
      divide: 'Divide Quantities'
    }[this.op];
  }

  get label1() { return this.op === 'divide' ? 'Dividend' : 'First Quantity'; }
  get label2() { return this.op === 'divide' ? 'Divisor' : 'Second Quantity'; }
  get symbol() { return { add: '+', subtract: '−', divide: '÷' }[this.op]; }
  get btnLabel() { return { add: 'Add', subtract: 'Subtract', divide: 'Divide' }[this.op]; }
  get resultLabel() { return { add: 'Sum', subtract: 'Difference', divide: 'Quotient' }[this.op]; }

  category = 'length';
  val1: number | null = null;
  unit1 = '';
  val2: number | null = null;
  unit2 = '';
  units: string[] = [];

  result = '';
  error = '';
  loading = false;

  constructor(private api: ApiService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.onCatChange();
  }

  onCatChange() {
    this.units = UNITS[this.category]?.units || [];
    this.unit1 = this.units[0] || '';
    this.unit2 = this.units[0] || '';
  }

  doOp() {
    this.result = '';
    this.error = '';

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

    this.api.post<any>(`/api/v1/quantities/${this.op}`, body)
      .subscribe({
        next: (data) => {
          console.log("API RESPONSE:", data);

          this.loading = false;

          if (data.error) {
            this.error = data.errorMessage || 'Something went wrong';
          } else {
            this.result = `${data.resultValue} ${data.resultUnit}`;
          }

          // ✅ FORCE UI UPDATE (REAL FIX)
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