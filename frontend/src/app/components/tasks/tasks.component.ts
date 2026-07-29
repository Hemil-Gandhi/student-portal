import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { DataRefreshService } from '../../services/data-refresh.service';
import { Task } from '../../models/interfaces';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1 text-sm">Manage your academic and personal tasks</p>
        </div>
        <button
          (click)="showAddModal.set(true)"
          class="px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Add Task
        </button>
      </div>

      @if (stats()) {
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ totalCount() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ pendingCount() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Pending</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ inProgressCount() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
          </div>
          <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5">
            <div class="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-3">
              <svg class="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ completedCount() }}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">Completed</p>
          </div>
        </div>
      }

      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5">
        <div class="flex flex-wrap gap-3 items-center">
          <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
            </svg>
            <span class="font-medium text-sm">Filters:</span>
          </div>
          <select
            [(ngModel)]="filterStatus"
            (change)="loadTasks()"
            class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="">All Status</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ status | titlecase }}</option>
            }
          </select>
          <select
            [(ngModel)]="filterPriority"
            (change)="loadTasks()"
            class="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100"
          >
            <option value="">All Priorities</option>
            @for (priority of priorities; track priority) {
              <option [value]="priority">{{ priority | titlecase }}</option>
            }
          </select>
          <div class="flex-1 min-w-[200px] relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="loadTasks()"
              placeholder="Search tasks..."
              class="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center p-12">
          <div class="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 dark:border-gray-700 border-t-gray-900 dark:border-t-white"></div>
        </div>
      } @else if (tasks().length === 0) {
        <div class="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-800">
          <div class="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-5 flex items-center justify-center">
            <svg class="w-10 h-10 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
            </svg>
          </div>
          <p class="text-gray-600 dark:text-gray-400 font-medium">No tasks found</p>
          <p class="text-gray-400 dark:text-gray-500 mt-1 mb-5 text-sm">Start organizing your work by creating a new task</p>
          <button
            (click)="showAddModal.set(true)"
            class="px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm"
          >
            Create your first task
          </button>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (task of tasks(); track task._id) {
            <div 
              class="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 border-l-4 hover:shadow-sm transition-all cursor-pointer"
              [class]="getPriorityBorderColor(task.priority)"
            >
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1 min-w-0 pr-2">
                  <h3 class="font-semibold text-gray-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">{{ task.title }}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                    {{ task.category | titlecase }}
                  </p>
                </div>
                <button
                  (click)="toggleComplete(task)"
                  [class]="task.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'"
                  class="p-2 rounded-lg transition-all flex-shrink-0"
                  title="{{ task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete' }}"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </button>
              </div>
              
              @if (task.description) {
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{{ task.description }}</p>
              }
              
              <div class="flex flex-wrap gap-1.5 mb-3">
                <span [class]="'px-2.5 py-1 text-xs font-medium rounded-lg ' + getStatusColor(task.status)">
                  {{ task.status | titlecase }}
                </span>
                <span [class]="'px-2.5 py-1 text-xs font-medium rounded-lg ' + getPriorityColor(task.priority)">
                  {{ task.priority | titlecase }}
                </span>
              </div>
              
              @if (task.dueDate) {
                <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Due {{ formatDate(task.dueDate) }}
                </div>
              }
              
              @if (task.tags && task.tags.length > 0) {
                <div class="flex flex-wrap gap-1.5 mb-3">
                  @for (tag of task.tags; track tag) {
                    <span class="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-md font-medium">{{ tag }}</span>
                  }
                </div>
              }
              
              <div class="flex gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                <button
                  (click)="editTask(task)"
                  class="flex-1 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Edit
                </button>
                <button
                  (click)="deleteTask(task._id!)"
                  class="flex-1 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all flex items-center justify-center gap-1"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (showAddModal() || showEditModal()) {
        <div class="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div class="p-5 border-b border-gray-200 dark:border-gray-800">
              <h2 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ showEditModal() ? 'Edit Task' : 'Add Task' }}
              </h2>
              <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ showEditModal() ? 'Update your task details' : 'Create a new task to track' }}</p>
            </div>
            <form (ngSubmit)="saveTask()" class="p-5 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title *</label>
                <input
                  type="text"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
                <textarea
                  [(ngModel)]="formData.description"
                  name="description"
                  rows="3"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 resize-none"
                  placeholder="Enter task description"
                ></textarea>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                  <select
                    [(ngModel)]="formData.category"
                    name="category"
                    required
                    class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100"
                  >
                    @for (category of categories; track category) {
                      <option [value]="category">{{ category | titlecase }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority *</label>
                  <select
                    [(ngModel)]="formData.priority"
                    name="priority"
                    required
                    class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100"
                  >
                    @for (priority of priorities; track priority) {
                      <option [value]="priority">{{ priority | titlecase }}</option>
                    }
                  </select>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                  <select
                    [(ngModel)]="formData.status"
                    name="status"
                    class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100"
                  >
                    @for (status of statuses; track status) {
                      <option [value]="status">{{ status | titlecase }}</option>
                    }
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Due Date</label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="formData.dueDate"
                    name="dueDate"
                    class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  [(ngModel)]="tagsInput"
                  name="tags"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                  placeholder="e.g., urgent, important, project"
                />
              </div>
              <div class="flex gap-3 pt-3">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-sm transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  [disabled]="saving()"
                  class="flex-1 px-4 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  {{ saving() ? 'Saving...' : 'Save Task' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class TasksComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(true);
  showAddModal = signal(false);
  showEditModal = signal(false);
  saving = signal(false);
  stats = signal<any>(null);
  
  filterStatus = '';
  filterPriority = '';
  searchQuery = '';
  
  statuses = ['pending', 'in-progress', 'completed', 'cancelled'];
  priorities = ['low', 'medium', 'high', 'urgent'];
  categories = ['academic', 'personal', 'project', 'assignment', 'exam', 'other'];
  
  totalCount = signal(0);
  pendingCount = signal(0);
  inProgressCount = signal(0);
  completedCount = signal(0);
  
  tagsInput = '';
  formData: Partial<Task> = {
    title: '',
    description: '',
    category: 'academic',
    priority: 'medium',
    status: 'pending',
    dueDate: undefined,
    tags: []
  };
  
  editingId: string | null = null;

  constructor(
    private taskService: TaskService,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStats();
  }

  loadTasks(): void {
    this.loading.set(true);
    const params: any = {};
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterPriority) params.priority = this.filterPriority;
    if (this.searchQuery) params.search = this.searchQuery;
    
    this.taskService.getTasks(params).subscribe({
      next: (response) => {
        this.tasks.set(response.tasks);
        this.totalCount.set(response.totalCount);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  loadStats(): void {
    this.taskService.getTaskStats().subscribe({
      next: (stats) => {
        this.stats.set(stats);
        stats.statusStats.forEach((stat: any) => {
          if (stat._id === 'pending') this.pendingCount.set(stat.count);
          if (stat._id === 'in-progress') this.inProgressCount.set(stat.count);
          if (stat._id === 'completed') this.completedCount.set(stat.count);
        });
      }
    });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };
    return colors[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'medium': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
      'high': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
      'urgent': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };
    return colors[priority] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  }

  getPriorityBorderColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'border-l-green-400',
      'medium': 'border-l-amber-400',
      'high': 'border-l-orange-400',
      'urgent': 'border-l-red-400'
    };
    return colors[priority] || 'border-l-gray-300';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  toggleComplete(task: Task): void {
    const updatedTask: Task = { 
      ...task, 
      status: (task.status === 'completed' ? 'pending' : 'completed') as Task['status'],
      completedAt: task.status === 'completed' ? undefined : new Date()
    };
    this.taskService.updateTask(task._id!, updatedTask).subscribe({
      next: () => {
        this.loadTasks();
        this.loadStats();
        this.dataRefreshService.triggerDashboardRefresh();
      }
    });
  }

  editTask(task: Task): void {
    this.editingId = task._id || null;
    this.formData = { ...task };
    this.tagsInput = task.tags?.join(', ') || '';
    this.showEditModal.set(true);
  }

  deleteTask(id: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe({
        next: () => {
          this.loadTasks();
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
      title: '',
      description: '',
      category: 'academic',
      priority: 'medium',
      status: 'pending',
      dueDate: undefined,
      tags: []
    };
    this.tagsInput = '';
  }

  saveTask(): void {
    if (!this.formData.title) {
      return;
    }

    this.saving.set(true);
    
    const taskData: Partial<Task> = {
      ...this.formData,
      dueDate: this.formData.dueDate ? new Date(this.formData.dueDate as any) : undefined,
      tags: this.tagsInput.split(',').map(t => t.trim()).filter(t => t)
    };
    
    if (this.showEditModal() && this.editingId) {
      this.taskService.updateTask(this.editingId, taskData as Task).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTasks();
          this.loadStats();
          this.dataRefreshService.triggerDashboardRefresh();
        },
        error: () => {
          this.saving.set(false);
        }
      });
    } else {
      this.taskService.createTask(taskData as Task).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadTasks();
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
