import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const BASE = 'https://quantitymeasurementapp-2-i500.onrender.com';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private _token = new BehaviorSubject<string | null>(localStorage.getItem('jwtToken'));
  private _user = new BehaviorSubject<string | null>(localStorage.getItem('currentUser'));

  token$ = this._token.asObservable();
  user$ = this._user.asObservable();

  isLoggedIn$ = new BehaviorSubject<boolean>(!!localStorage.getItem('jwtToken'));

  constructor(private http: HttpClient) { }

  getToken() { return this._token.value; }
  getUser() { return this._user.value; }

  // ✅ FIXED: backend returns JSON
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(BASE + '/auth/login', { username, password }).pipe(
      tap(res => this.saveSession(res.token, res.username))
    );
  }

  // ✅ FIXED: register + email + JSON response
  signup(username: string, password: string, email: string): Observable<any> {
    return this.http.post<any>(BASE + '/auth/register', {
      username,
      password,
      email
    });
  }

  saveSession(token: string, username: string) {
    localStorage.setItem('jwtToken', token);
    localStorage.setItem('currentUser', username);

    this._token.next(token);
    this._user.next(username);
    this.isLoggedIn$.next(true);
  }

  logout() {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('currentUser');

    this._token.next(null);
    this._user.next(null);
    this.isLoggedIn$.next(false);
  }

  // ✅ FIXED: required for your earlier error
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  handleGoogleCallback() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');

    if (token && username) {
      this.saveSession(token, decodeURIComponent(username));
      window.history.replaceState({}, document.title, window.location.pathname);
      return true;
    }
    return false;
  }
}