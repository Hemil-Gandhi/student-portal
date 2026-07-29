import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3 sm:p-4 lg:p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">System overview — manage users and view all entries</p>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        @for (stat of stats(); track stat.label) {
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div class="flex items-center justify-between mb-1">
              <span class="text-xs font-medium text-gray-500 dark:text-gray-400">{{ stat.label }}</span>
              <span>{{ stat.icon }}</span>
            </div>
            <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stat.count }}</p>
          </div>
        }
      </div>

      <div class="flex gap-1 mb-6 overflow-x-auto pb-2 -mx-3 px-3 sm:mx-0 sm:px-0">
        @for (tab of tabs; track tab.key) {
          <button (click)="activeTab.set(tab.key)"
            class="px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all min-h-[40px]"
            [class.bg-gray-900]="activeTab() === tab.key"
            [class.dark:bg-white]="activeTab() === tab.key"
            [class.text-white]="activeTab() === tab.key"
            [class.dark:text-gray-900]="activeTab() === tab.key"
            [class.bg-gray-100]="activeTab() !== tab.key"
            [class.dark:bg-gray-800]="activeTab() !== tab.key"
            [class.text-gray-600]="activeTab() !== tab.key"
            [class.dark:text-gray-400]="activeTab() !== tab.key"
            [class.hover:bg-gray-200]="activeTab() !== tab.key"
            [class.dark:hover:bg-gray-700]="activeTab() !== tab.key">
            {{ tab.label }}
          </button>
        }
      </div>

      @if (loading()) {
        <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-12 text-center">
          <svg class="animate-spin h-8 w-8 mx-auto text-gray-900 dark:text-white" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-gray-400 dark:text-gray-500 mt-2 text-sm">Loading...</p>
        </div>
      } @else {
        @if (activeTab() === 'users') {
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800">
              <h2 class="font-semibold text-gray-900 dark:text-white">Registered Users ({{ usersCount() }})</h2>
            </div>
            <div class="hidden md:block overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <tr>
                    <th class="text-left px-4 py-3 font-semibold">Name</th>
                    <th class="text-left px-4 py-3 font-semibold">Email</th>
                    <th class="text-left px-4 py-3 font-semibold">Role</th>
                    <th class="text-left px-4 py-3 font-semibold">Department</th>
                    <th class="text-left px-4 py-3 font-semibold">Joined</th>
                    <th class="text-right px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  @for (user of users(); track user._id) {
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">{{ user.name }}</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user.email }}</td>
                      <td class="px-4 py-3">
                        <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                          [class.bg-purple-100]="user.role === 'admin'"
                          [class.dark:bg-purple-900/30]="user.role === 'admin'"
                          [class.text-purple-700]="user.role === 'admin'"
                          [class.dark:text-purple-400]="user.role === 'admin'"
                          [class.bg-blue-100]="user.role === 'student'"
                          [class.dark:bg-blue-900/30]="user.role === 'student'"
                          [class.text-blue-700]="user.role === 'student'"
                          [class.dark:text-blue-400]="user.role === 'student'">{{ user.role }}</span>
                      </td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user.department || '—' }}</td>
                      <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ user.createdAt | date:'mediumDate' }}</td>
                      <td class="px-4 py-3 text-right">
                        @if (user.email !== 'hemilgandhi904@gmail.com') {
                          <button (click)="toggleRole(user)" class="px-3 py-1 text-xs font-medium rounded-lg mr-1"
                            [class.bg-purple-50]="user.role !== 'admin'"
                            [class.dark:bg-purple-900/20]="user.role !== 'admin'"
                            [class.text-purple-600]="user.role !== 'admin'"
                            [class.dark:text-purple-400]="user.role !== 'admin'"
                            [class.bg-gray-100]="user.role === 'admin'"
                            [class.dark:bg-gray-800]="user.role === 'admin'"
                            [class.text-gray-600]="user.role === 'admin'"
                            [class.dark:text-gray-400]="user.role === 'admin'">
                            {{ user.role === 'admin' ? 'Demote' : 'Promote' }}
                          </button>
                          <button (click)="deleteUser(user)" class="px-3 py-1 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg">Delete</button>
                        } @else {
                          <span class="text-xs text-gray-400 dark:text-gray-500">Super Admin</span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
            <div class="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
              @for (user of users(); track user._id) {
                <div class="p-4 space-y-2">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="font-medium text-gray-900 dark:text-white">{{ user.name }}</p>
                      <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                      [class.bg-purple-100]="user.role === 'admin'"
                      [class.dark:bg-purple-900/30]="user.role === 'admin'"
                      [class.text-purple-700]="user.role === 'admin'"
                      [class.dark:text-purple-400]="user.role === 'admin'"
                      [class.bg-blue-100]="user.role === 'student'"
                      [class.dark:bg-blue-900/30]="user.role === 'student'"
                      [class.text-blue-700]="user.role === 'student'"
                      [class.dark:text-blue-400]="user.role === 'student'">{{ user.role }}</span>
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">Dept: {{ user.department || '—' }} · Joined: {{ user.createdAt | date:'mediumDate' }}</div>
                  @if (user.email !== 'hemilgandhi904@gmail.com') {
                    <div class="flex gap-2">
                      <button (click)="toggleRole(user)" class="flex-1 py-2 text-xs font-medium rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">Toggle Role</button>
                      <button (click)="deleteUser(user)" class="flex-1 py-2 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg">Delete</button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        @if (activeTab() !== 'users') {
          <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div class="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-wrap gap-2">
              <h2 class="font-semibold text-gray-900 dark:text-white">{{ getTabLabel() }} ({{ entriesCount() }})</h2>
              <div class="flex items-center gap-2 text-sm">
                <label class="text-gray-500 dark:text-gray-400">Filter by user:</label>
                <select (change)="filterByUser($event)" class="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500 outline-none">
                  <option value="">All Users</option>
                  @for (u of users(); track u._id) {
                    <option [value]="u._id">{{ u.name }} ({{ u.email }})</option>
                  }
                </select>
              </div>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead class="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  <tr>
                    @for (col of getColumns(); track col) {
                      <th class="text-left px-4 py-3 font-semibold whitespace-nowrap">{{ col }}</th>
                    }
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
                  @for (entry of entries(); track entry._id) {
                    <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      @if (activeTab() === 'tasks') {
                        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">{{ entry.title }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.name || 'Unknown' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.email || '' }}</td>
                        <td class="px-4 py-3"><span class="px-2 py-0.5 rounded-full text-xs font-medium"
                          [class.bg-yellow-100]="entry.priority === 'high'||entry.priority==='urgent'"
                          [class.dark:bg-yellow-900/30]="entry.priority === 'high'||entry.priority==='urgent'"
                          [class.text-yellow-700]="entry.priority === 'high'||entry.priority==='urgent'"
                          [class.dark:text-yellow-400]="entry.priority === 'high'||entry.priority==='urgent'"
                          [class.bg-green-100]="entry.priority === 'low'"
                          [class.dark:bg-green-900/30]="entry.priority === 'low'"
                          [class.text-green-700]="entry.priority === 'low'"
                          [class.dark:text-green-400]="entry.priority === 'low'"
                          [class.bg-blue-100]="entry.priority === 'medium'"
                          [class.dark:bg-blue-900/30]="entry.priority === 'medium'"
                          [class.text-blue-700]="entry.priority === 'medium'"
                          [class.dark:text-blue-400]="entry.priority === 'medium'">{{ entry.priority }}</span></td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.status }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ entry.dueDate ? (entry.dueDate | date:'shortDate') : '—' }}</td>
                      }
                      @if (activeTab() === 'notes') {
                        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-[200px] truncate">{{ entry.title }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.name || 'Unknown' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.email || '' }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ entry.subject || '—' }}</td>
                        <td class="px-4 py-3">{{ entry.isFavorite ? '⭐' : '—' }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ entry.createdAt | date:'shortDate' }}</td>
                      }
                      @if (activeTab() === 'exams') {
                        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">{{ entry.subject }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.name || 'Unknown' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.email || '' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.examType }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.status }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.percentage != null ? entry.percentage + '%' : '—' }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ entry.examDate | date:'shortDate' }}</td>
                      }
                      @if (activeTab() === 'expenses') {
                        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">{{ entry.title }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.name || 'Unknown' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.email || '' }}</td>
                        <td class="px-4 py-3 font-medium text-gray-900 dark:text-white">₹{{ entry.amount }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.category }}</td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ entry.date | date:'shortDate' }}</td>
                      }
                      @if (activeTab() === 'attendance') {
                        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">{{ entry.subject }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.name || 'Unknown' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.email || '' }}</td>
                        <td class="px-4 py-3">
                          <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                            [class.bg-green-100]="entry.status === 'present'"
                            [class.dark:bg-green-900/30]="entry.status === 'present'"
                            [class.text-green-700]="entry.status === 'present'"
                            [class.dark:text-green-400]="entry.status === 'present'"
                            [class.bg-red-100]="entry.status === 'absent'"
                            [class.dark:bg-red-900/30]="entry.status === 'absent'"
                            [class.text-red-700]="entry.status === 'absent'"
                            [class.dark:text-red-400]="entry.status === 'absent'"
                            [class.bg-yellow-100]="entry.status === 'late'"
                            [class.dark:bg-yellow-900/30]="entry.status === 'late'"
                            [class.text-yellow-700]="entry.status === 'late'"
                            [class.dark:text-yellow-400]="entry.status === 'late'">{{ entry.status }}</span>
                        </td>
                        <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ entry.date | date:'shortDate' }}</td>
                      }
                      @if (activeTab() === 'placements') {
                        <td class="px-4 py-3 text-gray-900 dark:text-white font-medium">{{ entry.companyName }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.name || 'Unknown' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.user?.email || '' }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.role }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.status }}</td>
                        <td class="px-4 py-3 text-gray-600 dark:text-gray-400">{{ entry.ctc ? '₹' + entry.ctc + 'L' : '—' }}</td>
                      }
                    </tr>
                  } @empty {
                    <tr><td [attr.colspan]="getColumns().length" class="px-4 py-8 text-center text-gray-400 dark:text-gray-500">No entries found</td></tr>
                  }
                </tbody>
              </table>
            </div>
            @if (totalPages() > 1) {
              <div class="p-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <button (click)="prevPage()" [disabled]="currentPage() <= 1" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Previous</button>
                <span class="text-sm text-gray-600 dark:text-gray-400">Page {{ currentPage() }} of {{ totalPages() }}</span>
                <button (click)="nextPage()" [disabled]="currentPage() >= totalPages()" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Next</button>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class AdminComponent implements OnInit {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = 'http://localhost:3002/api/admin';

  activeTab = signal('users');
  users = signal<any[]>([]);
  entries = signal<any[]>([]);
  stats = signal<any[]>([]);
  loading = signal(true);
  currentPage = signal(1);
  totalPages = signal(1);
  usersCount = signal(0);
  entriesCount = signal(0);
  selectedUserId = signal('');

  tabs = [
    { key: 'users', label: '👥 Users' },
    { key: 'tasks', label: '📋 Tasks' },
    { key: 'notes', label: '📝 Notes' },
    { key: 'exams', label: '📖 Exams' },
    { key: 'expenses', label: '💰 Expenses' },
    { key: 'attendance', label: '✅ Attendance' },
    { key: 'placements', label: '💼 Placements' }
  ];

  ngOnInit() {
    this.loadStats();
    this.loadUsers();
  }

  private headers() {
    return { headers: { Authorization: `Bearer ${this.authService.getToken()}` } };
  }

  loadStats() {
    this.http.get<any>(`${this.apiUrl}/stats`, this.headers()).subscribe({
      next: (d) => this.stats.set([
        { label: 'Users', count: d.totalUsers, icon: '👥' },
        { label: 'Tasks', count: d.totalTasks, icon: '📋' },
        { label: 'Exams', count: d.totalExams, icon: '📖' },
        { label: 'Notes', count: d.totalNotes, icon: '📝' },
        { label: 'Expenses', count: d.totalExpenses, icon: '💰' },
        { label: 'Attendance', count: d.totalAttendance, icon: '✅' },
        { label: 'Placements', count: d.totalPlacements, icon: '💼' }
      ])
    });
  }

  loadUsers() {
    this.http.get<any>(`${this.apiUrl}/users?limit=100`, this.headers()).subscribe({
      next: (d) => { this.users.set(d.users); this.usersCount.set(d.totalCount); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadEntries() {
    this.loading.set(true);
    const tab = this.activeTab();
    let url = `${this.apiUrl}/entries/${tab}?page=${this.currentPage()}`;
    if (this.selectedUserId()) url += `&userId=${this.selectedUserId()}`;
    this.http.get<any>(url, this.headers()).subscribe({
      next: (d) => {
        this.entries.set(d[tab] || []);
        this.totalPages.set(d.totalPages);
        this.entriesCount.set(d.totalCount);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  filterByUser(event: any) {
    this.selectedUserId.set(event.target.value);
    this.currentPage.set(1);
    this.loadEntries();
  }

  prevPage() { if (this.currentPage() > 1) { this.currentPage.update(p => p - 1); this.loadEntries(); } }
  nextPage() { if (this.currentPage() < this.totalPages()) { this.currentPage.update(p => p + 1); this.loadEntries(); } }

  toggleRole(user: any) {
    this.http.put(`${this.apiUrl}/users/${user._id}/role`, { role: user.role === 'admin' ? 'student' : 'admin' }, this.headers())
      .subscribe({ next: () => { this.loadUsers(); this.loadStats(); } });
  }

  deleteUser(user: any) {
    if (confirm(`Delete "${user.name}" and ALL their data?`)) {
      this.http.delete(`${this.apiUrl}/users/${user._id}`, this.headers())
        .subscribe({ next: () => { this.loadUsers(); this.loadStats(); } });
    }
  }

  getTabLabel() {
    const t = this.tabs.find(t => t.key === this.activeTab());
    return t ? t.label : '';
  }

  getColumns(): string[] {
    switch (this.activeTab()) {
      case 'tasks': return ['Title', 'User', 'Email', 'Priority', 'Status', 'Due Date'];
      case 'notes': return ['Title', 'User', 'Email', 'Subject', 'Favorite', 'Created'];
      case 'exams': return ['Subject', 'User', 'Email', 'Type', 'Status', 'Score', 'Date'];
      case 'expenses': return ['Title', 'User', 'Email', 'Amount', 'Category', 'Date'];
      case 'attendance': return ['Subject', 'User', 'Email', 'Status', 'Date'];
      case 'placements': return ['Company', 'User', 'Email', 'Role', 'Status', 'CTC'];
      default: return [];
    }
  }
}