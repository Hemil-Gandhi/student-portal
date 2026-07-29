import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NotificationPreferences {
  emailEnabled: boolean;
  onTaskCreated: boolean;
  onNoteCreated: boolean;
  onTaskReminder: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3002/api/notifications';

  getNotifications(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  markAllAsRead(): Observable<any> {
    return this.http.put(`${this.apiUrl}/read-all`, {});
  }

  deleteNotification(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getPreferences(): Observable<any> {
    return this.http.get(`${this.apiUrl}/preferences`);
  }

  updatePreferences(prefs: NotificationPreferences): Observable<any> {
    return this.http.put(`${this.apiUrl}/preferences`, prefs);
  }
}