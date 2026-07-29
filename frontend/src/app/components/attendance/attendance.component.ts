import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService } from '../../services/attendance.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Attendance } from '../../models/interfaces';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">Track your class attendance and progress</p>
        </div>
        <button (click)="showAddModal.set(true)" class="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg>
          Mark Attendance
        </button>
      </div>

      @if (stats()) {
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats()?.summary?.present || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Present</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats()?.summary?.absent || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Absent</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xl font-bold text-gray-900 dark:text-white">{{ stats()?.summary?.late || 0 }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Late</p>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 sm:p-5">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <div class="min-w-0">
                <p class="text-xl font-bold" [class]="getAttendancePercentageColor(stats()?.percentage || 0)">{{ stats()?.percentage || 0 }}%</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 font-medium">Attendance</p>
              </div>
            </div>
          </div>
        </div>
      }

      @if (stats()?.subjectWise?.length > 0) {
        <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white">Subject-wise Attendance</h3>
          </div>
          <div class="space-y-4">
            @for (subject of stats()?.subjectWise; track subject._id) {
              <div class="group">
                <div class="flex items-center justify-between mb-1.5">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs" [class]="getSubjectIconColor(subject._id)">
                      {{ getSubjectInitials(subject._id) }}
                    </div>
                    <span class="font-medium text-gray-900 dark:text-white text-sm">{{ subject._id }}</span>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-gray-900 dark:text-white text-sm">{{ ((subject.present / subject.total) * 100).toFixed(1) }}%</span>
                    <span class="text-xs text-gray-500 dark:text-gray-400 ml-2">({{ subject.present }}/{{ subject.total }})</span>
                  </div>
                </div>
                <div class="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full transition-all duration-500 ease-out"
                    [class]="getProgressBarColor((subject.present / subject.total) * 100)"
                    [style.width.%]="(subject.present / subject.total) * 100"
                  ></div>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 sm:p-5">
        <div class="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path></svg>
            <span class="font-medium text-sm">Filters:</span>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input type="text" [(ngModel)]="searchSubject" (input)="loadAttendance()" placeholder="Search subject..." class="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" />
            <select [(ngModel)]="filterStatus" (change)="loadAttendance()" class="w-full sm:w-auto px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100">
              <option value="">All Status</option>
              @for (status of statuses; track status) {
                <option [value]="status">{{ status | titlecase }}</option>
              }
            </select>
          </div>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
        @if (loading()) {
          <div class="flex items-center justify-center p-12">
            <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white"></div>
          </div>
        } @else if (attendance().length === 0) {
          <div class="text-center py-16 px-4">
            <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5 flex items-center justify-center">
              <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-gray-600 dark:text-gray-400 font-medium">No attendance records found</p>
            <p class="text-gray-400 dark:text-gray-500 text-sm mt-1 mb-5">Start tracking by marking your first attendance</p>
            <button (click)="showAddModal.set(true)" class="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm">Mark attendance</button>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subject</th>
                  <th class="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th class="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th class="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden sm:table-cell">Semester</th>
                  <th class="px-5 py-3 text-left text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                @for (record of attendance(); track record._id) {
                  <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0" [class]="getSubjectIconColor(record.subject)">
                          {{ getSubjectInitials(record.subject) }}
                        </div>
                        <span class="font-medium text-gray-900 dark:text-white text-sm truncate max-w-[120px]">{{ record.subject }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3.5">
                      <div class="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 text-sm">
                        <svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span class="whitespace-nowrap">{{ formatDate(record.date) }}</span>
                      </div>
                    </td>
                    <td class="px-5 py-3.5">
                      <span [class]="'px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide whitespace-nowrap ' + getStatusBadgeColor(record.status)">
                        {{ record.status }}
                      </span>
                    </td>
                    <td class="px-5 py-3.5 text-gray-600 dark:text-gray-400 text-sm hidden sm:table-cell">{{ record.semester || 'N/A' }}</td>
                    <td class="px-5 py-3.5">
                      <div class="flex gap-1.5">
                        <button (click)="editAttendance(record)" class="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        <button (click)="deleteAttendance(record._id!)" class="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete">
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      @if (showAddModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div class="p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ showEditModal() ? 'Edit Attendance' : 'Mark Attendance' }}</h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ showEditModal() ? 'Update attendance record' : 'Record your attendance status' }}</p>
            </div>
            <form (ngSubmit)="saveAttendance()" class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject *</label>
                <input type="text" [(ngModel)]="formData.subject" name="subject" required class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="e.g., Mathematics" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date *</label>
                <input type="date" [(ngModel)]="formData.date" name="date" required class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status *</label>
                <div class="grid grid-cols-2 gap-2">
                  @for (status of statuses; track status) {
                    <button
                      type="button"
                      (click)="setStatus(status)"
                      [class]="formData.status === status ? getStatusButtonClass(status) + ' ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'"
                      class="px-3 py-2.5 rounded-lg font-medium text-sm transition-all"
                    >
                      {{ status | titlecase }}
                    </button>
                  }
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Semester</label>
                <input type="text" [(ngModel)]="formData.semester" name="semester" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100" placeholder="e.g., Fall 2024" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
                <textarea [(ngModel)]="formData.notes" name="notes" rows="3" class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 resize-none" placeholder="Add any notes (optional)"></textarea>
              </div>
              <div class="flex gap-3 pt-3">
                <button type="button" (click)="closeModal()" class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all">Cancel</button>
                <button type="submit" [disabled]="saving()" class="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm disabled:opacity-50 transition-all">{{ saving() ? 'Saving...' : 'Save' }}</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  attendance = signal<Attendance[]>([]);
  loading = signal(true);
  showAddModal = signal(false);
  showEditModal = signal(false);
  saving = signal(false);
  stats = signal<any>(null);
  
  searchSubject = '';
  filterStatus = '';
  statuses = ['present', 'absent', 'late', 'excused'];
  
  formData: Partial<Attendance> = {
    subject: '',
    date: new Date(),
    status: 'present',
    semester: '',
    notes: ''
  };
  
  editingId: string | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadAttendance();
    this.loadStats();
  }

  loadAttendance(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.searchSubject) params.subject = this.searchSubject;
    if (this.filterStatus) params.status = this.filterStatus;
    
    this.attendanceService.getAttendance(params).subscribe({
      next: (data) => {
        this.attendance.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.attendanceService.getAttendanceStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
      }
    });
  }

  getStatusBadgeColor(status: string): string {
    const colors: { [key: string]: string } = {
      'present': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'absent': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      'late': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'excused': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  }

  getStatusButtonClass(status: string): string {
    const classes: { [key: string]: string } = {
      'present': 'bg-green-500 text-white',
      'absent': 'bg-red-500 text-white',
      'late': 'bg-amber-500 text-white',
      'excused': 'bg-blue-500 text-white'
    };
    return classes[status] || 'bg-gray-500 text-white';
  }

  getProgressBarColor(percentage: number): string {
    if (percentage >= 85) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  }

  getAttendancePercentageColor(percentage: number): string {
    if (percentage >= 85) return 'text-green-600 dark:text-green-400';
    if (percentage >= 70) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  }

  getSubjectInitials(subject: string): string {
    return subject.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  }

  getSubjectIconColor(subject: string): string {
    const colors = [
      'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
      'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
      'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
    ];
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  setStatus(status: string): void {
    this.formData.status = status as 'present' | 'absent' | 'late' | 'excused';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  editAttendance(record: Attendance): void {
    this.editingId = record._id || null;
    this.formData = { ...record };
    this.showEditModal.set(true);
  }

  deleteAttendance(id: string): void {
    if (confirm('Are you sure you want to delete this record?')) {
      this.attendanceService.deleteAttendance(id).subscribe({
        next: () => {
          this.loadAttendance();
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
      date: new Date(),
      status: 'present',
      semester: '',
      notes: ''
    };
  }

  saveAttendance(): void {
    if (!this.formData.subject || !this.formData.status) {
      return;
    }

    this.saving.set(true);
    
    const attendanceData = {
      ...this.formData,
      date: new Date(this.formData.date as any)
    } as Attendance;
    
    if (this.showEditModal() && this.editingId) {
      this.attendanceService.updateAttendance(this.editingId, attendanceData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadAttendance();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.attendanceService.createAttendance(attendanceData).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadAttendance();
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
