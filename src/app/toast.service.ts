import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast { message: string; type: 'success' | 'error'; }

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toast = new BehaviorSubject<Toast | null>(null);
  toast$ = this._toast.asObservable();
  private _timer: any;

  show(message: string, type: 'success' | 'error' = 'success') {
    clearTimeout(this._timer);
    this._toast.next({ message, type });
    this._timer = setTimeout(() => this._toast.next(null), 3000);
  }
}
