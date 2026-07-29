import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamService } from '../../services/exam.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Exam } from '../../models/interfaces';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Exams</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Prepare for and track your exam performance</p>
        </div>
        <button (click)="showAddModal.set(true)" class="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Add Exam
        </button>
      </div>

      @if (stats()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.totalExams || 0 }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Exams</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.upcomingCount || 0 }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Upcoming</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ stats()?.averagePercentage || 0 }}%</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Average Score</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ exams().length }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">In View</p>
          </div>
        </div>
      }

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <span class="font-medium text-sm">Filters:</span>
          </div>
          <select [(ngModel)]="filterStatus" (change)="loadExams()" class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100">
            <option value="">All Status</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status | titlecase }}</option>
            }
          </select>
          <select [(ngModel)]="filterType" (change)="loadExams()" class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100">
            <option value="">All Types</option>
            @for (type of examTypes; track type) {
              <option [value]="type">{{ type | titlecase }}</option>
            }
          </select>
          <div class="flex-1 min-w-[200px] relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <input type="text" [(ngModel)]="searchSubject" (input)="loadExams()" placeholder="Search subject..." class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400" />
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center p-12">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white"></div>
        </div>
      } @else if (exams().length === 0) {
        <div class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">No exams found</p>
          <p class="text-gray-400 dark:text-gray-500 mt-1 mb-5 text-sm">Start by adding your upcoming exams</p>
          <button (click)="showAddModal.set(true)" class="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm">Add your first exam</button>
        </div>
      } @else {
        <div class="space-y-4">
          @for (exam of exams(); track exam._id) {
            <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl border-l-4 hover:shadow-sm transition-all overflow-hidden" [class]="getStatusBorderColor(exam.status)">
              <div class="p-5">
                <div class="flex flex-col md:flex-row md:items-center gap-5">
                  <div class="flex-shrink-0 text-center bg-gray-50 dark:bg-gray-800 rounded-xl p-4 min-w-[90px] border border-gray-200 dark:border-gray-700">
                    <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ getDay(exam.examDate) }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider">{{ getMonth(exam.examDate) }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ getYear(exam.examDate) }}</p>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h3 class="text-lg font-bold text-gray-900 dark:text-white">{{ exam.subject }}</h3>
                        <p class="text-gray-500 dark:text-gray-400 flex items-center gap-2 mt-1 text-sm">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                          {{ exam.examType | titlecase }}
                          @if (exam.venue) {
                            <span class="text-gray-300 dark:text-gray-600">\u2022</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            {{ exam.venue }}
                          }
                        </p>
                      </div>
                      <span [class]="'px-3 py-1.5 text-xs font-bold rounded-lg uppercase tracking-wide ' + getStatusBadgeColor(exam.status)">{{ exam.status }}</span>
                    </div>
                    @if (exam.syllabus) {
                      <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 border border-gray-100 dark:border-gray-700">
                        <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ exam.syllabus }}</p>
                      </div>
                    }
                    <div class="flex flex-wrap gap-3 text-sm">
                      @if (exam.duration) {
                        <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span class="font-medium">{{ exam.duration }} min</span>
                        </div>
                      }
                      @if (exam.maxMarks) {
                        <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span class="font-medium">{{ exam.maxMarks }} marks</span>
                        </div>
                      }
                      @if (exam.marksObtained !== undefined && exam.marksObtained !== null) {
                        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold" [class]="getScoreBadgeClass(exam.marksObtained, exam.maxMarks)">
                          <span>{{ exam.marksObtained }}/{{ exam.maxMarks }}</span>
                          @if (exam.percentage) {
                            <span class="text-xs opacity-75">({{ exam.percentage }}%)</span>
                          }
                          @if (exam.grade) {
                            <span class="bg-white/50 px-1.5 py-0.5 rounded text-xs">{{ exam.grade }}</span>
                          }
                        </div>
                      }
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <button (click)="editExam(exam)" class="p-2.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button (click)="deleteExam(exam._id!)" class="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (showAddModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ showEditModal() ? 'Edit Exam' : 'Add Exam' }}</h2>
            </div>
            <form (ngSubmit)="saveExam()" class="p-5 space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                  <input type="text" [(ngModel)]="formData.subject" name="subject" required class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="Subject name" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Exam Type *</label>
                  <select [(ngModel)]="formData.examType" name="examType" required class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100">
                    @for (type of examTypes; track type) {
                      <option [value]="type">{{ type | titlecase }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Exam Date *</label>
                  <input type="datetime-local" [(ngModel)]="formData.examDate" name="examDate" required class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Venue</label>
                  <input type="text" [(ngModel)]="formData.venue" name="venue" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="Exam venue" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (minutes)</label>
                  <input type="number" [(ngModel)]="formData.duration" name="duration" min="0" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="Duration" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Max Marks</label>
                  <input type="number" [(ngModel)]="formData.maxMarks" name="maxMarks" min="0" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="Maximum marks" />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select [(ngModel)]="formData.status" name="status" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100">
                  @for (status of statuses; track status) {
                    <option [value]="status">{{ status | titlecase }}</option>
                  }
                </select>
              </div>
              @if (formData.status === 'completed') {
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Marks Obtained</label>
                    <input type="number" [(ngModel)]="formData.marksObtained" name="marksObtained" min="0" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="Your score" />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Grade</label>
                    <input type="text" [(ngModel)]="formData.grade" name="grade" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="e.g., A+, B" />
                  </div>
                </div>
              }
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                <input type="text" [(ngModel)]="formData.semester" name="semester" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="e.g., Fall 2024" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Syllabus</label>
                <textarea [(ngModel)]="formData.syllabus" name="syllabus" rows="3" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 resize-none" placeholder="Exam syllabus and topics"></textarea>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea [(ngModel)]="formData.notes" name="notes" rows="2" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 resize-none" placeholder="Additional notes"></textarea>
              </div>
              <div class="flex gap-3 pt-3">
                <button type="button" (click)="closeModal()" class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Cancel</button>
                <button type="submit" [disabled]="saving()" class="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm disabled:opacity-50">{{ saving() ? 'Saving...' : 'Save Exam' }}</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class ExamsComponent implements OnInit {
  exams = signal<Exam[]>([]);
  loading = signal(true);
  showAddModal = signal(false);
  showEditModal = signal(false);
  saving = signal(false);
  stats = signal<any>(null);
  
  filterStatus = '';
  filterType = '';
  searchSubject = '';
  
  statuses = ['upcoming', 'ongoing', 'completed', 'cancelled'];
  examTypes = ['quiz', 'midterm', 'final', 'practical', 'oral', 'other'];
  
  formData: Partial<Exam> = {
    subject: '',
    examType: 'quiz',
    examDate: new Date(),
    venue: '',
    duration: 60,
    maxMarks: 100,
    status: 'upcoming',
    syllabus: '',
    semester: '',
    notes: ''
  };
  
  editingId: string | null = null;

  constructor(
    private examService: ExamService,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadExams();
    this.loadStats();
  }

  loadExams(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterType) params.examType = this.filterType;
    if (this.searchSubject) params.subject = this.searchSubject;
    
    this.examService.getExams(params).subscribe({
      next: (response) => {
        this.exams.set(response.exams);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.examService.getExamStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      }
    });
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'upcoming': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'ongoing': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  }

  getStatusBorderColor(status: string): string {
    const colors: { [key: string]: string } = {
      'upcoming': 'border-l-blue-400',
      'ongoing': 'border-l-amber-400',
      'completed': 'border-l-green-400',
      'cancelled': 'border-l-gray-400'
    };
    return colors[status] || 'border-l-gray-300';
  }

  getScoreBadgeClass(marks: number | undefined, maxMarks: number | undefined): string {
    if (!marks || !maxMarks) return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 85) return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
    if (percentage >= 70) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
    if (percentage >= 50) return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400';
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400';
  }

  getDay(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).getDate().toString();
  }

  getMonth(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short' });
  }

  getYear(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).getFullYear().toString();
  }

  editExam(exam: Exam): void {
    this.editingId = exam._id || null;
    this.formData = { ...exam };
    this.showEditModal.set(true);
  }

  deleteExam(id: string): void {
    if (confirm('Are you sure you want to delete this exam?')) {
      this.examService.deleteExam(id).subscribe({
        next: () => {
          this.loadExams();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        }
      });
    }
  }

  closeModal(): void {
    this.showAddModal.set(false);
    this.showEditModal.set(false);
    this.editingId = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formData = {
      subject: '',
      examType: 'quiz',
      examDate: new Date(),
      venue: '',
      duration: 60,
      maxMarks: 100,
      status: 'upcoming',
      syllabus: '',
      semester: '',
      notes: ''
    };
  }

  saveExam(): void {
    if (!this.formData.subject || !this.formData.examType || !this.formData.examDate) {
      return;
    }

    this.saving.set(true);
    
    const examData = {
      ...this.formData,
      examDate: new Date(this.formData.examDate as any)
    } as Exam;
    
    if (this.showEditModal() && this.editingId) {
      this.examService.updateExam(this.editingId, examData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadExams();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.examService.createExam(examData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadExams();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    }
  }
}
