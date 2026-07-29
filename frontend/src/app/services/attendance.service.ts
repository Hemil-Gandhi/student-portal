import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Attendance } from '../models/interfaces';
import { ApiService } from './api.service';

interface AttendanceStats {
  summary: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    total: number;
  };
  percentage: number;
  subjectWise: Array<{ _id: string; present: number; total: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService extends ApiService {
  getAttendance(params?: any): Observable<Attendance[]> {
    return this.get<Attendance[]>('attendance', params);
  }

  getAttendanceStats(params?: any): Observable<AttendanceStats> {
    return this.get<AttendanceStats>('attendance/stats', params);
  }

  createAttendance(attendance: Attendance): Observable<{ message: string; attendance: Attendance }> {
    return this.post<{ message: string; attendance: Attendance }>('attendance', attendance);
  }

  updateAttendance(id: string, attendance: Attendance): Observable<{ message: string; attendance: Attendance }> {
    return this.put<{ message: string; attendance: Attendance }>(`attendance/${id}`, attendance);
  }

  deleteAttendance(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`attendance/${id}`);
  }
}
