import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, NotificationPreferences } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-4xl mx-auto p-6">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <svg class="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p class="text-gray-500 dark:text-gray-400 text-sm">Manage your notification preferences</p>
        </div>
      </div>

      @if (saved()) {
        <div class="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Settings saved successfully!
        </div>
      }

      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Email Notifications</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure when to receive email alerts for your activities.</p>
        </div>

        <div class="p-6 space-y-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Enable Email Notifications</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Master switch for all email notifications</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="prefs().emailEnabled" (change)="toggleMaster()" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          <div class="border-t border-gray-100 dark:border-gray-800"></div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">New Task Created</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Get an email when you create a new task</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="prefs().onTaskCreated" [disabled]="!prefs().emailEnabled" (change)="toggle('onTaskCreated')" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" [class.opacity-50]="!prefs().emailEnabled"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">New Note Created</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Get an email when you create a new note</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="prefs().onNoteCreated" [disabled]="!prefs().emailEnabled" (change)="toggle('onNoteCreated')" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" [class.opacity-50]="!prefs().emailEnabled"></div>
            </label>
          </div>

          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900 dark:text-white">Task Due Reminders</p>
              <p class="text-sm text-gray-500 dark:text-gray-400">Get a reminder email 24 hours before a task is due</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" [checked]="prefs().onTaskReminder" [disabled]="!prefs().emailEnabled" (change)="toggle('onTaskReminder')" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" [class.opacity-50]="!prefs().emailEnabled"></div>
            </label>
          </div>
        </div>

        <div class="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-800 flex justify-end">
          <button (click)="save()" [disabled]="saving()" class="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium">
            @if (saving()) {
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            } @else {
              Save Settings
            }
          </button>
        </div>
      </div>

      <div class="mt-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div class="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Notification History</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">Recently sent notifications</p>
          </div>
          @if (unreadCount() > 0) {
            <button (click)="markAllRead()" class="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">Mark all as read</button>
          }
        </div>
        <div class="divide-y divide-gray-100 dark:divide-gray-800">
          @for (notif of notifications(); track notif._id) {
            <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" [class.bg-purple-50]="!notif.read" [class.dark:bg-purple-900/20]="!notif.read">
              <div class="flex items-start justify-between">
                <div class="flex items-start gap-3">
                  <span class="text-lg mt-0.5">{{ notif.type === 'task_reminder' ? '⏰' : notif.type === 'task_created' ? '📋' : '📝' }}</span>
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">{{ notif.title }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ notif.message }}</p>
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1">{{ notif.createdAt | date:'medium' }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  @if (!notif.read) {
                    <button (click)="markRead(notif._id)" class="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">Mark read</button>
                  }
                  @if (notif.emailSent) {
                    <span class="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">Emailed</span>
                  } @else if (notif.emailError) {
                    <span class="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full" title="{{ notif.emailError }}">Failed</span>
                  }
                  <button (click)="deleteNotif(notif._id)" class="text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <div class="p-12 text-center text-gray-400 dark:text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p>No notifications yet</p>
              <p class="text-sm mt-1">Notifications will appear here when you receive them.</p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private notifService = inject(NotificationService);

  prefs = signal<NotificationPreferences>({
    emailEnabled: true,
    onTaskCreated: true,
    onNoteCreated: true,
    onTaskReminder: true
  });
  notifications = signal<any[]>([]);
  unreadCount = signal(0);
  saved = signal(false);
  saving = signal(false);

  ngOnInit() {
    this.loadPreferences();
    this.loadNotifications();
  }

  private loadPreferences() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.notificationPreferences) {
          this.prefs.set(user.notificationPreferences);
        }
      } catch {}
    }
    this.notifService.getPreferences().subscribe({
      next: (res) => this.prefs.set(res.preferences),
      error: () => {}
    });
  }

  private loadNotifications() {
    this.notifService.getNotifications({ limit: 50 }).subscribe({
      next: (res) => {
        this.notifications.set(res.notifications);
        this.unreadCount.set(res.unreadCount);
      }
    });
  }

  toggleMaster() {
    this.prefs.update(p => ({ ...p, emailEnabled: !p.emailEnabled }));
  }

  toggle(key: 'onTaskCreated' | 'onNoteCreated' | 'onTaskReminder') {
    this.prefs.update(p => ({ ...p, [key]: !p[key] }));
  }

  save() {
    this.saving.set(true);
    this.notifService.updatePreferences(this.prefs()).subscribe({
      next: (res) => {
        this.prefs.set(res.preferences);
        this.saved.set(true);
        this.saving.set(false);
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  markRead(id: string) {
    this.notifService.markAsRead(id).subscribe(() => this.loadNotifications());
  }

  markAllRead() {
    this.notifService.markAllAsRead().subscribe(() => this.loadNotifications());
  }

  deleteNotif(id: string) {
    this.notifService.deleteNotification(id).subscribe(() => this.loadNotifications());
  }
}