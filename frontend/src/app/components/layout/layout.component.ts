import { Component, signal, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { User } from '../../models/interfaces';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="min-h-dvh bg-gray-50 dark:bg-gray-950 flex">
      <!-- Sidebar -->
      <aside 
        [class.translate-x-0]="sidebarOpen()"
        [class.-translate-x-full]="!sidebarOpen()"
        class="fixed lg:static inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white dark:bg-gray-900 shadow-lg lg:shadow-sm transform transition-transform duration-300 ease-in-out lg:!translate-x-0 border-r border-gray-200 dark:border-gray-800 flex flex-col"
      >
        <!-- Logo -->
        <div class="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-white dark:text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h1 class="text-sm font-semibold text-gray-900 dark:text-white truncate">Student Portal</h1>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ currentUser()?.role === 'admin' ? 'Administrator' : 'Student' }}</p>
            </div>
          </div>
          <button (click)="toggleSidebar()" class="absolute top-4 right-4 lg:hidden p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 overflow-y-auto py-2 px-3">
          <ul class="space-y-0.5">
            @for (item of visibleMenuItems; track item.path || item.label) {
              @if (item.type === 'separator') {
                <li class="border-t border-gray-100 dark:border-gray-800 my-3"></li>
              } @else {
                <li>
                  <a
                    [routerLink]="item.path"
                    (click)="onNavClick()"
                    routerLinkActive="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                    class="flex items-center gap-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-all duration-150 text-sm"
                  >
                    <span class="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                      [class.text-gray-900]="isActive(item.path)"
                      [class.dark:text-white]="isActive(item.path)"
                      [class.text-gray-400]="!isActive(item.path)"
                      [class.dark:text-gray-500]="!isActive(item.path)">
                        <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path [attr.stroke-linecap]="'round'" [attr.stroke-linejoin]="'round'" [attr.stroke-width]="1.5" [attr.d]="item.icon"></path>
                        </svg>
                    </span>
                    <span>{{ item.label }}</span>
                  </a>
                </li>
              }
            }
          </ul>
        </nav>

        <!-- User Profile -->
        <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-800">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-xs font-semibold text-gray-600 dark:text-gray-300">{{ getInitials(currentUser()?.name || '') }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ currentUser()?.name }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ currentUser()?.email }}</p>
            </div>
          </div>
          <div class="flex gap-1.5">
            <button (click)="themeService.toggle()"
              class="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all min-h-[36px]">
              @if (themeService.darkMode()) {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                Light
              } @else {
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                Dark
              }
            </button>
            <button (click)="logout()"
              class="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-all min-h-[36px]">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <!-- Mobile Overlay -->
      @if (sidebarOpen()) {
        <div (click)="toggleSidebar()" class="fixed inset-0 bg-black/30 z-40 lg:hidden transition-opacity"></div>
      }

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 max-w-full">
        <!-- Mobile Header -->
        <header class="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-30">
          <button (click)="toggleSidebar()" class="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
          <span class="text-sm font-semibold text-gray-900 dark:text-white">Student Portal</span>
          <div class="w-8"></div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-full">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  sidebarOpen = signal(false);
  currentUser = signal<User | null>(null);

  menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z' },
    { path: '/schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { path: '/tasks', label: 'Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { path: '/exams', label: 'Exams', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { path: '/attendance', label: 'Attendance', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/expenses', label: 'Expenses', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { path: '/notes', label: 'Notes', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
    { path: '/placements', label: 'Placements', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { path: '/study-timer', label: 'Study Timer', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { type: 'separator' },
    { path: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }
  ];

  adminMenuItems = [
    { type: 'separator' },
    { path: '/admin', label: 'Admin Panel', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    public themeService: ThemeService
  ) {}

  get visibleMenuItems() {
    const items = [...this.menuItems];
    if (this.currentUser()?.role === 'admin') {
      items.push(...this.adminMenuItems);
    }
    return items;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.sidebarOpen()) {
      this.sidebarOpen.set(false);
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
    });
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
  }

  onNavClick(): void {
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  isActive(path: string | undefined): boolean {
    if (!path) return false;
    return this.router.url.startsWith(path);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}