import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {
  private refreshDashboardSubject = new Subject<void>();
  refreshDashboard$ = this.refreshDashboardSubject.asObservable();

  triggerDashboardRefresh() {
    this.refreshDashboardSubject.next();
  }
}
