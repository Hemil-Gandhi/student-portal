import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/interfaces';

interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }

  register(userData: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, userData)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  sendOtp(email: string): Observable<{ message: string; expiresIn: number }> {
    return this.http.post<{ message: string; expiresIn: number }>(`${this.apiUrl}/auth/send-otp`, { email });
  }

  resendOtp(email: string): Observable<{ message: string; expiresIn: number }> {
    return this.http.post<{ message: string; expiresIn: number }>(`${this.apiUrl}/auth/resend-otp`, { email });
  }

  verifyOtp(data: { email: string; otp: string; name: string; studentId?: string; department?: string; year?: number }): Observable<AuthResponse & { needsPassword?: boolean }> {
    return this.http.post<AuthResponse & { needsPassword?: boolean }>(`${this.apiUrl}/auth/verify-otp`, data)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`);
  }

  updateProfile(userData: Partial<User>): Observable<any> {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.put(`${this.apiUrl}/auth/profile`, userData, { headers });
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.put(`${this.apiUrl}/auth/change-password`, data, { headers });
  }

  setPassword(password: string): Observable<AuthResponse> {
    const headers = { Authorization: `Bearer ${this.getToken()}` };
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/set-password`, { password }, { headers })
      .pipe(
        tap(response => {
          this.setSession(response);
        })
      );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
