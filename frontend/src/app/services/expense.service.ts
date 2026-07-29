import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Expense } from '../models/interfaces';
import { ApiService } from './api.service';

interface ExpenseResponse {
  expenses: Expense[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  totalAmount: number;
}

interface ExpenseStats {
  categoryStats: Array<{ _id: string; total: number; count: number }>;
  monthlyStats: Array<{ _id: { year: number; month: number }; total: number }>;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService extends ApiService {
  getExpenses(params?: any): Observable<ExpenseResponse> {
    return this.get<ExpenseResponse>('expenses', params);
  }

  getExpenseById(id: string): Observable<Expense> {
    return this.get<Expense>(`expenses/${id}`);
  }

  getExpenseStats(params?: any): Observable<ExpenseStats> {
    return this.get<ExpenseStats>('expenses/stats', params);
  }

  createExpense(expense: Expense): Observable<{ message: string; expense: Expense }> {
    return this.post<{ message: string; expense: Expense }>('expenses', expense);
  }

  updateExpense(id: string, expense: Expense): Observable<{ message: string; expense: Expense }> {
    return this.put<{ message: string; expense: Expense }>(`expenses/${id}`, expense);
  }

  deleteExpense(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`expenses/${id}`);
  }
}
