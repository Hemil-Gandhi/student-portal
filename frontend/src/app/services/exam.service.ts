import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Exam } from '../models/interfaces';
import { ApiService } from './api.service';

interface ExamResponse {
  exams: Exam[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface ExamStats {
  totalExams: number;
  averagePercentage: number;
  subjectWise: Array<{ _id: string; avgPercentage: number; examsCount: number }>;
  upcomingCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService extends ApiService {
  getExams(params?: any): Observable<ExamResponse> {
    return this.get<ExamResponse>('exams', params);
  }

  getExamStats(): Observable<ExamStats> {
    return this.get<ExamStats>('exams/stats');
  }

  createExam(exam: Exam): Observable<{ message: string; exam: Exam }> {
    return this.post<{ message: string; exam: Exam }>('exams', exam);
  }

  updateExam(id: string, exam: Exam): Observable<{ message: string; exam: Exam }> {
    return this.put<{ message: string; exam: Exam }>(`exams/${id}`, exam);
  }

  deleteExam(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`exams/${id}`);
  }
}
