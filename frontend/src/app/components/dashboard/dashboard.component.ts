import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardData } from '../../models/interfaces';
import { Subscription, filter } from 'rxjs';
import { DataRefreshService } from '../../services/data-refresh.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">Welcome back</h1>
          <p class="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1">{{ currentDate }}</p>
        </div>
      </div>

      @if (loading()) {
        <div class="flex items-center justify-center h-48 sm:h-64">
          <div class="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-gray-900 dark:border-white"></div>
        </div>
      } @else if (dashboardData()) {
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          @for (stat of quickStats; track stat.label) {
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-3 sm:p-4 hover:shadow-sm transition-shadow">
              <div [class]="'w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center mb-1 sm:mb-2 ' + stat.bgClass">
                <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="stat.icon"></path>
                </svg>
              </div>
              <p class="text-base sm:text-xl font-semibold text-gray-900 dark:text-white">{{ stat.value() }}</p>
              <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            </div>
          }
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div class="lg:col-span-2 space-y-4 sm:space-y-6">
            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
              <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Actions</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                @for (action of quickActions; track action.label) {
                  <a 
                    [routerLink]="action.path"
                    class="p-2 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-center touch-manipulation"
                  >
                    <div [class]="'w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center mx-auto mb-1 sm:mb-2 ' + action.bgClass">
                      <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="action.icon"></path>
                      </svg>
                    </div>
                    <p class="font-medium text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{{ action.label }}</p>
                  </a>
                }
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
              <div class="flex items-center justify-between mb-3 sm:mb-4">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Upcoming Tasks</h3>
                <a routerLink="/tasks" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm">View All</a>
              </div>
              @if (dashboardData()?.upcomingTasks?.length === 0) {
                <div class="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-500">
                  <svg class="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path>
                  </svg>
                  <p class="text-xs sm:text-sm">No upcoming tasks</p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (task of dashboardData()?.upcomingTasks?.slice(0, 5); track task._id) {
                    <div class="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div [class]="'w-1.5 sm:w-2 h-8 sm:h-10 rounded-full flex-shrink-0 ' + getPriorityColor(task.priority)"></div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{{ task.title }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ task.category }} \u2022 Due {{ formatDate(task.dueDate) }}</p>
                      </div>
                      <span [class]="'px-1.5 sm:px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ' + getStatusBadgeClass(task.status)">
                        {{ task.status }}
                      </span>
                    </div>
                  }
                </div>
              }
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
              <div class="flex items-center justify-between mb-3 sm:mb-4">
                <h3 class="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
                <a routerLink="/exams" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-xs sm:text-sm">View All</a>
              </div>
              @if (dashboardData()?.upcomingExams?.length === 0) {
                <div class="text-center py-6 sm:py-8 text-gray-400 dark:text-gray-500">
                  <svg class="w-8 h-8 sm:w-10 sm:h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                  </svg>
                  <p class="text-xs sm:text-sm">No upcoming exams</p>
                </div>
              } @else {
                <div class="space-y-2">
                  @for (exam of dashboardData()?.upcomingExams?.slice(0, 5); track exam._id) {
                    <div class="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <div class="w-10 h-10 sm:w-12 sm:h-12 bg-red-50 dark:bg-red-900/20 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                        <span class="text-red-600 dark:text-red-400 font-bold text-base sm:text-lg">{{ getExamDay(exam.examDate) }}</span>
                        <span class="text-red-500 dark:text-red-400 text-xs">{{ getExamMonth(exam.examDate) }}</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white text-xs sm:text-sm truncate">{{ exam.subject }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">{{ exam.examType }} \u2022 {{ exam.venue }}</p>
                      </div>
                      <div class="text-right">
                        <span class="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">{{ formatDate(exam.examDate) }}</span>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <div class="space-y-4 sm:space-y-6">
            <div class="bg-gray-900 dark:bg-gray-800 rounded-xl p-4 sm:p-5 text-white">
              <h3 class="font-semibold mb-3 sm:mb-4 flex items-center gap-2 text-xs sm:text-sm">
                <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                Your Progress
              </h3>
              <div class="space-y-3 sm:space-y-4">
                <div>
                  <div class="flex justify-between text-xs sm:text-sm mb-1">
                    <span class="text-gray-400">Attendance</span>
                    <span class="font-semibold">{{ dashboardData()?.overview?.attendance?.percentage || 0 }}%</span>
                  </div>
                  <div class="h-1 sm:h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-white rounded-full transition-all duration-1000"
                      [style.width.%]="dashboardData()?.overview?.attendance?.percentage || 0"
                    ></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-gray-400">Avg Score</span>
                    <span class="font-semibold">{{ dashboardData()?.overview?.exams?.averagePercentage || 0 }}%</span>
                  </div>
                  <div class="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-white rounded-full transition-all duration-1000"
                      [style.width.%]="dashboardData()?.overview?.exams?.averagePercentage || 0"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-base font-semibold text-gray-900 dark:text-white">Today's Classes</h3>
                <a routerLink="/schedule" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">View All</a>
              </div>
              <div class="text-center py-8 text-gray-400 dark:text-gray-500">
                <svg class="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p class="text-sm">Check your schedule</p>
              </div>
            </div>

            <div class="bg-gray-900 dark:bg-gray-800 rounded-xl p-5 text-white">
              <h3 class="font-semibold mb-4 flex items-center gap-2 text-sm">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                Placements
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white/10 rounded-lg p-3">
                  <p class="text-xl font-bold">{{ dashboardData()?.overview?.placements?.applied || 0 }}</p>
                  <p class="text-sm text-gray-300">Applied</p>
                </div>
                <div class="bg-white/10 rounded-lg p-3">
                  <p class="text-xl font-bold">{{ dashboardData()?.overview?.placements?.offers || 0 }}</p>
                  <p class="text-sm text-gray-300">Offers</p>
                </div>
              </div>
            </div>

            @if ((dashboardData()?.recentNotes?.length || 0) > 0) {
              <div class="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-base font-semibold text-gray-900 dark:text-white">Recent Notes</h3>
                  <a routerLink="/notes" class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm">View All</a>
                </div>
                <div class="space-y-2">
                  @for (note of dashboardData()?.recentNotes?.slice(0, 3); track note._id) {
                    <div class="p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow" [style.background-color]="note.color || 'white'">
                      <div class="flex items-start justify-between mb-1">
                        <h4 class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ note.title }}</h4>
                        @if (note.isFavorite) {
                          <svg class="w-4 h-4 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        }
                      </div>
                      <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{{ note.content || 'No content' }}</p>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = signal(true);
  dashboardData = signal<DashboardData | null>(null);
  currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  private refreshInterval: any;
  private routerSubscription: Subscription | null = null;
  private refreshSubscription: Subscription | null = null;

  quickStats = [
    {
      label: 'Tasks',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      bgClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
      value: () => this.dashboardData()?.overview?.tasks?.total || 0
    },
    {
      label: 'Monthly Exp',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bgClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      value: () => '\u20B9' + (this.dashboardData()?.overview?.expenses?.monthly || 0)
    },
    {
      label: 'Attendance',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      value: () => (this.dashboardData()?.overview?.attendance?.percentage || 0) + '%'
    },
    {
      label: 'Avg Score',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      bgClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      value: () => (this.dashboardData()?.overview?.exams?.averagePercentage || 0) + '%'
    },
    {
      label: 'Job Offers',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      bgClass: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
      value: () => this.dashboardData()?.overview?.placements?.offers || 0
    },
    {
      label: 'Notes',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      value: () => this.dashboardData()?.overview?.notes?.favorites || 0
    }
  ];

  quickActions = [
    {
      label: 'Add Task',
      path: '/tasks',
      icon: 'M12 4v16m8-8H4',
      bgClass: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
    },
    {
      label: 'Add Expense',
      path: '/expenses',
      icon: 'M12 4v16m8-8H4',
      bgClass: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
    },
    {
      label: 'New Note',
      path: '/notes',
      icon: 'M12 4v16m8-8H4',
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
    },
    {
      label: 'Add Exam',
      path: '/exams',
      icon: 'M12 4v16m8-8H4',
      bgClass: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private dataRefreshService: DataRefreshService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();

    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 5000);

    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      if (event.url === '/dashboard' || event.url === '/') {
        this.loadDashboardData();
      }
    });

    this.refreshSubscription = this.dataRefreshService.refreshDashboard$.subscribe(() => {
      this.loadDashboardData();
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  loadDashboardData(): void {
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        console.log('Dashboard data received:', data);
        console.log('Expenses data:', data?.overview?.expenses);
        console.log('Attendance data:', data?.overview?.attendance);
        this.dashboardData.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading.set(false);
      }
    });
  }

  getPriorityColor(priority: string): string {
    const colors: { [key: string]: string } = {
      'low': 'bg-green-500',
      'medium': 'bg-yellow-500',
      'high': 'bg-orange-500',
      'urgent': 'bg-red-500'
    };
    return colors[priority] || 'bg-gray-500';
  }

  getStatusBadgeClass(status: string): string {
    const classes: { [key: string]: string } = {
      'pending': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'in-progress': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
    };
    return classes[status] || 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getExamDay(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).getDate().toString();
  }

  getExamMonth(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', { month: 'short' });
  }
}
