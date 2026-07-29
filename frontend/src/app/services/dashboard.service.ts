import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardData } from '../models/interfaces';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService extends ApiService {
  getDashboardData(): Observable<DashboardData> {
    return this.get<DashboardData>('dashboard');
  }
}
