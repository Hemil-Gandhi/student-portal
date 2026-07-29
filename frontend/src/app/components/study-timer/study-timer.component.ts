import { Component, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-study-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-2xl mx-auto space-y-8">
      <div class="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Study Timer</h1>
          <p class="text-gray-500 dark:text-gray-400 mt-1">Stay focused with the Pomodoro technique</p>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800 text-center">
        <div class="mb-2 flex justify-center gap-2">
          @for (p of presets; track p.label) {
            <button (click)="setPreset(p.minutes)"
              [class]="activePreset === p.minutes ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 ring-2 ring-gray-300 dark:ring-gray-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-all">
              {{ p.label }}
            </button>
          }
        </div>

        <div class="text-8xl sm:text-9xl font-bold tabular-nums tracking-wider my-8"
          [class.text-gray-900]="!isBreak()"
          [class.dark:text-white]="!isBreak()"
          [class.text-amber-600]="isBreak()"
          [class.dark:text-amber-400]="isBreak()">
          {{ displayTime }}
        </div>

        <p class="text-sm font-medium mb-6"
          [class.text-gray-900]="!isBreak()"
          [class.dark:text-white]="!isBreak()"
          [class.text-amber-600]="isBreak()"
          [class.dark:text-amber-400]="isBreak()">
          {{ isBreak() ? 'Break Time' : 'Focus Time' }}
        </p>

        <div class="flex justify-center gap-4">
          @if (!isRunning()) {
            <button (click)="start()"
              class="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-all shadow-lg min-h-[44px] flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path></svg>
              Start
            </button>
          } @else {
            <button (click)="pause()"
              class="px-8 py-3 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 transition-all shadow-lg min-h-[44px] flex items-center gap-2">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1-1 1 1 0 00-1 1v4a1 1 0 102 0V8z" clip-rule="evenodd"></path></svg>
              Pause
            </button>
            <button (click)="reset()"
              class="px-8 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all min-h-[44px] flex items-center gap-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
              Reset
            </button>
          }
        </div>

        <div class="mt-6 flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
          <span>Sessions: {{ sessionsCompleted() }}</span>
        </div>
      </div>

      <div class="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-800">
        <h3 class="font-bold text-gray-900 dark:text-white mb-3">How it works</h3>
        <ul class="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-0.5">•</span>
            <span>Work for a focused session (default: 25 min)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-amber-500 mt-0.5">•</span>
            <span>Take a short break (default: 5 min)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-emerald-500 mt-0.5">•</span>
            <span>Repeat and track your completed sessions</span>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class StudyTimerComponent implements OnDestroy {
  presets = [
    { label: '25/5', minutes: 25 },
    { label: '45/15', minutes: 45 },
    { label: '60/10', minutes: 60 }
  ];
  activePreset = 25;

  isRunning = signal(false);
  isBreak = signal(false);
  sessionsCompleted = signal(0);

  private totalSeconds = 25 * 60;
  private remainingSeconds = 25 * 60;
  private timer: any = null;

  get displayTime(): string {
    const m = Math.floor(this.remainingSeconds / 60);
    const s = this.remainingSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  setPreset(minutes: number): void {
    if (this.isRunning()) return;
    this.activePreset = minutes;
    this.totalSeconds = minutes * 60;
    this.remainingSeconds = minutes * 60;
    this.isBreak.set(false);
  }

  start(): void {
    if (this.isRunning()) return;
    this.isRunning.set(true);
    this.timer = setInterval(() => {
      this.remainingSeconds--;
      if (this.remainingSeconds <= 0) {
        this.handleTimerEnd();
      }
    }, 1000);
  }

  pause(): void {
    this.isRunning.set(false);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  reset(): void {
    this.pause();
    this.remainingSeconds = this.totalSeconds;
    this.isBreak.set(false);
  }

  private handleTimerEnd(): void {
    this.pause();
    if (!this.isBreak()) {
      this.sessionsCompleted.update(v => v + 1);
      this.isBreak.set(true);
      this.totalSeconds = Math.max(5, Math.round(this.activePreset / 5)) * 60;
      this.remainingSeconds = this.totalSeconds;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Break time!', { body: 'Take a short break and recharge.' });
      }
    } else {
      this.isBreak.set(false);
      this.totalSeconds = this.activePreset * 60;
      this.remainingSeconds = this.totalSeconds;
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Session time!', { body: 'Break is over. Time to focus.' });
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }
}