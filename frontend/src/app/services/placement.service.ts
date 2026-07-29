import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Placement } from '../models/interfaces';
import { ApiService } from './api.service';

interface PlacementResponse {
  placements: Placement[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface PlacementStats {
  statusStats: Array<{ _id: string; count: number }>;
  jobTypeStats: Array<{ _id: string; count: number }>;
  acceptedOffers: Placement[];
  totalCTC: number;
  offersCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PlacementService extends ApiService {
  getPlacements(params?: any): Observable<PlacementResponse> {
    return this.get<PlacementResponse>('placements', params);
  }

  getPlacementStats(): Observable<PlacementStats> {
    return this.get<PlacementStats>('placements/stats');
  }

  createPlacement(placement: Placement): Observable<{ message: string; placement: Placement }> {
    return this.post<{ message: string; placement: Placement }>('placements', placement);
  }

  updatePlacement(id: string, placement: Placement): Observable<{ message: string; placement: Placement }> {
    return this.put<{ message: string; placement: Placement }>(`placements/${id}`, placement);
  }

  deletePlacement(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`placements/${id}`);
  }
}
