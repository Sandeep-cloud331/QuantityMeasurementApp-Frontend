import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

const BASE = 'https://quantitymeasurementapp-2-i500.onrender.com';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient, private auth: AuthService) { }

  private headers(): HttpHeaders {
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    const token = this.auth.getToken();
    if (token) h = h.set('Authorization', 'Bearer ' + token);
    return h;
  }

  get<T>(path: string): Observable<T> {
    return this.http.get<T>(BASE + path, { headers: this.headers() }).pipe(
      catchError(e => {
        const msg = typeof e.error === 'string'
          ? e.error
          : (e.error?.message || e.error?.error || JSON.stringify(e.error) || e.message || 'Request failed');
        return throwError(() => new Error(msg));
      })
    );
  }

  // ✅ FIXED: now accepts optional options (headers etc.)
  post<T>(path: string, body: any, options: any = {}): Observable<T> {

    const finalOptions = {
      headers: options.headers || this.headers(),
      responseType: 'text' as const
    };

    return this.http.post(BASE + path, body, finalOptions).pipe(
      map(text => {
        try {
          return JSON.parse(text) as T;
        } catch {
          return text as unknown as T;
        }
      }),
      catchError(e => {
        let msg: string;

        if (typeof e.error === 'string') {
          try {
            const parsed = JSON.parse(e.error);
            msg = parsed.message || parsed.error || e.error;
          } catch {
            msg = e.error;
          }
        } else {
          msg = e.error?.message || e.error?.error || e.message || 'Request failed';
        }

        return throwError(() => new Error(msg));
      })
    );
  }
}