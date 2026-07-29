import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Task } from '../models/interfaces';
import { ApiService } from './api.service';

interface TaskResponse {
  tasks: Task[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface TaskStats {
  statusStats: Array<{ _id: string; count: number }>;
  priorityStats: Array<{ _id: string; count: number }>;
  upcomingTasks: number;
  overdueTasks: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService extends ApiService {
  getTasks(params?: any): Observable<TaskResponse> {
    return this.get<TaskResponse>('tasks', params);
  }

  getTaskStats(): Observable<TaskStats> {
    return this.get<TaskStats>('tasks/stats');
  }

  createTask(task: Task): Observable<{ message: string; task: Task }> {
    return this.post<{ message: string; task: Task }>('tasks', task);
  }

  updateTask(id: string, task: Task): Observable<{ message: string; task: Task }> {
    return this.put<{ message: string; task: Task }>(`tasks/${id}`, task);
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`tasks/${id}`);
  }
}
