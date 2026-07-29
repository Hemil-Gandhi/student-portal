import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { Note } from '../models/interfaces';
import { ApiService } from './api.service';

interface NoteResponse {
  notes: Note[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class NoteService extends ApiService {
  getNotes(params?: any): Observable<NoteResponse> {
    return this.get<NoteResponse>('notes', params);
  }

  createNote(note: Note): Observable<{ message: string; note: Note }> {
    return this.post<{ message: string; note: Note }>('notes', note);
  }

  updateNote(id: string, note: Note): Observable<{ message: string; note: Note }> {
    return this.put<{ message: string; note: Note }>(`notes/${id}`, note);
  }

  deleteNote(id: string): Observable<{ message: string }> {
    return this.delete<{ message: string }>(`notes/${id}`);
  }

  uploadFile(noteId: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    const token = this.authService.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post(`${this.apiUrl}/upload/note/${noteId}`, formData, { headers });
  }

  deleteFile(noteId: string, filename: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/upload/note/${noteId}/${filename}`, {
      headers: new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` })
    });
  }
}
